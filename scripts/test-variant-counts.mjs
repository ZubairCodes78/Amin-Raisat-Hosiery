import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectVariants() {
  const { data: prods } = await sb.from('products').select('id, name, product_variants(*), product_media(*)');
  console.log('Products:', prods.map(p => ({
    name: p.name,
    variantsCount: p.product_variants?.length,
    mediaCount: p.product_media?.length,
  })));
}

inspectVariants();
