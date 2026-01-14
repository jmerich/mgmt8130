/**
 * AUTO-NEGOTIATION FEATURE
 * Owner: [Team Member 3]
 *
 * This module handles:
 * - Displaying active subscriptions
 * - Initiating automated price negotiations
 * - Tracking negotiation progress and results
 * - Showing potential and realized savings
 */

import React, { useState, useEffect } from 'react';
import type { Subscription, NegotiationSession } from '../../shared/types';
import { autoNegotiationService } from '../../services/stub-service';
import './AutoNegotiation.css';

export function AutoNegotiationPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [negotiations, setNegotiations] = useState<Map<string, NegotiationSession>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setIsLoading(true);
    try {
      const data = await autoNegotiationService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function startNegotiation(subscriptionId: string) {
    try {
      const session = await autoNegotiationService.startNegotiation(subscriptionId);
      setNegotiations(new Map(negotiations.set(subscriptionId, session)));

      // Poll for status updates
      pollNegotiationStatus(session.id, subscriptionId);
    } catch (error) {
      console.error('Failed to start negotiation:', error);
    }
  }

  async function pollNegotiationStatus(sessionId: string, subscriptionId: string) {
    const poll = async () => {
      const status = await autoNegotiationService.getNegotiationStatus(sessionId);
      if (status) {
        setNegotiations(new Map(negotiations.set(subscriptionId, status)));
        if (status.status === 'in-progress' || status.status === 'pending') {
          setTimeout(poll, 1000);
        }
      }
    };
    setTimeout(poll, 1000);
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.currentPrice, 0);
  const potentialSavings = totalMonthly * 0.2; // Estimate 20% potential savings

  if (isLoading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="auto-negotiation">
      <header className="page-header">
        <h2>Auto-Negotiation</h2>
        <p>Let us negotiate better prices on your subscriptions</p>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">${totalMonthly.toFixed(2)}</span>
          <span className="stat-label">Monthly Spend</span>
        </div>
        <div className="stat">
          <span className="stat-value">{subscriptions.length}</span>
          <span className="stat-label">Active Subscriptions</span>
        </div>
        <div className="stat highlight">
          <span className="stat-value">~${potentialSavings.toFixed(2)}</span>
          <span className="stat-label">Potential Savings/mo</span>
        </div>
      </div>

      <div className="subscriptions-list">
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions found. Connect your accounts to see them here!</p>
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              negotiation={negotiations.get(subscription.id)}
              onNegotiate={() => startNegotiation(subscription.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  negotiation?: NegotiationSession;
  onNegotiate: () => void;
}

function SubscriptionCard({ subscription, negotiation, onNegotiate }: SubscriptionCardProps) {
  const isNegotiating = negotiation?.status === 'in-progress' || negotiation?.status === 'pending';
  const isSuccess = negotiation?.status === 'success';
  const isFailed = negotiation?.status === 'failed';

  return (
    <div className={`subscription-card ${isSuccess ? 'success' : ''}`}>
      <div className="subscription-icon">
        {getServiceIcon(subscription.serviceName)}
      </div>

      <div className="subscription-info">
        <h3>{subscription.serviceName}</h3>
        <span className="subscription-category">{subscription.category}</span>

        <div className="pricing">
          {isSuccess && negotiation?.negotiatedPrice ? (
            <>
              <span className="original-price">${subscription.currentPrice}</span>
              <span className="new-price">${negotiation.negotiatedPrice}</span>
              <span className="savings-badge">
                Save {negotiation.savingsPercent}%
              </span>
            </>
          ) : (
            <span className="current-price">
              ${subscription.currentPrice}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          )}
        </div>

        <div className="next-billing">
          Next billing: {formatDate(subscription.nextBillingDate)}
        </div>
      </div>

      <div className="subscription-actions">
        {isNegotiating ? (
          <div className="negotiating">
            <div className="spinner"></div>
            <span>Negotiating...</span>
          </div>
        ) : isSuccess ? (
          <div className="negotiation-result success">
            <span>✓ Price reduced!</span>
          </div>
        ) : isFailed ? (
          <div className="negotiation-result failed">
            <span>Could not reduce price</span>
            <button className="btn small" onClick={onNegotiate}>
              Try Again
            </button>
          </div>
        ) : subscription.negotiationEligible ? (
          <button className="btn primary" onClick={onNegotiate}>
            Negotiate Price
          </button>
        ) : (
          <span className="not-eligible">Not eligible</span>
        )}
      </div>
    </div>
  );
}

function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    Netflix: '🎬',
    Spotify: '🎵',
    'Adobe Creative Cloud': '🎨',
    'Amazon Prime': '📦',
    Hulu: '📺',
    'Disney+': '🏰',
    'HBO Max': '🎭',
    YouTube: '▶️',
  };
  return icons[serviceName] || '📱';
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
