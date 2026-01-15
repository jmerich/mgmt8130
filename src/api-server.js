// SubGuard API Server
// Simple Express server for Chrome extension communication

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const AUTONOMY_DEFAULTS = require('./shared/autonomy-defaults.json');

// ==================== CONFIGURATION ====================
const CONFIG = {
  PORT: process.env.PORT || 3001,
  LIMITS: {
    MAX_PAGE_ANALYSES: 50,
    MAX_RISK_EVENTS: 100,
    MAX_REQUEST_SIZE: '100kb',
  },
  // API key for extension authentication (in production, use environment variable)
  API_KEY: process.env.SUBGUARD_API_KEY || 'dev-api-key-change-in-production',
  // Allowed origins for CORS
  ALLOWED_ORIGINS: [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ],
  AUTONOMY_DEFAULTS,
};

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for extension
}));

// Rate limiting - 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Rate limit exceeded for this endpoint' },
});

// CORS - restrict to allowed origins and Chrome extensions
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Chrome extension, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    // Allow Chrome extension origins
    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    // Allow configured origins
    if (CONFIG.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true,
}));

// Request size limit
app.use(express.json({ limit: CONFIG.LIMITS.MAX_REQUEST_SIZE }));

// ==================== AUTHENTICATION MIDDLEWARE ====================

// API Key authentication for extension endpoints
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // In development mode, allow requests without API key
  if (process.env.NODE_ENV !== 'production' && !apiKey) {
    return next();
  }

  if (!apiKey || apiKey !== CONFIG.API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

// ==================== INPUT VALIDATION HELPERS ====================

const validateSync = (body) => {
  const errors = [];
  if (body.sessionId && typeof body.sessionId !== 'string') {
    errors.push('sessionId must be a string');
  }
  if (body.dailyStats && typeof body.dailyStats !== 'object') {
    errors.push('dailyStats must be an object');
  }
  if (body.timestamp && typeof body.timestamp !== 'number') {
    errors.push('timestamp must be a number');
  }
  return errors;
};

const validatePageAnalysis = (body) => {
  const errors = [];
  if (!body.domain || typeof body.domain !== 'string') {
    errors.push('domain is required and must be a string');
  }
  if (body.riskLevel && !['low', 'moderate', 'high', 'critical'].includes(body.riskLevel)) {
    errors.push('riskLevel must be one of: low, moderate, high, critical');
  }
  if (body.prices && !Array.isArray(body.prices)) {
    errors.push('prices must be an array');
  }
  return errors;
};

const validateCard = (card) => {
  const errors = [];
  if (!card || typeof card !== 'object') {
    errors.push('card object is required');
    return errors;
  }
  if (!card.domain || typeof card.domain !== 'string') {
    errors.push('card.domain is required and must be a string');
  }
  if (card.maskedNumber && typeof card.maskedNumber !== 'string') {
    errors.push('card.maskedNumber must be a string');
  }
  return errors;
};

const sanitizeDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return null;
  // Remove protocol, www, and normalize
  return domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/[^a-z0-9.-]/g, '')
    .slice(0, 255);
};

// Generate secure random ID
const generateSecureId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// In-memory data store
let extensionData = {
  lastSync: null,
  dailyStats: null,
  currentSession: null,
  pageAnalyses: [],
  riskEvents: []
};

// Merchant cards store (for card masking feature)
let merchantCards = {};
let autofillEvents = [];

// Autonomy settings store (initialized from config defaults)
let autonomySettings = { ...CONFIG.AUTONOMY_DEFAULTS };

// Sync endpoint - receives data from extension
app.post('/api/extension/sync', authenticateApiKey, (req, res) => {
  // Validate input
  const errors = validateSync(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { sessionId, dailyStats, currentSession, timestamp } = req.body;

  extensionData.lastSync = timestamp || Date.now();
  extensionData.dailyStats = dailyStats;
  extensionData.currentSession = currentSession;

  // Minimal logging in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[API] Extension sync received:', {
      sessionId,
      shoppingSites: dailyStats?.shoppingSitesVisited,
      cartInteractions: dailyStats?.cartInteractions,
      potentialSpend: dailyStats?.totalPotentialSpend
    });
  }

  res.json({ success: true, received: extensionData.lastSync });
});

// Page analysis endpoint
app.post('/api/extension/page-analysis', authenticateApiKey, (req, res) => {
  // Validate input
  const errors = validatePageAnalysis(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const analysis = req.body;

  // Sanitize domain
  const sanitizedDomain = sanitizeDomain(analysis.domain);
  if (!sanitizedDomain) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  // Store recent analyses (keep last N)
  extensionData.pageAnalyses.unshift({
    ...analysis,
    domain: sanitizedDomain,
    receivedAt: Date.now()
  });
  if (extensionData.pageAnalyses.length > CONFIG.LIMITS.MAX_PAGE_ANALYSES) {
    extensionData.pageAnalyses = extensionData.pageAnalyses.slice(0, CONFIG.LIMITS.MAX_PAGE_ANALYSES);
  }

  // Track risk events
  if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
    extensionData.riskEvents.unshift({
      ...analysis,
      domain: sanitizedDomain,
      eventType: 'risk_detected'
    });
    if (extensionData.riskEvents.length > CONFIG.LIMITS.MAX_RISK_EVENTS) {
      extensionData.riskEvents = extensionData.riskEvents.slice(0, CONFIG.LIMITS.MAX_RISK_EVENTS);
    }
  }

  // Minimal logging in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[API] Page analysis:', {
      domain: sanitizedDomain,
      riskLevel: analysis.riskLevel,
      isShoppingSite: analysis.isShoppingSite,
      prices: analysis.prices?.length || 0
    });
  }

  res.json({ success: true });
});

// Get current data endpoint (for dashboard)
app.get('/api/extension/data', authenticateApiKey, (req, res) => {
  res.json(extensionData);
});

// Get recent risk events
app.get('/api/extension/risk-events', authenticateApiKey, (req, res) => {
  res.json(extensionData.riskEvents);
});

// Get page analyses
app.get('/api/extension/analyses', authenticateApiKey, (req, res) => {
  res.json(extensionData.pageAnalyses);
});

// Health check (no auth required for monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    lastSync: extensionData.lastSync
  });
});

// ==================== AUTONOMY SETTINGS ====================

// Get autonomy settings
app.get('/api/autonomy/settings', authenticateApiKey, (req, res) => {
  res.json({ settings: autonomySettings });
});

// Update autonomy settings (rate-limited more strictly)
app.post('/api/autonomy/settings', authenticateApiKey, strictLimiter, (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object is required' });
  }

  // Validate autonomy settings fields
  const allowedFields = ['level', 'dailySpendingLimit', 'maxShoppingTime', 'blockCheckoutAbove',
                         'coolingOffMinutes', 'autoRedirectOnRisk', 'strictMode'];
  const validSettings = {};

  for (const [key, value] of Object.entries(settings)) {
    if (allowedFields.includes(key)) {
      validSettings[key] = value;
    }
  }

  autonomySettings = { ...autonomySettings, ...validSettings };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[API] Autonomy settings updated:', autonomySettings);
  }

  res.json({ success: true, settings: autonomySettings });
});

// Check if action should be taken (called by extension)
app.post('/api/autonomy/check', authenticateApiKey, (req, res) => {
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

    // Check price threshold - block checkout for high autonomy, cooloff for moderate
    if (currentPrice > autonomySettings.blockCheckoutAbove && action === 'checkout') {
      decision = {
        allow: false,
        action: 'block_checkout',
        reason: 'price_threshold',
        message: `SubGuard blocked this $${currentPrice} purchase. It exceeds your $${autonomySettings.blockCheckoutAbove} checkout limit.`
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

// ==================== CARD MASKING ENDPOINTS ====================

// Receive merchant card from extension (syncs card data to API)
app.post('/api/cards/merchant', authenticateApiKey, strictLimiter, (req, res) => {
  const { card } = req.body;

  // Validate card input
  const errors = validateCard(card);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  // Sanitize domain
  const normalizedDomain = sanitizeDomain(card.domain);
  if (!normalizedDomain) {
    return res.status(400).json({ success: false, error: 'Invalid domain' });
  }

  // Store/update merchant card (only safe fields)
  merchantCards[normalizedDomain] = {
    id: card.id || generateSecureId(),
    domain: normalizedDomain,
    maskedNumber: card.maskedNumber,
    cardType: card.cardType,
    expiry: card.expiry,
    createdAt: card.createdAt || Date.now(),
    lastUsedAt: card.lastUsedAt,
    usageCount: typeof card.usageCount === 'number' ? card.usageCount : 0,
    syncedAt: Date.now()
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[API] Merchant card synced:', {
      domain: normalizedDomain,
      maskedNumber: card.maskedNumber,
      usageCount: card.usageCount
    });
  }

  res.json({ success: true, card: merchantCards[normalizedDomain] });
});

// Get all merchant cards (for dashboard)
app.get('/api/cards/merchant', authenticateApiKey, (req, res) => {
  const cards = Object.values(merchantCards).map(card => ({
    id: card.id,
    domain: card.domain,
    maskedNumber: card.maskedNumber,
    cardType: card.cardType,
    expiry: card.expiry,
    createdAt: card.createdAt,
    lastUsedAt: card.lastUsedAt,
    usageCount: card.usageCount,
    syncedAt: card.syncedAt
  }));

  res.json({ cards });
});

// Get specific merchant card by domain
app.get('/api/cards/merchant/:domain', authenticateApiKey, (req, res) => {
  // Sanitize and validate domain parameter
  const domain = sanitizeDomain(req.params.domain);
  if (!domain) {
    return res.status(400).json({ success: false, error: 'Invalid domain parameter' });
  }

  const card = merchantCards[domain];

  if (!card) {
    return res.status(404).json({ success: false, error: 'Card not found' });
  }

  res.json({ card });
});

// Record autofill event
app.post('/api/cards/autofill', authenticateApiKey, (req, res) => {
  const { domain, fieldType, timestamp } = req.body;

  // Validate required fields
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain is required and must be a string' });
  }
  if (!fieldType || typeof fieldType !== 'string') {
    return res.status(400).json({ error: 'fieldType is required and must be a string' });
  }

  // Sanitize domain
  const normalizedDomain = sanitizeDomain(domain);
  if (!normalizedDomain) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  // Validate fieldType is one of expected values
  const allowedFieldTypes = ['card-number', 'expiry', 'cvv', 'name', 'billing-address'];
  if (!allowedFieldTypes.includes(fieldType)) {
    return res.status(400).json({ error: 'Invalid fieldType' });
  }

  const event = {
    id: generateSecureId(),
    domain: normalizedDomain,
    fieldType,
    timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
    recordedAt: Date.now()
  };

  autofillEvents.unshift(event);

  // Keep only last 100 events
  if (autofillEvents.length > 100) {
    autofillEvents = autofillEvents.slice(0, 100);
  }

  // Update card usage count if we have the card
  if (merchantCards[normalizedDomain]) {
    merchantCards[normalizedDomain].lastUsedAt = event.timestamp;
    merchantCards[normalizedDomain].usageCount = (merchantCards[normalizedDomain].usageCount || 0) + 1;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[API] Autofill event:', { domain: normalizedDomain, fieldType });
  }

  res.json({ success: true, event });
});

// Get autofill events (for dashboard analytics)
app.get('/api/cards/autofill-events', authenticateApiKey, (req, res) => {
  res.json({ events: autofillEvents });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  // Log error in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API Error]:', err.message);
  }

  // Don't expose internal errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`[SubGuard API] Server running on http://localhost:${CONFIG.PORT}`);
  console.log('[SubGuard API] Waiting for Chrome extension connections...');
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SubGuard API] Running in development mode (auth bypassed)');
  }
});
