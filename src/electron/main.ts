import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

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

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
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

// IPC handlers for feature modules
ipcMain.handle('purchase-blocking:get-rules', async () => {
  // Stub: Return mock blocking rules
  return [];
});

ipcMain.handle('card-masking:generate-card', async () => {
  // Stub: Return mock virtual card
  return { number: '4111-XXXX-XXXX-1234', expiry: '12/25', cvv: '***' };
});

ipcMain.handle('auto-negotiation:get-subscriptions', async () => {
  // Stub: Return mock subscriptions
  return [];
});
