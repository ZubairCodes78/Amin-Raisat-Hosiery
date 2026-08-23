import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      customerName,
      customerCity,
      rating,
      comment,
    } = body;

    const cleanName = customerName?.trim();
    const cleanComment = comment?.trim();
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

    let reviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseServer
          .from('reviews')
          .insert({
            product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
              ? productId
              : null,
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
