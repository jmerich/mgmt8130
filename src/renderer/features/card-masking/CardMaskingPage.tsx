/**
 * CARD MASKING FEATURE
 * Owner: [Team Member 2]
 *
 * This module handles:
 * - Generating virtual/masked cards
 * - One-time use cards for trial signups
 * - Merchant-locked cards for subscriptions
 * - Card lifecycle management
 */

import React, { useState, useEffect } from 'react';
import type { VirtualCard, CardGenerationOptions } from '../../shared/types';
import { cardMaskingService } from '../../services/stub-service';
import './CardMasking.css';

export function CardMaskingPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [feedItems, setFeedItems] = useState([
    { id: 2, type: 'auto', time: '2h ago', service: 'Adobe Creative Cloud', action: 'trial started', badge: 'Auto-Generated Virtual Card', badgeClass: 'generated' },
    { id: 3, type: 'success', time: '5h ago', service: 'Spotify', action: 'payment authorized ($11.99)', badge: 'Approved', badgeClass: 'ok' }
  ]);
  const [selectedFeedItem, setSelectedFeedItem] = useState<any>(null);
  const [provisioning, setProvisioning] = useState<string | null>(null);
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);
  const [activeWallets, setActiveWallets] = useState<string[]>([]);

  const simulateProvisioning = (wallet: string) => {
    const isAdded = activeWallets.includes(wallet);
    setProvisioning(wallet);

    setTimeout(() => {
      setProvisioning(null);

      if (isAdded) {
        // Remove logic
        setActiveWallets(prev => prev.filter(w => w !== wallet));
        setWalletSuccess(`${wallet} Removed`); // Re-using toast for simplicity
      } else {
        // Add logic
        setActiveWallets(prev => [...prev, wallet]);
        setWalletSuccess(wallet); // "Card added to..." handled in render
      }

      setTimeout(() => setWalletSuccess(null), 3000);
    }, 1500);
  };

  useEffect(() => {
    loadCards();

    // Listen for demo events from other tabs
    const handleStorageChange = () => {
      const newSub = localStorage.getItem('subguard_new_subscription');
      if (newSub) {
        const data = JSON.parse(newSub);

        // 1. Add Card
        const newCard: VirtualCard = {
          id: data.id.toString(),
          maskedNumber: '•••• •••• •••• 1039',
          expiryDate: '09/28',
          cvv: '942',
          status: 'active',
          type: 'subscription',
          linkedMerchant: data.service,
          spendLimit: 20,
          createdAt: new Date()
        };
        setCards(prev => [newCard, ...prev]);

        // 2. Add to Feed (The "Magic" part)
        const newFeedItem = {
          id: Date.now(),
          type: 'auto',
          time: 'Just now',
          service: data.service,
          action: `subscription detected (${data.amount})`,
          badge: 'Protected via Virtual Card',
          badgeClass: 'generated'
        };
        setFeedItems(prev => [newFeedItem, ...prev]);

        // Clear it
        localStorage.removeItem('subguard_new_subscription');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case we are on the same window and storage event doesn't fire
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    }
  }, []);

  async function loadCards() {
    setIsLoading(true);
    try {
      const data = await cardMaskingService.listCards();
      setCards(data);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateCard(options: CardGenerationOptions) {
    setIsGenerating(true);
    try {
      const newCard = await cardMaskingService.generateCard(options);
      setCards([newCard, ...cards]);
      setShowGenerator(false);
    } catch (error) {
      console.error('Failed to generate card:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDeactivate(cardId: string) {
    try {
      await cardMaskingService.deactivateCard(cardId);
      setCards(
        cards.map((card) =>
          card.id === cardId ? { ...card, status: 'cancelled' } : card
        )
      );
    } catch (error) {
      console.error('Failed to deactivate card:', error);
    }
  }

  if (isLoading) {
    return <div className="loading">Loading cards...</div>;
  }

  return (
    <div className="card-masking invisible-theme">
      <header className="page-header">
        <div className="header-content">
          <h2>Autonomous Defense</h2>
          <p>Infrastructure operating below the threshold of attention.</p>
        </div>
        <div className="status-indicator active">
          <span className="pulse"></span>
          System Active
        </div>
        {!showGenerator && (
          <button className="btn primary glow-effect" onClick={() => setShowGenerator(true)}>
            + Provision New Access
          </button>
        )}
      </header>

      {/* Main "Wallet" Action Area */}
      <div className="wallet-section">
        <div className="wallet-card-preview">
          <div className="card-visual">
            <div className="card-chip"></div>
            <div className="card-logo">SubGuard</div>
            <div className="card-number">•••• •••• •••• 8829</div>
            <div className="card-holder">VIRTUAL PROXY</div>
          </div>
          <button
            className={`btn wallet-btn ${activeWallets.includes('Apple Pay') ? 'active' : ''}`}
            onClick={() => simulateProvisioning('Apple Pay')}
            disabled={!!provisioning}
          >
            {provisioning === 'Apple Pay' ? <span className="spinner"></span> : (
              activeWallets.includes('Apple Pay') ? (
                <span className="icon">✓</span>
              ) : (
                <svg className="icon-svg" viewBox="0 0 384 512" fill="currentColor" height="18" width="18">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-54.7-65.8-60.8-77.4 32.5 2.1 66.8-20.7 75.6-56.1-23.7 2.1-51.8 17.9-76.5 41.6z" />
                </svg>
              )
            )}
            {provisioning === 'Apple Pay'
              ? (activeWallets.includes('Apple Pay') ? 'Removing...' : 'Adding...')
              : (activeWallets.includes('Apple Pay') ? 'Remove from Wallet' : 'Add to Apple Wallet')
            }
          </button>

          <button
            className={`btn wallet-btn google ${activeWallets.includes('Google Pay') ? 'active' : ''}`}
            onClick={() => simulateProvisioning('Google Pay')}
            disabled={!!provisioning}
          >
            {provisioning === 'Google Pay' ? <span className="spinner"></span> : (
              activeWallets.includes('Google Pay') ? (
                <span className="icon">✓</span>
              ) : (
                <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor" height="18" width="18">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              )
            )}
            {provisioning === 'Google Pay'
              ? (activeWallets.includes('Google Pay') ? 'Removing...' : 'Adding...')
              : (activeWallets.includes('Google Pay') ? 'Remove from Google Pay' : 'Add to Google Pay')
            }
          </button>
        </div>

        {walletSuccess && (
          <div className="wallet-toast">
            <div className="check-circle">✓</div>
            <div>
              <strong>Success</strong>
              <div>{walletSuccess.endsWith('Removed') ? walletSuccess : `Card added to ${walletSuccess}`}</div>
            </div>
          </div>
        )}

        <div className="intervention-feed">
          <h3>Recent Interventions</h3>
          <ul className="feed-list">
            {feedItems.map(item => (
              <li key={item.id} className={`feed-item ${item.type}`} onClick={() => setSelectedFeedItem(item)}>
                <div className="time">{item.time}</div>
                <div className="event">
                  <strong>{item.service}</strong> {item.action}.
                  <span className={`badge ${item.badgeClass}`}>{item.badge}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showGenerator && (
        <CardGenerator
          onGenerate={handleGenerateCard}
          onCancel={() => setShowGenerator(false)}
          isGenerating={isGenerating}
        />
      )}

      {/* Details Modal */}
      {selectedFeedItem && (
        <div className="modal-overlay" onClick={() => setSelectedFeedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedFeedItem.service}</h3>
              <span className={`badge ${selectedFeedItem.badgeClass}`}>{selectedFeedItem.badge}</span>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span>Status</span>
                {selectedFeedItem.badgeClass === 'blocked' ? (
                  <strong style={{ color: '#ff3b30' }}>Terminated</strong>
                ) : (
                  <strong className="active-text">Active Protection</strong>
                )}
              </div>
              <div className="detail-row">
                <span>Virtual Card</span>
                <code>•••• 1039</code>
              </div>
              <div className="detail-row">
                <span>Spend Limit</span>
                <strong>$20.00 / month</strong>
              </div>
              <div className="detail-row">
                <span>Last Event</span>
                <span>{selectedFeedItem.action}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setSelectedFeedItem(null)}>Close</button>

              {selectedFeedItem.badgeClass === 'blocked' ? (
                <button className="btn primary" onClick={() => {
                  // Reinstate Logic
                  const newItem = {
                    ...selectedFeedItem,
                    badge: 'Protected via Virtual Card',
                    badgeClass: 'generated',
                    action: 'protection reinstated'
                  };
                  setFeedItems(prev => prev.map(item => item.id === selectedFeedItem.id ? newItem : item));
                  setSelectedFeedItem(null);
                }}>Reinstate Connection</button>
              ) : (
                <button className="btn danger" onClick={() => {
                  // Destroy Logic
                  const newItem = {
                    ...selectedFeedItem,
                    badge: 'Cancelled',
                    badgeClass: 'blocked',
                    action: 'subscription terminated'
                  };
                  setFeedItems(prev => prev.map(item => item.id === selectedFeedItem.id ? newItem : item));
                  setSelectedFeedItem(null);
                }}>Destroy Card & Cancel</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden "Real" Cards (Infrastructure View) */}
      <div className="infrastructure-view">
        <h3>Active Infrastructure Nodes</h3>
        <div className="cards-grid">
          {cards.map((card) => (
            <VirtualCardDisplay
              key={card.id}
              card={card}
              onDeactivate={() => handleDeactivate(card.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualCardDisplayProps {
  card: VirtualCard;
  onDeactivate: () => void;
}

function VirtualCardDisplay({ card, onDeactivate }: VirtualCardDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusColors: Record<VirtualCard['status'], string> = {
    active: '#4caf50',
    used: '#ff9800',
    expired: '#9e9e9e',
    cancelled: '#f44336',
  };

  return (
    <div className={`virtual-card ${card.status}`}>
      <div className="card-header">
        <span className="card-type">{formatCardType(card.type)}</span>
        <span
          className="card-status"
          style={{ backgroundColor: statusColors[card.status] }}
        >
          {card.status}
        </span>
      </div>

      <div className="card-number">
        {showDetails ? card.maskedNumber : '•••• •••• •••• ••••'}
      </div>

      <div className="card-details">
        <div className="detail">
          <span className="label">Expiry</span>
          <span className="value">{showDetails ? card.expiryDate : '••/••'}</span>
        </div>
        <div className="detail">
          <span className="label">CVV</span>
          <span className="value">{showDetails ? card.cvv : '•••'}</span>
        </div>
      </div>

      {card.linkedMerchant && (
        <div className="merchant-lock">
          🔒 Locked to: {card.linkedMerchant}
        </div>
      )}

      {card.spendLimit && (
        <div className="spend-limit">
          💰 Limit: ${card.spendLimit}
        </div>
      )}

      <div className="card-actions">
        <button
          className="btn small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
        {card.status === 'active' && (
          <button
            className="btn small danger"
            onClick={onDeactivate}
          >
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}

interface CardGeneratorProps {
  onGenerate: (options: CardGenerationOptions) => void;
  onCancel: () => void;
  isGenerating: boolean;
}

function CardGenerator({ onGenerate, onCancel, isGenerating }: CardGeneratorProps) {
  const [type, setType] = useState<VirtualCard['type']>('single-use');
  const [merchantLock, setMerchantLock] = useState('');
  const [spendLimit, setSpendLimit] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      type,
      merchantLock: merchantLock || undefined,
      spendLimit: spendLimit ? Number(spendLimit) : undefined,
      expiryDays: Number(expiryDays),
    });
  }

  return (
    <form className="card-generator" onSubmit={handleSubmit}>
      <h3>Generate Virtual Card</h3>

      <div className="card-type-selector">
        <label className={`type-option ${type === 'single-use' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="type"
            value="single-use"
            checked={type === 'single-use'}
            onChange={(e) => setType(e.target.value as VirtualCard['type'])}
          />
          <span className="type-icon">1️⃣</span>
          <span className="type-name">Single Use</span>
          <span className="type-desc">One transaction, then expires</span>
        </label>

        <label className={`type-option ${type === 'merchant-locked' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="type"
            value="merchant-locked"
            checked={type === 'merchant-locked'}
            onChange={(e) => setType(e.target.value as VirtualCard['type'])}
          />
          <span className="type-icon">🔒</span>
          <span className="type-name">Merchant Lock</span>
          <span className="type-desc">Only works at one merchant</span>
        </label>

        <label className={`type-option ${type === 'subscription' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="type"
            value="subscription"
            checked={type === 'subscription'}
            onChange={(e) => setType(e.target.value as VirtualCard['type'])}
          />
          <span className="type-icon">🔄</span>
          <span className="type-name">Subscription</span>
          <span className="type-desc">For recurring payments</span>
        </label>
      </div>

      {type === 'merchant-locked' && (
        <div className="form-group">
          <label>Merchant Name</label>
          <input
            type="text"
            value={merchantLock}
            onChange={(e) => setMerchantLock(e.target.value)}
            placeholder="e.g., Netflix, Spotify"
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Spend Limit ($)</label>
          <input
            type="number"
            value={spendLimit}
            onChange={(e) => setSpendLimit(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Expires In (days)</label>
          <input
            type="number"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            min="1"
            max="365"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Card'}
        </button>
      </div>
    </form>
  );
}

function formatCardType(type: VirtualCard['type']): string {
  const labels: Record<VirtualCard['type'], string> = {
    'single-use': 'Single Use',
    'merchant-locked': 'Merchant Locked',
    subscription: 'Subscription',
  };
  return labels[type];
}
