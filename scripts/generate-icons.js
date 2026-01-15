#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Or manually convert using online tools:
 *   - https://cloudconvert.com/svg-to-png
 *   - Upload public/icons/icon.svg
 *   - Download as 192x192 and 512x512 PNG
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // Try to use sharp if installed
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const svg = fs.readFileSync(svgPath);

    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of sizes) {
      const outputPath = path.join(__dirname, `../public/icons/icon-${size}.png`);
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}.png`);
    }

    console.log('\\nAll icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Sharp not installed. To generate icons:');
      console.log('');
      console.log('Option 1: Install sharp and run again');
      console.log('  npm install sharp');
      console.log('  node scripts/generate-icons.js');
      console.log('');
      console.log('Option 2: Use online converter');
      console.log('  1. Go to https://cloudconvert.com/svg-to-png');
      console.log('  2. Upload public/icons/icon.svg');
      console.log('  3. Set width/height to 192 and 512');
      console.log('  4. Save as icon-192.png and icon-512.png');
      console.log('  5. Place in public/icons/');
      console.log('');
      console.log('Option 3: Use placeholder icons (already created)');
      createPlaceholders();
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

function createPlaceholders() {
  // Create simple colored square placeholders
  const sizes = [192, 512];

  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/icons/icon-${size}.png`);

    // Check if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Placeholder already exists: icon-${size}.png`);
      continue;
    }

    // Create a minimal valid PNG (1x1 cyan pixel, will be scaled)
    // This is a base64-encoded 1x1 cyan PNG
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwADBwF/cf/0CAAAAABJRU5ErkJggg==',
      'base64'
    );

    fs.writeFileSync(outputPath, pngData);
    console.log(`Created placeholder: icon-${size}.png (replace with proper icon)`);
  }
}

generateIcons();
