import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

console.log('================================================================');
console.log('🧪 TESTING ADVANCED MULTI-TIER DYNAMIC PRODUCT VARIANT SYSTEM');
console.log(`📡 URL: ${SUPABASE_URL}`);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAdvancedDynamicVariants() {
  let passed = 0;
  let total = 0;

  function pass(label) {
    passed++;
    total++;
    console.log(`✅ [PASS] ${label}`);
  }

  function fail(label, err) {
    total++;
    console.error(`❌ [FAIL] ${label}:`, err);
  }

  let testProdId = null;

  try {
    // 1. Create Product with 4 Qualities, 3 Styles, 5 Sizes
    console.log('--- 1. Creating Garment with 4 Dynamic Qualities ---');
    const { data: prod, error: pErr } = await supabase
      .from('products')
      .insert({
        name: 'Multi-Tier Dynamic Garment',
        slug: `multi-tier-garment-${Date.now()}`,
        subtitle: 'Tested with 4 custom qualities and 3 sleeve styles',
        description: 'Demonstrating fully dynamic unlimited qualities without hardcoded limitations.',
        features: ['4 Quality Tiers', '3 Sleeve Cuts', 'Real-time sync'],
        care_instructions: ['Machine wash'],
        shipping_info: 'Free delivery on 4+ pcs',
        is_published: true,
      })
      .select()
      .single();

    if (pErr) throw pErr;
    testProdId = prod.id;
    pass(`Created Multi-Tier Product: "${prod.name}" (ID: ${prod.id})`);

    // 2. Define custom 4 qualities, 3 styles, sizes
    const qualities = ['High Quality', 'Semi High Quality', 'Low Quality', 'Underrated Quality'];
    const styles = ['Sleeveless', 'Full Sleeve', 'Half Sleeve'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const testVariants = [
      // High Quality combinations
      { quality: 'High Quality', sleeve: 'Sleeveless', size: 'M', price: 490, stock: 40, sku: 'MT-HQ-SL-M' },
      { quality: 'High Quality', sleeve: 'Full Sleeve', size: 'L', price: 560, stock: 30, sku: 'MT-HQ-FS-L' },
      { quality: 'High Quality', sleeve: 'Half Sleeve', size: 'XL', price: 530, stock: 25, sku: 'MT-HQ-HS-XL' },

      // Semi High Quality combinations
      { quality: 'Semi High Quality', sleeve: 'Sleeveless', size: 'M', price: 440, stock: 50, sku: 'MT-SHQ-SL-M' },
      { quality: 'Semi High Quality', sleeve: 'Full Sleeve', size: 'L', price: 500, stock: 35, sku: 'MT-SHQ-FS-L' },

      // Low Quality combinations (ONLY Sleeveless)
      { quality: 'Low Quality', sleeve: 'Sleeveless', size: 'S', price: 380, stock: 60, sku: 'MT-LQ-SL-S' },
      { quality: 'Low Quality', sleeve: 'Sleeveless', size: 'M', price: 380, stock: 80, sku: 'MT-LQ-SL-M' },

      // Underrated Quality combinations (ONLY Half Sleeve)
      { quality: 'Underrated Quality', sleeve: 'Half Sleeve', size: 'L', price: 340, stock: 15, sku: 'MT-UQ-HS-L' },
      { quality: 'Underrated Quality', sleeve: 'Half Sleeve', size: 'XL', price: 340, stock: 20, sku: 'MT-UQ-HS-XL' },
    ];

    const variantsPayload = testVariants.map((v) => ({
      product_id: testProdId,
      quality: v.quality,
      sleeve: v.sleeve,
      size: v.size,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
      is_available: true,
    }));

    const { data: insertedVars, error: vErr } = await supabase
      .from('product_variants')
      .insert(variantsPayload)
      .select();

    if (vErr) throw vErr;
    pass(`Saved ${insertedVars.length} dynamic variants across 4 qualities & 3 styles.`);

    // 3. Attach Variant-Specific Photos for each Quality & Style
    const { data: insertedMedia, error: mErr } = await supabase
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
    pass(`Attached ${insertedMedia.length} variant-specific photos.`);

    // 4. Verify Storefront Dynamic Resolution Simulation
    console.log('\n--- 2. Simulating Customer Dynamic Variant Navigation ---');
    const { data: loadedProd, error: lpErr } = await supabase
      .from('products')
      .select('*, product_variants(*), product_media(*)')
      .eq('id', testProdId)
      .single();

    if (lpErr) throw lpErr;

    // Test Quality 1: High Quality -> has 3 styles (Sleeveless, Full Sleeve, Half Sleeve)
    const hqSleeves = Array.from(new Set(loadedProd.product_variants.filter(v => v.quality === 'High Quality').map(v => v.sleeve)));
    if (hqSleeves.length === 3) {
      pass(`High Quality properly resolves 3 styles: ${hqSleeves.join(', ')}`);
    } else {
      fail('HQ Sleeve Resolution', `Expected 3 styles, got ${hqSleeves.length}`);
    }

    // Test Quality 3: Low Quality -> has ONLY Sleeveless
    const lqSleeves = Array.from(new Set(loadedProd.product_variants.filter(v => v.quality === 'Low Quality').map(v => v.sleeve)));
    if (lqSleeves.length === 1 && lqSleeves[0] === 'Sleeveless') {
      pass(`Low Quality properly restricts available styles to [${lqSleeves[0]}]`);
    } else {
      fail('LQ Sleeve Resolution', `Expected 1 style (Sleeveless), got ${lqSleeves.join(', ')}`);
    }

    // Test Quality 4: Underrated Quality -> has ONLY Half Sleeve
    const uqSleeves = Array.from(new Set(loadedProd.product_variants.filter(v => v.quality === 'Underrated Quality').map(v => v.sleeve)));
    if (uqSleeves.length === 1 && uqSleeves[0] === 'Half Sleeve') {
      pass(`Underrated Quality properly restricts available styles to [${uqSleeves[0]}]`);
    } else {
      fail('UQ Sleeve Resolution', `Expected 1 style (Half Sleeve), got ${uqSleeves.join(', ')}`);
    }

    // 5. Clean up temporary test product
    console.log('\n--- 3. Cleaning Up Temporary Test Garment ---');
    await supabase.from('products').delete().eq('id', testProdId);
    pass(`Test product & variants cleaned up cleanly from Supabase.`);

  } catch (err) {
    fail('Dynamic Variant Execution', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================');
}

testAdvancedDynamicVariants();
