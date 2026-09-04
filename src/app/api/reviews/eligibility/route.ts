import { NextResponse } from 'next/server';
import { supabaseServer, createAdminClient, createServerClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getDbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return createAdminClient();
    } catch {
      return supabaseServer;
    }
  }
  return supabaseServer;
}

/**
 * Extracts and verifies the authenticated user from the Request headers or cookies.
 */
async function getAuthenticatedUser(req: Request) {
  let token = '';
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/i);
    if (match) {
      try {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
      } catch {}
    }
  }

  if (!token) return null;

  try {
    const client = createServerClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.warn('Error verifying auth token:', err);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { eligible: false, reason: 'Product ID is required.' },
        { status: 400 }
      );
    }

    // 1. Authenticate Customer
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        eligible: false,
        unauthenticated: true,
        reason: "Please sign in to review a product you've purchased.",
      });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        eligible: true,
        reason: 'You are eligible to review this product.',
      });
    }

    const authUserId = user.id;
    const authUserEmail = user.email?.toLowerCase();
    const dbClient = getDbClient();

    // 2. Check if user already submitted a review for this product
    const { data: existingReviews, error: revErr } = await dbClient
      .from('reviews')
      .select('*')
      .eq('product_id', productId);

    if (!revErr && existingReviews && existingReviews.length > 0) {
      const userReview = existingReviews.find((r: any) => {
        if (r.user_id && r.user_id === authUserId) return true;
        if (authUserEmail && r.customer_name && user.user_metadata?.full_name && r.customer_name.toLowerCase() === user.user_metadata.full_name.toLowerCase()) return true;
        return false;
      });

      if (userReview) {
        return NextResponse.json({
          eligible: false,
          alreadyReviewed: true,
          existingReview: {
            id: userReview.id,
            rating: userReview.rating,
            comment: userReview.comment,
            createdAt: userReview.created_at,
          },
          reason: 'You have already submitted a review for this product.',
        });
      }
    }

    // 3. Query Customer's Orders
    let orderQuery = dbClient
      .from('orders')
      .select('*, order_items(product_id, product_name)');

    if (authUserEmail) {
      orderQuery = orderQuery.ilike('customer_email', authUserEmail);
    } else {
      return NextResponse.json({
        eligible: false,
        reason: 'Customer account must have a verified email to review products.',
      });
    }

    const { data: customerOrders, error: ordErr } = await orderQuery;

    if (ordErr) {
      console.error('Eligibility orders lookup error:', ordErr);
      return NextResponse.json({ error: 'Failed to verify order history.' }, { status: 500 });
    }

    // Find orders containing this product
    const ordersWithProduct = (customerOrders || []).filter((ord: any) => {
      const items = ord.order_items || [];
      return items.some((it: any) => it.product_id === productId);
    });

    // CASE: Never purchased
    if (ordersWithProduct.length === 0) {
      return NextResponse.json({
        eligible: false,
        neverPurchased: true,
        reason: 'Only customers who have received this product can leave a review.',
      });
    }

    // Find delivered orders containing this product
    const deliveredOrders = ordersWithProduct.filter(
      (ord: any) => ord.status?.toLowerCase() === 'delivered'
    );

    // CASE: Purchased, but order is NOT Delivered
    if (deliveredOrders.length === 0) {
      return NextResponse.json({
        eligible: false,
        hasPendingOrder: true,
        reason: 'Reviews are available after your order has been delivered.',
      });
    }

    // CASE: Eligible! (Order is DELIVERED)
    const activeDeliveredOrder = deliveredOrders[0];
    return NextResponse.json({
      eligible: true,
      orderId: activeDeliveredOrder.id,
      orderNumber: activeDeliveredOrder.order_number,
      reason: 'You are eligible to review this product.',
    });
  } catch (err: any) {
    console.error('Review eligibility error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
