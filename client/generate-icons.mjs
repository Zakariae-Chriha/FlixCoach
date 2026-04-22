import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="50%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>
  <polygon points="296,80 176,280 248,280 216,432 336,232 264,232" fill="white" opacity="0.95"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}.png`);
  console.log(`✅ icon-${size}.png`);
}

// Also create a screenshot placeholder
await sharp(Buffer.from(svg))
  .resize(390, 390)
  .extend({ top: 0, bottom: 454, left: 0, right: 0, background: { r: 10, g: 10, b: 15, alpha: 1 } })
  .png()
  .toFile('./public/icons/screenshot-mobile.png');

console.log('✅ screenshot-mobile.png');
console.log('🎉 All icons generated!');
