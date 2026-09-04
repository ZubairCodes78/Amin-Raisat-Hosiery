import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  console.log('--- Inspecting live Supabase schema ---');
  
  const { data: orders, error: oErr } = await sb.from('orders').select('*').limit(1);
  console.log('Orders sample keys:', orders && orders[0] ? Object.keys(orders[0]) : 'None/Empty', 'Error:', oErr?.message);

  const { data: products, error: pErr } = await sb.from('products').select('*').limit(1);
  console.log('Products sample keys:', products && products[0] ? Object.keys(products[0]) : 'None/Empty', 'Error:', pErr?.message);

  const { data: site, error: sErr } = await sb.from('site_settings').select('*').limit(1);
  console.log('Site settings sample keys:', site && site[0] ? Object.keys(site[0]) : 'None/Empty', 'Error:', sErr?.message);

  const { data: shipping, error: shErr } = await sb.from('shipping_settings').select('*').limit(1);
  console.log('Shipping settings sample keys:', shipping && shipping[0] ? Object.keys(shipping[0]) : 'None/Empty', 'Error:', shErr?.message);

  const { data: media, error: mErr } = await sb.from('product_media').select('*').limit(1);
  console.log('Product media sample keys:', media && media[0] ? Object.keys(media[0]) : 'None/Empty', 'Error:', mErr?.message);

  const { data: reviews, error: rErr } = await sb.from('reviews').select('*').limit(1);
  console.log('Reviews sample keys:', reviews && reviews[0] ? Object.keys(reviews[0]) : 'None/Empty', 'Error:', rErr?.message);
}

inspect();
