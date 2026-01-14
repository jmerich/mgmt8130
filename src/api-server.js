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

// Start server
app.listen(PORT, () => {
  console.log(`[SubGuard API] Server running on http://localhost:${PORT}`);
  console.log('[SubGuard API] Waiting for Chrome extension connections...');
});
