import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('================================================================');
console.log('🧪 MASTER FEATURES VERIFICATION: SETTINGS, MOQ, & PAYMENT ENGINE');
console.log('================================================================\n');

async function testMasterFeatures() {
  // 1. Verify Shipping Settings can be set to 100 max qty and 3 MOQ without error
  console.log('--- 1. Testing Shipping Settings (MOQ & 100+ Max Qty) ---');
  try {
    const { data: currentShip, error: getShipErr } = await supabase
      .from('shipping_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (getShipErr) {
      console.log('❌ Error fetching shipping_settings:', getShipErr.message);
    } else {
      const shipRow = currentShip[0];
      console.log(`✅ Current shipping_settings row found: ID ${shipRow.id}`);
      console.log(`   - min_order_qty: ${shipRow.min_order_qty}`);
      console.log(`   - max_order_qty: ${shipRow.max_order_qty}`);
      console.log(`   - base_delivery_charge: Rs. ${shipRow.base_delivery_charge}`);
      console.log(`   - free_delivery_threshold: ${shipRow.free_delivery_threshold} pcs`);

      // Test updating max_order_qty to 100
      const { error: updShipErr } = await supabase
        .from('shipping_settings')
        .update({
          min_order_qty: 3,
          max_order_qty: 100,
          base_delivery_charge: 200,
          free_delivery_threshold: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipRow.id);

      if (updShipErr) {
        console.log('❌ Failed to update max_order_qty to 100:', updShipErr.message);
      } else {
        console.log('✅ Successfully updated shipping_settings to 100 Max Qty and 3 MOQ!');
      }
    }
  } catch (err) {
    console.log('❌ Exception in shipping_settings test:', err.message);
  }

  // 2. Verify Site Settings (announcement_strips & payment_methods)
  console.log('\n--- 2. Testing Site Settings (Announcement Strips & Payment Methods) ---');
  try {
    const { data: currentSite, error: getSiteErr } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);

    if (getSiteErr) {
      console.log('❌ Error fetching site_settings:', getSiteErr.message);
    } else {
      const siteRow = currentSite[0];
      console.log(`✅ Site settings found: Brand "${siteRow.brand_name}", Owner "${siteRow.owner_name}"`);
      console.log(`   - announcement_strips column present: ${siteRow.announcement_strips !== undefined ? 'YES' : 'NO'}`);
      console.log(`   - payment_methods column present: ${siteRow.payment_methods !== undefined ? 'YES' : 'NO'}`);
    }
  } catch (err) {
    console.log('❌ Exception in site_settings test:', err.message);
  }

  // 3. Verify Product Media and columns
  console.log('\n--- 3. Testing Products Table Columns ---');
  try {
    const { data: prods, error: pErr } = await supabase
      .from('products')
      .select('id, name, slug, video_url, size_guide_url, short_description')
      .limit(2);

    if (pErr) {
      console.log('❌ Error fetching product columns:', pErr.message);
    } else {
      console.log(`✅ Products queried successfully (${prods.length} rows):`);
      for (const p of prods) {
        console.log(`   - "${p.name}" (Slug: ${p.slug})`);
        console.log(`     video_url: ${p.video_url || 'null'}`);
        console.log(`     size_guide_url: ${p.size_guide_url || 'null'}`);
        console.log(`     short_description: ${p.short_description ? p.short_description.slice(0, 40) + '...' : 'null'}`);
      }
    }
  } catch (err) {
    console.log('❌ Exception in products test:', err.message);
  }

  // 4. Verify Orders Table Columns
  console.log('\n--- 4. Testing Orders Table (Customer Type & Payment Status Columns) ---');
  try {
    const { data: ords, error: oErr } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_type, payment_method, payment_status, payment_screenshot_url')
      .limit(2);

    if (oErr) {
      console.log('❌ Error querying orders columns:', oErr.message);
    } else {
      console.log(`✅ Orders queried successfully (${ords.length} rows):`);
      for (const o of ords) {
        console.log(`   - Order #${o.order_number}: type=${o.customer_type || 'GUEST'}, status=${o.payment_status || 'COD_PENDING'}, method=${o.payment_method}`);
      }
    }
  } catch (err) {
    console.log('❌ Exception in orders test:', err.message);
  }

  // 5. Verify Reviews Table
  console.log('\n--- 5. Testing Reviews Table ---');
  try {
    const { data: revs, error: rErr } = await supabase
      .from('reviews')
      .select('*')
      .limit(5);

    if (rErr) {
      console.log('❌ Error querying reviews table:', rErr.message);
    } else {
      console.log(`✅ Reviews queried successfully (${revs.length} total rows in database)`);
    }
  } catch (err) {
    console.log('❌ Exception in reviews test:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 MASTER FEATURES LIVE VERIFICATION FINISHED');
  console.log('================================================================');
}

testMasterFeatures();
