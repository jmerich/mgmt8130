import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { PurchaseBlockingPage } from './features/purchase-blocking/PurchaseBlockingPage';
import { CardMaskingPage } from './features/card-masking/CardMaskingPage';
import { AutoNegotiationPage } from './features/auto-negotiation/AutoNegotiationPage';
import { NetflixMockPage } from './features/demo/NetflixMockPage';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
}

function AppContent() {
  const location = window.location;
  // Check if we are on a demo page
  const isDemo = location.pathname.includes('/demo/');

  return (
    <div className="app">
      {!isDemo && (
        <nav className="sidebar">
          <div className="logo">
            <h1>SubGuard</h1>
            <p>Subscription Protection</p>
          </div>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/purchase-blocking">
                Purchase Blocking
              </NavLink>
            </li>
            <li>
              <NavLink to="/card-masking">
                Card Masking
              </NavLink>
            </li>
            <li>
              <NavLink to="/auto-negotiation">
                Auto-Negotiation
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      <main className={isDemo ? "content full-width" : "content"}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/purchase-blocking" element={<PurchaseBlockingPage />} />
          <Route path="/card-masking" element={<CardMaskingPage />} />
          <Route path="/auto-negotiation" element={<AutoNegotiationPage />} />
          <Route path="/demo/netflix" element={<NetflixMockPage />} />
        </Routes>
      </main>
    </div>
  );
}

// Autonomy settings types
interface AutonomySettings {
  level: 'minimal' | 'moderate' | 'high' | 'full';
  dailySpendingLimit: number;
  maxShoppingTime: number; // minutes
  blockCheckoutAbove: number;
  autoRedirectOnRisk: boolean;
  enforceColingOff: boolean;
  coolingOffMinutes: number;
}

const DEFAULT_AUTONOMY: AutonomySettings = {
  level: 'moderate',
  dailySpendingLimit: 200,
  maxShoppingTime: 60,
  blockCheckoutAbove: 100,
  autoRedirectOnRisk: false,
  enforceColingOff: true,
  coolingOffMinutes: 5
};

const AUTONOMY_PRESETS: Record<string, Partial<AutonomySettings>> = {
  minimal: {
    autoRedirectOnRisk: false,
    enforceColingOff: false,
  },
  moderate: {
    autoRedirectOnRisk: false,
    enforceColingOff: true,
    coolingOffMinutes: 5
  },
  high: {
    autoRedirectOnRisk: true,
    enforceColingOff: true,
    coolingOffMinutes: 10
  },
  full: {
    autoRedirectOnRisk: true,
    enforceColingOff: true,
    coolingOffMinutes: 15
  }
};

function Dashboard() {
  const [extensionData, setExtensionData] = React.useState<any>(null);
  const [extensionConnected, setExtensionConnected] = React.useState(false);
  const [autonomySettings, setAutonomySettings] = React.useState<AutonomySettings>(DEFAULT_AUTONOMY);
  const [settingsSaved, setSettingsSaved] = React.useState(false);

  // Fetch extension data periodically
  React.useEffect(() => {
    const fetchExtensionData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/extension/data');
        if (response.ok) {
          const data = await response.json();
          setExtensionData(data);
          setExtensionConnected(data.lastSync !== null);
        }
      } catch (error) {
        setExtensionConnected(false);
      }
    };

    fetchExtensionData();
    const interval = setInterval(fetchExtensionData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch autonomy settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/autonomy/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setAutonomySettings(data.settings);
          }
        }
      } catch (error) {
        console.log('Using default autonomy settings');
      }
    };
    fetchSettings();
  }, []);

  // Save autonomy settings
  const saveAutonomySettings = async (newSettings: AutonomySettings) => {
    setAutonomySettings(newSettings);
    try {
      await fetch('http://localhost:3001/api/autonomy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings');
    }
  };

  // Handle autonomy level change
  const handleAutonomyLevelChange = (level: AutonomySettings['level']) => {
    const preset = AUTONOMY_PRESETS[level];
    const newSettings = { ...autonomySettings, ...preset, level };
    saveAutonomySettings(newSettings);
  };

  // Demo savings data
  const savingsData = {
    blockedPurchases: { count: 12, amount: 847.50 },
    trialsSaved: { count: 8, amount: 156.00 },
    negotiationSavings: { monthly: 47.50, yearly: 570.00 },
  };

  const totalSaved = savingsData.blockedPurchases.amount +
    savingsData.trialsSaved.amount +
    savingsData.negotiationSavings.yearly;

  // Extension stats
  const browserStats = extensionData?.dailyStats || {
    shoppingSitesVisited: 0,
    cartInteractions: 0,
    purchasesPrevented: 0,
    totalPotentialSpend: 0,
    totalTimeOnShoppingSites: 0
  };

  return (
    <div className="dashboard">
      <h2>Welcome to SubGuard</h2>
      <p>Your subscription management and purchase protection tool.</p>

      {/* Savings Overview */}
      <div className="savings-hero">
        <div className="savings-total">
          <span className="savings-label">Total Saved This Year</span>
          <span className="savings-amount">${totalSaved.toFixed(2)}</span>
        </div>
        <div className="savings-breakdown">
          <div className="savings-item">
            <span className="savings-icon">🛡️</span>
            <span className="savings-stat">${savingsData.blockedPurchases.amount}</span>
            <span className="savings-desc">{savingsData.blockedPurchases.count} purchases blocked</span>
          </div>
          <div className="savings-item">
            <span className="savings-icon">💳</span>
            <span className="savings-stat">${savingsData.trialsSaved.amount}</span>
            <span className="savings-desc">{savingsData.trialsSaved.count} trials cancelled</span>
          </div>
          <div className="savings-item">
            <span className="savings-icon">🤝</span>
            <span className="savings-stat">${savingsData.negotiationSavings.monthly}/mo</span>
            <span className="savings-desc">negotiated savings</span>
          </div>
        </div>
      </div>

      {/* Browser Extension Activity */}
      <div className="browser-activity-section">
        <div className="section-header">
          <h3>Browser Activity Monitor</h3>
          <div className={`extension-status ${extensionConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span>{extensionConnected ? 'Extension Connected' : 'Extension Not Connected'}</span>
          </div>
        </div>

        <div className="browser-stats-grid">
          <div className="browser-stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-value">{browserStats.shoppingSitesVisited}</div>
            <div className="stat-label">Shopping Sites Today</div>
          </div>
          <div className="browser-stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-value">{browserStats.cartInteractions}</div>
            <div className="stat-label">Cart Interactions</div>
          </div>
          <div className="browser-stat-card highlight">
            <div className="stat-icon">🚫</div>
            <div className="stat-value">{browserStats.purchasesPrevented}</div>
            <div className="stat-label">Purchases Prevented</div>
          </div>
          <div className="browser-stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${browserStats.totalPotentialSpend.toFixed(0)}</div>
            <div className="stat-label">Potential Spend</div>
          </div>
        </div>

        {extensionData?.pageAnalyses && extensionData.pageAnalyses.length > 0 && (
          <div className="recent-activity">
            <h4>Recent Shopping Activity</h4>
            <div className="activity-list">
              {extensionData.pageAnalyses.slice(0, 5).map((analysis: any, idx: number) => (
                <div key={idx} className={`activity-item risk-${analysis.riskLevel}`}>
                  <div className="activity-domain">{analysis.domain}</div>
                  <div className="activity-meta">
                    <span className={`risk-badge ${analysis.riskLevel}`}>{analysis.riskLevel}</span>
                    {analysis.prices?.length > 0 && (
                      <span className="price-tag">${Math.max(...analysis.prices).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!extensionConnected && (
          <div className="extension-prompt">
            <div className="prompt-icon">🔌</div>
            <div className="prompt-content">
              <h4>Install Browser Extension</h4>
              <p>Get real-time shopping protection by installing the SubGuard browser extension.</p>
              <ol className="install-steps">
                <li>Open Chrome and go to <code>chrome://extensions</code></li>
                <li>Enable "Developer mode" in the top right</li>
                <li>Click "Load unpacked" and select the <code>chrome-extension</code> folder</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* AI Autonomy Configuration */}
      <div className="autonomy-section">
        <div className="section-header">
          <h3>AI Autonomy Level</h3>
          {settingsSaved && <span className="saved-badge">Settings Saved</span>}
        </div>

        <div className="autonomy-levels">
          {(['minimal', 'moderate', 'high', 'full'] as const).map((level) => (
            <button
              key={level}
              className={`autonomy-level-btn ${autonomySettings.level === level ? 'active' : ''}`}
              onClick={() => handleAutonomyLevelChange(level)}
            >
              <div className="level-icon">
                {level === 'minimal' && '👁️'}
                {level === 'moderate' && '🛡️'}
                {level === 'high' && '🤖'}
                {level === 'full' && '🧠'}
              </div>
              <div className="level-name">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
              <div className="level-desc">
                {level === 'minimal' && 'Monitor only'}
                {level === 'moderate' && 'Gentle nudges'}
                {level === 'high' && 'Active intervention'}
                {level === 'full' && 'Full AI control'}
              </div>
            </button>
          ))}
        </div>

        <div className="autonomy-details">
          {autonomySettings.level === 'minimal' && (
            <div className="autonomy-description">
              <h4>Observer Mode</h4>
              <p>SubGuard will silently track your browsing and shopping behavior without any interventions. You'll see analytics in the dashboard but won't be interrupted.</p>
              <ul className="autonomy-features">
                <li><span className="feature-status off"></span>No automatic redirects</li>
                <li><span className="feature-status off"></span>No cooling-off periods</li>
                <li><span className="feature-status on"></span>Activity tracking only</li>
              </ul>
            </div>
          )}
          {autonomySettings.level === 'moderate' && (
            <div className="autonomy-description">
              <h4>Guided Protection</h4>
              <p>SubGuard will show helpful reminders and require brief pauses before purchases, but won't block or redirect you automatically.</p>
              <ul className="autonomy-features">
                <li><span className="feature-status off"></span>No automatic redirects</li>
                <li><span className="feature-status on"></span>5-minute cooling-off for large purchases</li>
                <li><span className="feature-status on"></span>Risk warnings and nudges</li>
              </ul>
            </div>
          )}
          {autonomySettings.level === 'high' && (
            <div className="autonomy-description">
              <h4>Active Guardian</h4>
              <p>SubGuard will actively intervene when it detects risky shopping behavior, including automatic redirects when spending limits are exceeded.</p>
              <ul className="autonomy-features">
                <li><span className="feature-status on"></span>Auto-redirect on high risk</li>
                <li><span className="feature-status on"></span>10-minute cooling-off enforced</li>
                <li><span className="feature-status on"></span>Checkout blocking above limits</li>
              </ul>
            </div>
          )}
          {autonomySettings.level === 'full' && (
            <div className="autonomy-description full-autonomy">
              <h4>Full AI Autonomy</h4>
              <p>SubGuard takes complete control of your shopping protection. The AI will automatically redirect you away from shopping sites when behavior doesn't align with your goals.</p>
              <ul className="autonomy-features">
                <li><span className="feature-status on"></span>Automatic redirects when over time/spend limits</li>
                <li><span className="feature-status on"></span>15-minute mandatory cooling-off</li>
                <li><span className="feature-status on"></span>AI decides when shopping session ends</li>
                <li><span className="feature-status on"></span>Blocks checkout if daily limit exceeded</li>
              </ul>
              <div className="full-autonomy-warning">
                <span className="warning-icon">⚠️</span>
                <span>In full autonomy mode, SubGuard may redirect you away from pages with an explanation of why this action was taken.</span>
              </div>
            </div>
          )}
        </div>

        <div className="autonomy-settings-grid">
          <div className="setting-card">
            <label>Daily Spending Limit</label>
            <div className="setting-input">
              <span className="input-prefix">$</span>
              <input
                type="number"
                value={autonomySettings.dailySpendingLimit}
                onChange={(e) => saveAutonomySettings({
                  ...autonomySettings,
                  dailySpendingLimit: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <span className="setting-hint">AI will warn/block purchases beyond this</span>
          </div>

          <div className="setting-card">
            <label>Max Shopping Time</label>
            <div className="setting-input">
              <input
                type="number"
                value={autonomySettings.maxShoppingTime}
                onChange={(e) => saveAutonomySettings({
                  ...autonomySettings,
                  maxShoppingTime: parseInt(e.target.value) || 0
                })}
              />
              <span className="input-suffix">min</span>
            </div>
            <span className="setting-hint">Daily shopping time before AI intervenes</span>
          </div>

          <div className="setting-card">
            <label>Block Checkout Above</label>
            <div className="setting-input">
              <span className="input-prefix">$</span>
              <input
                type="number"
                value={autonomySettings.blockCheckoutAbove}
                onChange={(e) => saveAutonomySettings({
                  ...autonomySettings,
                  blockCheckoutAbove: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <span className="setting-hint">Require cooling-off for purchases above</span>
          </div>

          <div className="setting-card">
            <label>Cooling-Off Period</label>
            <div className="setting-input">
              <input
                type="number"
                value={autonomySettings.coolingOffMinutes}
                onChange={(e) => saveAutonomySettings({
                  ...autonomySettings,
                  coolingOffMinutes: parseInt(e.target.value) || 0
                })}
              />
              <span className="input-suffix">min</span>
            </div>
            <span className="setting-hint">Wait time before allowing purchase</span>
          </div>
        </div>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Purchase Blocking</h3>
          <p>Set rules to block unwanted purchases automatically.</p>
          <NavLink to="/purchase-blocking" className="btn primary">
            Manage Rules
          </NavLink>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Card Masking</h3>
          <p>Generate virtual cards for trials and subscriptions.</p>
          <NavLink to="/card-masking" className="btn primary">
            Create Card
          </NavLink>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Auto-Negotiation</h3>
          <p>Let us negotiate better prices on your subscriptions.</p>
          <NavLink to="/auto-negotiation" className="btn primary">
            View Subscriptions
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default App;
