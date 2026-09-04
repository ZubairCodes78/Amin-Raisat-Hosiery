import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSettings() {
  const { data: site, error: sErr } = await sb.from('site_settings').select('*').limit(1).single();
  console.log('Current site settings:', site, 'Error:', sErr);

  const { data: ship, error: shErr } = await sb.from('shipping_settings').select('*').limit(1).single();
  console.log('Current shipping settings:', ship, 'Error:', shErr);
}

testSettings();
