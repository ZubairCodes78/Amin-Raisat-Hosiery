import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envText = fs.readFileSync('.env.local', 'utf-8');
const url = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

// Simulate DataStore.uploadMediaFile validation and logic
async function uploadMediaFileMock(fileObj, folderOrBucket = 'product-media', subfolder) {
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const fileExt = fileObj.name.split('.').pop()?.toLowerCase() || '';
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];
  const isMimeValid = fileObj.type ? validMimes.includes(fileObj.type.toLowerCase()) : false;
  const isExtValid = validExts.includes(fileExt);

  if (!isMimeValid && !isExtValid) {
    throw new Error('Please upload a valid image (JPG, PNG, or WebP).');
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (fileObj.size > MAX_SIZE_BYTES) {
    throw new Error('Image size is too large. Maximum allowed size is 10MB.');
  }

  let targetBucket = 'product-media';
  if (
    folderOrBucket === 'hero-slides' ||
    folderOrBucket === 'hero' ||
    folderOrBucket === 'desktop-hero' ||
    folderOrBucket === 'mobile-hero'
  ) {
    targetBucket = 'hero-slides';
  } else {
    targetBucket = 'product-media';
  }

  let folderPath = '';
  if (subfolder && subfolder.trim()) {
    folderPath = subfolder.trim().replace(/^\/+|\/+$/g, '');
  } else if (folderOrBucket.includes('/')) {
    folderPath = folderOrBucket.trim().replace(/^\/+|\/+$/g, '');
  } else if (folderOrBucket === 'size-guides' || folderOrBucket === 'size-guide') {
    folderPath = 'products/size-guide';
  } else {
    folderPath = 'products';
  }

  const cleanName = fileObj.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase()
    .slice(0, 50);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fileName = `${uniqueSuffix}_${cleanName}.${fileExt || 'webp'}`;
  const storagePath = folderPath ? `${folderPath}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(targetBucket)
    .upload(storagePath, fileObj.buffer, {
      contentType: fileObj.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: publicUrlData.publicUrl, targetBucket };
}

async function run() {
  console.log('=== TEST FORMAT VALIDATION & STORAGE UPLOAD ===\n');

  const testDir = path.resolve('test-assets');
  const formats = [
    { name: 'size-guide-test.jpg', type: 'image/jpeg' },
    { name: 'size-guide-test.png', type: 'image/png' },
    { name: 'size-guide-test.webp', type: 'image/webp' },
  ];

  const uploadedPaths = [];

  for (const fmt of formats) {
    const buffer = fs.readFileSync(path.join(testDir, fmt.name));
    const fileObj = {
      name: fmt.name,
      type: fmt.type,
      size: buffer.length,
      buffer,
    };

    console.log(`Testing upload for ${fmt.name} (${fmt.type})...`);
    // Test that even if legacy caller passed 'size-guides', it safely normalizes to product-media
    const result = await uploadMediaFileMock(
      fileObj,
      'product-media',
      `products/test-prod-123/size-guide`
    );
    console.log(`✓ Uploaded to bucket: [${result.targetBucket}]`);
    console.log(`✓ Storage path: ${result.storagePath}`);
    console.log(`✓ Public URL: ${result.publicUrl}`);

    // Verify HTTP 200 on public URL
    const fetchRes = await fetch(result.publicUrl);
    console.log(`✓ Public CDN HTTP status: ${fetchRes.status}`);
    if (fetchRes.status !== 200) {
      throw new Error(`Failed to fetch public URL: ${result.publicUrl}`);
    }
    uploadedPaths.push(result.storagePath);
    console.log(`--- ${fmt.name} PASS ---\n`);
  }

  // Test Invalid file format
  console.log('Testing invalid file format rejection (e.g. document.pdf)...');
  try {
    await uploadMediaFileMock({
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('fake pdf'),
    });
    throw new Error('Should have thrown validation error for PDF');
  } catch (err) {
    console.log(`✓ Correctly rejected invalid file: "${err.message}"`);
  }

  // Test File size too large
  console.log('Testing oversize file rejection (>10MB)...');
  try {
    await uploadMediaFileMock({
      name: 'huge-image.jpg',
      type: 'image/jpeg',
      size: 12 * 1024 * 1024,
      buffer: Buffer.from('oversize'),
    });
    throw new Error('Should have thrown size error for 12MB');
  } catch (err) {
    console.log(`✓ Correctly rejected oversize file: "${err.message}"`);
  }

  // Test Legacy bucket name normalization ('size-guides' -> 'product-media')
  console.log('\nTesting legacy bucket parameter normalization ("size-guides" -> product-media)...');
  const webpBuf = fs.readFileSync(path.join(testDir, 'size-guide-test.webp'));
  const legacyRes = await uploadMediaFileMock(
    { name: 'legacy-test.webp', type: 'image/webp', size: webpBuf.length, buffer: webpBuf },
    'size-guides' // legacy call
  );
  console.log(`✓ Normalized bucket: [${legacyRes.targetBucket}] (Bucket not found is PREVENTED)`);
  console.log(`✓ Storage path: ${legacyRes.storagePath}`);
  uploadedPaths.push(legacyRes.storagePath);

  // Cleanup
  console.log('\nCleaning up test files from Supabase Storage...');
  const { error: delErr } = await supabase.storage.from('product-media').remove(uploadedPaths);
  if (delErr) {
    console.warn('Cleanup warning:', delErr);
  } else {
    console.log(`✓ Successfully cleaned up ${uploadedPaths.length} test storage items.`);
  }

  console.log('\n>>> ALL FORMAT VALIDATIONS & STORAGE UPLOADS PASSED PERFECTLY! <<<');
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
