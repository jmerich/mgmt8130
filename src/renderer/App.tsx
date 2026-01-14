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

function Dashboard() {
  // Demo savings data
  const savingsData = {
    blockedPurchases: { count: 12, amount: 847.50 },
    trialsSaved: { count: 8, amount: 156.00 },
    negotiationSavings: { monthly: 47.50, yearly: 570.00 },
  };

  const totalSaved = savingsData.blockedPurchases.amount +
    savingsData.trialsSaved.amount +
    savingsData.negotiationSavings.yearly;

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
