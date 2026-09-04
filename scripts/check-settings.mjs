import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const ANON_KEY = 'sb_publishable_NGQj434a2YlJRZ-OVzst1g_tw3QYVSP';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function check() {
  const { data: ship, error: shErr } = await supabase.from('shipping_settings').select('*');
  console.log('shipping_settings:', JSON.stringify(ship, null, 2), 'error:', shErr);

  const { data: site, error: siErr } = await supabase.from('site_settings').select('*');
  console.log('site_settings:', JSON.stringify(site, null, 2), 'error:', siErr);

  // Test updating shipping_settings
  if (ship && ship.length > 0) {
    console.log('Testing update on shipping_settings id:', ship[0].id);
    const { data: upd, error: updErr } = await supabase
      .from('shipping_settings')
      .update({ max_order_qty: 100 })
      .eq('id', ship[0].id)
      .select();
    console.log('Update result:', upd, 'error:', updErr);
  }
}

check();
