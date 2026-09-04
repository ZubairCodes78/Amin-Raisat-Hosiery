/**
 * One-time seed script: Inserts/restores the 2 baseline products via the
 * live production API POST endpoint (which uses the server-side service role key).
 * Products A and B are inserted with their canonical f0000000 UUIDs.
 */

const API_BASE = 'https://aminhosiery.com';

const MEDIA_MAP = {
  '/images/products/sleevless high.jpeg': 'https://pqjpgexmupcuuqfzchhc.supabase.co/storage/v1/object/public/product-media/original_products/sleevless_high.jpeg',
  '/images/products/full sleeve high.jpeg': 'https://pqjpgexmupcuuqfzchhc.supabase.co/storage/v1/object/public/product-media/original_products/full_sleeve_high.jpeg',
  '/images/products/sleevless low.jpeg': 'https://pqjpgexmupcuuqfzchhc.supabase.co/storage/v1/object/public/product-media/original_products/sleevless_low.jpeg',
};

function mapMediaUrl(url) {
  return MEDIA_MAP[url] || url;
}

const PRODUCTS = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    categoryId: 'cat-men',
    subcategoryId: 'sub-men-vests',
    name: "Men's Pure Cotton Vest — High Quality (Taped Seams)",
    slug: 'mens-vest-high-quality',
    subtitle: '100% Combed Cotton Breathable Innerwear with Anti-Sag Neck & Shoulder Seam Tape',
    description: "Engineered for long-lasting durability in Pakistani climate, the Amin Raisat Hosiery High-Quality Men's Vest is crafted from 100% fine combed cotton. Features protective reinforcement tape along the neck and shoulder seams to maintain its shape wash after wash without collar sagging. Available in Sleeveless (Sando) and Full Sleeve options.",
    features: [
      '100% Premium Combed Cotton for skin-friendly softness and breathability',
      'Reinforced Neck & Shoulder Tape for anti-sag shape retention',
      'Sweat-absorbent weave tailored for all-day freshness in warm climates',
      'Form-retaining rib weave that resists stretching and collar sagging',
      'Tagless inner neckline for smooth, itch-free wear under shirts and kurtas',
    ],
    qualityComparison: {
      highQuality: {
        neck: 'Reinforced woven tape around neckline for anti-sag shape retention.',
        shoulders: 'Protective reinforcement tape along shoulder seams.',
        stitching: 'Precision industrial interlock 4-thread stitching.',
        feel: 'Silky-smooth premium combed cotton finish with enhanced softness.',
      },
    },
    careInstructions: [
      'Machine wash gentle or hand wash in cold/lukewarm water',
      'Wash with similar light colors',
      'Do not use chlorine bleach',
      'Medium heat iron if required',
      'Line dry in shade for longest fabric life',
    ],
    shippingInfo: 'Fast delivery across all cities of Pakistan. Minimum order 3 pieces. Orders of 3 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    isPublished: true,
    isWholesaleEnabled: true,
    wholesaleMinQty: 12,
    media: [
      {
        id: 'med-hq-sl',
        productId: 'f0000000-0000-0000-0000-000000000001',
        type: 'photo',
        url: mapMediaUrl('/images/products/sleevless high.jpeg'),
        alt: "Men's Vest - High Quality Sleeveless / Sando",
        title: 'High Quality Sleeveless Front',
        displayOrder: 1,
        variantQuality: 'High Quality',
        variantSleeve: 'Sleeveless',
      },
      {
        id: 'med-hq-fs',
        productId: 'f0000000-0000-0000-0000-000000000001',
        type: 'photo',
        url: mapMediaUrl('/images/products/full sleeve high.jpeg'),
        alt: "Men's Vest - High Quality Full Sleeve",
        title: 'High Quality Full Sleeve',
        displayOrder: 2,
        variantQuality: 'High Quality',
        variantSleeve: 'Full Sleeve',
      },
    ],
    variants: [
      { id: 'var-hq-sl-s', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Sleeveless', size: 'S', price: 480, wholesalePrice: 390, stock: 45, sku: 'ARH-HQ-SL-S', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 390, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 370, label: '2–4 Dozen' }, { minQty: 48, price: 350, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-sl-m', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Sleeveless', size: 'M', price: 480, wholesalePrice: 390, stock: 60, sku: 'ARH-HQ-SL-M', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 390, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 370, label: '2–4 Dozen' }, { minQty: 48, price: 350, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-sl-l', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Sleeveless', size: 'L', price: 480, wholesalePrice: 390, stock: 55, sku: 'ARH-HQ-SL-L', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 390, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 370, label: '2–4 Dozen' }, { minQty: 48, price: 350, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-sl-xl', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Sleeveless', size: 'XL', price: 500, wholesalePrice: 410, stock: 40, sku: 'ARH-HQ-SL-XL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 410, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 390, label: '2–4 Dozen' }, { minQty: 48, price: 370, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-sl-xxl', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Sleeveless', size: 'XXL', price: 520, wholesalePrice: 430, stock: 30, sku: 'ARH-HQ-SL-XXL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 430, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 410, label: '2–4 Dozen' }, { minQty: 48, price: 390, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-fs-s', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Full Sleeve', size: 'S', price: 540, wholesalePrice: 440, stock: 35, sku: 'ARH-HQ-FS-S', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 440, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 420, label: '2–4 Dozen' }, { minQty: 48, price: 395, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-fs-m', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Full Sleeve', size: 'M', price: 540, wholesalePrice: 440, stock: 50, sku: 'ARH-HQ-FS-M', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 440, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 420, label: '2–4 Dozen' }, { minQty: 48, price: 395, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-fs-l', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Full Sleeve', size: 'L', price: 540, wholesalePrice: 440, stock: 50, sku: 'ARH-HQ-FS-L', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 440, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 420, label: '2–4 Dozen' }, { minQty: 48, price: 395, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-fs-xl', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Full Sleeve', size: 'XL', price: 560, wholesalePrice: 460, stock: 35, sku: 'ARH-HQ-FS-XL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 460, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 440, label: '2–4 Dozen' }, { minQty: 48, price: 415, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-hq-fs-xxl', productId: 'f0000000-0000-0000-0000-000000000001', quality: 'High Quality', sleeve: 'Full Sleeve', size: 'XXL', price: 580, wholesalePrice: 480, stock: 25, sku: 'ARH-HQ-FS-XXL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 480, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 460, label: '2–4 Dozen' }, { minQty: 48, price: 435, label: 'Bulk 4+ Dozen' }] },
    ],
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    categoryId: 'cat-men',
    subcategoryId: 'sub-men-vests',
    name: "Men's Pure Cotton Vest — Standard Quality (Folded Seams)",
    slug: 'mens-vest-standard-quality',
    subtitle: '100% Pure Combed Cotton Daily Wear Innerwear with Clean Folded Stitched Finish',
    description: 'Dependable everyday pure cotton inner vest crafted for breathability and comfort. Built with clean double-needle machine-stitched folded seams for dependable daily wear at an affordable price.',
    features: [
      '100% Pure Combed Cotton for gentle breathability and skin comfort',
      'Clean folded neckline machine-stitched seam',
      'Sweat-absorbent weave tailored for Pakistani climate',
      'Durable lockstitch seam construction',
      'Tagless comfort collar for irritation-free daily wear',
    ],
    qualityComparison: {
      standardQuality: {
        neck: 'Folded & machine-stitched seam (no tape).',
        shoulders: 'Clean double-needle stitched finish.',
        stitching: 'Durable everyday lockstitch seam construction.',
        feel: 'Classic breathable pure cotton feel suited for dependable daily wear.',
      },
    },
    careInstructions: [
      'Machine wash gentle or hand wash in cold/lukewarm water',
      'Wash with similar light colors',
      'Do not use chlorine bleach',
      'Medium heat iron if required',
      'Line dry in shade for longest fabric life',
    ],
    shippingInfo: 'Fast delivery across all cities of Pakistan. Minimum order 3 pieces. Orders of 3 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    isPublished: true,
    isWholesaleEnabled: true,
    wholesaleMinQty: 12,
    media: [
      {
        id: 'med-sq-sl',
        productId: 'f0000000-0000-0000-0000-000000000002',
        type: 'photo',
        url: mapMediaUrl('/images/products/sleevless low.jpeg'),
        alt: "Men's Vest - Standard Quality Sleeveless / Sando",
        title: 'Standard Quality Sleeveless',
        displayOrder: 1,
        variantQuality: 'Standard Quality',
        variantSleeve: 'Sleeveless',
      },
    ],
    variants: [
      { id: 'var-sq-sl-s', productId: 'f0000000-0000-0000-0000-000000000002', quality: 'Standard Quality', sleeve: 'Sleeveless', size: 'S', price: 380, wholesalePrice: 310, stock: 50, sku: 'ARH-SQ-SL-S', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 310, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 295, label: '2–4 Dozen' }, { minQty: 48, price: 280, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-sq-sl-m', productId: 'f0000000-0000-0000-0000-000000000002', quality: 'Standard Quality', sleeve: 'Sleeveless', size: 'M', price: 380, wholesalePrice: 310, stock: 65, sku: 'ARH-SQ-SL-M', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 310, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 295, label: '2–4 Dozen' }, { minQty: 48, price: 280, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-sq-sl-l', productId: 'f0000000-0000-0000-0000-000000000002', quality: 'Standard Quality', sleeve: 'Sleeveless', size: 'L', price: 380, wholesalePrice: 310, stock: 60, sku: 'ARH-SQ-SL-L', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 310, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 295, label: '2–4 Dozen' }, { minQty: 48, price: 280, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-sq-sl-xl', productId: 'f0000000-0000-0000-0000-000000000002', quality: 'Standard Quality', sleeve: 'Sleeveless', size: 'XL', price: 400, wholesalePrice: 330, stock: 45, sku: 'ARH-SQ-SL-XL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 330, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 310, label: '2–4 Dozen' }, { minQty: 48, price: 295, label: 'Bulk 4+ Dozen' }] },
      { id: 'var-sq-sl-xxl', productId: 'f0000000-0000-0000-0000-000000000002', quality: 'Standard Quality', sleeve: 'Sleeveless', size: 'XXL', price: 420, wholesalePrice: 350, stock: 30, sku: 'ARH-SQ-SL-XXL', isAvailable: true, wholesaleTiers: [{ minQty: 12, maxQty: 23, price: 350, label: '1–2 Dozen' }, { minQty: 24, maxQty: 47, price: 330, label: '2–4 Dozen' }, { minQty: 48, price: 310, label: 'Bulk 4+ Dozen' }] },
    ],
  },
];

async function seedProduct(product) {
  console.log(`\nSeeding: ${product.name}...`);
  const res = await fetch(`${API_BASE}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (res.ok && data.success) {
    console.log(`  ✓ Saved: ${data.product.id} | ${data.product.name}`);
    console.log(`  ✓ Variants: ${data.product.variants?.length ?? 0} | Media: ${data.product.media?.length ?? 0}`);
  } else {
    console.error(`  ✗ FAILED: ${JSON.stringify(data)}`);
    throw new Error(`Failed to seed ${product.name}: ${data.error || 'Unknown error'}`);
  }
}

async function verifyDB() {
  console.log('\n--- Verifying database via API ---');
  const res = await fetch(`${API_BASE}/api/admin/products`);
  const data = await res.json();
  console.log(`Products in DB (via API): ${data.products?.length ?? 'ERROR'}`);
  for (const p of (data.products || [])) {
    console.log(`  [${p.id}] ${p.name} | variants: ${p.variants?.length} | media: ${p.media?.length}`);
  }
}

async function main() {
  console.log('=== ONE-TIME BASELINE PRODUCT SEED ===');
  console.log('Target:', API_BASE);

  // Verify current state
  await verifyDB();

  for (const product of PRODUCTS) {
    await seedProduct(product);
  }

  console.log('\n=== FINAL VERIFICATION ===');
  await verifyDB();
  console.log('\n=== SEED COMPLETE ===');
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
