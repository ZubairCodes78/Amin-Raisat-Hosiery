import { NextResponse } from 'next/server';
import { supabaseServer, createAdminClient, isSupabaseConfigured } from '@/lib/supabase';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email')?.trim().toLowerCase();
    const phone = searchParams.get('phone')?.trim().replace(/\D/g, '');

    if (!productId || (!userId && !email && !phone)) {
      return NextResponse.json({
        eligible: false,
        reason: 'Please sign in or enter your verified order details to submit a review.',
      });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ eligible: true });
    }

    const dbClient = getDbClient();
    const { data: deliveredOrders, error } = await dbClient
      .from('orders')
      .select('id, status, user_id, customer_email, customer_phone, order_items(product_id)')
      .eq('status', 'Delivered');

    if (error || !deliveredOrders || deliveredOrders.length === 0) {
      return NextResponse.json({
        eligible: false,
        reason: 'No delivered orders found. Only verified delivered purchases can be reviewed.',
      });
    }

    let isEligible = false;
    for (const order of deliveredOrders) {
      const matchUser = userId && order.user_id === userId;
      const matchEmail = email && order.customer_email && order.customer_email.toLowerCase() === email;
      const matchPhone = phone && order.customer_phone && order.customer_phone.replace(/\D/g, '') === phone;

      if (matchUser || matchEmail || matchPhone) {
        const items = order.order_items || [];
        if (items.some((it: any) => it.product_id === productId)) {
          isEligible = true;
          break;
        }
      }
    }

    return NextResponse.json({
      eligible: isEligible,
      reason: isEligible
        ? 'Customer is eligible to review.'
        : 'You have not yet received a delivered order for this product.',
    });
  } catch (err: any) {
    console.error('Review eligibility error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
