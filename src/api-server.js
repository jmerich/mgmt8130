// SubGuard API Server
// Simple Express server for Chrome extension communication

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for extension
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// In-memory data store
let extensionData = {
  lastSync: null,
  dailyStats: null,
  currentSession: null,
  pageAnalyses: [],
  riskEvents: []
};

// Autonomy settings store
let autonomySettings = {
  level: 'moderate',
  dailySpendingLimit: 200,
  maxShoppingTime: 60,
  blockCheckoutAbove: 100,
  autoRedirectOnRisk: false,
  enforceColingOff: true,
  coolingOffMinutes: 5
};

// Sync endpoint - receives data from extension
app.post('/api/extension/sync', (req, res) => {
  const { sessionId, dailyStats, currentSession, timestamp } = req.body;

  extensionData.lastSync = timestamp;
  extensionData.dailyStats = dailyStats;
  extensionData.currentSession = currentSession;

  console.log('[API] Extension sync received:', {
    sessionId,
    shoppingSites: dailyStats?.shoppingSitesVisited,
    cartInteractions: dailyStats?.cartInteractions,
    potentialSpend: dailyStats?.totalPotentialSpend
  });

  res.json({ success: true, received: timestamp });
});

// Page analysis endpoint
app.post('/api/extension/page-analysis', (req, res) => {
  const analysis = req.body;

  // Store recent analyses (keep last 50)
  extensionData.pageAnalyses.unshift({
    ...analysis,
    receivedAt: Date.now()
  });
  if (extensionData.pageAnalyses.length > 50) {
    extensionData.pageAnalyses = extensionData.pageAnalyses.slice(0, 50);
  }

  // Track risk events
  if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
    extensionData.riskEvents.unshift({
      ...analysis,
      eventType: 'risk_detected'
    });
    if (extensionData.riskEvents.length > 100) {
      extensionData.riskEvents = extensionData.riskEvents.slice(0, 100);
    }
  }

  console.log('[API] Page analysis:', {
    domain: analysis.domain,
    riskLevel: analysis.riskLevel,
    isShoppingSite: analysis.isShoppingSite,
    prices: analysis.prices?.length || 0
  });

  res.json({ success: true });
});

// Get current data endpoint (for dashboard)
app.get('/api/extension/data', (req, res) => {
  res.json(extensionData);
});

// Get recent risk events
app.get('/api/extension/risk-events', (req, res) => {
  res.json(extensionData.riskEvents);
});

// Get page analyses
app.get('/api/extension/analyses', (req, res) => {
  res.json(extensionData.pageAnalyses);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    lastSync: extensionData.lastSync
  });
});

// ==================== AUTONOMY SETTINGS ====================

// Get autonomy settings
app.get('/api/autonomy/settings', (req, res) => {
  res.json({ settings: autonomySettings });
});

// Update autonomy settings
app.post('/api/autonomy/settings', (req, res) => {
  const { settings } = req.body;
  if (settings) {
    autonomySettings = { ...autonomySettings, ...settings };
    console.log('[API] Autonomy settings updated:', autonomySettings);
  }
  res.json({ success: true, settings: autonomySettings });
});

// Check if action should be taken (called by extension)
app.post('/api/autonomy/check', (req, res) => {
  const { action, context } = req.body;
  const { totalSpentToday, timeOnShoppingSites, currentPrice, riskLevel } = context || {};

  let decision = {
    allow: true,
    action: null,
    reason: null,
    message: null
  };

  // Only enforce if autonomy level is high or full
  if (autonomySettings.level === 'high' || autonomySettings.level === 'full') {

    // Check daily spending limit
    if (totalSpentToday >= autonomySettings.dailySpendingLimit) {
      decision = {
        allow: false,
        action: 'block_checkout',
        reason: 'daily_limit_exceeded',
        message: `You've reached your daily spending limit of $${autonomySettings.dailySpendingLimit}. SubGuard is protecting your financial goals.`
      };
    }

    // Check shopping time limit
    if (timeOnShoppingSites >= autonomySettings.maxShoppingTime * 60) {
      decision = {
        allow: false,
        action: 'redirect_away',
        reason: 'time_limit_exceeded',
        message: `You've been shopping for ${autonomySettings.maxShoppingTime} minutes today. SubGuard is helping you take a break.`
      };
    }

    // Check price threshold
    if (currentPrice > autonomySettings.blockCheckoutAbove && action === 'checkout') {
      decision = {
        allow: false,
        action: 'require_cooloff',
        reason: 'price_threshold',
        cooloffMinutes: autonomySettings.coolingOffMinutes,
        message: `This purchase of $${currentPrice} requires a ${autonomySettings.coolingOffMinutes}-minute cooling-off period.`
      };
    }

    // Auto-redirect on high risk (full autonomy only)
    if (autonomySettings.level === 'full' && autonomySettings.autoRedirectOnRisk) {
      if (riskLevel === 'critical' || (riskLevel === 'high' && action === 'checkout')) {
        decision = {
          allow: false,
          action: 'redirect_away',
          reason: 'high_risk_detected',
          message: `SubGuard detected high-risk shopping behavior. Redirecting you to protect your financial wellbeing.`
        };
      }
    }
  }

  console.log('[API] Autonomy check:', { action, decision });
  res.json(decision);
});

// Start server
app.listen(PORT, () => {
  console.log(`[SubGuard API] Server running on http://localhost:${PORT}`);
  console.log('[SubGuard API] Waiting for Chrome extension connections...');
});
