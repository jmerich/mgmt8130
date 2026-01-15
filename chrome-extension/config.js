// Chrome Extension Configuration
// Centralized constants and configuration

export const CONFIG = {
  // API Configuration
  API_URL: 'http://localhost:3001/api',

  // Endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    SYNC: '/extension/sync',
    PAGE_ANALYSIS: '/extension/page-analysis',
    AUTONOMY_SETTINGS: '/autonomy/settings',
    AUTONOMY_CHECK: '/autonomy/check',
  },

  // Polling intervals (in milliseconds)
  POLLING: {
    SESSION_UPDATE: 5000,
    SYNC_WITH_APP: 60000,
  },

  // Z-index values for overlays
  Z_INDEX: {
    OVERLAY: 2147483647,
    MODAL: 2147483646,
    TOAST: 2147483645,
  },

  // Redirect countdown in seconds
  REDIRECT_COUNTDOWN: 5,

  // Default cooling-off period in minutes
  DEFAULT_COOLOFF_MINUTES: 5,
};

// Shopping site detection patterns
export const SHOPPING_PATTERNS = {
  // Known shopping domains
  domains: [
    'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de',
    'ebay.com', 'ebay.co.uk',
    'walmart.com',
    'target.com',
    'bestbuy.com',
    'etsy.com',
    'shopify.com',
    'aliexpress.com',
    'wish.com',
    'wayfair.com',
    'nordstrom.com',
    'macys.com',
    'zappos.com',
    'nike.com',
    'adidas.com',
    'costco.com',
    'sephora.com',
    'ulta.com',
    'homedepot.com',
    'lowes.com',
    'newegg.com',
    'overstock.com',
  ],

  // Keywords that indicate checkout pages
  checkoutKeywords: [
    'checkout', 'cart', 'basket', 'bag', 'payment', 'billing',
    'shipping', 'order', 'purchase', 'buy now', 'add to cart',
  ],

  // Price pattern regex
  pricePattern: /\$[\d,]+\.?\d*/g,

  // Maximum price to consider valid (filters out phone numbers, etc.)
  maxValidPrice: 100000,
};

// Checkout button detection patterns
export const CHECKOUT_BUTTON_PATTERNS = {
  textPatterns: [
    'checkout',
    'check out',
    'sign in to',
    'proceed',
    'place order',
    'place your order',
    'complete purchase',
    'complete order',
    'buy now',
    'buy it now',
    'submit order',
    'pay now',
    'pay $',
    'continue to payment',
    'continue to checkout',
    'go to checkout',
    'view cart',
    'view bag',
    'start checkout',
  ],
  classPatterns: [
    'checkout',
    'proceed',
    'buy-now',
    'place-order',
  ],
  idPatterns: [
    'checkout',
    'buy-now',
    'place-order',
  ],
  hrefPatterns: [
    'checkout',
    '/buy/',
    '/cart',
    '/basket',
    '/bag',
  ],
};

// Urgency tactics (dark patterns) to detect
export const URGENCY_TACTICS = [
  { phrase: 'only .* left', type: 'scarcity' },
  { phrase: 'limited time', type: 'urgency' },
  { phrase: 'sale ends', type: 'urgency' },
  { phrase: 'hurry', type: 'urgency' },
  { phrase: 'last chance', type: 'urgency' },
  { phrase: 'selling fast', type: 'scarcity' },
  { phrase: 'in high demand', type: 'social_proof' },
  { phrase: 'people are viewing', type: 'social_proof' },
  { phrase: 'people bought', type: 'social_proof' },
  { phrase: 'flash sale', type: 'urgency' },
  { phrase: 'today only', type: 'urgency' },
  { phrase: 'exclusive offer', type: 'exclusivity' },
  { phrase: 'members only', type: 'exclusivity' },
];

// Risk level scoring weights
export const RISK_WEIGHTS = {
  isShoppingSite: 20,
  isCheckoutPage: 40,
  isProductPage: 15,
  highPriceItem: 15,
  urgencyTactic: 10,
  hasCartItems: 20,
  lateNightShopping: 15,
  weekendShopping: 5,
};

// Risk level thresholds
export const RISK_THRESHOLDS = {
  critical: 70,
  high: 50,
  medium: 30,
};

// SubGuard dashboard URLs to exclude from monitoring
export const EXCLUDED_URLS = {
  hostnames: ['localhost'],
  ports: ['5173', '3001'],
};
