import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

console.log('================================================================');
console.log('🚀 LIVE SUPABASE END-TO-END VERIFICATION — AMIN RAISAT HOSIERY');
console.log(`📡 URL: ${SUPABASE_URL}`);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'categories',
  'subcategories',
  'products',
  'product_variants',
  'product_media',
  'orders',
  'order_items',
  'hero_slides',
  'shipping_settings',
  'site_settings',
  'reviews',
];

const BUCKETS = ['product-media', 'hero-slides'];

async function runComprehensiveVerification() {
  const summary = {
    tables: {},
    buckets: {},
    productData: null,
    orderFlow: null,
    adminCrud: null,
    settings: null,
  };

  // 1. Check all 11 Database Tables
  console.log('--- 1. Testing Database Tables & Row-Level Access ---');
  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false });
      if (error) {
        summary.tables[table] = { status: '❌ Failed', message: error.message };
        console.log(`❌ Table '${table}': ${error.message} (${error.code || 'no-code'})`);
      } else {
        summary.tables[table] = { status: '✅ Working', count: data?.length || 0 };
        console.log(`✅ Table '${table}': Accessible (${data?.length || 0} rows found)`);
      }
    } catch (err) {
      summary.tables[table] = { status: '❌ Exception', message: err.message };
      console.log(`❌ Table '${table}': Exception - ${err.message}`);
    }
  }

  // 2. Check Storage Buckets
  console.log('\n--- 2. Testing Storage Buckets ---');
  for (const bucket of BUCKETS) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', { limit: 5 });
      if (error) {
        summary.buckets[bucket] = { status: '❌ Failed', message: error.message };
        console.log(`❌ Bucket '${bucket}': ${error.message}`);
      } else {
        summary.buckets[bucket] = { status: '✅ Working', count: data?.length || 0 };
        console.log(`✅ Bucket '${bucket}': Active on CDN (${data?.length || 0} files)`);
      }
    } catch (err) {
      summary.buckets[bucket] = { status: '❌ Exception', message: err.message };
      console.log(`❌ Bucket '${bucket}': Exception - ${err.message}`);
    }
  }

  // 3. Verify Seeded Product, Variants & Media
  console.log('\n--- 3. Verifying Seeded Men\'s Vest Product & Variant Matrix ---');
  try {
    const { data: prods, error: pErr } = await supabase
      .from('products')
      .select('*, product_variants(*), product_media(*)')
      .eq('slug', 'mens-vest');

    if (pErr || !prods || prods.length === 0) {
      console.log(`❌ Men's Vest Product not found: ${pErr?.message || 'Empty'}`);
    } else {
      const product = prods[0];
      console.log(`✅ Product Found: "${product.name}" (ID: ${product.id}, Slug: ${product.slug})`);
      console.log(`   - Variants count: ${product.product_variants?.length || 0}`);
      
      const highSleeveless = product.product_variants.filter(v => v.quality === 'High Quality' && v.sleeve === 'Sleeveless');
      const highFullSleeve = product.product_variants.filter(v => v.quality === 'High Quality' && v.sleeve === 'Full Sleeve');
      const lowSleeveless = product.product_variants.filter(v => v.quality === 'Low Quality' && v.sleeve === 'Sleeveless');

      console.log(`     * High Quality + Sleeveless: ${highSleeveless.length} sizes (e.g. Price Rs. ${highSleeveless[0]?.price})`);
      console.log(`     * High Quality + Full Sleeve: ${highFullSleeve.length} sizes (e.g. Price Rs. ${highFullSleeve[0]?.price})`);
      console.log(`     * Low Quality + Sleeveless: ${lowSleeveless.length} sizes (e.g. Price Rs. ${lowSleeveless[0]?.price})`);

      console.log(`   - Media photos count: ${product.product_media?.length || 0}`);
      for (const m of product.product_media || []) {
        console.log(`     * Photo: "${m.url}" -> Quality: [${m.variant_quality || 'All'}], Sleeve: [${m.variant_sleeve || 'All'}]`);
      }
    }
  } catch (err) {
    console.log(`❌ Product Verification Exception: ${err.message}`);
  }

  // 4. Test Live Shipping Settings & Site Settings
  console.log('\n--- 4. Verifying Shipping Settings & Site Settings ---');
  try {
    const { data: ship } = await supabase.from('shipping_settings').select('*').single();
    if (ship) {
      console.log(`✅ Shipping Settings: Base Delivery Rs. ${ship.base_delivery_charge}, Free Delivery Threshold ${ship.free_delivery_threshold} pcs, Min Qty ${ship.min_order_qty}`);
    } else {
      console.log(`⚠️ Shipping Settings row missing`);
    }

    const { data: site } = await supabase.from('site_settings').select('*').single();
    if (site) {
      console.log(`✅ Site Settings: Brand "${site.brand_name}", Owner "${site.owner_name}", WhatsApp "${site.whatsapp}", Phone "${site.phone}"`);
    } else {
      console.log(`⚠️ Site Settings row missing`);
    }
  } catch (err) {
    console.log(`❌ Settings Exception: ${err.message}`);
  }

  // 5. Test Live Guest Checkout Order Flow
  console.log('\n--- 5. Testing Live Guest Order Placement & Admin Management ---');
  const testOrderNum = `TEST-${Date.now().toString().slice(-5)}`;
  try {
    const { data: order, error: ordErr } = await supabase
      .from('orders')
      .insert({
        order_number: testOrderNum,
        customer_name: 'Test Customer',
        customer_phone: '03088666075',
        customer_email: 'customer@example.com',
        address: 'Main Commercial Area, Gulberg III',
        city: 'Lahore',
        province: 'Punjab',
        subtotal: 960,
        delivery_fee: 200,
        total_amount: 1160,
        payment_method: 'cod',
        status: 'Pending',
      })
      .select()
      .single();

    if (ordErr) {
      console.log(`❌ Order Placement Failed: ${ordErr.message}`);
    } else {
      console.log(`✅ Guest Order Created: ID ${order.id}, Order #${order.order_number}`);

      // Insert Order Items
      const { data: item, error: itmErr } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_name: "Men's Pure Cotton Vest",
        quality: 'High Quality',
        sleeve: 'Sleeveless',
        size: 'L',
        unit_price: 480,
        quantity: 2,
        total_price: 960,
        image_url: '/images/products/sleevless high.jpeg',
      });

      if (itmErr) {
        console.log(`❌ Order Item Insert Failed: ${itmErr.message}`);
      } else {
        console.log(`✅ Order Item Inserted Successfully`);
      }

      // Test Admin Status Update (e.g. Pending -> Confirmed -> Shipped)
      const { error: updErr } = await supabase
        .from('orders')
        .update({ status: 'Confirmed' })
        .eq('id', order.id);

      if (updErr) {
        console.log(`❌ Order Status Update Failed: ${updErr.message}`);
      } else {
        console.log(`✅ Admin Order Status Update ('Pending' -> 'Confirmed') Succeeded`);
      }

      // Cleanup test order
      await supabase.from('orders').delete().eq('id', order.id);
      console.log(`✅ Cleaned up test order #${testOrderNum}`);
    }
  } catch (err) {
    console.log(`❌ Order Flow Exception: ${err.message}`);
  }

  // 6. Test Admin CRUD Flow (Create Test Product -> Edit Price & Stock -> Delete)
  console.log('\n--- 6. Testing Live Admin Product CRUD Simulation ---');
  const tempSlug = `test-item-${Date.now().toString().slice(-4)}`;
  try {
    const { data: newProd, error: npErr } = await supabase
      .from('products')
      .insert({
        name: 'Admin Test Item',
        slug: tempSlug,
        subtitle: 'Created during live verification',
        description: 'Test description',
        is_published: true,
      })
      .select()
      .single();

    if (npErr) {
      console.log(`❌ Admin Product Creation Failed: ${npErr.message}`);
    } else {
      console.log(`✅ Admin Create Product Succeeded: ID ${newProd.id}`);

      // Add Variant
      const { data: newVar, error: nvErr } = await supabase
        .from('product_variants')
        .insert({
          product_id: newProd.id,
          quality: 'High Quality',
          sleeve: 'Sleeveless',
          size: 'M',
          price: 550,
          stock: 25,
          is_available: true,
        })
        .select()
        .single();

      if (nvErr) {
        console.log(`❌ Admin Variant Add Failed: ${nvErr.message}`);
      } else {
        console.log(`✅ Admin Add Variant Succeeded: Price Rs. ${newVar.price}, Stock ${newVar.stock}`);

        // Update Price & Stock
        const { error: updVarErr } = await supabase
          .from('product_variants')
          .update({ price: 600, stock: 40 })
          .eq('id', newVar.id);

        if (updVarErr) {
          console.log(`❌ Admin Update Price/Stock Failed: ${updVarErr.message}`);
        } else {
          console.log(`✅ Admin Update Price & Stock Succeeded: Price -> Rs. 600, Stock -> 40`);
        }
      }

      // Delete Product (Cascades to variant)
      const { error: delErr } = await supabase.from('products').delete().eq('id', newProd.id);
      if (delErr) {
        console.log(`❌ Admin Delete Product Failed: ${delErr.message}`);
      } else {
        console.log(`✅ Admin Delete Product Succeeded`);
      }
    }
  } catch (err) {
    console.log(`❌ Admin CRUD Exception: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL LIVE TESTS COMPLETED');
  console.log('================================================================');
}

runComprehensiveVerification();
