#!/usr/bin/env node
/**
 * Mobile Demo Script
 *
 * Starts the app and creates a public URL you can access from any device.
 *
 * Usage:
 *   npm run demo:mobile
 */

const { spawn } = require('child_process');
const ngrok = require('ngrok');

const FRONTEND_PORT = 5173;

async function main() {
  console.log('');
  console.log('🚀 Starting SubGuard Mobile Demo...');
  console.log('');

  // Start the web app (frontend + API)
  console.log('📦 Starting app servers...');
  const app = spawn('npm', ['run', 'dev:web'], {
    stdio: 'pipe',
    shell: true
  });

  app.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready')) {
      // App is ready
    }
  });

  app.stderr.on('data', (data) => {
    // Ignore vite warnings
  });

  // Wait for servers to start
  console.log('⏳ Waiting for servers to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start ngrok tunnel
  console.log('🌐 Creating public tunnel...');

  try {
    const url = await ngrok.connect({
      addr: FRONTEND_PORT,
      region: 'us'
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('  ✅ SubGuard is ready for mobile demo!');
    console.log('');
    console.log('  📱 Open this URL on your phone:');
    console.log('');
    console.log(`     ${url}`);
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
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Failed to create tunnel:', error.message);
    console.error('');
    console.error('Try running manually:');
    console.error('  1. npm run dev:web');
    console.error('  2. npx ngrok http 5173');
    console.error('');
    process.exit(1);
  }

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('');
    console.log('Shutting down...');
    await ngrok.disconnect();
    await ngrok.kill();
    app.kill();
    process.exit(0);
  });
}

main();
