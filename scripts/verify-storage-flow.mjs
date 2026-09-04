import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env.local manually
try {
  const envText = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn('Could not read .env.local');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminSupabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

async function runTests() {
  console.log('--- TEST 1: Verify Supabase Storage Upload to product-media ---');
  const dummyBuffer = Buffer.from('RIFF....WEBPVP8 ... dummy webp content');
  const timestamp = Date.now();
  const testProductId = `test-prod-${timestamp}`;
  const testPath = `products/${testProductId}/size-guide/${timestamp}_test_chart.webp`;

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('product-media')
    .upload(testPath, dummyBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadErr) {
    console.error('FAILED to upload to product-media:', uploadErr);
    process.exit(1);
  }
  console.log('Upload success! Uploaded path:', uploadData.path);

  // Verify file actually exists in product-media bucket
  const { data: listData, error: listErr } = await supabase.storage
    .from('product-media')
    .list(`products/${testProductId}/size-guide`);

  if (listErr || !listData || listData.length === 0) {
    console.error('FAILED: File was not found when listing product-media bucket:', listErr);
    process.exit(1);
  }
  console.log('VERIFIED: File actually exists in Supabase Storage product-media bucket:', listData[0].name);

  const { data: publicUrlData } = supabase.storage
    .from('product-media')
    .getPublicUrl(testPath);
  console.log('Public URL generated:', publicUrlData.publicUrl);

  const res = await fetch(publicUrlData.publicUrl);
  console.log('Public URL HTTP status:', res.status);
  if (res.status !== 200) {
    console.error('FAILED: Public URL did not return 200');
    process.exit(1);
  }

  console.log('\n--- TEST 2: Product Creation Validation (Mandatory Size Guide) ---');
  // Attempt to create product without Size Guide via API
  const createFailRes = await fetch('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': 'authenticated',
    },
    body: JSON.stringify({
      id: testProductId,
      name: 'Test Product No Size Guide',
      slug: `test-prod-no-sg-${timestamp}`,
      description: 'Testing mandatory size guide validation',
      categoryId: 'c0000000-0000-0000-0000-000000000001',
      variants: [{
        id: `var-${testProductId}-1`,
        productId: testProductId,
        quality: 'High Quality',
        sleeve: 'Sleeveless',
        size: 'M',
        price: 950,
        stock: 10,
      }],
      media: [],
      // sizeGuideUrl omitted!
    }),
  });

  const createFailJson = await createFailRes.json();
  console.log('Create without sizeGuide status:', createFailRes.status, 'Response:', createFailJson);
  if (createFailRes.status !== 400 || !createFailJson.error?.includes('Size Guide image is required')) {
    console.error('FAILED: Product creation without size guide should have been blocked with 400 error');
    process.exit(1);
  }
  console.log('VERIFIED: Creation correctly blocked when Size Guide is missing!');

  console.log('\n--- TEST 3: Product Creation with Size Guide ---');
  const createSuccessRes = await fetch('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': 'authenticated',
    },
    body: JSON.stringify({
      id: testProductId,
      name: 'Test Product With Size Guide A',
      slug: `test-prod-sg-a-${timestamp}`,
      description: 'Testing successful size guide persistence',
      categoryId: 'c0000000-0000-0000-0000-000000000001',
      sizeGuideUrl: publicUrlData.publicUrl,
      variants: [{
        id: `var-${testProductId}-1`,
        productId: testProductId,
        quality: 'High Quality',
        sleeve: 'Sleeveless',
        size: 'L',
        price: 950,
        stock: 10,
      }],
      media: [{
        id: `med-${testProductId}-sg`,
        productId: testProductId,
        type: 'size_guide',
        url: publicUrlData.publicUrl,
        alt: 'Test Product Size Guide Chart',
        title: 'Size Guide',
        variantSleeve: 'size_guide',
        displayOrder: 99,
      }],
    }),
  });

  const createSuccessJson = await createSuccessRes.json();
  console.log('Create with sizeGuide status:', createSuccessRes.status);
  if (createSuccessRes.status !== 200 || !createSuccessJson.product?.sizeGuideUrl) {
    console.error('FAILED to create product with size guide:', createSuccessJson);
    process.exit(1);
  }
  console.log('VERIFIED: Product created! sizeGuideUrl in DB:', createSuccessJson.product.sizeGuideUrl);

  console.log('\n--- TEST 4: Product Duplication & Independent Replacement ---');
  const dupRes = await fetch('http://localhost:3000/api/admin/products/duplicate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': 'authenticated',
    },
    body: JSON.stringify({ productId: testProductId }),
  });

  const dupJson = await dupRes.json();
  console.log('Duplicate status:', dupRes.status);
  if (dupRes.status !== 200 || !dupJson.product) {
    console.error('FAILED to duplicate product:', dupJson);
    process.exit(1);
  }
  const dupProduct = dupJson.product;
  console.log('VERIFIED: Duplicated product ID:', dupProduct.id, 'Cloned sizeGuideUrl:', dupProduct.sizeGuideUrl);
  if (dupProduct.sizeGuideUrl !== publicUrlData.publicUrl) {
    console.error('FAILED: Cloned product did not retain valid Size Guide reference');
    process.exit(1);
  }

  // Now replace duplicate's Size Guide with a distinct new image
  const dupChartPath = `products/${dupProduct.id}/size-guide/${timestamp}_dup_chart_b.webp`;
  const { data: dupUploadData, error: dupUploadErr } = await supabase.storage
    .from('product-media')
    .upload(dupChartPath, dummyBuffer, { contentType: 'image/webp', upsert: true });

  if (dupUploadErr) {
    console.error('FAILED to upload duplicate size guide:', dupUploadErr);
    process.exit(1);
  }
  const { data: dupUrlData } = supabase.storage.from('product-media').getPublicUrl(dupChartPath);

  console.log('Uploaded new Size Guide for duplicate:', dupUrlData.publicUrl);
  // Update duplicate product
  const updateDupRes = await fetch('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': 'authenticated',
    },
    body: JSON.stringify({
      ...dupProduct,
      sizeGuideUrl: dupUrlData.publicUrl,
      media: [{
        id: `med-${dupProduct.id}-sg-new`,
        productId: dupProduct.id,
        type: 'size_guide',
        url: dupUrlData.publicUrl,
        alt: 'Duplicate Size Guide',
        title: 'Size Guide',
        variantSleeve: 'size_guide',
        displayOrder: 99,
      }],
    }),
  });

  const updateDupJson = await updateDupRes.json();
  console.log('Update duplicate status:', updateDupRes.status);

  // Fetch original product to confirm it was NOT modified
  const origRes = await fetch(`http://localhost:3000/api/products?id=${testProductId}`);
  const origJson = await origRes.json();
  const origProd = (origJson.products || []).find((p) => p.id === testProductId) || origJson;
  console.log('Original Product Size Guide URL:', origProd.sizeGuideUrl);
  console.log('Duplicate Product Size Guide URL:', updateDupJson.product.sizeGuideUrl);

  if (origProd.sizeGuideUrl === updateDupJson.product.sizeGuideUrl) {
    console.error('FAILED: Mutating duplicate affected original product sizeGuideUrl!');
    process.exit(1);
  }
  console.log('VERIFIED: Changing duplicate does NOT affect original product!');

  console.log('\n--- CLEANUP ---');
  // Clean up created test products
  await fetch(`http://localhost:3000/api/admin/products?id=${testProductId}`, {
    method: 'DELETE',
    headers: { 'x-admin-auth': 'authenticated' },
  });
  await fetch(`http://localhost:3000/api/admin/products?id=${dupProduct.id}`, {
    method: 'DELETE',
    headers: { 'x-admin-auth': 'authenticated' },
  });
  // Clean up storage test files
  await supabase.storage.from('product-media').remove([testPath, dupChartPath]);
  console.log('CLEANUP COMPLETE: Test products and storage objects removed.');

  console.log('\nALL BACKEND STORAGE & API VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
