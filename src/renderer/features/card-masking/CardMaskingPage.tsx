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
    <div className="card-masking">
      <header className="page-header">
        <h2>Card Masking</h2>
        <p>Generate virtual cards for trials, subscriptions, and one-time purchases</p>
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
