import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PurchaseBlockingPage } from './features/purchase-blocking/PurchaseBlockingPage';
import { CardMaskingPage } from './features/card-masking/CardMaskingPage';
import { AutoNegotiationPage } from './features/auto-negotiation/AutoNegotiationPage';
import { NetflixMockPage } from './features/demo/NetflixMockPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
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
  return (
    <div className="dashboard">
      <h2>Welcome to SubGuard</h2>
      <p>Your subscription management and purchase protection tool.</p>

      <div className="feature-cards">
        <div className="feature-card">
          <h3>Purchase Blocking</h3>
          <p>Set rules to block unwanted purchases automatically.</p>
          <NavLink to="/purchase-blocking" className="btn">
            Manage Rules
          </NavLink>
        </div>

        <div className="feature-card">
          <h3>Card Masking</h3>
          <p>Generate virtual cards for trials and subscriptions.</p>
          <NavLink to="/card-masking" className="btn">
            Create Card
          </NavLink>
        </div>

        <div className="feature-card">
          <h3>Auto-Negotiation</h3>
          <p>Let us negotiate better prices on your subscriptions.</p>
          <NavLink to="/auto-negotiation" className="btn">
            View Subscriptions
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default App;
