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

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const dbClient = getDbClient();
    const { data: orders, error } = await dbClient
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin GET orders error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedOrders = (orders || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerType: o.customer_type || (o.user_id ? 'REGISTERED' : 'GUEST'),
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email || undefined,
      address: o.address || o.shipping_address || '',
      city: o.city,
      province: o.province,
      orderNotes: o.order_notes || undefined,
      subtotal: Number(o.subtotal) || 0,
      deliveryFee: Number(o.delivery_fee) || 0,
      totalAmount: Number(o.total_amount) || 0,
      paymentMethod: o.payment_method || 'cod',
      paymentReference: o.payment_reference || undefined,
      paymentScreenshotUrl: o.payment_screenshot_url || undefined,
      paymentStatus: o.payment_status || (o.payment_method === 'cod' ? 'COD_PENDING' : 'PENDING_VERIFICATION'),
      paymentVerifiedAt: o.payment_verified_at || undefined,
      paymentVerifiedBy: o.payment_verified_by || undefined,
      paymentRejectionReason: o.payment_rejection_reason || undefined,
      status: o.status || 'Pending',
      isWholesale: o.is_wholesale ?? false,
      wholesaleDiscount: o.wholesale_discount ? Number(o.wholesale_discount) : undefined,
      createdAt: o.created_at,
      items: Array.isArray(o.order_items)
        ? o.order_items.map((it: any) => ({
            id: it.id,
            orderId: it.order_id,
            productId: it.product_id,
            variantId: it.variant_id,
            productName: it.product_name,
            quality: it.quality,
            sleeve: it.sleeve,
            size: it.size,
            unitPrice: Number(it.unit_price) || 0,
            regularPrice: it.regular_price ? Number(it.regular_price) : undefined,
            wholesalePrice: it.wholesale_price ? Number(it.wholesale_price) : undefined,
            isWholesale: it.is_wholesale ?? false,
            quantity: Number(it.quantity) || 1,
            totalPrice: Number(it.total_price) || 0,
            image: it.image_url,
          }))
        : [],
    }));

    return NextResponse.json({ success: true, orders: mappedOrders });
  } catch (err: any) {
    console.error('Admin GET orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, orderId, status });
    }

    const dbClient = getDbClient();
    const { data: updated, error } = await dbClient
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single();

    if (error) {
      console.error('Admin PATCH order error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Admin PATCH order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
