import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANON_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

// Use service key if available, else anon
const supabase = createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY);

async function diagnose() {
  console.log('\n======= LIVE DATABASE DIAGNOSTIC =======\n');

  // 1. Products
  const { data: prods, error: prodsErr } = await supabase
    .from('products')
    .select('id, name, slug, is_published, created_at')
    .order('created_at', { ascending: false });

  console.log('Products (count:', prods?.length ?? 'ERROR', '):');
  if (prodsErr) console.error('  Error:', prodsErr.message);
  for (const p of (prods || [])) {
    console.log(`  [${p.id}] ${p.name} | slug: ${p.slug} | published: ${p.is_published}`);
  }

  // 2. For each product, check variants + media
  for (const p of (prods || [])) {
    const { data: vars } = await supabase.from('product_variants').select('id, size, quality, sleeve, price').eq('product_id', p.id);
    const { data: media } = await supabase.from('product_media').select('id, url').eq('product_id', p.id);
    console.log(`\n  [${p.name}]`);
    console.log(`    Variants (${vars?.length ?? 0}):`, vars?.map(v => `${v.quality} ${v.sleeve} ${v.size} @${v.price}`).join(', ') || 'NONE');
    console.log(`    Media (${media?.length ?? 0}):`, media?.map(m => m.url).join('\n      ') || 'NONE');
  }

  // 3. Check _system marker
  console.log('\n  Checking _system/catalog_initialized.marker...');
  const { data: marker } = await supabase.storage.from('product-media').list('_system');
  if (marker && marker.length > 0) {
    console.log('  MARKER EXISTS:', marker.map(m => m.name).join(', '));
  } else {
    console.log('  MARKER NOT FOUND');
  }

  // 4. Check IDs specifically  
  console.log('\n  Checking for hardcoded f0000000 UUIDs:');
  const { data: baseProds } = await supabase.from('products').select('id, name').in('id', [
    'f0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
  ]);
  if (baseProds && baseProds.length > 0) {
    console.log('  FOUND f0000000 UUIDs:', baseProds.map(p => `${p.id}: ${p.name}`).join('\n    '));
  } else {
    console.log('  NO f0000000 UUIDs found — products have random UUIDs');
  }

  console.log('\n======= END DIAGNOSTIC =======\n');
}

diagnose().catch(console.error);
