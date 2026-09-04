import { NextResponse } from 'next/server';
import { supabaseServer, createAdminClient, isSupabaseConfigured } from '@/lib/supabase';

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
      // Support matching by UUID or slug/id
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
      customerEmail,
      customerPhone,
      userId,
      rating,
      comment,
      bypassEligibility,
    } = body;

    const cleanName = customerName?.trim();
    const cleanComment = comment?.trim();
    const cleanEmail = customerEmail?.trim()?.toLowerCase();
    const cleanPhone = customerPhone?.trim()?.replace(/\D/g, '');
    const parsedRating = Number(rating);

    if (
      !cleanName ||
      cleanName.length < 2 ||
      !cleanComment ||
      cleanComment.length < 2 ||
      !parsedRating ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return NextResponse.json(
        { error: 'Please provide a valid name, rating between 1 and 5, and review comment.' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const dbClient = getDbClient();

    // Eligibility check: Only customers with a DELIVERED order containing this product can review
    if (isSupabaseConfigured() && !bypassEligibility) {
      let isEligible = false;

      // Find delivered orders matching customer
      let orderQuery = dbClient
        .from('orders')
        .select('id, status, user_id, customer_email, customer_phone, order_items(product_id, variant_id)')
        .eq('status', 'Delivered');

      const { data: deliveredOrders, error: ordErr } = await orderQuery;

      if (!ordErr && deliveredOrders && deliveredOrders.length > 0) {
        for (const order of deliveredOrders) {
          const matchUser = userId && order.user_id === userId;
          const matchEmail = cleanEmail && order.customer_email && order.customer_email.toLowerCase() === cleanEmail;
          const matchPhone = cleanPhone && order.customer_phone && order.customer_phone.replace(/\D/g, '') === cleanPhone;

          if (matchUser || matchEmail || matchPhone) {
            // Check if this delivered order has this product
            const items = order.order_items || [];
            const hasProduct = items.some((it: any) => it.product_id === productId);
            if (hasProduct) {
              isEligible = true;
              break;
            }
          }
        }
      }

      if (!isEligible) {
        return NextResponse.json(
          {
            error:
              'Review not permitted: Only verified customers with a Delivered order containing this product are eligible to leave a review.',
          },
          { status: 403 }
        );
      }
    }

    let reviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        const { data, error } = await dbClient
          .from('reviews')
          .insert({
            product_id: isUuid ? productId : null,
            customer_name: cleanName,
            customer_city: customerCity?.trim() || null,
            rating: parsedRating,
            comment: cleanComment,
            is_approved: true,
          })
          .select()
          .single();

        if (!error && data) {
          reviewId = data.id;
        } else if (error) {
          console.error('Supabase review insert error:', error);
        }
      } catch (err) {
        console.warn('Supabase server review insertion error', err);
      }
    }

    const review = {
      id: reviewId,
      productId,
      customerName: cleanName,
      customerCity: customerCity?.trim() || undefined,
      rating: parsedRating,
      comment: cleanComment,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    console.error('Review API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
