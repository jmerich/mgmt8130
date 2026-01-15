#!/usr/bin/env node
/**
 * Chrome Extension Icon Generator
 * Generates PNG icons from SVG source for Chrome extension
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const sizes = [16, 48, 128];
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const outputDir = path.join(__dirname, '../chrome-extension/icons');

  if (!fs.existsSync(svgPath)) {
    console.error('Error: icon.svg not found at', svgPath);
    process.exit(1);
  }

  console.log('Generating Chrome extension icons...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon${size}.png`);
    } catch (err) {
      console.error(`Error generating icon${size}.png:`, err.message);
    }
  }

  console.log('Chrome extension icons generated!');
}

generateIcons().catch(console.error);
