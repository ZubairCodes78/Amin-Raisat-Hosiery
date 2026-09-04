import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpload() {
  const targetBucket = 'product-media';
  const prodId = 'test-prod-123';
  const uniqueName = `${Date.now()}_size_guide_chart.webp`;
  const storagePath = `products/${prodId}/size-guide/${uniqueName}`;

  // 1x1 transparent PNG buffer
  const sampleBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  console.log(`Uploading to bucket "${targetBucket}", path "${storagePath}"...`);
  const { data, error } = await supabase.storage
    .from(targetBucket)
    .upload(storagePath, sampleBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error.message);
  } else {
    console.log('Upload success! Data:', data);
    const { data: pubData } = supabase.storage.from(targetBucket).getPublicUrl(storagePath);
    console.log('Public URL:', pubData?.publicUrl);

    // Verify file can be read via fetch
    const res = await fetch(pubData.publicUrl);
    console.log('Public fetch status:', res.status, 'Content-Type:', res.headers.get('content-type'));

    // Clean up test file
    await supabase.storage.from(targetBucket).remove([storagePath]);
    console.log('Cleaned up test file from Supabase.');
  }
}

testUpload().catch(console.error);
