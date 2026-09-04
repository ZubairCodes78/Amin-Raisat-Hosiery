import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const url = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const sb = createClient(url, key);

async function run() {
  const { data: cats, error: catErr } = await sb.from('categories').select('*');
  console.log('Categories:', cats, 'Error:', catErr);

  const { data: media, error: mediaErr } = await sb.from('product_media').select('*').limit(10);
  console.log('Product Media:', media, 'Error:', mediaErr);

  const existingId = 'c8bf8549-a0d5-4218-a400-b63af7ccef33';
  const { data: upData, error: upErr } = await sb.from('products').update({
    updated_at: new Date().toISOString()
  }).eq('id', existingId).select();
  console.log('Update existing result:', upData, 'Error:', upErr);

  const { data: medIns, error: medErr } = await sb.from('product_media').insert({
    product_id: existingId,
    media_type: 'size_guide',
    url: 'https://pqjpgexmupcuuqfzchhc.supabase.co/storage/v1/object/public/product-media/test_sg.webp',
    title: 'Size Guide',
    alt_text: 'Size Guide Test',
    display_order: 99
  }).select();
  console.log('Media insert result:', medIns, 'Error:', medErr);
}

run();
