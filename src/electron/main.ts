import { app, BrowserWindow, ipcMain } from 'electron';
import type { BrowserWindow as BrowserWindowType } from 'electron';
import path from 'path';


let mainWindow: BrowserWindowType | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Start the Localhost Bridge
  if (mainWindow) startBridgeServer(mainWindow);

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    mainWindow?.loadURL('http://localhost:5173');
    mainWindow?.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

import http from 'http';

const PORT = 3000;

function startBridgeServer(targetWindow: BrowserWindowType) {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '', `http://localhost:${PORT}`);

    if (url.pathname === '/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'active', version: '1.0.0-native' }));
      return;
    }

    if (url.pathname === '/analyze' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          targetWindow.webContents.send('extension-event', {
            type: 'ANALYSIS_RECEIVED',
            payload: data
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Analysis received' }));
        } catch (e) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (url.pathname === '/card' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        card: {
          number: '5500 0000 0000 9012',
          expiry: '12/28',
          cvv: '123',
          holder: 'SUBGUARD PROXY'
        }
      }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  server.listen(PORT, () => {
    console.log(`[Bridge] Native Server running on http://localhost:${PORT}`);
  });
}

// IPC handlers for feature modules
ipcMain.handle('purchase-blocking:get-rules', async () => {
  return [];
});

ipcMain.handle('card-masking:generate-card', async () => {
  return { number: '4111-XXXX-XXXX-1234', expiry: '12/25', cvv: '***' };
});

ipcMain.handle('auto-negotiation:get-subscriptions', async () => {
  return [];
});
