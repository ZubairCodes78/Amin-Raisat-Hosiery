import fs from 'fs';
import path from 'path';

const testDir = path.resolve('test-assets');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// 1x1 Transparent PNG
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(path.join(testDir, 'size-guide-test.png'), pngBuffer);

// 1x1 Minimal JPEG
const jpegBuffer = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);
fs.writeFileSync(path.join(testDir, 'size-guide-test.jpg'), jpegBuffer);

// 1x1 Minimal WebP
const webpBuffer = Buffer.from(
  'UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v1bAAA==',
  'base64'
);
fs.writeFileSync(path.join(testDir, 'size-guide-test.webp'), webpBuffer);

console.log('Created test assets: size-guide-test.png, size-guide-test.jpg, size-guide-test.webp');
