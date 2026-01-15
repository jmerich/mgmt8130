import React, { useState, useEffect } from 'react';
import './GooglePayMock.css';

interface Card {
  id: string;
  type: 'subguard' | 'personal';
  name: string;
  last4: string;
  network: string;
  color: string;
}

const DEMO_CARDS: Card[] = [
  {
    id: 'sg-1',
    type: 'subguard',
    name: 'SubGuard Protected',
    last4: '8492',
    network: 'Mastercard',
    color: 'linear-gradient(135deg, #00f3ff 0%, #0080ff 100%)',
  },
  {
    id: 'personal-1',
    type: 'personal',
    name: 'Personal Card',
    last4: '4521',
    network: 'Visa',
    color: 'linear-gradient(135deg, #1a1f71 0%, #2d3494 100%)',
  },
];

interface Purchase {
  merchant: string;
  amount: number;
  description: string;
  icon: string;
}

const DEMO_PURCHASES: Purchase[] = [
  { merchant: 'Netflix', amount: 19.99, description: 'Premium Plan - Monthly', icon: '🎬' },
  { merchant: 'Spotify', amount: 10.99, description: 'Individual Plan', icon: '🎵' },
  { merchant: 'Disney+', amount: 13.99, description: 'Standard Plan', icon: '🏰' },
  { merchant: 'Amazon Prime', amount: 14.99, description: 'Monthly Membership', icon: '📦' },
];

type ViewState = 'select' | 'confirm' | 'processing' | 'success' | 'blocked';

export function GooglePayMockPage() {
  const [view, setView] = useState<ViewState>('select');
  const [selectedCard, setSelectedCard] = useState<Card>(DEMO_CARDS[0]);
  const [purchase, setPurchase] = useState<Purchase>(DEMO_PURCHASES[0]);
  const [showCardSelector, setShowCardSelector] = useState(false);

  // Simulate processing
  useEffect(() => {
    if (view === 'processing') {
      const timer = setTimeout(() => {
        // If using SubGuard card, show success; if personal, show blocked
        if (selectedCard.type === 'subguard') {
          setView('success');
          // Send notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Payment Protected', {
              body: `$${purchase.amount} to ${purchase.merchant} using SubGuard virtual card`,
              icon: '/icons/icon-192.png',
            });
          }
        } else {
          setView('blocked');
          // Send blocking notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Payment Blocked', {
              body: `SubGuard blocked $${purchase.amount} to ${purchase.merchant}. Use a protected card instead.`,
              icon: '/icons/icon-192.png',
            });
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view, selectedCard, purchase]);

  const handlePay = () => {
    setView('confirm');
  };

  const handleConfirm = () => {
    setView('processing');
  };

  const handleReset = () => {
    setView('select');
    setSelectedCard(DEMO_CARDS[0]);
  };

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
    setShowCardSelector(false);
  };

  const handleChangePurchase = () => {
    const currentIndex = DEMO_PURCHASES.indexOf(purchase);
    const nextIndex = (currentIndex + 1) % DEMO_PURCHASES.length;
    setPurchase(DEMO_PURCHASES[nextIndex]);
  };

  // Processing View
  if (view === 'processing') {
    return (
      <div className="gpay-mock processing-view">
        <div className="processing-content">
          <div className="processing-spinner"></div>
          <h2>Processing Payment</h2>
          <p>Verifying with SubGuard...</p>
        </div>
      </div>
    );
  }

  // Success View
  if (view === 'success') {
    return (
      <div className="gpay-mock success-view">
        <div className="success-content">
          <div className="success-checkmark">✓</div>
          <h2>Payment Complete</h2>
          <p className="success-amount">${purchase.amount.toFixed(2)}</p>
          <p className="success-merchant">{purchase.merchant}</p>

          <div className="protection-badge">
            <span className="shield-icon">🛡️</span>
            <div className="protection-text">
              <strong>Protected by SubGuard</strong>
              <span>Virtual card ending in {selectedCard.last4}</span>
            </div>
          </div>

          <p className="success-note">
            Your real card details were never shared with the merchant.
          </p>

          <button className="gpay-btn primary" onClick={handleReset}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // Blocked View
  if (view === 'blocked') {
    return (
      <div className="gpay-mock blocked-view">
        <div className="blocked-content">
          <div className="blocked-icon">🚫</div>
          <h2>Payment Blocked</h2>
          <p className="blocked-reason">
            SubGuard prevented this payment to protect your finances.
          </p>

          <div className="blocked-details">
            <div className="blocked-row">
              <span>Merchant</span>
              <strong>{purchase.merchant}</strong>
            </div>
            <div className="blocked-row">
              <span>Amount</span>
              <strong>${purchase.amount.toFixed(2)}</strong>
            </div>
            <div className="blocked-row">
              <span>Reason</span>
              <strong>Unprotected card detected</strong>
            </div>
          </div>

          <div className="blocked-suggestion">
            <span className="suggestion-icon">💡</span>
            <p>Use a SubGuard Protected card to complete this payment safely.</p>
          </div>

          <div className="blocked-actions">
            <button
              className="gpay-btn primary"
              onClick={() => {
                setSelectedCard(DEMO_CARDS[0]);
                setView('select');
              }}
            >
              Use Protected Card
            </button>
            <button className="gpay-btn secondary" onClick={handleReset}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation View
  if (view === 'confirm') {
    return (
      <div className="gpay-mock confirm-view">
        <div className="confirm-header">
          <button className="back-btn" onClick={() => setView('select')}>
            ← Back
          </button>
          <h1>Confirm Payment</h1>
        </div>

        <div className="confirm-content">
          <div className="confirm-merchant">
            <span className="merchant-icon">{purchase.icon}</span>
            <div className="merchant-info">
              <strong>{purchase.merchant}</strong>
              <span>{purchase.description}</span>
            </div>
          </div>

          <div className="confirm-amount">
            <span className="amount-label">Total</span>
            <span className="amount-value">${purchase.amount.toFixed(2)}</span>
          </div>

          <div className="confirm-card">
            <div
              className="mini-card"
              style={{ background: selectedCard.color }}
            >
              <span className="card-network">{selectedCard.network}</span>
              <span className="card-number">•••• {selectedCard.last4}</span>
            </div>
            <div className="card-name">
              {selectedCard.type === 'subguard' && <span className="shield-mini">🛡️</span>}
              {selectedCard.name}
            </div>
          </div>

          {selectedCard.type === 'subguard' && (
            <div className="subguard-notice">
              <span className="notice-icon">✓</span>
              <span>Your real card details will not be shared</span>
            </div>
          )}

          {selectedCard.type === 'personal' && (
            <div className="warning-notice">
              <span className="notice-icon">⚠️</span>
              <span>This card is not protected by SubGuard</span>
            </div>
          )}

          <button className="gpay-btn pay-btn" onClick={handleConfirm}>
            <span className="gpay-logo">G</span>
            Pay ${purchase.amount.toFixed(2)}
          </button>
        </div>
      </div>
    );
  }

  // Select View (default)
  return (
    <div className="gpay-mock select-view">
      <div className="gpay-header">
        <div className="gpay-logo-full">
          <span className="g-letter">G</span>oogle Pay
        </div>
      </div>

      <div className="gpay-content">
        {/* Merchant Info */}
        <div className="merchant-section" onClick={handleChangePurchase}>
          <span className="merchant-icon large">{purchase.icon}</span>
          <div className="merchant-details">
            <h2>{purchase.merchant}</h2>
            <p>{purchase.description}</p>
          </div>
          <span className="change-hint">Tap to change</span>
        </div>

        {/* Amount */}
        <div className="amount-section">
          <span className="amount-value large">${purchase.amount.toFixed(2)}</span>
          <span className="amount-label">per month</span>
        </div>

        {/* Card Selection */}
        <div className="card-section">
          <h3>Payment Method</h3>

          <div
            className="selected-card"
            onClick={() => setShowCardSelector(!showCardSelector)}
          >
            <div
              className="card-preview"
              style={{ background: selectedCard.color }}
            >
              {selectedCard.type === 'subguard' && (
                <div className="subguard-badge">🛡️ Protected</div>
              )}
              <div className="card-chip"></div>
              <div className="card-number-preview">•••• •••• •••• {selectedCard.last4}</div>
              <div className="card-bottom">
                <span className="card-name-preview">{selectedCard.name}</span>
                <span className="card-network-preview">{selectedCard.network}</span>
              </div>
            </div>
            <span className="card-change-btn">Change ▼</span>
          </div>

          {/* Card Selector Dropdown */}
          {showCardSelector && (
            <div className="card-selector">
              {DEMO_CARDS.map((card) => (
                <div
                  key={card.id}
                  className={`card-option ${selectedCard.id === card.id ? 'selected' : ''}`}
                  onClick={() => handleSelectCard(card)}
                >
                  <div
                    className="card-option-preview"
                    style={{ background: card.color }}
                  >
                    <span className="card-network">{card.network}</span>
                  </div>
                  <div className="card-option-info">
                    <strong>
                      {card.type === 'subguard' && '🛡️ '}
                      {card.name}
                    </strong>
                    <span>•••• {card.last4}</span>
                  </div>
                  {selectedCard.id === card.id && <span className="check-mark">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SubGuard Info */}
        {selectedCard.type === 'subguard' && (
          <div className="subguard-info">
            <div className="info-header">
              <span className="shield-icon">🛡️</span>
              <strong>SubGuard Protection Active</strong>
            </div>
            <ul className="info-list">
              <li>Virtual card number masks your real details</li>
              <li>Merchant-locked: only works at {purchase.merchant}</li>
              <li>Easy cancellation from SubGuard dashboard</li>
            </ul>
          </div>
        )}

        {/* Pay Button */}
        <button className="gpay-btn pay-btn large" onClick={handlePay}>
          <span className="gpay-logo">G</span>
          Pay with Google Pay
        </button>

        <p className="gpay-footer">
          Protected by SubGuard • Your card details stay private
        </p>
      </div>
    </div>
  );
}
