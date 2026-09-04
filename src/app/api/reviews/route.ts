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

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        reviews: [],
        averageRating: 5.0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const dbClient = getDbClient();
    let query = dbClient
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: reviewsData, error } = await query;

    if (error) {
      console.error('Fetch reviews error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reviews = (reviewsData || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id || undefined,
      orderId: r.order_id || undefined,
      customerName: r.customer_name,
      customerCity: r.customer_city || '',
      rating: Number(r.rating) || 5,
      comment: r.comment,
      createdAt: r.created_at,
      isApproved: r.is_approved ?? true,
    }));

    const totalReviews = reviews.length;
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingBreakdown[rounded] = (ratingBreakdown[rounded] || 0) + 1;
      sumRating += r.rating;
    });

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
      ratingBreakdown,
    });
  } catch (err: any) {
    console.error('GET reviews API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      customerName,
      customerCity,
      rating,
      comment,
      orderId,
    } = body;

    const cleanName = customerName?.trim();
    const cleanComment = comment?.trim();
    const cleanCity = customerCity?.trim();
    const parsedRating = Number(rating);

    if (
      !cleanComment ||
      cleanComment.length < 2 ||
      !parsedRating ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return NextResponse.json(
        { error: 'Please provide a valid rating between 1 and 5 and a review comment.' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    // 1. Authenticate Customer Server-Side (CASE 6: Unauthenticated customer rejected)
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to review a product you've purchased." },
        { status: 401 }
      );
    }

    const authUserId = user.id;
    const authUserEmail = user.email?.toLowerCase();
    const dbClient = getDbClient();

    if (isSupabaseConfigured()) {
      // 2. Query Orders belonging to this Authenticated Customer
      let orderQuery = dbClient
        .from('orders')
        .select('*, order_items(product_id, product_name)');

      if (authUserEmail) {
        orderQuery = orderQuery.ilike('customer_email', authUserEmail);
      } else {
        return NextResponse.json(
          { error: 'Customer account must have a verified email to review products.' },
          { status: 403 }
        );
      }

      const { data: customerOrders, error: ordErr } = await orderQuery;

      if (ordErr) {
        console.error('Customer orders lookup error:', ordErr);
        return NextResponse.json({ error: 'Failed to verify order history.' }, { status: 500 });
      }

      // Check if customer has any order containing this product
      const ordersWithProduct = (customerOrders || []).filter((ord: any) => {
        const items = ord.order_items || [];
        return items.some((it: any) => it.product_id === productId);
      });

      // CASE 5: Customer has never purchased this product
      if (ordersWithProduct.length === 0) {
        return NextResponse.json(
          { error: 'Only customers who have received this product can leave a review.' },
          { status: 403 }
        );
      }

      // Check if any of those orders have been DELIVERED
      const deliveredOrdersWithProduct = ordersWithProduct.filter(
        (ord: any) => ord.status?.toLowerCase() === 'delivered'
      );

      // CASE 2 & 3: Customer ordered product but order is NOT Delivered (Pending, Confirmed, Shipped, etc.)
      if (deliveredOrdersWithProduct.length === 0) {
        return NextResponse.json(
          { error: 'Reviews are available after your order has been delivered.' },
          { status: 403 }
        );
      }

      // CASE 7 & 8: If client provided an orderId, verify it matches an authenticated delivered order containing this product
      let matchingDeliveredOrder = deliveredOrdersWithProduct[0];
      if (orderId) {
        const found = deliveredOrdersWithProduct.find((ord: any) => ord.id === orderId);
        if (!found) {
          return NextResponse.json(
            { error: 'Invalid order: The specified order does not belong to you or has not been delivered with this product.' },
            { status: 403 }
          );
        }
        matchingDeliveredOrder = found;
      }

      // CASE 9: Customer already reviewed the same product -> Prevent duplicate review
      const { data: existingReviews, error: revErr } = await dbClient
        .from('reviews')
        .select('*')
        .eq('product_id', productId);

      if (!revErr && existingReviews && existingReviews.length > 0) {
        const alreadyReviewed = existingReviews.some((r: any) => {
          if (r.user_id && r.user_id === authUserId) return true;
          if (r.customer_name && cleanName && r.customer_name.toLowerCase() === cleanName.toLowerCase()) return true;
          return false;
        });

        if (alreadyReviewed) {
          return NextResponse.json(
            { error: 'You have already submitted a review for this product.' },
            { status: 409 }
          );
        }
      }

      // CASE 1: All checks passed! Insert review into Supabase
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      const effectiveName =
        cleanName ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Verified Buyer';

      const reviewPayload: any = {
        product_id: isUuid ? productId : null,
        user_id: authUserId,
        order_id: matchingDeliveredOrder?.id || null,
        customer_name: effectiveName,
        customer_city: cleanCity || null,
        rating: parsedRating,
        comment: cleanComment,
        is_approved: true,
      };

      let insertedId = `rev-${Date.now()}`;
      let { data: insertedData, error: insErr } = await dbClient
        .from('reviews')
        .insert(reviewPayload)
        .select()
        .single();

      // If user_id or order_id columns don't exist yet, strip them and retry
      if (
        insErr &&
        (insErr.code === 'PGRST204' ||
          insErr.code === '42703' ||
          insErr.message?.includes('user_id') ||
          insErr.message?.includes('order_id'))
      ) {
        delete reviewPayload.user_id;
        delete reviewPayload.order_id;
        const retry = await dbClient.from('reviews').insert(reviewPayload).select().single();
        insertedData = retry.data;
        insErr = retry.error;
      }

      if (insErr) {
        console.error('Supabase review insert error:', insErr);
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }

      if (insertedData) {
        insertedId = insertedData.id;
      }

      const review = {
        id: insertedId,
        productId,
        userId: authUserId,
        orderId: matchingDeliveredOrder?.id,
        customerName: effectiveName,
        customerCity: cleanCity || undefined,
        rating: parsedRating,
        comment: cleanComment,
        createdAt: new Date().toISOString(),
        isApproved: true,
      };

      return NextResponse.json({ success: true, review }, { status: 201 });
    }

    // Fallback if Supabase not configured (demo mode)
    const demoReview = {
      id: `rev-${Date.now()}`,
      productId,
      userId: authUserId,
      customerName: cleanName || 'Verified Buyer',
      customerCity: cleanCity || undefined,
      rating: parsedRating,
      comment: cleanComment,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    return NextResponse.json({ success: true, review: demoReview }, { status: 201 });
  } catch (err: any) {
    console.error('Review API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
