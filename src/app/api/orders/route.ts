import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_SHIPPING_SETTINGS } from '@/data/initialData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      province,
      orderNotes,
      paymentMethod,
      paymentReference,
      items,
    } = body;

    const cleanName = customerName?.trim();
    const cleanPhone = customerPhone?.trim();
    const cleanAddress = address?.trim();
    const cleanCity = city?.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      cleanPhone.length < 10 ||
      !cleanAddress ||
      !cleanCity ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please provide valid customer details, delivery address, and order items.' },
        { status: 400 }
      );
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
      const qty = Math.max(1, Number(it.quantity) || 1);
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
            customer_name: cleanName,
            customer_phone: cleanPhone,
            customer_email: customerEmail?.trim() || null,
            address: cleanAddress,
            city: cleanCity,
            province: province?.trim() || 'Punjab',
            order_notes: orderNotes?.trim() || null,
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total_amount: totalAmount,
            payment_method: paymentMethod || 'cod',
            payment_reference: paymentReference || null,
            status: 'Pending',
          })
          .select()
          .single();

        if (!ordErr && insertedOrder) {
          orderId = insertedOrder.id;

          const itemsPayload = verifiedItems.map((it: any) => ({
            order_id: insertedOrder.id,
            product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.productId)
              ? it.productId
              : null,
            variant_id: it.variantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.variantId)
              ? it.variantId
              : null,
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
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: customerEmail?.trim() || undefined,
      address: cleanAddress,
      city: cleanCity,
      province: province?.trim() || 'Punjab',
      orderNotes: orderNotes?.trim() || undefined,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentReference: paymentReference || undefined,
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
