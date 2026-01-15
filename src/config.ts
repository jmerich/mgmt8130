// Centralized configuration for SubGuard
// All environment-specific values and constants in one place

import AUTONOMY_DEFAULTS from './shared/autonomy-defaults.json';

export const CONFIG = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  API_ENDPOINTS: {
    HEALTH: '/api/health',
    EXTENSION_DATA: '/api/extension/data',
    EXTENSION_SYNC: '/api/extension/sync',
    EXTENSION_PAGE_ANALYSIS: '/api/extension/page-analysis',
    AUTONOMY_SETTINGS: '/api/autonomy/settings',
    AUTONOMY_CHECK: '/api/autonomy/check',
  },

  // Polling intervals (in milliseconds)
  POLLING: {
    EXTENSION_DATA: 5000,
    SYNC_INTERVAL: 60000,
  },

  // Default autonomy settings (imported from shared config)
  AUTONOMY_DEFAULTS: AUTONOMY_DEFAULTS as {
    level: 'moderate';
    dailySpendingLimit: number;
    maxShoppingTime: number;
    blockCheckoutAbove: number;
    autoRedirectOnRisk: boolean;
    enforceCoolingOff: boolean;
    coolingOffMinutes: number;
  },

  // Autonomy level presets
  AUTONOMY_PRESETS: {
    minimal: {
      autoRedirectOnRisk: false,
      enforceCoolingOff: false,
    },
    moderate: {
      autoRedirectOnRisk: false,
      enforceCoolingOff: true,
      coolingOffMinutes: 5,
    },
    high: {
      autoRedirectOnRisk: true,
      enforceCoolingOff: true,
      coolingOffMinutes: 10,
    },
    full: {
      autoRedirectOnRisk: true,
      enforceCoolingOff: true,
      coolingOffMinutes: 15,
    },
  },

  // UI Constants
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
    REDIRECT_COUNTDOWN: 5,
  },
} as const;

// Type exports
export type AutonomyLevel = 'minimal' | 'moderate' | 'high' | 'full';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
