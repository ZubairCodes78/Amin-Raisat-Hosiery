import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCoreUpdate() {
  const { data, error } = await sb.from('site_settings').update({
    brand_name: 'Amin Raisat Hosiery',
    owner_name: 'Muhammad Amin',
    phone: '03088666075',
    whatsapp: '03088666075',
    email: 'info@aminhosiery.com',
    bank_name: 'Meezan Bank Ltd.',
    account_title: 'Muhammad Amin',
    account_number: '01010101010101',
    iban: 'PK00MEZN0000000000000000',
    is_store_open: true,
    announcement_text: 'Free shipping on orders above 3 items!',
    updated_at: new Date().toISOString()
  }).eq('id', '659678ea-6dd4-4321-8a91-afff2ce73ef7').select();

  console.log('Core update result:', data, 'Error:', error);
}

testCoreUpdate();
