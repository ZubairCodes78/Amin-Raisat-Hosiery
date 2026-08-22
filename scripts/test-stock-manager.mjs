import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

console.log('================================================================');
console.log('🧪 TESTING UNIVERSAL CATALOG-WIDE INVENTORY & STOCK MANAGER');
console.log(`📡 URL: ${SUPABASE_URL}`);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runStockManagerTest() {
  let passed = 0;
  let total = 0;

  function pass(msg) {
    passed++;
    total++;
    console.log(`✅ [PASS] ${msg}`);
  }

  function fail(msg, err) {
    total++;
    console.error(`❌ [FAIL] ${msg}:`, err);
  }

  // 1. Verify existing Men's Pure Cotton Vest is loaded
  console.log('--- 1. Testing Existing Catalog Products in Inventory ---');
  try {
    const { data: prods, error: pErr } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: true });

    if (pErr) throw pErr;
    pass(`Loaded ${prods.length} existing products in catalog.`);
    for (const p of prods) {
      console.log(`   • Product: "${p.name}" (Slug: ${p.slug}) -> ${p.product_variants?.length || 0} variants loaded`);
    }
  } catch (err) {
    fail('Existing Catalog Check', err.message);
  }

  // 2. Simulate adding a second product from Admin (e.g. Women's Cotton Innerwear)
  console.log('\n--- 2. Simulating Adding a New Multi-Variant Product to Catalog ---');
  let newProdId = null;
  try {
    const { data: newProd, error: npErr } = await supabase
      .from('products')
      .insert({
        name: "Women's Combed Cotton Camisole",
        slug: `womens-camisole-${Date.now()}`,
        subtitle: 'Ultra-soft daily wear',
        description: 'Made from 100% fine cotton.',
        is_published: true,
      })
      .select()
      .single();

    if (npErr) throw npErr;
    newProdId = newProd.id;
    pass(`New Product Created: "${newProd.name}" (ID: ${newProd.id})`);

    // Insert 4 custom variants with different qualities, sleeves, sizes, prices, and stock
    const { data: variants, error: vErr } = await supabase
      .from('product_variants')
      .insert([
        {
          product_id: newProdId,
          quality: 'Premium Cotton',
          sleeve: 'Sleeveless / Straps',
          size: 'S',
          price: 520,
          stock: 40,
          is_available: true,
        },
        {
          product_id: newProdId,
          quality: 'Premium Cotton',
          sleeve: 'Sleeveless / Straps',
          size: 'M',
          price: 520,
          stock: 8, // low stock test
          is_available: true,
        },
        {
          product_id: newProdId,
          quality: 'Premium Cotton',
          sleeve: 'Sleeveless / Straps',
          size: 'L',
          price: 520,
          stock: 0, // out of stock test
          is_available: true,
        },
        {
          product_id: newProdId,
          quality: 'Soft Rib',
          sleeve: 'Short Sleeve',
          size: 'M',
          price: 590,
          stock: 25,
          is_available: true,
        },
      ])
      .select();

    if (vErr) throw vErr;
    pass(`Added 4 dynamic variants to "${newProd.name}" (Ready, Low-Stock, Out-of-Stock)`);

    // 3. Test Stock Query & Aggregation
    console.log('\n--- 3. Testing Real-Time Catalog Aggregations ---');
    const { data: allProds, error: allErr } = await supabase
      .from('products')
      .select('*, product_variants(*)');

    if (allErr) throw allErr;
    const totalVariants = allProds.flatMap((p) => p.product_variants || []);
    const totalStockUnits = totalVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const lowStock = totalVariants.filter((v) => v.stock > 0 && v.stock <= 10).length;
    const outOfStock = totalVariants.filter((v) => v.stock <= 0).length;

    pass(`Live Aggregation: ${allProds.length} Products, ${totalVariants.length} Variants, ${totalStockUnits} Total Stock Units`);
    pass(`Inventory Indicators: ${lowStock} Low Stock Variants, ${outOfStock} Out of Stock Variants`);

    // 4. Test Stock Number Mutation (e.g. Replenish Stock 0 -> 60)
    console.log('\n--- 4. Testing Direct Stock Mutation ---');
    const outVariant = variants.find((v) => v.stock === 0);
    const { error: updErr } = await supabase
      .from('product_variants')
      .update({ stock: 60 })
      .eq('id', outVariant.id);

    if (updErr) throw updErr;
    pass(`Replenished Out-of-Stock Variant from 0 to 60 units`);

    // 5. Test Price Update Sync
    console.log('\n--- 5. Testing Price Synchronization ---');
    const { error: prcErr } = await supabase
      .from('product_variants')
      .update({ price: 650 })
      .eq('id', variants[0].id);

    if (prcErr) throw prcErr;
    pass(`Variant Price Updated (Rs. 520 -> Rs. 650) - Synchronized with variant matrix`);

    // 6. Delete Test Product (Ensure Cascading Cleanliness)
    console.log('\n--- 6. Testing Product Deletion in Inventory ---');
    await supabase.from('products').delete().eq('id', newProdId);
    
    // Verify no orphaned variants exist
    const { data: orphaned } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', newProdId);

    if (!orphaned || orphaned.length === 0) {
      pass(`Product deleted cleanly. Zero orphaned variants in database.`);
    } else {
      fail('Cascade Delete', `${orphaned.length} orphaned variants remained`);
    }
  } catch (err) {
    fail('Universal Stock Test', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 TEST COMPLETE: ${passed}/${total} PASSED`);
  console.log('================================================================');
}

runStockManagerTest();
