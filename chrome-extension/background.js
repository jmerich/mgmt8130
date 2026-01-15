// SubGuard AI Background Service Worker
// Handles data aggregation, communication, and sync with main app

import { CONFIG } from './config.js';

const SUBGUARD_API_URL = CONFIG.API_URL;
let API_KEY = CONFIG.API_KEY || '';

// Load API key from storage
chrome.storage.local.get(['apiKey'], (result) => {
  if (result.apiKey) API_KEY = result.apiKey;
});

// Helper to create headers with API key
function getApiHeaders(additionalHeaders = {}) {
  const headers = { ...additionalHeaders };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
}

// Merchant card storage for card masking autofill
let merchantCards = {}; // domain -> card mapping

// Aggregated data store
let aggregatedData = {
  sessions: [],
  currentSession: null,
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    shoppingSitesVisited: 0,
    totalTimeOnShoppingSites: 0,
    cartInteractions: 0,
    checkoutAttempts: 0,
    interventionsShown: 0,
    purchasesPrevented: 0,
    totalPotentialSpend: 0,
    riskEvents: []
  },
  weeklyTrends: [],
  blockedSites: [],
  settings: {
    enabled: true,
    interventionThreshold: 'medium', // low, medium, high
    autoBlockCheckout: false,
    coolingOffPeriod: 30, // seconds
    syncWithApp: true
  }
};

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubGuard] Extension installed');
  loadStoredData();
  startNewSession();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[SubGuard] Extension started');
  loadStoredData();
  startNewSession();
});

// Load stored data
async function loadStoredData() {
  try {
    const stored = await chrome.storage.local.get(['aggregatedData', 'settings', 'merchantCards']);
    if (stored.aggregatedData) {
      aggregatedData = { ...aggregatedData, ...stored.aggregatedData };
    }
    if (stored.settings) {
      aggregatedData.settings = { ...aggregatedData.settings, ...stored.settings };
    }
    if (stored.merchantCards) {
      merchantCards = stored.merchantCards;
      console.log('[SubGuard] Loaded', Object.keys(merchantCards).length, 'merchant cards');
    }

    // Reset daily stats if new day
    const today = new Date().toISOString().split('T')[0];
    if (aggregatedData.dailyStats.date !== today) {
      archiveDailyStats();
      resetDailyStats();
    }
  } catch (error) {
    console.error('[SubGuard] Error loading stored data:', error);
  }
}

// Save data
async function saveData() {
  try {
    await chrome.storage.local.set({ aggregatedData });
  } catch (error) {
    console.error('[SubGuard] Error saving data:', error);
  }
}

// Start new browsing session
function startNewSession() {
  aggregatedData.currentSession = {
    id: generateId(),
    startTime: Date.now(),
    endTime: null,
    pagesVisited: 0,
    shoppingSitesVisited: 0,
    cartInteractions: 0,
    checkoutAttempts: 0,
    interventions: [],
    riskEvents: [],
    totalPotentialSpend: 0
  };
}

// Generate unique ID
function generateId() {
  return `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Archive daily stats to weekly trends
function archiveDailyStats() {
  aggregatedData.weeklyTrends.push({ ...aggregatedData.dailyStats });
  // Keep only last 7 days
  if (aggregatedData.weeklyTrends.length > 7) {
    aggregatedData.weeklyTrends.shift();
  }
}

// Reset daily stats
function resetDailyStats() {
  aggregatedData.dailyStats = {
    date: new Date().toISOString().split('T')[0],
    shoppingSitesVisited: 0,
    totalTimeOnShoppingSites: 0,
    cartInteractions: 0,
    checkoutAttempts: 0,
    interventionsShown: 0,
    purchasesPrevented: 0,
    totalPotentialSpend: 0,
    riskEvents: []
  };
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
  const { type, data, session } = message;

  switch (type) {
    case 'PAGE_ANALYSIS':
      return handlePageAnalysis(data, session, sender.tab);

    case 'SESSION_UPDATE':
      return handleSessionUpdate(session);

    case 'CART_INTERACTION':
      return handleCartInteraction(data);

    case 'CHECKOUT_ATTEMPT':
      return handleCheckoutAttempt(data);

    case 'LEAVE_SITE':
      return handleLeaveSite();

    case 'GET_STATS':
      return getStats();

    case 'GET_SETTINGS':
      return aggregatedData.settings;

    case 'UPDATE_SETTINGS':
      return updateSettings(data);

    case 'SYNC_WITH_APP':
      return syncWithApp();

    case 'API_AUTONOMY_CHECK':
      return proxyAutonomyCheck(data);

    case 'CHECKOUT_BLOCKED':
      aggregatedData.dailyStats.purchasesPrevented++;
      await saveData();
      return { success: true };

    // Card masking autofill handlers
    case 'GET_MERCHANT_CARD':
      return getOrCreateMerchantCard(data.domain);

    case 'CARD_FIELD_FILLED':
      return recordAutofillEvent(data);

    case 'LIST_MERCHANT_CARDS':
      return { cards: Object.values(merchantCards) };

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Proxy autonomy check through background script (avoids CORS)
async function proxyAutonomyCheck(data) {
  try {
    const response = await fetch(`${SUBGUARD_API_URL}/autonomy/check`, {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const decision = await response.json();
      console.log('[SubGuard] Autonomy check result:', decision);
      return decision;
    } else {
      return { allow: true, error: 'API error' };
    }
  } catch (error) {
    console.log('[SubGuard] Autonomy check failed:', error);
    return { allow: true, error: 'Network error' };
  }
}

// ==================== CARD MASKING FUNCTIONS ====================

// Generate a Luhn-valid card number (test card starting with 4532 - Visa format)
function generateCardNumber() {
  // Start with a known Visa test prefix
  const prefix = '4532';
  let cardNumber = prefix;

  // Generate 11 random digits (total 15 digits before check digit)
  for (let i = 0; i < 11; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate Luhn check digit
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  return cardNumber + checkDigit;
}

// Calculate the Luhn check digit for a partial card number
function calculateLuhnCheckDigit(partialNumber) {
  let sum = 0;
  let isEven = true; // Since we're calculating for 15 digits, start with even

  for (let i = partialNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return ((10 - (sum % 10)) % 10).toString();
}

// Generate expiry date (2+ years from now)
function generateExpiry() {
  const now = new Date();
  const futureYear = now.getFullYear() + 2 + Math.floor(Math.random() * 3);
  const month = Math.floor(Math.random() * 12) + 1;
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = futureYear.toString().slice(-2);
  return monthStr + '/' + yearStr;
}

// Generate CVV (3 random digits)
function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString();
}

// Generate a new masked card for a merchant
function generateMerchantCard(domain) {
  const cardNumber = generateCardNumber();
  return {
    id: generateId(),
    domain: domain,
    number: cardNumber,
    maskedNumber: '**** **** **** ' + cardNumber.slice(-4),
    expiry: generateExpiry(),
    cvv: generateCVV(),
    cardholderName: 'SUBGUARD USER',
    cardType: 'Visa',
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    usageCount: 0
  };
}

// Get or create a merchant card for a domain
async function getOrCreateMerchantCard(domain) {
  // Normalize domain (remove www. prefix)
  const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

  // Check if card already exists for this merchant
  if (merchantCards[normalizedDomain]) {
    console.log('[SubGuard] Returning existing card for', normalizedDomain);
    // Update last used timestamp
    merchantCards[normalizedDomain].lastUsedAt = Date.now();
    await saveMerchantCards();
    return { card: merchantCards[normalizedDomain] };
  }

  // Generate new card
  console.log('[SubGuard] Generating new card for', normalizedDomain);
  const newCard = generateMerchantCard(normalizedDomain);
  merchantCards[normalizedDomain] = newCard;

  // Save to storage
  await saveMerchantCards();

  // Sync with API
  await syncMerchantCard(newCard);

  return { card: newCard };
}

// Save merchant cards to storage
async function saveMerchantCards() {
  try {
    await chrome.storage.local.set({ merchantCards });
    console.log('[SubGuard] Saved', Object.keys(merchantCards).length, 'merchant cards');
  } catch (error) {
    console.error('[SubGuard] Error saving merchant cards:', error);
  }
}

// Record an autofill event
async function recordAutofillEvent(data) {
  const { domain, fieldType, timestamp } = data;
  const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

  if (merchantCards[normalizedDomain]) {
    merchantCards[normalizedDomain].usageCount++;
    merchantCards[normalizedDomain].lastUsedAt = timestamp;
    await saveMerchantCards();

    // Sync event with API
    await syncAutofillEvent(data);
  }

  return { success: true };
}

// Sync merchant card with API
async function syncMerchantCard(card) {
  try {
    await fetch(`${SUBGUARD_API_URL}/cards/merchant`, {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ card })
    });
    console.log('[SubGuard] Synced merchant card to API');
  } catch (error) {
    // API might not be available
    console.log('[SubGuard] Card sync skipped (API not available)');
  }
}

// Sync autofill event with API
async function syncAutofillEvent(data) {
  try {
    await fetch(`${SUBGUARD_API_URL}/cards/autofill`, {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
  } catch (error) {
    // API might not be available
  }
}

// Handle page analysis from content script
async function handlePageAnalysis(analysis, session, tab) {
  if (!analysis || !aggregatedData.currentSession) return;

  // Update current session
  aggregatedData.currentSession.pagesVisited++;

  if (analysis.isShoppingSite) {
    aggregatedData.currentSession.shoppingSitesVisited++;
    aggregatedData.dailyStats.shoppingSitesVisited++;
  }

  // Track potential spend
  if (analysis.prices && analysis.prices.length > 0) {
    const maxPrice = Math.max(...analysis.prices);
    aggregatedData.currentSession.totalPotentialSpend += maxPrice;
    aggregatedData.dailyStats.totalPotentialSpend += maxPrice;
  }

  // Record risk events
  if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
    const riskEvent = {
      id: generateId(),
      timestamp: Date.now(),
      url: analysis.url,
      domain: analysis.domain,
      riskLevel: analysis.riskLevel,
      factors: {
        isCheckout: analysis.isCheckoutPage,
        urgencyTactics: analysis.urgencyTactics.length,
        highPrices: analysis.prices.some(p => p > 100)
      }
    };
    aggregatedData.currentSession.riskEvents.push(riskEvent);
    aggregatedData.dailyStats.riskEvents.push(riskEvent);
  }

  // Update badge
  updateBadge(analysis.riskLevel);

  // Sync with main app if enabled
  if (aggregatedData.settings.syncWithApp) {
    await syncPageAnalysis(analysis);
  }

  await saveData();
  return { success: true };
}

// Handle session updates
async function handleSessionUpdate(session) {
  if (session && aggregatedData.currentSession) {
    aggregatedData.currentSession.timeOnShoppingSites = session.timeOnShoppingSites;
    aggregatedData.dailyStats.totalTimeOnShoppingSites = session.timeOnShoppingSites;
  }
  return { success: true };
}

// Handle cart interactions
async function handleCartInteraction(data) {
  aggregatedData.currentSession.cartInteractions++;
  aggregatedData.dailyStats.cartInteractions++;

  // Log for analytics
  console.log('[SubGuard] Cart interaction:', data);

  await saveData();
  await syncWithApp();

  return { success: true };
}

// Handle checkout attempts
async function handleCheckoutAttempt(data) {
  aggregatedData.currentSession.checkoutAttempts++;
  aggregatedData.dailyStats.checkoutAttempts++;

  // Check if we should block
  if (aggregatedData.settings.autoBlockCheckout) {
    // Show intervention
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SHOW_INTERVENTION' });
      }
    });
    aggregatedData.dailyStats.interventionsShown++;
  }

  await saveData();
  return { success: true };
}

// Handle leave site action
async function handleLeaveSite() {
  aggregatedData.dailyStats.purchasesPrevented++;
  await saveData();
  return { success: true };
}

// Get aggregated stats
function getStats() {
  return {
    currentSession: aggregatedData.currentSession,
    dailyStats: aggregatedData.dailyStats,
    weeklyTrends: aggregatedData.weeklyTrends,
    settings: aggregatedData.settings
  };
}

// Update settings
async function updateSettings(newSettings) {
  aggregatedData.settings = { ...aggregatedData.settings, ...newSettings };
  await chrome.storage.local.set({ settings: aggregatedData.settings });
  return { success: true, settings: aggregatedData.settings };
}

// Update extension badge
function updateBadge(riskLevel) {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  const text = {
    critical: '!',
    high: '!',
    medium: '',
    low: ''
  };

  chrome.action.setBadgeBackgroundColor({ color: colors[riskLevel] || colors.low });
  chrome.action.setBadgeText({ text: text[riskLevel] || '' });
}

// Sync with main SubGuard app
async function syncWithApp() {
  if (!aggregatedData.settings.syncWithApp) return;

  try {
    const response = await fetch(`${SUBGUARD_API_URL}/extension/sync`, {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        sessionId: aggregatedData.currentSession?.id,
        dailyStats: aggregatedData.dailyStats,
        currentSession: aggregatedData.currentSession,
        timestamp: Date.now()
      })
    });

    if (response.ok) {
      console.log('[SubGuard] Synced with app');
    }
  } catch (error) {
    // App might not be running - that's ok
    console.log('[SubGuard] App sync skipped (app not available)');
  }
}

// Sync page analysis with app
async function syncPageAnalysis(analysis) {
  try {
    await fetch(`${SUBGUARD_API_URL}/extension/page-analysis`, {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...analysis,
        sessionId: aggregatedData.currentSession?.id
      })
    });
  } catch (error) {
    // Silently fail if app not available
  }
}

// Periodic sync alarm
chrome.alarms.create('syncWithApp', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncWithApp') {
    syncWithApp();
  }
});

// Tab change listener
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      // Request analysis from content script
      chrome.tabs.sendMessage(activeInfo.tabId, { type: 'GET_PAGE_ANALYSIS' });
    }
  } catch (error) {
    // Tab might not have content script
  }
});

// Navigation listener
chrome.webNavigation?.onCompleted?.addListener((details) => {
  if (details.frameId === 0) {
    // Main frame navigation
    chrome.tabs.sendMessage(details.tabId, { type: 'GET_PAGE_ANALYSIS' }).catch(() => {});
  }
});

console.log('[SubGuard] Background service worker initialized');
