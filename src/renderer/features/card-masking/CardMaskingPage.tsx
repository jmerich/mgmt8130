/**
 * CARD MASKING FEATURE
 * Owner: [Team Member 2]
 *
 * This module handles:
 * - Generating virtual/masked cards
 * - One-time use cards for trial signups
 * - Merchant-locked cards for subscriptions
 * - Card lifecycle management
 * - DEMO: Fake checkout flow
 */

import React, { useState, useEffect } from 'react';
import type { VirtualCard, CardGenerationOptions } from '../../shared/types';
import { cardMaskingService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import './CardMasking.css';

export function CardMaskingPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCards();
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
      showToast('Virtual card generated!', 'success', '💳');
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
      showToast('Card deactivated', 'warning', '🚫');
    } catch (error) {
      console.error('Failed to deactivate card:', error);
    }
  }

  function handleTryCheckout(card: VirtualCard) {
    setSelectedCard(card);
    setShowCheckout(true);
  }

  if (isLoading) {
    return <div className="loading">Loading cards...</div>;
  }

  return (
    <div className="card-masking">
      <header className="page-header">
        <div>
          <h2>Card Masking</h2>
          <p>Generate virtual cards for trials, subscriptions, and one-time purchases</p>
        </div>
        <button className="btn primary" onClick={() => setShowGenerator(true)}>
          + Generate New Card
        </button>
      </header>

      {showGenerator && (
        <CardGenerator
          onGenerate={handleGenerateCard}
          onCancel={() => setShowGenerator(false)}
          isGenerating={isGenerating}
        />
      )}

      {showCheckout && selectedCard && (
        <FakeCheckout
          card={selectedCard}
          onClose={() => {
            setShowCheckout(false);
            setSelectedCard(null);
          }}
          onSuccess={() => {
            // Mark card as used if single-use
            if (selectedCard.type === 'single-use') {
              setCards(
                cards.map((c) =>
                  c.id === selectedCard.id ? { ...c, status: 'used' } : c
                )
              );
            }
            showToast('Payment successful! Trial activated.', 'success', '✅');
            setShowCheckout(false);
            setSelectedCard(null);
          }}
        />
      )}

      <div className="cards-grid">
        {cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>No virtual cards yet. Generate one to protect your real card!</p>
          </div>
        ) : (
          cards.map((card) => (
            <VirtualCardDisplay
              key={card.id}
              card={card}
              onDeactivate={() => handleDeactivate(card.id)}
              onTryCheckout={() => handleTryCheckout(card)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface VirtualCardDisplayProps {
  card: VirtualCard;
  onDeactivate: () => void;
  onTryCheckout: () => void;
}

function VirtualCardDisplay({ card, onDeactivate, onTryCheckout }: VirtualCardDisplayProps) {
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
          <span className="value">{showDetails ? '123' : '•••'}</span>
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
          {showDetails ? 'Hide' : 'Show'}
        </button>
        {card.status === 'active' && (
          <>
            <button className="btn small demo" onClick={onTryCheckout}>
              Try Checkout
            </button>
            <button className="btn small danger" onClick={onDeactivate}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface FakeCheckoutProps {
  card: VirtualCard;
  onClose: () => void;
  onSuccess: () => void;
}

function FakeCheckout({ card, onClose, onSuccess }: FakeCheckoutProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [merchant] = useState(() => {
    const merchants = ['StreamFlix', 'MusicCloud Pro', 'FitnessPal Premium', 'CloudStorage+'];
    return merchants[Math.floor(Math.random() * merchants.length)];
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep('processing');

    // Simulate processing
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 1500);
    }, 2000);
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="checkout-header">
          <div className="merchant-logo">🏪</div>
          <h3>{merchant}</h3>
          <p>Start your free trial</p>
        </div>

        {step === 'form' && (
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="trial-info">
              <span className="trial-badge">7-DAY FREE TRIAL</span>
              <p>Then $9.99/month. Cancel anytime.</p>
            </div>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={card.maskedNumber}
                readOnly
                className="card-input"
              />
              <span className="virtual-badge">Virtual Card</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry</label>
                <input type="text" value={card.expiryDate} readOnly />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="text" value="123" readOnly />
              </div>
            </div>

            <button type="submit" className="btn primary checkout-btn">
              Start Free Trial
            </button>

            <p className="secure-note">🔒 Your real card details are never shared</p>
          </form>
        )}

        {step === 'processing' && (
          <div className="checkout-processing">
            <div className="spinner large"></div>
            <p>Processing payment...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-success">
            <div className="success-icon">✓</div>
            <h4>Trial Activated!</h4>
            <p>Your virtual card will auto-cancel before you're charged.</p>
          </div>
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
