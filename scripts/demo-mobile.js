#!/usr/bin/env node
/**
 * Mobile Demo Script
 *
 * Starts the app and creates a public URL you can access from any device.
 * Uses Cloudflare tunnel - free, fast, no signup required.
 *
 * Usage:
 *   npm run demo:mobile
 */

const { spawn } = require('child_process');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const FRONTEND_PORT = 5173;
const CLOUDFLARED_PATH = '/tmp/cloudflared';

async function main() {
  console.log('');
  console.log('🚀 Starting SubGuard Mobile Demo...');
  console.log('');

  // Check for cloudflared
  if (!fs.existsSync(CLOUDFLARED_PATH)) {
    console.log('📥 First run: downloading Cloudflare tunnel...');
    console.log('   Run this command first:');
    console.log('');
    console.log('   curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared && chmod +x /tmp/cloudflared');
    console.log('');
    console.log('   Then run: npm run demo:mobile');
    console.log('');
    process.exit(1);
  }

  // Start the web app (frontend + API)
  console.log('📦 Starting app servers...');
  const app = spawn('npm', ['run', 'dev:web'], {
    stdio: 'pipe',
    shell: true
  });

  // Wait for servers to start
  console.log('⏳ Waiting for servers to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start Cloudflare tunnel
  console.log('🌐 Creating Cloudflare tunnel...');

  const tunnel = spawn(CLOUDFLARED_PATH, [
    'tunnel', '--url', `http://localhost:${FRONTEND_PORT}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let urlFound = false;

  const handleOutput = (data) => {
    const output = data.toString();
    // Cloudflare outputs the URL to stderr
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
      urlFound = true;
      showSuccess(match[0]);
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('error', (err) => {
    console.error('❌ Tunnel failed:', err.message);
    process.exit(1);
  });

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('');
    console.log('Shutting down...');
    tunnel.kill();
    app.kill();
    process.exit(0);
  });
}

function showSuccess(url) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  ✅ SubGuard is ready for mobile demo!');
  console.log('');
  console.log('  📱 Scan this QR code with your phone:');
  console.log('');

  qrcode.generate(url, { small: true }, (qr) => {
    const indentedQR = qr.split('\n').map(line => '     ' + line).join('\n');
    console.log(indentedQR);
    console.log('');
    console.log(`  🔗 URL: ${url}`);
    console.log('');
    console.log('  📲 To install as app:');
    console.log('     1. Open URL in Chrome on your phone');
    console.log('     2. Tap menu (⋮) → "Add to Home screen"');
    console.log('');
    console.log('  🎮 Demo pages:');
    console.log(`     Dashboard:    ${url}`);
    console.log(`     Google Pay:   ${url}/demo/google-pay`);
    console.log(`     Netflix:      ${url}/demo/netflix`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');
  });
}

main();
