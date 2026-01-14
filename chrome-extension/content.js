// SubGuard AI Content Script
// Analyzes page content and detects shopping behavior

(function() {
  'use strict';

  // Shopping site patterns
  const SHOPPING_PATTERNS = {
    domains: [
      'amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com',
      'etsy.com', 'shopify.com', 'aliexpress.com', 'wish.com', 'wayfair.com',
      'nordstrom.com', 'macys.com', 'zappos.com', 'nike.com', 'adidas.com',
      'costco.com', 'sephora.com', 'ulta.com', 'homedepot.com', 'lowes.com'
    ],
    checkoutKeywords: [
      'checkout', 'cart', 'basket', 'bag', 'payment', 'billing',
      'shipping', 'order', 'purchase', 'buy now', 'add to cart'
    ],
    pricePatterns: /\$[\d,]+\.?\d*/g
  };

  // State
  let pageAnalysis = null;
  let overlayVisible = false;
  let autonomySettings = null;
  let sessionData = {
    startTime: Date.now(),
    pagesVisited: 0,
    shoppingSitesVisited: 0,
    pricesViewed: [],
    cartInteractions: 0,
    timeOnShoppingSites: 0
  };

  const SUBGUARD_API = 'http://localhost:3001/api';

  // Initialize
  function init() {
    console.log('[SubGuard] Content script initialized');
    fetchAutonomySettings();
    analyzePage();
    setupMutationObserver();
    setupEventListeners();
    reportToBackground();
    checkAutonomyEnforcement();
  }

  // Fetch autonomy settings from API
  async function fetchAutonomySettings() {
    try {
      const response = await fetch(`${SUBGUARD_API}/autonomy/settings`);
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
      const response = await fetch(`${SUBGUARD_API}/autonomy/check`, {
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
    console.log('[SubGuard] Autonomy decision:', decision);

    if (decision.action === 'redirect_away') {
      showRedirectOverlay(decision);
    } else if (decision.action === 'block_checkout') {
      showBlockOverlay(decision);
    } else if (decision.action === 'require_cooloff') {
      showCooloffOverlay(decision);
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
    let seconds = 5;
    const countdownInterval = setInterval(() => {
      seconds--;
      timer.textContent = seconds.toString();
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        window.location.href = 'http://localhost:5173/?redirected=true&reason=' + encodeURIComponent(decision.reason);
      }
    }, 1000);

    acceptBtn.addEventListener('click', () => {
      clearInterval(countdownInterval);
      window.location.href = 'http://localhost:5173/?redirected=true&reason=' + encodeURIComponent(decision.reason);
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

    const modal = createElement('div', 'subguard-autonomy-modal');

    const header = createElement('div', 'autonomy-header');
    header.appendChild(createElement('div', 'autonomy-icon', '\uD83D\uDEAB'));
    header.appendChild(createElement('h2', null, 'Checkout Blocked'));
    modal.appendChild(header);

    const message = createElement('div', 'autonomy-message');
    message.appendChild(createElement('p', 'autonomy-reason', decision.message));
    message.appendChild(createElement('p', null, 'This is helping you stick to your financial goals.'));
    modal.appendChild(message);

    const actions = createElement('div', 'autonomy-actions');
    const backBtn = createElement('button', 'autonomy-btn accept', 'Go Back to Shopping');
    const dashboardBtn = createElement('button', 'autonomy-btn secondary', 'View Dashboard');
    actions.appendChild(backBtn);
    actions.appendChild(dashboardBtn);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlayVisible = true;

    backBtn.addEventListener('click', () => {
      overlay.remove();
      overlayVisible = false;
      window.history.back();
    });

    dashboardBtn.addEventListener('click', () => {
      window.location.href = 'http://localhost:5173';
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
      window.history.back();
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
    const matches = text.match(SHOPPING_PATTERNS.pricePatterns) || [];
    return matches
      .map(p => parseFloat(p.replace(/[$,]/g, '')))
      .filter(p => p > 0 && p < 100000)
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

    const urgencyPhrases = [
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
      { phrase: 'members only', type: 'exclusivity' }
    ];

    urgencyPhrases.forEach(({ phrase, type }) => {
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

    if (analysis.isShoppingSite) score += 20;
    if (analysis.isCheckoutPage) score += 40;
    if (analysis.isProductPage) score += 15;
    if (analysis.prices.some(p => p > 100)) score += 15;
    if (analysis.urgencyTactics.length > 0) score += analysis.urgencyTactics.length * 10;
    if (analysis.cartItems > 0) score += 20;

    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) score += 15;
    if (new Date().getDay() === 0 || new Date().getDay() === 6) score += 5;

    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
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
    let seconds = 30;
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

  // Setup event listeners
  function setupEventListeners() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent?.toLowerCase() || '';
      const className = target.className?.toLowerCase() || '';

      if (text.includes('add to cart') || text.includes('add to bag') ||
          text.includes('buy now') || className.includes('add-to-cart')) {
        sessionData.cartInteractions++;
        chrome.runtime.sendMessage({
          type: 'CART_INTERACTION',
          data: { url: window.location.href, timestamp: Date.now(), buttonText: text.slice(0, 50) }
        });
        showQuickWarning('Item added to cart - SubGuard is tracking');
      }
    }, true);

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.action?.includes('checkout') || form.action?.includes('payment')) {
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
    }, 3000);
  }

  // Report to background script
  function reportToBackground() {
    chrome.runtime.sendMessage({
      type: 'PAGE_ANALYSIS',
      data: pageAnalysis,
      session: sessionData
    });

    setInterval(() => {
      if (pageAnalysis?.isShoppingSite) {
        sessionData.timeOnShoppingSites += 5;
      }
      chrome.runtime.sendMessage({
        type: 'SESSION_UPDATE',
        session: sessionData
      });
    }, 5000);
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
