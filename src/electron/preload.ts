import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('api', {
  // Purchase Blocking APIs
  purchaseBlocking: {
    getRules: () => ipcRenderer.invoke('purchase-blocking:get-rules'),
    addRule: (rule: unknown) => ipcRenderer.invoke('purchase-blocking:add-rule', rule),
    removeRule: (id: string) => ipcRenderer.invoke('purchase-blocking:remove-rule', id),
    checkTransaction: (tx: unknown) => ipcRenderer.invoke('purchase-blocking:check', tx),
  },

  // Card Masking APIs
  cardMasking: {
    generateCard: (options: unknown) => ipcRenderer.invoke('card-masking:generate-card', options),
    listCards: () => ipcRenderer.invoke('card-masking:list-cards'),
    deactivateCard: (id: string) => ipcRenderer.invoke('card-masking:deactivate', id),
  },

  // Auto-Negotiation APIs
  autoNegotiation: {
    getSubscriptions: () => ipcRenderer.invoke('auto-negotiation:get-subscriptions'),
    startNegotiation: (subId: string) => ipcRenderer.invoke('auto-negotiation:start', subId),
    getNegotiationStatus: (id: string) => ipcRenderer.invoke('auto-negotiation:status', id),
  },
});
