import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
const envText = fs.readFileSync('.env.local', 'utf-8');
const url = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const svgChart = `
<svg width="1200" height="850" viewBox="0 0 1200 850" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Background -->
  <rect width="1200" height="850" fill="#0C0E14" rx="24"/>
  <rect x="20" y="20" width="1160" height="810" fill="#141721" rx="20" stroke="#252A3B" stroke-width="2"/>
  <rect x="28" y="28" width="1144" height="8" fill="url(#goldGrad)" rx="4"/>

  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9A7B38"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#F3E5AB"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E2333"/>
      <stop offset="100%" stop-color="#171B28"/>
    </linearGradient>
  </defs>

  <!-- Title & Brand Header -->
  <text x="600" y="80" text-anchor="middle" font-size="28" font-weight="800" fill="#D4AF37" letter-spacing="3">AMIN RAISAT HOSIERY</text>
  <text x="600" y="115" text-anchor="middle" font-size="18" font-weight="600" fill="#FFFFFF" letter-spacing="1">MEN'S PURE COTTON VESTS — OFFICIAL SIZE &amp; MEASUREMENT GUIDE</text>
  <text x="600" y="140" text-anchor="middle" font-size="13" fill="#8E99AF">All dimensions in inches. Standard pre-shrunk combed cotton knit fit.</text>

  <!-- Table Container -->
  <g transform="translate(60, 170)">
    <!-- Table Header -->
    <rect x="0" y="0" width="1080" height="56" fill="url(#headerGrad)" rx="12" stroke="#2E354B" stroke-width="1.5"/>
    <text x="80" y="35" font-size="15" font-weight="700" fill="#D4AF37" text-anchor="middle">TAG SIZE</text>
    <text x="240" y="35" font-size="15" font-weight="700" fill="#D4AF37" text-anchor="middle">CHEST (INCHES)</text>
    <text x="420" y="35" font-size="15" font-weight="700" fill="#D4AF37" text-anchor="middle">BODY LENGTH (IN)</text>
    <text x="620" y="35" font-size="15" font-weight="700" fill="#D4AF37" text-anchor="middle">SHOULDER WIDTH</text>
    <text x="890" y="35" font-size="15" font-weight="700" fill="#D4AF37" text-anchor="middle">RECOMMENDED FIT / BODY TYPE</text>

    <!-- Row 1: Small -->
    <rect x="0" y="66" width="1080" height="60" fill="#181C28" rx="8"/>
    <circle cx="80" cy="96" r="18" fill="#22283A" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="80" y="102" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">S</text>
    <text x="240" y="102" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">34″ – 36″</text>
    <text x="420" y="102" font-size="16" fill="#D1D5DB" text-anchor="middle">27.0″</text>
    <text x="620" y="102" font-size="15" fill="#D1D5DB" text-anchor="middle">14.0″</text>
    <text x="890" y="102" font-size="14" fill="#9CA3AF" text-anchor="middle">Slim build, snug tailored undershirt fit</text>

    <!-- Row 2: Medium -->
    <rect x="0" y="136" width="1080" height="60" fill="#1C2130" rx="8"/>
    <circle cx="80" cy="166" r="18" fill="#252C40" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="80" y="172" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">M</text>
    <text x="240" y="172" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">36″ – 38″</text>
    <text x="420" y="172" font-size="16" fill="#D1D5DB" text-anchor="middle">28.0″</text>
    <text x="620" y="172" font-size="15" fill="#D1D5DB" text-anchor="middle">14.5″</text>
    <text x="890" y="172" font-size="14" fill="#9CA3AF" text-anchor="middle">Regular / Average athletic build</text>

    <!-- Row 3: Large -->
    <rect x="0" y="206" width="1080" height="60" fill="#181C28" rx="8"/>
    <circle cx="80" cy="236" r="18" fill="#22283A" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="80" y="242" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">L</text>
    <text x="240" y="242" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">38″ – 40″</text>
    <text x="420" y="242" font-size="16" fill="#D1D5DB" text-anchor="middle">29.0″</text>
    <text x="620" y="242" font-size="15" fill="#D1D5DB" text-anchor="middle">15.2″</text>
    <text x="890" y="242" font-size="14" fill="#9CA3AF" text-anchor="middle">Broad chest / Standard Pakistani size</text>

    <!-- Row 4: XL -->
    <rect x="0" y="276" width="1080" height="60" fill="#1C2130" rx="8"/>
    <circle cx="80" cy="306" r="18" fill="#252C40" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="80" y="312" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">XL</text>
    <text x="240" y="312" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">40″ – 42″</text>
    <text x="420" y="312" font-size="16" fill="#D1D5DB" text-anchor="middle">30.0″</text>
    <text x="620" y="312" font-size="15" fill="#D1D5DB" text-anchor="middle">16.0″</text>
    <text x="890" y="312" font-size="14" fill="#9CA3AF" text-anchor="middle">Muscular or relaxed comfort wear</text>

    <!-- Row 5: XXL -->
    <rect x="0" y="346" width="1080" height="60" fill="#181C28" rx="8"/>
    <circle cx="80" cy="376" r="18" fill="#22283A" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="80" y="382" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">XXL</text>
    <text x="240" y="382" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">42″ – 44″</text>
    <text x="420" y="382" font-size="16" fill="#D1D5DB" text-anchor="middle">31.0″</text>
    <text x="620" y="382" font-size="15" fill="#D1D5DB" text-anchor="middle">16.8″</text>
    <text x="890" y="382" font-size="14" fill="#9CA3AF" text-anchor="middle">Extra roomy cut with extra length</text>
  </g>

  <!-- How to Measure Tips Footer -->
  <g transform="translate(60, 610)">
    <rect x="0" y="0" width="1080" height="180" fill="#11141E" rx="14" stroke="#252A3C" stroke-width="1"/>
    <text x="30" y="36" font-size="16" font-weight="700" fill="#D4AF37">PRO MEASUREMENT ADVICE:</text>
    
    <circle cx="45" cy="72" r="5" fill="#D4AF37"/>
    <text x="65" y="77" font-size="14" fill="#E2E8F0"><tspan font-weight="700" fill="#FFFFFF">Chest:</tspan> Measure around the fullest part of your chest, keeping the tape horizontal under your armpits.</text>

    <circle cx="45" cy="110" r="5" fill="#D4AF37"/>
    <text x="65" y="115" font-size="14" fill="#E2E8F0"><tspan font-weight="700" fill="#FFFFFF">Length:</tspan> Measured from the highest point of the shoulder seam to the bottom hem.</text>

    <circle cx="45" cy="148" r="5" fill="#D4AF37"/>
    <text x="65" y="153" font-size="14" fill="#E2E8F0"><tspan font-weight="700" fill="#FFFFFF">Preferred Fit:</tspan> If you prefer a loose, breathable kurta fit, choose one size up from your snug measurement.</text>
  </g>
</svg>
`;

async function main() {
  const outDir = path.resolve('public/images/products');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pngPath = path.join(outDir, 'arh-size-guide-chart.png');
  const webpPath = path.join(outDir, 'arh-size-guide-chart.webp');

  console.log('Rendering SVG chart to PNG and WebP using sharp...');
  await sharp(Buffer.from(svgChart))
    .png({ quality: 95 })
    .toFile(pngPath);

  await sharp(Buffer.from(svgChart))
    .webp({ quality: 90 })
    .toFile(webpPath);

  console.log('Saved to local files:');
  console.log(' -', pngPath);
  console.log(' -', webpPath);

  // Upload to Supabase Storage: bucket 'product-media'
  const productId = 'f0000000-0000-0000-0000-000000000001';
  const storagePath = `products/${productId}/size-guide/arh_mens_vest_size_chart.webp`;

  console.log(`Uploading to Supabase Storage: bucket [product-media] at path [${storagePath}]...`);
  const webpBuffer = fs.readFileSync(webpPath);

  const { data, error } = await supabase.storage
    .from('product-media')
    .upload(storagePath, webpBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    console.error('Storage upload error:', error);
    process.exit(1);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-media')
    .getPublicUrl(storagePath);

  console.log('Upload SUCCESS!');
  console.log('Public CDN URL:', publicUrlData.publicUrl);

  const check = await fetch(publicUrlData.publicUrl);
  console.log('CDN verification status:', check.status);
}

main().catch(console.error);
