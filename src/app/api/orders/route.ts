import { NextResponse } from 'next/server';
import { supabaseServer, createAdminClient, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_SHIPPING_SETTINGS, INITIAL_PRODUCTS } from '@/data/initialData';

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
      isWholesale: clientIsWholesale,
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

    // 1. Fetch live settings from Supabase if configured
    let minOrderQty = INITIAL_SHIPPING_SETTINGS.minOrderQty;
    let baseDeliveryCharge = INITIAL_SHIPPING_SETTINGS.baseDeliveryCharge;
    let freeDeliveryThreshold = INITIAL_SHIPPING_SETTINGS.freeDeliveryThreshold;
    let wholesaleMinQty = 12;

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

        const { data: siteData } = await supabaseServer
          .from('site_settings')
          .select('wholesale_min_qty')
          .limit(1)
          .single();
        if (siteData?.wholesale_min_qty) {
          wholesaleMinQty = Number(siteData.wholesale_min_qty) || wholesaleMinQty;
        }
      } catch (err) {
        console.warn('Could not fetch server shipping settings, using fallback', err);
      }
    }

    // 2. Fetch all products and variants from DB to calculate authoritative pricing
    let dbVariants: any[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data: variantsData } = await supabaseServer
          .from('product_variants')
          .select('*');
        if (variantsData && variantsData.length > 0) {
          dbVariants = variantsData;
        }
      } catch (err) {
        console.warn('Could not fetch variants from Supabase:', err);
      }
    }

    // Fallback dictionary for initial products
    const initialVariantsMap = new Map<string, any>();
    INITIAL_PRODUCTS.forEach((p) => {
      p.variants.forEach((v) => {
        initialVariantsMap.set(v.id, { ...v, productName: p.name });
        const compositeKey = `${p.id}_${v.quality}_${v.sleeve}_${v.size}`;
        initialVariantsMap.set(compositeKey, { ...v, productName: p.name });
      });
    });

    // 3. Authoritative verification of all items & compute subtotal
    let subtotal = 0;
    let totalSavings = 0;
    let totalItemCount = 0;

    const verifiedItems = items.map((clientItem: any) => {
      const qty = Math.max(1, Number(clientItem.quantity) || 1);
      totalItemCount += qty;

      // Find variant in DB or in initial data
      let variant = dbVariants.find(
        (v) =>
          v.id === clientItem.variantId ||
          (v.product_id === clientItem.productId &&
            v.quality === clientItem.quality &&
            v.sleeve === clientItem.sleeve &&
            v.size === clientItem.size)
      );

      let unitPrice = 0;
      let retailPrice = 0;
      let wholesalePrice = 0;
      let productName = clientItem.productName || 'Hosiery Product';

      if (variant) {
        retailPrice = Number(variant.sale_price) || Number(variant.price) || 480;
        wholesalePrice = Number(variant.wholesale_price) || Math.round(retailPrice * 0.82);
      } else {
        const initialVar =
          initialVariantsMap.get(clientItem.variantId) ||
          initialVariantsMap.get(`${clientItem.productId}_${clientItem.quality}_${clientItem.sleeve}_${clientItem.size}`);
        if (initialVar) {
          retailPrice = Number(initialVar.salePrice) || Number(initialVar.price) || 480;
          wholesalePrice = Number(initialVar.wholesalePrice) || Math.round(retailPrice * 0.82);
          productName = initialVar.productName || productName;
        } else {
          retailPrice = Number(clientItem.unitPrice) || 480;
          wholesalePrice = Math.round(retailPrice * 0.82);
        }
      }

      // Check wholesale criteria
      const isEligibleForWholesale = clientIsWholesale || totalItemCount >= wholesaleMinQty;
      unitPrice = isEligibleForWholesale ? wholesalePrice : retailPrice;

      const itemTotal = unitPrice * qty;
      const normalTotal = retailPrice * qty;
      subtotal += itemTotal;
      if (normalTotal > itemTotal) {
        totalSavings += normalTotal - itemTotal;
      }

      return {
        productId: clientItem.productId || null,
        variantId: variant?.id || clientItem.variantId || null,
        productName,
        quality: clientItem.quality || variant?.quality || 'High Quality',
        sleeve: clientItem.sleeve || variant?.sleeve || 'Sleeveless',
        size: clientItem.size || variant?.size || 'L',
        unitPrice,
        quantity: qty,
        totalPrice: itemTotal,
        image: clientItem.image || null,
      };
    });

    // Enforce MOQ check
    if (totalItemCount < minOrderQty) {
      return NextResponse.json(
        {
          error: `Minimum order quantity requirement not met. Minimum ${minOrderQty} pieces required per order.`,
        },
        { status: 400 }
      );
    }

    // Determine final delivery fee
    const hasWholesale = totalItemCount >= wholesaleMinQty || clientIsWholesale;
    let deliveryFee = baseDeliveryCharge;
    if (subtotal >= freeDeliveryThreshold && !hasWholesale) {
      deliveryFee = 0;
    }

    const totalAmount = subtotal + deliveryFee;
    const orderNumber = `ARH-${Date.now().toString().slice(-6)}`;
    let orderId = `ord-${Date.now()}`;

    // 4. Save Order to Supabase Database
    if (isSupabaseConfigured()) {
      try {
        let dbClient = supabaseServer;
        try {
          dbClient = createAdminClient();
        } catch {
          // Fallback to supabaseServer if service key not configured
        }

        const orderPayload: any = {
          order_number: orderNumber,
          user_id: userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
            ? userId
            : null,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          customer_email: customerEmail?.trim() || null,
          shipping_address: cleanAddress,
          city: cleanCity,
          province: province?.trim() || 'Punjab',
          order_notes: orderNotes?.trim() || null,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          payment_method: paymentMethod || 'cod',
          payment_reference: paymentReference || null,
          status: 'Pending',
          is_wholesale: hasWholesale,
          wholesale_discount: totalSavings,
        };

        let { data: insertedOrder, error: ordErr } = await dbClient
          .from('orders')
          .insert(orderPayload)
          .select()
          .single();

        if (ordErr && ordErr.code === 'PGRST204') {
          delete orderPayload.is_wholesale;
          delete orderPayload.wholesale_discount;
          const retryRes = await dbClient
            .from('orders')
            .insert(orderPayload)
            .select()
            .single();
          insertedOrder = retryRes.data;
          ordErr = retryRes.error;
        }

        if (!ordErr && insertedOrder) {
          orderId = insertedOrder.id;

          const itemsPayload = verifiedItems.map((it: any) => ({
            order_id: insertedOrder.id,
            product_id: it.productId,
            variant_id: it.variantId,
            product_name: it.productName,
            quality: it.quality,
            sleeve: it.sleeve,
            size: it.size,
            unit_price: it.unitPrice,
            quantity: it.quantity,
            total_price: it.totalPrice,
            image_url: it.image || null,
          }));

          const { error: itemsErr } = await dbClient.from('order_items').insert(itemsPayload);
          if (itemsErr) {
            console.error('FULL SUPABASE ORDER ITEMS INSERT ERROR:', itemsErr);
          }

          // Decrement stock in product_variants safely
          for (const item of verifiedItems) {
            if (item.variantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variantId)) {
              try {
                const targetVar = dbVariants.find((v) => v.id === item.variantId);
                if (targetVar) {
                  const newStock = Math.max(0, (targetVar.stock || 0) - item.quantity);
                  await dbClient
                    .from('product_variants')
                    .update({ stock: newStock, updated_at: new Date().toISOString() })
                    .eq('id', item.variantId);
                }
              } catch (stockErr) {
                console.warn('Stock decrement error:', stockErr);
              }
            }
          }
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
      isWholesale: hasWholesale,
      wholesaleDiscount: totalSavings > 0 ? totalSavings : undefined,
      items: verifiedItems,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    console.error('Order API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
