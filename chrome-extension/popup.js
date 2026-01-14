// SubGuard AI Popup Script

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadStats();
  await analyzeCurrentPage();
  setupEventListeners();
}

// Load aggregated stats from background
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });

    if (response) {
      const { dailyStats, settings } = response;

      // Update stats display
      document.getElementById('shopping-sites').textContent = dailyStats.shoppingSitesVisited || 0;
      document.getElementById('cart-interactions').textContent = dailyStats.cartInteractions || 0;
      document.getElementById('prevented').textContent = dailyStats.purchasesPrevented || 0;

      // Format time
      const minutes = Math.floor((dailyStats.totalTimeOnShoppingSites || 0) / 60);
      document.getElementById('time-shopping').textContent = `${minutes}m`;

      // Format potential spend
      const spend = dailyStats.totalPotentialSpend || 0;
      document.getElementById('potential-spend').textContent = `$${spend.toFixed(2)}`;

      // Update toggles
      document.getElementById('protection-toggle').checked = settings.enabled !== false;
      document.getElementById('sync-toggle').checked = settings.syncWithApp !== false;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Analyze current tab
async function analyzeCurrentPage() {
  const pageAnalysisEl = document.getElementById('page-analysis');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      pageAnalysisEl.textContent = 'Not available on this page';
      return;
    }

    // Request analysis from content script
    const analysis = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_ANALYSIS' });

    if (analysis) {
      renderPageAnalysis(analysis);
    } else {
      pageAnalysisEl.textContent = 'Unable to analyze this page';
    }
  } catch (error) {
    pageAnalysisEl.textContent = 'Page analysis unavailable';
  }
}

// Render page analysis results
function renderPageAnalysis(analysis) {
  const container = document.getElementById('page-analysis');
  container.textContent = ''; // Clear loading state

  const result = document.createElement('div');
  result.className = 'analysis-result';

  // Domain
  const domain = document.createElement('div');
  domain.className = 'analysis-domain';
  domain.textContent = analysis.domain;
  result.appendChild(domain);

  // Risk level
  const riskRow = document.createElement('div');
  riskRow.className = 'analysis-risk';

  const riskBadge = document.createElement('span');
  riskBadge.className = `risk-badge ${analysis.riskLevel}`;
  riskBadge.textContent = `${analysis.riskLevel} risk`;
  riskRow.appendChild(riskBadge);

  result.appendChild(riskRow);

  // Tags
  const tags = document.createElement('div');
  tags.className = 'analysis-tags';

  if (analysis.isShoppingSite) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'Shopping Site';
    tags.appendChild(tag);
  }

  if (analysis.isCheckoutPage) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'Checkout';
    tags.appendChild(tag);
  }

  if (analysis.isProductPage) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'Product Page';
    tags.appendChild(tag);
  }

  if (analysis.urgencyTactics && analysis.urgencyTactics.length > 0) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = `${analysis.urgencyTactics.length} Tactics`;
    tags.appendChild(tag);
  }

  if (analysis.prices && analysis.prices.length > 0) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = `${analysis.prices.length} Prices`;
    tags.appendChild(tag);
  }

  result.appendChild(tags);
  container.appendChild(result);
}

// Setup event listeners
function setupEventListeners() {
  // Trigger check button
  document.getElementById('trigger-check').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'SHOW_INTERVENTION' });
      window.close();
    }
  });

  // Open dashboard button
  document.getElementById('open-dashboard').addEventListener('click', () => {
    // Open the SubGuard app dashboard
    chrome.tabs.create({ url: 'http://localhost:5173' });
    window.close();
  });

  // Protection toggle
  document.getElementById('protection-toggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      data: { enabled }
    });
    updateStatusIndicator(enabled);
  });

  // Sync toggle
  document.getElementById('sync-toggle').addEventListener('change', async (e) => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      data: { syncWithApp: e.target.checked }
    });
  });
}

// Update status indicator
function updateStatusIndicator(active) {
  const indicator = document.getElementById('status-indicator');
  const dot = indicator.querySelector('.status-dot');
  const text = indicator.querySelector('.status-text');

  if (active) {
    dot.classList.remove('inactive');
    dot.classList.add('active');
    text.textContent = 'Active';
    text.style.color = '#22c55e';
    indicator.style.background = 'rgba(34, 197, 94, 0.15)';
  } else {
    dot.classList.remove('active');
    dot.classList.add('inactive');
    text.textContent = 'Paused';
    text.style.color = '#64748b';
    indicator.style.background = 'rgba(100, 116, 139, 0.15)';
  }
}
