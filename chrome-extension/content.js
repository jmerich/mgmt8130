// SubGuard AI Content Script
// Analyzes page content and detects shopping behavior

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  // Note: Content scripts can't use ES module imports, so config is defined inline
  // Keep in sync with chrome-extension/config.js

  const CONFIG = {
    API_URL: 'http://localhost:3001/api',
    DASHBOARD_URL: 'http://localhost:5173',
    POLLING: {
      SESSION_UPDATE: 5000,
    },
    UI: {
      TOAST_DURATION: 3000,
      PAUSE_DURATION: 30,
      REDIRECT_COUNTDOWN: 5,
    },
    Z_INDEX: {
      OVERLAY: 2147483647,
    },
  };

  // SubGuard dashboard URLs to exclude from monitoring
  const EXCLUDED_URLS = {
    hostnames: ['localhost'],
    ports: ['5173', '3001'],
  };

  // Shopping site detection patterns
  const SHOPPING_PATTERNS = {
    domains: [
      'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de',
      'ebay.com', 'ebay.co.uk',
      'walmart.com', 'target.com', 'bestbuy.com',
      'etsy.com', 'shopify.com', 'aliexpress.com', 'wish.com', 'wayfair.com',
      'nordstrom.com', 'macys.com', 'zappos.com', 'nike.com', 'adidas.com',
      'costco.com', 'sephora.com', 'ulta.com', 'homedepot.com', 'lowes.com',
      'newegg.com', 'overstock.com',
    ],
    checkoutKeywords: [
      'checkout', 'cart', 'basket', 'bag', 'payment', 'billing',
      'shipping', 'order', 'purchase', 'buy now', 'add to cart',
    ],
    pricePattern: /\$[\d,]+\.?\d*/g,
    maxValidPrice: 100000,
  };

  // Checkout button detection patterns
  const CHECKOUT_BUTTON_PATTERNS = {
    textPatterns: [
      'checkout', 'check out', 'sign in to', 'proceed',
      'place order', 'place your order', 'complete purchase', 'complete order',
      'buy now', 'buy it now', 'submit order', 'pay now', 'pay $',
      'continue to payment', 'continue to checkout', 'go to checkout',
      'view cart', 'view bag', 'start checkout',
    ],
    classPatterns: ['checkout', 'proceed', 'buy-now', 'place-order'],
    idPatterns: ['checkout', 'buy-now', 'place-order'],
    hrefPatterns: ['checkout', '/buy/', '/cart', '/basket', '/bag'],
  };

  // Urgency tactics (dark patterns) to detect
  const URGENCY_TACTICS = [
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
  const RISK_WEIGHTS = {
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
  const RISK_THRESHOLDS = {
    critical: 70,
    high: 50,
    medium: 30,
  };

  // Payment form field detection patterns (for card masking autofill)
  const PAYMENT_FIELD_PATTERNS = {
    cardNumber: {
      namePatterns: ['card', 'cc', 'credit', 'cardnumber', 'ccnum', 'pan', 'account'],
      idPatterns: ['cardNumber', 'cc-number', 'credit-card', 'ccnum', 'card-number'],
      autocompleteValues: ['cc-number', 'card-number'],
      placeholderPatterns: ['card number', 'credit card', '1234 5678', '4111', 'xxxx xxxx'],
      labelPatterns: ['card number', 'credit card number', 'debit card', 'card no'],
    },
    expiry: {
      namePatterns: ['exp', 'expir', 'expdate', 'cc-exp', 'valid', 'expiry'],
      idPatterns: ['expiry', 'exp-date', 'expirationDate', 'cc-exp', 'cardExpiry'],
      autocompleteValues: ['cc-exp', 'cc-exp-month', 'cc-exp-year'],
      placeholderPatterns: ['mm/yy', 'mm / yy', 'expiry', 'exp date', 'mm/yyyy'],
      labelPatterns: ['expiry', 'expiration', 'valid thru', 'exp. date', 'expires'],
    },
    cvv: {
      namePatterns: ['cvv', 'cvc', 'csc', 'security', 'seccode', 'cvn', 'cv2'],
      idPatterns: ['cvv', 'cvc', 'securityCode', 'cardCode', 'cvv2'],
      autocompleteValues: ['cc-csc'],
      placeholderPatterns: ['cvv', 'cvc', '123', 'security code', 'csc'],
      labelPatterns: ['cvv', 'cvc', 'security code', 'card code', 'verification'],
    },
    cardholderName: {
      namePatterns: ['cardholder', 'ccname', 'name-on-card', 'card-name', 'holdername'],
      idPatterns: ['cardholderName', 'ccName', 'nameOnCard', 'cardHolder'],
      autocompleteValues: ['cc-name'],
      placeholderPatterns: ['name on card', 'cardholder', 'full name', 'name as on card'],
      labelPatterns: ['name on card', 'cardholder name', 'card holder', 'name as it appears'],
    },
  };

  // Card masking autofill settings
  const AUTOFILL_CONFIG = {
    ICON_SIZE: 20,
    ICON_OFFSET: 4,
  };

  // ==================== STATE ====================
  let pageAnalysis = null;
  let overlayVisible = false;
  let autonomySettings = null;
  let detectedPaymentFields = []; // For card masking autofill
  let autofillIconsInjected = false;
  let sessionData = {
    startTime: Date.now(),
    pagesVisited: 0,
    shoppingSitesVisited: 0,
    pricesViewed: [],
    cartInteractions: 0,
    timeOnShoppingSites: 0
  };

  // Check if we're on the SubGuard dashboard - don't interfere with it
  function isSubGuardDashboard() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return EXCLUDED_URLS.hostnames.includes(hostname) && EXCLUDED_URLS.ports.includes(port);
  }

  // Initialize
  function init() {
    // Skip initialization on SubGuard dashboard
    if (isSubGuardDashboard()) {
      console.log('[SubGuard] Skipping on dashboard');
      return;
    }

    console.log('[SubGuard] Content script initialized');
    fetchAutonomySettings();
    analyzePage();
    setupMutationObserver();
    setupEventListeners();
    reportToBackground();
    checkAutonomyEnforcement();

    // Card masking autofill - inject icons on checkout/payment pages
    if (pageAnalysis?.isCheckoutPage || window.location.href.toLowerCase().includes('payment')) {
      setTimeout(() => {
        injectAutofillIcons();
        setupPaymentFieldObserver();
      }, 1000); // Delay to let page fully load
    }
  }

  // Fetch autonomy settings from API
  async function fetchAutonomySettings() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/autonomy/settings`);
      if (response.ok) {
        const data = await response.json();
        autonomySettings = data.settings;
        console.log('[SubGuard] Autonomy settings loaded:', autonomySettings?.level);
      }
    } catch (error) {
      console.log('[SubGuard] Could not fetch autonomy settings');
    }
  }

  // Check and enforce autonomy rules
  async function checkAutonomyEnforcement() {
    if (!pageAnalysis?.isShoppingSite) return;

    try {
      const response = await fetch(`${CONFIG.API_URL}/autonomy/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: pageAnalysis.isCheckoutPage ? 'checkout' : 'browse',
          context: {
            totalSpentToday: sessionData.pricesViewed.reduce((a, b) => a + b, 0),
            timeOnShoppingSites: sessionData.timeOnShoppingSites,
            currentPrice: pageAnalysis.prices.length > 0 ? Math.max(...pageAnalysis.prices) : 0,
            riskLevel: pageAnalysis.riskLevel
          }
        })
      });

      if (response.ok) {
        const decision = await response.json();
        if (!decision.allow) {
          handleAutonomyDecision(decision);
        }
      }
    } catch (error) {
      console.log('[SubGuard] Autonomy check failed');
    }
  }

  // Handle autonomy decision
  function handleAutonomyDecision(decision) {
    console.log('[SubGuard] Handling autonomy decision:', decision);

    try {
      // Remove any existing overlay first
      const existingOverlay = document.getElementById('subguard-autonomy-overlay');
      if (existingOverlay) existingOverlay.remove();
      overlayVisible = false;

      if (decision.action === 'redirect_away') {
        console.log('[SubGuard] Showing redirect overlay');
        showRedirectOverlay(decision);
      } else if (decision.action === 'block_checkout') {
        console.log('[SubGuard] Showing block overlay');
        showBlockOverlay(decision);
      } else if (decision.action === 'require_cooloff') {
        console.log('[SubGuard] Showing cooloff overlay');
        showCooloffOverlay(decision);
      } else {
        // Unknown action - show a generic block
        console.log('[SubGuard] Unknown action, showing generic block');
        showBlockOverlay({
          ...decision,
          message: decision.message || 'SubGuard has blocked this action to protect your financial goals.'
        });
      }
    } catch (error) {
      console.error('[SubGuard] Error showing overlay:', error);
      // Show a simple alert as fallback
      alert(`SubGuard Blocked: ${decision.message || decision.reason || 'Purchase blocked'}`);
    }
  }

  // Show redirect overlay (for full autonomy mode)
  function showRedirectOverlay(decision) {
    if (overlayVisible) return;

    const overlay = createElement('div');
    overlay.id = 'subguard-autonomy-overlay';
    overlay.className = 'subguard-redirect-overlay';

    const modal = createElement('div', 'subguard-autonomy-modal');

    // Header
    const header = createElement('div', 'autonomy-header');
    const icon = createElement('div', 'autonomy-icon', '\uD83E\uDDE0');
    const title = createElement('h2', null, 'SubGuard AI is Taking Action');
    header.appendChild(icon);
    header.appendChild(title);
    modal.appendChild(header);

    // Message
    const message = createElement('div', 'autonomy-message');
    message.appendChild(createElement('p', 'autonomy-reason', decision.message));

    const explanation = createElement('div', 'autonomy-explanation');
    if (decision.reason === 'time_limit_exceeded') {
      explanation.appendChild(createElement('p', null, "You've exceeded your daily shopping time limit. Taking breaks helps you make better financial decisions."));
    } else if (decision.reason === 'daily_limit_exceeded') {
      explanation.appendChild(createElement('p', null, "You've reached your spending limit for today. This helps you stay within your budget."));
    } else if (decision.reason === 'high_risk_detected') {
      explanation.appendChild(createElement('p', null, "The AI detected patterns associated with impulse purchases. Taking a step back now can prevent buyer's regret."));
    }
    message.appendChild(explanation);
    modal.appendChild(message);

    // Countdown
    const countdown = createElement('div', 'autonomy-countdown');
    countdown.appendChild(createElement('p', null, 'Redirecting you in'));
    const timer = createElement('span', 'countdown-timer', '5');
    countdown.appendChild(timer);
    countdown.appendChild(createElement('span', null, ' seconds'));
    modal.appendChild(countdown);

    // Actions
    const actions = createElement('div', 'autonomy-actions');
    const acceptBtn = createElement('button', 'autonomy-btn accept', 'Take Me Away Now');
    const overrideBtn = createElement('button', 'autonomy-btn override', 'Override (Not Recommended)');
    actions.appendChild(acceptBtn);
    actions.appendChild(overrideBtn);
    modal.appendChild(actions);

    // Footer
    const footer = createElement('div', 'autonomy-footer');
    footer.appendChild(createElement('p', null, 'Full AI Autonomy Mode is enabled. Change this in your SubGuard dashboard.'));
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlayVisible = true;

    // Countdown and redirect
    let seconds = CONFIG.UI.REDIRECT_COUNTDOWN;
    const countdownInterval = setInterval(() => {
      seconds--;
      timer.textContent = seconds.toString();
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        window.location.href = CONFIG.DASHBOARD_URL + '/?redirected=true&reason=' + encodeURIComponent(decision.reason);
      }
    }, 1000);

    acceptBtn.addEventListener('click', () => {
      clearInterval(countdownInterval);
      window.location.href = CONFIG.DASHBOARD_URL + '/?redirected=true&reason=' + encodeURIComponent(decision.reason);
    });

    overrideBtn.addEventListener('click', () => {
      clearInterval(countdownInterval);
      overlay.remove();
      overlayVisible = false;
      chrome.runtime.sendMessage({ type: 'AUTONOMY_OVERRIDE', decision });
    });
  }

  // Show block overlay (for checkout blocking)
  function showBlockOverlay(decision) {
    if (overlayVisible) return;

    const overlay = createElement('div');
    overlay.id = 'subguard-autonomy-overlay';
    overlay.className = 'subguard-block-overlay';
    // Add inline styles as fallback
    overlay.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.95)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:system-ui,sans-serif!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;';

    const modal = createElement('div', 'subguard-autonomy-modal');
    modal.style.cssText = 'background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:24px;width:90%;max-width:520px;padding:0;box-shadow:0 30px 100px rgba(239,68,68,0.4);color:white;text-align:center;';

    const header = createElement('div', 'autonomy-header');
    header.style.cssText = 'padding:30px 24px 20px;background:linear-gradient(135deg,rgba(239,68,68,0.2),rgba(185,28,28,0.2));border-bottom:1px solid rgba(255,255,255,0.1);';

    const icon = createElement('div', 'autonomy-icon', '\uD83D\uDEAB');
    icon.style.cssText = 'font-size:48px;margin-bottom:10px;';
    header.appendChild(icon);

    const title = createElement('h2', null, 'Checkout Blocked');
    title.style.cssText = 'margin:0;font-size:24px;color:white;';
    header.appendChild(title);
    modal.appendChild(header);

    const message = createElement('div', 'autonomy-message');
    message.style.cssText = 'padding:24px;';

    const reason = createElement('p', 'autonomy-reason', decision.message);
    reason.style.cssText = 'font-size:16px;color:#f87171;margin:0 0 12px 0;font-weight:500;';
    message.appendChild(reason);

    const helpText = createElement('p', null, 'This is helping you stick to your financial goals.');
    helpText.style.cssText = 'font-size:14px;color:rgba(255,255,255,0.7);margin:0;';
    message.appendChild(helpText);
    modal.appendChild(message);

    const actions = createElement('div', 'autonomy-actions');
    actions.style.cssText = 'padding:0 24px 24px;display:flex;gap:12px;flex-direction:column;';

    const backBtn = createElement('button', 'autonomy-btn accept', 'Go Back to Shopping');
    backBtn.style.cssText = 'padding:14px 24px;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;';

    const dashboardBtn = createElement('button', 'autonomy-btn secondary', 'View Dashboard');
    dashboardBtn.style.cssText = 'padding:14px 24px;border:1px solid rgba(255,255,255,0.2);border-radius:12px;font-size:16px;cursor:pointer;background:transparent;color:white;';

    actions.appendChild(backBtn);
    actions.appendChild(dashboardBtn);
    modal.appendChild(actions);

    overlay.appendChild(modal);

    // Use setTimeout to ensure it shows after any page scripts run
    setTimeout(() => {
      // Try documentElement first, then body
      (document.documentElement || document.body).appendChild(overlay);
      overlayVisible = true;
      console.log('[SubGuard] Block overlay shown!');
    }, 50);

    backBtn.addEventListener('click', () => {
      overlay.remove();
      overlayVisible = false;
      // Redirect to Google
      window.location.href = 'https://www.google.com';
    });

    dashboardBtn.addEventListener('click', () => {
      window.location.href = CONFIG.DASHBOARD_URL;
    });
  }

  // Show cooling-off overlay
  function showCooloffOverlay(decision) {
    if (overlayVisible) return;

    const overlay = createElement('div');
    overlay.id = 'subguard-autonomy-overlay';
    overlay.className = 'subguard-cooloff-overlay';

    const modal = createElement('div', 'subguard-autonomy-modal');

    const header = createElement('div', 'autonomy-header');
    header.appendChild(createElement('div', 'autonomy-icon', '\u23F1\uFE0F'));
    header.appendChild(createElement('h2', null, 'Cooling-Off Period'));
    modal.appendChild(header);

    const message = createElement('div', 'autonomy-message');
    message.appendChild(createElement('p', 'autonomy-reason', decision.message));
    modal.appendChild(message);

    // Timer display
    const timerDisplay = createElement('div', 'cooloff-timer-display');
    const minutes = decision.cooloffMinutes || 5;
    let remainingSeconds = minutes * 60;
    const timerText = createElement('span', 'cooloff-time', formatTime(remainingSeconds));
    timerDisplay.appendChild(createElement('p', null, 'Time remaining:'));
    timerDisplay.appendChild(timerText);
    modal.appendChild(timerDisplay);

    // Progress bar
    const progressContainer = createElement('div', 'cooloff-progress');
    const progressBar = createElement('div', 'cooloff-progress-bar');
    progressBar.style.width = '100%';
    progressContainer.appendChild(progressBar);
    modal.appendChild(progressContainer);

    // Reflection prompts
    const prompts = createElement('div', 'cooloff-prompts');
    prompts.appendChild(createElement('h4', null, 'While you wait, consider:'));
    const promptList = createElement('ul');
    ['Is this purchase aligned with my financial goals?', 'Will I still want this item next week?', 'Is there a more affordable alternative?', 'Am I buying this out of emotion or necessity?'].forEach(text => {
      promptList.appendChild(createElement('li', null, text));
    });
    prompts.appendChild(promptList);
    modal.appendChild(prompts);

    const actions = createElement('div', 'autonomy-actions');
    const proceedBtn = createElement('button', 'autonomy-btn accept disabled', 'Proceed with Purchase');
    proceedBtn.disabled = true;
    const cancelBtn = createElement('button', 'autonomy-btn secondary', 'Cancel Purchase');
    actions.appendChild(proceedBtn);
    actions.appendChild(cancelBtn);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlayVisible = true;

    // Countdown
    const totalSeconds = remainingSeconds;
    const countdownInterval = setInterval(() => {
      remainingSeconds--;
      timerText.textContent = formatTime(remainingSeconds);
      progressBar.style.width = ((remainingSeconds / totalSeconds) * 100) + '%';

      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        proceedBtn.disabled = false;
        proceedBtn.classList.remove('disabled');
        proceedBtn.textContent = 'Proceed with Purchase';
      }
    }, 1000);

    proceedBtn.addEventListener('click', () => {
      if (!proceedBtn.disabled) {
        overlay.remove();
        overlayVisible = false;
      }
    });

    cancelBtn.addEventListener('click', () => {
      clearInterval(countdownInterval);
      overlay.remove();
      overlayVisible = false;
      // Redirect to Google
      window.location.href = 'https://www.google.com';
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Analyze current page
  function analyzePage() {
    const url = window.location.href;
    const domain = window.location.hostname;
    const pageText = document.body?.innerText || '';
    const title = document.title;

    pageAnalysis = {
      url,
      domain,
      title,
      timestamp: Date.now(),
      isShoppingSite: detectShoppingSite(domain, pageText),
      isCheckoutPage: detectCheckoutPage(url, pageText),
      isProductPage: detectProductPage(pageText),
      prices: extractPrices(pageText),
      cartItems: detectCartItems(),
      urgencyTactics: detectUrgencyTactics(pageText),
      riskLevel: 'low'
    };

    // Calculate risk level
    pageAnalysis.riskLevel = calculateRiskLevel(pageAnalysis);

    // Update session data
    sessionData.pagesVisited++;
    if (pageAnalysis.isShoppingSite) {
      sessionData.shoppingSitesVisited++;
    }
    if (pageAnalysis.prices.length > 0) {
      sessionData.pricesViewed.push(...pageAnalysis.prices);
    }

    // Show intervention if needed
    if (shouldIntervene(pageAnalysis)) {
      showIntervention(pageAnalysis);
    }

    return pageAnalysis;
  }

  // Detect if on shopping site
  function detectShoppingSite(domain, pageText) {
    if (SHOPPING_PATTERNS.domains.some(d => domain.includes(d))) {
      return true;
    }
    const shoppingIndicators = ['add to cart', 'buy now', 'shopping cart', 'checkout', 'price'];
    const matches = shoppingIndicators.filter(ind => pageText.toLowerCase().includes(ind));
    return matches.length >= 2;
  }

  // Detect checkout page
  function detectCheckoutPage(url, pageText) {
    const urlLower = url.toLowerCase();
    const textLower = pageText.toLowerCase();
    return SHOPPING_PATTERNS.checkoutKeywords.some(kw =>
      urlLower.includes(kw) || textLower.includes('complete your order') ||
      textLower.includes('payment method') || textLower.includes('billing address')
    );
  }

  // Detect product page
  function detectProductPage(pageText) {
    const indicators = ['add to cart', 'add to bag', 'buy now', 'in stock', 'out of stock', 'quantity'];
    const textLower = pageText.toLowerCase();
    return indicators.filter(ind => textLower.includes(ind)).length >= 2;
  }

  // Extract prices from page
  function extractPrices(text) {
    const matches = text.match(SHOPPING_PATTERNS.pricePattern) || [];
    return matches
      .map(p => parseFloat(p.replace(/[$,]/g, '')))
      .filter(p => p > 0 && p < SHOPPING_PATTERNS.maxValidPrice)
      .slice(0, 20);
  }

  // Detect cart items
  function detectCartItems() {
    const cartSelectors = [
      '[class*="cart-item"]', '[class*="cart_item"]', '[class*="basket-item"]',
      '[data-testid*="cart"]', '[id*="cart-item"]'
    ];
    let count = 0;
    cartSelectors.forEach(sel => {
      count += document.querySelectorAll(sel).length;
    });
    return count;
  }

  // Detect urgency tactics (dark patterns)
  function detectUrgencyTactics(pageText) {
    const tactics = [];
    const textLower = pageText.toLowerCase();

    URGENCY_TACTICS.forEach(({ phrase, type }) => {
      const regex = new RegExp(phrase, 'i');
      if (regex.test(textLower)) {
        tactics.push({ phrase, type });
      }
    });

    return tactics;
  }

  // Calculate risk level
  function calculateRiskLevel(analysis) {
    let score = 0;

    if (analysis.isShoppingSite) score += RISK_WEIGHTS.isShoppingSite;
    if (analysis.isCheckoutPage) score += RISK_WEIGHTS.isCheckoutPage;
    if (analysis.isProductPage) score += RISK_WEIGHTS.isProductPage;
    if (analysis.prices.some(p => p > 100)) score += RISK_WEIGHTS.highPriceItem;
    if (analysis.urgencyTactics.length > 0) score += analysis.urgencyTactics.length * RISK_WEIGHTS.urgencyTactic;
    if (analysis.cartItems > 0) score += RISK_WEIGHTS.hasCartItems;

    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) score += RISK_WEIGHTS.lateNightShopping;
    if (new Date().getDay() === 0 || new Date().getDay() === 6) score += RISK_WEIGHTS.weekendShopping;

    if (score >= RISK_THRESHOLDS.critical) return 'critical';
    if (score >= RISK_THRESHOLDS.high) return 'high';
    if (score >= RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  // Determine if intervention needed
  function shouldIntervene(analysis) {
    return analysis.riskLevel === 'critical' ||
           (analysis.riskLevel === 'high' && analysis.isCheckoutPage) ||
           analysis.urgencyTactics.length >= 3;
  }

  // Helper to create elements safely
  function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  // Show intervention overlay using safe DOM methods
  function showIntervention(analysis) {
    if (overlayVisible) return;

    const overlay = createElement('div');
    overlay.id = 'subguard-overlay';

    const modal = createElement('div', 'subguard-modal');

    // Header
    const header = createElement('div', 'subguard-header');
    const logo = createElement('div', 'subguard-logo');
    const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    logoSvg.setAttribute('width', '32');
    logoSvg.setAttribute('height', '32');
    logoSvg.setAttribute('viewBox', '0 0 32 32');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '16');
    circle.setAttribute('cy', '16');
    circle.setAttribute('r', '14');
    circle.setAttribute('stroke', '#6366f1');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('fill', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M16 8v8l6 3');
    path.setAttribute('stroke', '#6366f1');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    logoSvg.appendChild(circle);
    logoSvg.appendChild(path);
    logo.appendChild(logoSvg);
    logo.appendChild(createElement('span', null, 'SubGuard AI'));

    const closeBtn = createElement('button', 'subguard-close', '\u00D7');
    closeBtn.id = 'subguard-close';
    header.appendChild(logo);
    header.appendChild(closeBtn);

    // Content
    const content = createElement('div', 'subguard-content');

    // Alert section
    const alert = createElement('div', `subguard-alert ${analysis.riskLevel}`);
    const alertIcon = createElement('div', 'alert-icon', getRiskEmoji(analysis.riskLevel));
    const alertText = createElement('div', 'alert-text');
    alertText.appendChild(createElement('strong', null, getRiskTitle(analysis.riskLevel)));
    alertText.appendChild(createElement('p', null, getRiskMessage(analysis)));
    alert.appendChild(alertIcon);
    alert.appendChild(alertText);
    content.appendChild(alert);

    // Tactics section
    if (analysis.urgencyTactics.length > 0) {
      const tactics = createElement('div', 'subguard-tactics');
      tactics.appendChild(createElement('h4', null, 'Manipulation Tactics Detected'));
      const tacticsList = createElement('ul');
      analysis.urgencyTactics.forEach(t => {
        const li = createElement('li');
        li.appendChild(createElement('span', 'tactic-type', t.type));
        li.appendChild(document.createTextNode(` "${t.phrase}"`));
        tacticsList.appendChild(li);
      });
      tactics.appendChild(tacticsList);
      content.appendChild(tactics);
    }

    // Prices section
    if (analysis.prices.length > 0) {
      const prices = createElement('div', 'subguard-prices');
      prices.appendChild(createElement('h4', null, 'Prices on This Page'));
      const priceSummary = createElement('div', 'price-summary');
      const highest = createElement('span');
      highest.textContent = `Highest: $${Math.max(...analysis.prices).toFixed(2)}`;
      const total = createElement('span');
      total.textContent = `Total viewed: $${analysis.prices.reduce((a, b) => a + b, 0).toFixed(2)}`;
      priceSummary.appendChild(highest);
      priceSummary.appendChild(total);
      prices.appendChild(priceSummary);
      content.appendChild(prices);
    }

    // Questions section
    const questions = createElement('div', 'subguard-questions');
    questions.appendChild(createElement('h4', null, 'Ask Yourself'));
    const questionsList = createElement('ul');
    const questionTexts = [
      'Did I plan to buy this before visiting?',
      'Can I wait 24 hours before purchasing?',
      'Is this a need or a want?',
      'How will I feel about this purchase next week?'
    ];
    questionTexts.forEach(q => {
      questionsList.appendChild(createElement('li', null, q));
    });
    questions.appendChild(questionsList);
    content.appendChild(questions);

    // Actions
    const actions = createElement('div', 'subguard-actions');
    const pauseBtn = createElement('button', 'subguard-btn primary', 'Pause & Reflect (30s)');
    pauseBtn.id = 'subguard-pause';
    const continueBtn = createElement('button', 'subguard-btn secondary', 'Continue Shopping');
    continueBtn.id = 'subguard-continue';
    const leaveBtn = createElement('button', 'subguard-btn danger', 'Leave Site');
    leaveBtn.id = 'subguard-leave';
    actions.appendChild(pauseBtn);
    actions.appendChild(continueBtn);
    actions.appendChild(leaveBtn);
    content.appendChild(actions);

    // Stats
    const stats = createElement('div', 'subguard-stats');
    stats.appendChild(createElement('span', null, `Session: ${Math.floor((Date.now() - sessionData.startTime) / 60000)} min`));
    stats.appendChild(createElement('span', null, `Shopping sites: ${sessionData.shoppingSitesVisited}`));
    content.appendChild(stats);

    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlayVisible = true;

    // Event listeners
    closeBtn.addEventListener('click', hideOverlay);
    continueBtn.addEventListener('click', hideOverlay);
    pauseBtn.addEventListener('click', startPauseTimer);
    leaveBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'LEAVE_SITE' });
      window.location.href = 'https://www.google.com';
    });
  }

  function getRiskEmoji(level) {
    const emojis = { critical: '\u26A0\uFE0F', high: '\u26A0\uFE0F', medium: '\uD83D\uDCA1', low: '\u2705' };
    return emojis[level] || emojis.medium;
  }

  function getRiskTitle(level) {
    const titles = {
      critical: 'High Impulse Risk Detected',
      high: 'Elevated Spending Risk',
      medium: 'Shopping Alert',
      low: 'Low Risk'
    };
    return titles[level] || titles.medium;
  }

  function getRiskMessage(analysis) {
    if (analysis.isCheckoutPage) {
      return "You're about to make a purchase. Take a moment to ensure this aligns with your financial goals.";
    }
    if (analysis.urgencyTactics.length > 0) {
      return "This page is using psychological tactics to encourage quick purchasing decisions.";
    }
    if (analysis.riskLevel === 'critical') {
      return "Multiple risk factors detected. Consider whether this purchase is planned and necessary.";
    }
    return "SubGuard is monitoring your browsing to help you make mindful spending decisions.";
  }

  function hideOverlay() {
    const overlay = document.getElementById('subguard-overlay');
    if (overlay) {
      overlay.remove();
      overlayVisible = false;
    }
  }

  function startPauseTimer() {
    const btn = document.getElementById('subguard-pause');
    let seconds = CONFIG.UI.PAUSE_DURATION;
    btn.disabled = true;

    const interval = setInterval(() => {
      seconds--;
      btn.textContent = `Reflecting... (${seconds}s)`;
      if (seconds <= 0) {
        clearInterval(interval);
        btn.textContent = 'Reflection Complete';
        btn.disabled = false;
      }
    }, 1000);
  }

  // Setup mutation observer for dynamic content
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      const significantChange = mutations.some(m =>
        m.addedNodes.length > 5 ||
        m.target.className?.includes?.('cart') ||
        m.target.className?.includes?.('checkout')
      );
      if (significantChange) {
        analyzePage();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Track elements we've already approved (more reliable than dataset)
  const approvedClicks = new WeakSet();

  // Setup event listeners
  function setupEventListeners() {
    // Intercept checkout button clicks BEFORE they happen
    document.addEventListener('click', async (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="submit"]') || e.target;

      // Skip if we already allowed this click (check FIRST before anything else)
      if (approvedClicks.has(target) || approvedClicks.has(e.target) ||
          target.dataset?.subguardAllowed === 'true' || e.target.dataset?.subguardAllowed === 'true') {
        console.log('[SubGuard] Click already allowed, proceeding...');
        approvedClicks.delete(target);
        approvedClicks.delete(e.target);
        delete target.dataset.subguardAllowed;
        return; // Let the click through
      }

      const text = (target.textContent || '').toLowerCase();
      // Handle className being SVGAnimatedString or regular string
      const rawClassName = target.className;
      const className = (typeof rawClassName === 'string' ? rawClassName : rawClassName?.baseVal || '').toLowerCase();
      const id = (target.id || '').toLowerCase();
      const href = (target.href || '').toLowerCase();

      // Detect checkout/proceed buttons using CHECKOUT_BUTTON_PATTERNS
      const isCheckoutButton =
        CHECKOUT_BUTTON_PATTERNS.textPatterns.some(p => text.includes(p)) ||
        CHECKOUT_BUTTON_PATTERNS.classPatterns.some(p => className.includes(p)) ||
        CHECKOUT_BUTTON_PATTERNS.idPatterns.some(p => id.includes(p)) ||
        CHECKOUT_BUTTON_PATTERNS.hrefPatterns.some(p => href.includes(p)) ||
        target.getAttribute('data-action')?.includes('checkout') ||
        target.getAttribute('name')?.includes('checkout');

      if (isCheckoutButton) {
        console.log('[SubGuard] CHECKOUT BUTTON DETECTED! Text:', text.slice(0, 50));

        // BLOCK IMMEDIATELY - prevent the click from going through
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Show immediate visual feedback that SubGuard is checking
        showQuickWarning('SubGuard is checking this purchase...');

        console.log('[SubGuard] Click blocked, checking with API...');

        // Check with autonomy API via background script (avoids CORS)
        try {
          // Get price from page, or use a default high value to trigger block
          let currentPrice = pageAnalysis?.prices?.length > 0 ? Math.max(...pageAnalysis.prices) : 0;

          // If no price detected but we're on a checkout, assume it's above threshold
          if (currentPrice === 0) {
            currentPrice = 9999; // Force block check when price unknown
          }

          console.log('[SubGuard] Sending autonomy check to background...');

          // Use chrome.runtime.sendMessage to proxy through background script
          const decision = await chrome.runtime.sendMessage({
            type: 'API_AUTONOMY_CHECK',
            data: {
              action: 'checkout',
              context: {
                totalSpentToday: sessionData.pricesViewed.reduce((a, b) => a + b, 0),
                timeOnShoppingSites: sessionData.timeOnShoppingSites,
                currentPrice: currentPrice,
                riskLevel: pageAnalysis?.riskLevel || 'medium'
              }
            }
          });

          console.log('[SubGuard] API decision:', decision);

          if (decision && !decision.allow) {
            // Show blocking overlay
            console.log('[SubGuard] BLOCKING checkout:', decision.reason);

            // Show immediate blocking notification
            showBlockNotification(decision.message || 'SubGuard blocked this checkout to protect your financial goals.');

            // Also try to show the full overlay
            try {
              handleAutonomyDecision(decision);
            } catch (overlayError) {
              console.error('[SubGuard] Overlay error:', overlayError);
            }

            // Report blocked checkout
            try {
              chrome.runtime.sendMessage({
                type: 'CHECKOUT_BLOCKED',
                data: { url: window.location.href, reason: decision.reason, price: currentPrice }
              });
            } catch(err) {}

            return false;
          } else {
            // API says OK - let user proceed by simulating click on original target
            console.log('[SubGuard] Checkout ALLOWED, proceeding...');
            showQuickWarning('SubGuard approved - proceeding with checkout');

            // Navigate manually since we blocked the original click
            if (target.href) {
              window.location.href = target.href;
            } else if (target.form) {
              target.form.submit();
            } else {
              // Mark as approved and re-click
              approvedClicks.add(target);
              approvedClicks.add(e.target);
              target.dataset.subguardAllowed = 'true';

              // Use setTimeout to ensure our handler processes the approval first
              setTimeout(() => {
                target.click();
              }, 10);
            }
          }
        } catch (error) {
          console.log('[SubGuard] Autonomy check failed:', error);
          // On error, allow through
          if (target.href) {
            window.location.href = target.href;
          } else if (target.form) {
            target.form.submit();
          } else {
            approvedClicks.add(target);
            target.dataset.subguardAllowed = 'true';
            setTimeout(() => target.click(), 10);
          }
        }

        return false;
      }

      // Track add to cart clicks
      if (text.includes('add to cart') || text.includes('add to bag') ||
          className.includes('add-to-cart')) {
        sessionData.cartInteractions++;
        chrome.runtime.sendMessage({
          type: 'CART_INTERACTION',
          data: { url: window.location.href, timestamp: Date.now(), buttonText: text.slice(0, 50) }
        });
        showQuickWarning('Item added to cart - SubGuard is tracking');
      }
    }, true);

    document.addEventListener('submit', async (e) => {
      const form = e.target;
      if (form.action?.includes('checkout') || form.action?.includes('payment')) {
        // Also check form submissions
        try {
          const currentPrice = pageAnalysis?.prices?.length > 0 ? Math.max(...pageAnalysis.prices) : 0;

          const response = await fetch(`${CONFIG.API_URL}/autonomy/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'checkout',
              context: {
                totalSpentToday: sessionData.pricesViewed.reduce((a, b) => a + b, 0),
                timeOnShoppingSites: sessionData.timeOnShoppingSites,
                currentPrice: currentPrice,
                riskLevel: pageAnalysis?.riskLevel || 'medium'
              }
            })
          });

          if (response.ok) {
            const decision = await response.json();
            if (!decision.allow) {
              e.preventDefault();
              e.stopPropagation();
              handleAutonomyDecision(decision);
              return false;
            }
          }
        } catch (error) {
          console.log('[SubGuard] Form autonomy check failed');
        }

        chrome.runtime.sendMessage({
          type: 'CHECKOUT_ATTEMPT',
          data: { url: window.location.href, timestamp: Date.now() }
        });
      }
    }, true);
  }

  // Show quick warning toast
  function showQuickWarning(message) {
    const toast = createElement('div', 'subguard-toast');
    toast.appendChild(createElement('span', 'toast-icon', '\uD83D\uDEE1\uFE0F'));
    toast.appendChild(createElement('span', 'toast-message', message));
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.UI.TOAST_DURATION);
  }

  // Show prominent block notification (more visible than toast)
  function showBlockNotification(message) {
    // Remove any existing block notification
    const existing = document.getElementById('subguard-block-notification');
    if (existing) existing.remove();

    const notification = createElement('div');
    notification.id = 'subguard-block-notification';
    notification.style.cssText = [
      'position: fixed',
      'top: 20px',
      'left: 50%',
      'transform: translateX(-50%)',
      'background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      'color: white',
      'padding: 16px 24px',
      'border-radius: 12px',
      'box-shadow: 0 10px 40px rgba(220, 38, 38, 0.5)',
      'z-index: 2147483647',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'font-size: 15px',
      'font-weight: 600',
      'display: flex',
      'align-items: center',
      'gap: 12px',
      'max-width: 90vw',
      'animation: slideDown 0.3s ease-out'
    ].join(';');

    // Add animation keyframes if not already added
    if (!document.getElementById('subguard-block-styles')) {
      const style = document.createElement('style');
      style.id = 'subguard-block-styles';
      style.textContent = '@keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }';
      document.head.appendChild(style);
    }

    const icon = createElement('span');
    icon.textContent = '\uD83D\uDEAB'; // 🚫
    icon.style.fontSize = '24px';

    const textContainer = createElement('div');
    const title = createElement('div');
    title.textContent = 'Checkout Blocked by SubGuard';
    title.style.marginBottom = '4px';

    const desc = createElement('div');
    desc.textContent = message;
    desc.style.cssText = 'font-weight: 400; font-size: 13px; opacity: 0.9;';

    textContainer.appendChild(title);
    textContainer.appendChild(desc);

    const closeBtn = createElement('button');
    closeBtn.textContent = '\u00D7';
    closeBtn.style.cssText = 'background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 18px; margin-left: 8px;';
    closeBtn.addEventListener('click', () => notification.remove());

    notification.appendChild(icon);
    notification.appendChild(textContainer);
    notification.appendChild(closeBtn);

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  // Report to background script
  function reportToBackground() {
    chrome.runtime.sendMessage({
      type: 'PAGE_ANALYSIS',
      data: pageAnalysis,
      session: sessionData
    });

    setInterval(() => {
      try {
        if (!chrome.runtime?.id) return; // Extension context invalidated
        if (pageAnalysis?.isShoppingSite && sessionData) {
          sessionData.timeOnShoppingSites += CONFIG.POLLING.SESSION_UPDATE / 1000;
        }
        chrome.runtime.sendMessage({
          type: 'SESSION_UPDATE',
          session: sessionData
        });
      } catch (e) {
        // Extension was reloaded, ignore
      }
    }, CONFIG.POLLING.SESSION_UPDATE);
  }

  // ==================== CARD MASKING AUTOFILL ====================

  // Detect payment form fields on the page
  function detectPaymentFields() {
    detectedPaymentFields = [];
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input:not([type])');

    inputs.forEach(input => {
      // Skip if already processed or hidden
      if (input.dataset.subguardProcessed || !isElementVisible(input)) return;

      const fieldType = identifyFieldType(input);
      if (fieldType) {
        detectedPaymentFields.push({ input, fieldType });
        input.dataset.subguardProcessed = 'true';
      }
    });

    console.log(`[SubGuard] Detected ${detectedPaymentFields.length} payment fields`);
    return detectedPaymentFields;
  }

  // Check if element is visible
  function isElementVisible(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
  }

  // Identify the type of payment field
  function identifyFieldType(input) {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const autocomplete = (input.autocomplete || '').toLowerCase();

    // Get associated label text
    const labelText = getAssociatedLabelText(input).toLowerCase();

    // Check each field type
    for (const [fieldType, patterns] of Object.entries(PAYMENT_FIELD_PATTERNS)) {
      // Check name patterns
      if (patterns.namePatterns.some(p => name.includes(p))) return fieldType;

      // Check id patterns
      if (patterns.idPatterns.some(p => id.includes(p))) return fieldType;

      // Check autocomplete values
      if (patterns.autocompleteValues.some(v => autocomplete.includes(v))) return fieldType;

      // Check placeholder patterns
      if (patterns.placeholderPatterns.some(p => placeholder.includes(p))) return fieldType;

      // Check label patterns
      if (patterns.labelPatterns.some(p => labelText.includes(p))) return fieldType;
    }

    return null;
  }

  // Get text from associated label element
  function getAssociatedLabelText(input) {
    // Try explicit label via for attribute
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent || '';
    }

    // Try parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    // Try aria-labelledby
    if (input.getAttribute('aria-labelledby')) {
      const labelEl = document.getElementById(input.getAttribute('aria-labelledby'));
      if (labelEl) return labelEl.textContent || '';
    }

    // Try aria-label
    return input.getAttribute('aria-label') || '';
  }

  // Inject autofill icons next to payment fields
  function injectAutofillIcons() {
    if (autofillIconsInjected) return;

    const fields = detectPaymentFields();
    if (fields.length === 0) return;

    console.log('[SubGuard] Injecting autofill icons for', fields.length, 'fields');

    fields.forEach(({ input, fieldType }) => {
      // Skip if icon already exists
      if (input.parentElement?.querySelector('.subguard-autofill-icon')) return;

      const icon = createAutofillIcon(fieldType, input);
      positionAutofillIcon(icon, input);
    });

    autofillIconsInjected = true;
  }

  // Create SVG shield icon using safe DOM methods
  function createShieldSvg(size, fillColor, strokeColor) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const shieldPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shieldPath.setAttribute('d', 'M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z');
    shieldPath.setAttribute('fill', fillColor);
    shieldPath.setAttribute('stroke', strokeColor);
    shieldPath.setAttribute('stroke-width', '1.5');

    const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    checkPath.setAttribute('d', 'M9 12L11 14L15 10');
    checkPath.setAttribute('stroke', 'white');
    checkPath.setAttribute('stroke-width', '2');
    checkPath.setAttribute('stroke-linecap', 'round');
    checkPath.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(shieldPath);
    svg.appendChild(checkPath);
    return svg;
  }

  // Create success checkmark SVG
  function createSuccessSvg(size) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', '#22c55e');

    const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    check.setAttribute('d', 'M8 12L11 15L16 9');
    check.setAttribute('stroke', 'white');
    check.setAttribute('stroke-width', '2');
    check.setAttribute('stroke-linecap', 'round');
    check.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(circle);
    svg.appendChild(check);
    return svg;
  }

  // Create error X SVG
  function createErrorSvg(size) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', '#ef4444');

    const xPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    xPath.setAttribute('d', 'M15 9L9 15M9 9L15 15');
    xPath.setAttribute('stroke', 'white');
    xPath.setAttribute('stroke-width', '2');
    xPath.setAttribute('stroke-linecap', 'round');

    svg.appendChild(circle);
    svg.appendChild(xPath);
    return svg;
  }

  // Create the autofill icon element
  function createAutofillIcon(fieldType, inputElement) {
    const icon = document.createElement('div');
    icon.className = 'subguard-autofill-icon';
    icon.dataset.fieldType = fieldType;
    icon.title = 'Click to autofill with SubGuard masked card';

    // Create SVG using safe DOM methods
    const svg = createShieldSvg(AUTOFILL_CONFIG.ICON_SIZE, '#6366f1', '#4f46e5');
    icon.appendChild(svg);

    // Inline styles for the icon
    icon.style.cssText = [
      'position: absolute',
      'width: ' + AUTOFILL_CONFIG.ICON_SIZE + 'px',
      'height: ' + AUTOFILL_CONFIG.ICON_SIZE + 'px',
      'cursor: pointer',
      'z-index: 2147483646',
      'opacity: 0.8',
      'transition: opacity 0.2s, transform 0.2s',
      'display: flex',
      'align-items: center',
      'justify-content: center'
    ].join(';');

    // Hover effects
    icon.addEventListener('mouseenter', () => {
      icon.style.opacity = '1';
      icon.style.transform = 'scale(1.1)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.opacity = '0.8';
      icon.style.transform = 'scale(1)';
    });

    // Click handler
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleAutofillIconClick(fieldType, inputElement, icon);
    });

    return icon;
  }

  // Position the autofill icon relative to input field
  function positionAutofillIcon(icon, input) {
    const inputStyle = window.getComputedStyle(input);

    // Position icon at the right edge of the input
    const rightOffset = AUTOFILL_CONFIG.ICON_OFFSET;
    const topOffset = (input.offsetHeight - AUTOFILL_CONFIG.ICON_SIZE) / 2;

    icon.style.right = rightOffset + 'px';
    icon.style.top = topOffset + 'px';

    // Insert icon as sibling after the input
    if (input.parentElement) {
      // Make parent relative if not already positioned
      const parentStyle = window.getComputedStyle(input.parentElement);
      if (parentStyle.position === 'static') {
        input.parentElement.style.position = 'relative';
      }
      input.parentElement.appendChild(icon);
    }

    // Adjust input padding to make room for icon
    const currentPadding = parseInt(inputStyle.paddingRight) || 0;
    const neededPadding = AUTOFILL_CONFIG.ICON_SIZE + AUTOFILL_CONFIG.ICON_OFFSET * 2;
    input.style.paddingRight = Math.max(currentPadding, neededPadding) + 'px';
  }

  // Handle click on autofill icon
  async function handleAutofillIconClick(fieldType, inputElement, iconElement) {
    console.log('[SubGuard] Autofill clicked for field type:', fieldType);

    // Show loading state
    iconElement.style.opacity = '0.5';
    iconElement.style.pointerEvents = 'none';

    try {
      // Request card from background script
      const domain = window.location.hostname;
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MERCHANT_CARD',
        data: { domain }
      });

      if (response && response.card) {
        // Fill the field with the appropriate value
        fillPaymentField(inputElement, fieldType, response.card);

        // Show success feedback
        showAutofillSuccess(iconElement);

        // Report the autofill event
        chrome.runtime.sendMessage({
          type: 'CARD_FIELD_FILLED',
          data: {
            domain,
            fieldType,
            timestamp: Date.now()
          }
        });
      } else {
        console.error('[SubGuard] Failed to get merchant card:', response?.error);
        showAutofillError(iconElement, response?.error || 'Failed to get card');
      }
    } catch (error) {
      console.error('[SubGuard] Autofill error:', error);
      showAutofillError(iconElement, 'Autofill failed');
    }

    // Reset icon state
    setTimeout(() => {
      iconElement.style.opacity = '0.8';
      iconElement.style.pointerEvents = 'auto';
    }, 1000);
  }

  // Fill the payment field with card data
  function fillPaymentField(input, fieldType, card) {
    let value = '';

    switch (fieldType) {
      case 'cardNumber':
        value = card.number;
        break;
      case 'expiry':
        value = card.expiry;
        break;
      case 'cvv':
        value = card.cvv;
        break;
      case 'cardholderName':
        value = card.cardholderName;
        break;
    }

    // Set value and trigger events to notify the page
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Some sites use React/Vue and need additional events
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    console.log('[SubGuard] Filled', fieldType, 'field');
  }

  // Show success feedback on the icon
  function showAutofillSuccess(icon) {
    // Clear existing content
    while (icon.firstChild) {
      icon.removeChild(icon.firstChild);
    }
    icon.appendChild(createSuccessSvg(AUTOFILL_CONFIG.ICON_SIZE));

    setTimeout(() => {
      while (icon.firstChild) {
        icon.removeChild(icon.firstChild);
      }
      icon.appendChild(createShieldSvg(AUTOFILL_CONFIG.ICON_SIZE, '#6366f1', '#4f46e5'));
    }, 1500);
  }

  // Show error feedback on the icon
  function showAutofillError(icon, message) {
    while (icon.firstChild) {
      icon.removeChild(icon.firstChild);
    }
    icon.appendChild(createErrorSvg(AUTOFILL_CONFIG.ICON_SIZE));
    showQuickWarning(message);

    setTimeout(() => {
      while (icon.firstChild) {
        icon.removeChild(icon.firstChild);
      }
      icon.appendChild(createShieldSvg(AUTOFILL_CONFIG.ICON_SIZE, '#6366f1', '#4f46e5'));
    }, 2000);
  }

  // Setup observer for dynamically loaded payment forms
  function setupPaymentFieldObserver() {
    const observer = new MutationObserver((mutations) => {
      // Check if new inputs were added
      const hasNewInputs = mutations.some(m =>
        Array.from(m.addedNodes).some(node =>
          node.nodeType === 1 && (
            node.tagName === 'INPUT' ||
            node.querySelector?.('input')
          )
        )
      );

      if (hasNewInputs) {
        // Reset flag and re-detect fields
        autofillIconsInjected = false;
        setTimeout(() => injectAutofillIcons(), 500);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_PAGE_ANALYSIS') {
      sendResponse(pageAnalysis);
    } else if (message.type === 'SHOW_INTERVENTION') {
      showIntervention(pageAnalysis);
    } else if (message.type === 'GET_SESSION') {
      sendResponse(sessionData);
    }
    return true;
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
