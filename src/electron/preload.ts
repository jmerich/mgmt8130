import { contextBridge } from 'electron';

// Expose protected methods to renderer process
// Currently empty - feature modules use HTTP API instead of IPC
// Add IPC handlers here when Electron-native features are needed
contextBridge.exposeInMainWorld('api', {
  // Platform info
  platform: process.platform,
});
