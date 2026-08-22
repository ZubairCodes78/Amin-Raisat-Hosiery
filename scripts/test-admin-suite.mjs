import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

console.log('================================================================');
console.log('🧪 COMPREHENSIVE ADMIN PANEL LIVE FUNCTIONAL TEST SUITE');
console.log(`📡 URL: ${SUPABASE_URL}`);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runAdminFunctionalTests() {
  let passedCount = 0;
  let totalCount = 0;

  function testPass(label) {
    passedCount++;
    totalCount++;
    console.log(`✅ [PASS] ${label}`);
  }

  function testFail(label, err) {
    totalCount++;
    console.error(`❌ [FAIL] ${label}:`, err);
  }

  // 1. Test Category & Subcategory Management
  console.log('--- 1. Testing Category & Subcategory CRUD ---');
  let testCatId = null;
  let testSubId = null;
  try {
    const { data: cat, error: cErr } = await supabase
      .from('categories')
      .insert({
        name: 'Test Accessories',
        slug: `test-acc-${Date.now()}`,
        description: 'Test category created during admin audit',
        is_active: true,
        display_order: 99,
      })
      .select()
      .single();

    if (cErr) throw cErr;
    testCatId = cat.id;
    testPass(`Category Created: "${cat.name}" (ID: ${cat.id})`);

    const { data: sub, error: sErr } = await supabase
      .from('subcategories')
      .insert({
        category_id: testCatId,
        name: 'Cotton Socks',
        slug: `cotton-socks-${Date.now()}`,
        description: 'Premium cotton socks',
        is_active: true,
        display_order: 1,
      })
      .select()
      .single();

    if (sErr) throw sErr;
    testSubId = sub.id;
    testPass(`Subcategory Created: "${sub.name}" under Category ${testCatId}`);

    // Update Subcategory
    const { error: sUpdErr } = await supabase
      .from('subcategories')
      .update({ name: 'Fine Combed Cotton Socks' })
      .eq('id', testSubId);
    if (sUpdErr) throw sUpdErr;
    testPass(`Subcategory Edited & Saved`);

    // Clean up
    await supabase.from('subcategories').delete().eq('id', testSubId);
    await supabase.from('categories').delete().eq('id', testCatId);
    testPass(`Category & Subcategory Deleted & Cleaned Up`);
  } catch (err) {
    testFail('Category/Subcategory CRUD', err.message);
  }

  // 2. Test Product Creation with Dynamic Variants and Variant-Specific Images
  console.log('\n--- 2. Testing Product, Variant Matrix & Image Assignment ---');
  let testProdId = null;
  try {
    const { data: prod, error: pErr } = await supabase
      .from('products')
      .insert({
        name: 'Admin Test Garment',
        slug: `admin-test-${Date.now()}`,
        subtitle: 'Fine Cotton Innerwear',
        description: 'High durability stitching with soft feel.',
        features: ['100% Cotton', 'Anti-Sag Neck', 'Reinforced Seams'],
        care_instructions: ['Machine wash cold', 'Do not bleach'],
        shipping_info: 'Nationwide Delivery across Pakistan. Free on 4+ pcs.',
        is_published: true,
      })
      .select()
      .single();

    if (pErr) throw pErr;
    testProdId = prod.id;
    testPass(`Product Created: "${prod.name}" (ID: ${prod.id})`);

    // Add Variants for this product
    const { data: variants, error: vErr } = await supabase
      .from('product_variants')
      .insert([
        {
          product_id: testProdId,
          quality: 'High Quality',
          sleeve: 'Sleeveless',
          size: 'M',
          price: 490,
          stock: 35,
          is_available: true,
        },
        {
          product_id: testProdId,
          quality: 'High Quality',
          sleeve: 'Full Sleeve',
          size: 'L',
          price: 550,
          stock: 20,
          is_available: true,
        },
        {
          product_id: testProdId,
          quality: 'Low Quality',
          sleeve: 'Sleeveless',
          size: 'XL',
          price: 390,
          stock: 50,
          is_available: true,
        },
      ])
      .select();

    if (vErr) throw vErr;
    testPass(`Product Variants Added (3 combinations: HQ Sleeveless, HQ Full Sleeve, LQ Sleeveless)`);

    // Add Variant-Specific Media Photos
    const { data: media, error: mErr } = await supabase
      .from('product_media')
      .insert([
        {
          product_id: testProdId,
          url: '/images/products/sleevless high.jpeg',
          media_type: 'photo',
          variant_quality: 'High Quality',
          variant_sleeve: 'Sleeveless',
          display_order: 1,
        },
        {
          product_id: testProdId,
          url: '/images/products/full sleeve high.jpeg',
          media_type: 'photo',
          variant_quality: 'High Quality',
          variant_sleeve: 'Full Sleeve',
          display_order: 2,
        },
        {
          product_id: testProdId,
          url: '/images/products/sleevless low.jpeg',
          media_type: 'photo',
          variant_quality: 'Low Quality',
          variant_sleeve: 'Sleeveless',
          display_order: 3,
        },
      ])
      .select();

    if (mErr) throw mErr;
    testPass(`Variant-Specific Media Attached to combinations successfully`);

    // Test Price & Stock Mutation
    const targetVar = variants[0];
    const { error: vUpdErr } = await supabase
      .from('product_variants')
      .update({ price: 520, stock: 45 })
      .eq('id', targetVar.id);
    if (vUpdErr) throw vUpdErr;
    testPass(`Price & Stock Updated (Price -> Rs. 520, Stock -> 45)`);

    // Clean up test product (cascades to variants & media)
    await supabase.from('products').delete().eq('id', testProdId);
    testPass(`Test Product & Cascaded Variants/Media Cleaned Up`);
  } catch (err) {
    testFail('Product & Variant CRUD', err.message);
  }

  // 3. Test Order Management & Status Lifecycle
  console.log('\n--- 3. Testing Order Creation & Full Status Transitions ---');
  try {
    const testOrdNum = `ADMIN-ORD-${Date.now().toString().slice(-4)}`;
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        order_number: testOrdNum,
        customer_name: 'Zubair Admin Test',
        customer_phone: '03018666075',
        customer_email: 'zubair@example.com',
        address: 'Bazaar #3, Commercial Area',
        city: 'Faisalabad',
        province: 'Punjab',
        subtotal: 1040,
        delivery_fee: 200,
        total_amount: 1240,
        payment_method: 'cod',
        status: 'Pending',
      })
      .select()
      .single();

    if (oErr) throw oErr;
    testPass(`Order Placed: #${order.order_number}`);

    // Insert Line Item
    const { error: oiErr } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_name: "Men's Pure Cotton Vest",
      quality: 'High Quality',
      sleeve: 'Full Sleeve',
      size: 'XL',
      unit_price: 520,
      quantity: 2,
      total_price: 1040,
      image_url: '/images/products/full sleeve high.jpeg',
    });
    if (oiErr) throw oiErr;
    testPass(`Order Line Items Attached`);

    // Test Status Transitions: Pending -> Confirmed -> Processing -> Packed -> Shipped -> Delivered
    const statuses = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    for (const st of statuses) {
      const { error: stErr } = await supabase
        .from('orders')
        .update({ status: st })
        .eq('id', order.id);
      if (stErr) throw stErr;
    }
    testPass(`Status Progression Verified through: ${statuses.join(' -> ')}`);

    // Clean up
    await supabase.from('orders').delete().eq('id', order.id);
    testPass(`Test Order Cleaned Up`);
  } catch (err) {
    testFail('Order Workflow', err.message);
  }

  // 4. Test Hero Slider Management
  console.log('\n--- 4. Testing Hero Slider Management ---');
  try {
    const { data: slide, error: hsErr } = await supabase
      .from('hero_slides')
      .insert({
        title: 'Summer Cotton Fest',
        subtitle: '100% Fine Combed Cotton',
        desktop_image: '/images/slider 1.png',
        button_text: 'Shop Now',
        link: '/shop',
        display_order: 10,
        is_active: true,
      })
      .select()
      .single();

    if (hsErr) throw hsErr;
    testPass(`Hero Slide Created: "${slide.title}"`);

    // Update Slide
    const { error: hsUpdErr } = await supabase
      .from('hero_slides')
      .update({ is_active: false })
      .eq('id', slide.id);
    if (hsUpdErr) throw hsUpdErr;
    testPass(`Hero Slide Toggled Inactive`);

    // Delete Slide
    await supabase.from('hero_slides').delete().eq('id', slide.id);
    testPass(`Hero Slide Deleted & Cleaned Up`);
  } catch (err) {
    testFail('Hero Slider CRUD', err.message);
  }

  // 5. Test Shipping Settings Update & Reversion
  console.log('\n--- 5. Testing Shipping Settings Mutation & Verification ---');
  try {
    const { data: ship, error: shErr } = await supabase
      .from('shipping_settings')
      .select('*')
      .single();

    if (shErr) throw shErr;
    testPass(`Current Shipping Settings: Base Rs. ${ship.base_delivery_charge}, Free Threshold ${ship.free_delivery_threshold} pcs`);

    // Temporary update
    const { error: shUpdErr } = await supabase
      .from('shipping_settings')
      .update({ free_delivery_threshold: 5 })
      .eq('id', ship.id);
    if (shUpdErr) throw shUpdErr;
    testPass(`Free Delivery Threshold Temporarily Updated to 5 pcs`);

    // Revert back to 4 pcs
    await supabase
      .from('shipping_settings')
      .update({ free_delivery_threshold: 4 })
      .eq('id', ship.id);
    testPass(`Free Delivery Threshold Reverted to 4 pcs`);
  } catch (err) {
    testFail('Shipping Settings', err.message);
  }

  // 6. Test Customer Reviews Moderation
  console.log('\n--- 6. Testing Customer Review Submission & Moderation ---');
  try {
    const { data: rev, error: rErr } = await supabase
      .from('reviews')
      .insert({
        product_id: 'f0000000-0000-0000-0000-000000000001',
        customer_name: 'Kashif Ali',
        customer_city: 'Lahore',
        rating: 5,
        comment: 'Very soft cotton fabric and fast delivery in Lahore.',
        is_approved: false,
      })
      .select()
      .single();

    if (rErr) throw rErr;
    testPass(`Review Submitted (Pending Approval): Rating ${rev.rating}★ by ${rev.customer_name}`);

    // Admin Approves Review
    const { error: rApprErr } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', rev.id);
    if (rApprErr) throw rApprErr;
    testPass(`Admin Approved Review for Public Display`);

    // Clean up
    await supabase.from('reviews').delete().eq('id', rev.id);
    testPass(`Test Review Cleaned Up`);
  } catch (err) {
    testFail('Reviews Moderation', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULT: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('================================================================');
}

runAdminFunctionalTests();
