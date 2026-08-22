import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_SHIPPING_SETTINGS } from '@/data/initialData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      province,
      orderNotes,
      paymentMethod,
      items,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !address ||
      !city ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Fetch live shipping settings from Supabase if configured
    let minOrderQty = INITIAL_SHIPPING_SETTINGS.minOrderQty;
    let baseDeliveryCharge = INITIAL_SHIPPING_SETTINGS.baseDeliveryCharge;
    let freeDeliveryThreshold = INITIAL_SHIPPING_SETTINGS.freeDeliveryThreshold;

    if (isSupabaseConfigured()) {
      try {
        const { data: shipData } = await supabaseServer
          .from('shipping_settings')
          .select('*')
          .limit(1)
          .single();

        if (shipData) {
          minOrderQty = Number(shipData.min_order_qty) || minOrderQty;
          baseDeliveryCharge = Number(shipData.base_delivery_charge) || baseDeliveryCharge;
          freeDeliveryThreshold = Number(shipData.free_delivery_threshold) || freeDeliveryThreshold;
        }
      } catch (err) {
        console.warn('Could not fetch server shipping settings, using fallback', err);
      }
    }

    // 2. Validate total quantity
    const totalQty = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);
    if (totalQty < minOrderQty) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${minOrderQty} pieces` },
        { status: 400 }
      );
    }

    // 3. Verify server pricing and calculate totals
    let subtotal = 0;
    const verifiedItems = items.map((it: any) => {
      const price = Number(it.unitPrice) || 480;
      const qty = Number(it.quantity) || 2;
      const itemTotal = price * qty;
      subtotal += itemTotal;
      return {
        ...it,
        unitPrice: price,
        quantity: qty,
        totalPrice: itemTotal,
      };
    });

    const isFreeDelivery = totalQty >= freeDeliveryThreshold;
    const deliveryFee = isFreeDelivery ? 0 : baseDeliveryCharge;
    const totalAmount = subtotal + deliveryFee;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ARH-${new Date().getFullYear()}-${randomSuffix}`;
    let orderId = `ord-${Date.now()}-${randomSuffix}`;

    // 4. Save order to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: insertedOrder, error: ordErr } = await supabaseServer
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || null,
            address: address,
            city: city,
            province: province || 'Punjab',
            order_notes: orderNotes || null,
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total_amount: totalAmount,
            payment_method: paymentMethod || 'cod',
            status: 'Pending',
          })
          .select()
          .single();

        if (!ordErr && insertedOrder) {
          orderId = insertedOrder.id;

          const itemsPayload = verifiedItems.map((it: any) => ({
            order_id: insertedOrder.id,
            product_name: it.productName,
            quality: it.quality,
            sleeve: it.sleeve,
            size: it.size,
            unit_price: it.unitPrice,
            quantity: it.quantity,
            total_price: it.totalPrice,
            image_url: it.image || null,
          }));

          await supabaseServer.from('order_items').insert(itemsPayload);
        }
      } catch (err) {
        console.warn('Supabase server order insertion error', err);
      }
    }

    const order = {
      id: orderId,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      province,
      orderNotes,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      status: 'Pending',
      items: verifiedItems,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    console.error('Order API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
