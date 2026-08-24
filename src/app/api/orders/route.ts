import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
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

    // 3. Check for Wholesale Items and Validate Minimum Wholesale Quantities
    const wholesaleItemsCount = items.filter((it: any) => it.isWholesale).reduce(
      (sum: number, it: any) => sum + (Number(it.quantity) || 0),
      0
    );
    const regularItemsCount = items.filter((it: any) => !it.isWholesale).reduce(
      (sum: number, it: any) => sum + (Number(it.quantity) || 0),
      0
    );
    const totalQty = wholesaleItemsCount + regularItemsCount;

    const hasWholesale = wholesaleItemsCount > 0 || clientIsWholesale === true;

    if (hasWholesale && wholesaleItemsCount > 0 && wholesaleItemsCount < wholesaleMinQty) {
      return NextResponse.json(
        { error: `Wholesale orders require a minimum of ${wholesaleMinQty} pieces. You currently have ${wholesaleItemsCount} wholesale pieces in your cart.` },
        { status: 400 }
      );
    }

    if (!hasWholesale && totalQty < minOrderQty) {
      return NextResponse.json(
        { error: `Minimum retail order quantity is ${minOrderQty} pieces.` },
        { status: 400 }
      );
    }

    // 4. Calculate Authoritative Prices and Verify Line Items
    let subtotal = 0;
    let totalSavings = 0;

    const verifiedItems = items.map((it: any) => {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const isItemWholesale = Boolean(it.isWholesale || (hasWholesale && wholesaleItemsCount >= wholesaleMinQty));

      // Match variant
      let dbVar = dbVariants.find(
        (v) =>
          v.id === it.variantId ||
          (v.quality === it.quality && v.sleeve === it.sleeve && v.size === it.size)
      );

      let regularUnitPrice = 480;
      let wholesaleUnitPrice = 390;
      let tiers: any[] = [];

      if (dbVar) {
        regularUnitPrice = Number(dbVar.sale_price) || Number(dbVar.price) || 480;
        wholesaleUnitPrice = Number(dbVar.wholesale_price) || Math.round(regularUnitPrice * 0.82);
        if (Array.isArray(dbVar.wholesale_tiers)) {
          tiers = dbVar.wholesale_tiers;
        }
      } else {
        const fallbackVar = initialVariantsMap.get(it.variantId) || initialVariantsMap.get(`${it.productId}_${it.quality}_${it.sleeve}_${it.size}`);
        if (fallbackVar) {
          regularUnitPrice = Number(fallbackVar.salePrice) || Number(fallbackVar.price) || 480;
          wholesaleUnitPrice = Number(fallbackVar.wholesalePrice) || Math.round(regularUnitPrice * 0.82);
          if (Array.isArray(fallbackVar.wholesaleTiers)) {
            tiers = fallbackVar.wholesaleTiers;
          }
        }
      }

      // Check tiered bulk pricing for wholesale
      let finalUnitPrice = regularUnitPrice;
      if (isItemWholesale) {
        finalUnitPrice = wholesaleUnitPrice;
        // Check if item quantity unlocks a higher tier
        if (tiers && tiers.length > 0) {
          for (const tier of tiers) {
            if (qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty)) {
              if (tier.price) {
                finalUnitPrice = Number(tier.price);
              } else if (tier.discountPercent) {
                finalUnitPrice = Math.round(regularUnitPrice * (1 - tier.discountPercent / 100));
              }
            }
          }
        }
      }

      const itemTotal = finalUnitPrice * qty;
      const regularItemTotal = regularUnitPrice * qty;
      if (isItemWholesale && regularItemTotal > itemTotal) {
        totalSavings += regularItemTotal - itemTotal;
      }

      subtotal += itemTotal;

      return {
        ...it,
        isWholesale: isItemWholesale,
        unitPrice: finalUnitPrice,
        regularPrice: regularUnitPrice,
        wholesalePrice: wholesaleUnitPrice,
        quantity: qty,
        totalPrice: itemTotal,
      };
    });

    // Delivery fee rule: Wholesale orders of 12+ pieces or retail 3+ pieces get FREE delivery
    const isFreeDelivery = totalQty >= freeDeliveryThreshold || hasWholesale;
    const deliveryFee = isFreeDelivery ? 0 : baseDeliveryCharge;
    const totalAmount = subtotal + deliveryFee;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ARH-${new Date().getFullYear()}-${randomSuffix}`;
    let orderId = `ord-${Date.now()}-${randomSuffix}`;

    // 5. Save order to Supabase and Decrement Inventory
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
            is_wholesale: hasWholesale,
            wholesale_discount: totalSavings,
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
            is_wholesale: it.isWholesale ?? false,
            wholesale_price: it.wholesalePrice || null,
          }));

          await supabaseServer.from('order_items').insert(itemsPayload);

          // Decrement stock in product_variants safely
          for (const item of verifiedItems) {
            if (item.variantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variantId)) {
              try {
                const targetVar = dbVariants.find((v) => v.id === item.variantId);
                if (targetVar) {
                  const newStock = Math.max(0, (targetVar.stock || 0) - item.quantity);
                  await supabaseServer
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
