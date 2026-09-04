import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testUpdate() {
  const { data, error } = await sb.from('site_settings').update({
    brand_name: 'Amin Raisat Hosiery',
    is_announcement_enabled: true,
  }).eq('id', '659678ea-6dd4-4321-8a91-afff2ce73ef7').select();

  console.log('Update result:', data, 'Error:', error);
}

testUpdate();
