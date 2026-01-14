/**
 * AUTO-NEGOTIATION FEATURE
 * Owner: [Team Member 3]
 *
 * This module handles:
 * - Displaying active subscriptions
 * - Initiating automated price negotiations
 * - Tracking negotiation progress and results
 * - Showing potential and realized savings
 * - DEMO: Animated chat showing AI negotiating
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Subscription, NegotiationSession } from '../../shared/types';
import { autoNegotiationService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import './AutoNegotiation.css';

// Simulated chat messages for demo
const NEGOTIATION_SCRIPTS: Record<string, Array<{ role: 'ai' | 'rep'; message: string }>> = {
  Netflix: [
    { role: 'ai', message: "Hi! I'm reaching out on behalf of a loyal Netflix customer who's been subscribed for over 2 years." },
    { role: 'rep', message: "Hello! Thank you for contacting Netflix support. How can I help you today?" },
    { role: 'ai', message: "My customer is considering canceling due to recent price increases. They love the service but are looking to reduce monthly expenses." },
    { role: 'rep', message: "I understand. Let me check what options we have available..." },
    { role: 'rep', message: "I can offer a 20% discount for the next 6 months. Would that work?" },
    { role: 'ai', message: "That's a great start! Could we possibly extend that to 12 months given their loyalty?" },
    { role: 'rep', message: "I can do 25% off for 12 months. That's our best retention offer." },
    { role: 'ai', message: "Perfect! My customer accepts. Thank you for your help!" },
  ],
  Spotify: [
    { role: 'ai', message: "Hello! I'm negotiating on behalf of a Premium subscriber who's been with Spotify for 18 months." },
    { role: 'rep', message: "Hi there! How can I assist you?" },
    { role: 'ai', message: "They're comparing prices with Apple Music and considering switching. Is there any loyalty discount available?" },
    { role: 'rep', message: "Let me look into your account... I see you've been a great customer." },
    { role: 'rep', message: "I can offer 3 months at 50% off." },
    { role: 'ai', message: "That's helpful! Can we make it 6 months?" },
    { role: 'rep', message: "I can do 4 months at 50% off. Final offer!" },
    { role: 'ai', message: "Deal! Thank you for working with us." },
  ],
  default: [
    { role: 'ai', message: "Hi! I'm reaching out about a subscription price negotiation." },
    { role: 'rep', message: "Hello! How can I help you today?" },
    { role: 'ai', message: "My customer is a loyal subscriber looking to reduce their monthly bill." },
    { role: 'rep', message: "I understand. Let me check what discounts are available..." },
    { role: 'rep', message: "I can offer a 15% discount for the next 6 months." },
    { role: 'ai', message: "Thank you! That works for us." },
  ],
};

export function AutoNegotiationPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeNegotiation, setActiveNegotiation] = useState<{
    subscription: Subscription;
    messages: Array<{ role: 'ai' | 'rep'; message: string }>;
    status: 'chatting' | 'success' | 'failed';
    discount?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

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

  function startNegotiation(subscription: Subscription) {
    const script = NEGOTIATION_SCRIPTS[subscription.serviceName] || NEGOTIATION_SCRIPTS.default;

    setActiveNegotiation({
      subscription,
      messages: [],
      status: 'chatting',
    });

    // Animate messages one by one
    let index = 0;
    const interval = setInterval(() => {
      if (index >= script.length) {
        clearInterval(interval);
        // Determine outcome
        const success = Math.random() > 0.2; // 80% success rate
        const discount = success ? Math.floor(15 + Math.random() * 20) : 0;

        setActiveNegotiation((prev) => prev ? {
          ...prev,
          status: success ? 'success' : 'failed',
          discount,
        } : null);

        if (success) {
          showToast(`Negotiation successful! ${discount}% discount secured.`, 'success', '🎉');
        }
        return;
      }

      setActiveNegotiation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, script[index]],
      } : null);
      index++;
    }, 1500);
  }

  function closeNegotiation() {
    setActiveNegotiation(null);
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.currentPrice, 0);
  const potentialSavings = totalMonthly * 0.2;

  if (isLoading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="auto-negotiation">
      <header className="page-header">
        <div>
          <h2>Auto-Negotiation</h2>
          <p>Let our AI negotiate better prices on your subscriptions</p>
        </div>
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

      {activeNegotiation && (
        <NegotiationChat
          negotiation={activeNegotiation}
          onClose={closeNegotiation}
        />
      )}

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
              onNegotiate={() => startNegotiation(subscription)}
              isNegotiating={activeNegotiation?.subscription.id === subscription.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface NegotiationChatProps {
  negotiation: {
    subscription: Subscription;
    messages: Array<{ role: 'ai' | 'rep'; message: string }>;
    status: 'chatting' | 'success' | 'failed';
    discount?: number;
  };
  onClose: () => void;
}

function NegotiationChat({ negotiation, onClose }: NegotiationChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation.messages]);

  return (
    <div className="negotiation-overlay">
      <div className="negotiation-modal">
        <div className="chat-header">
          <div className="chat-title">
            <span className="chat-icon">🤝</span>
            <div>
              <h3>Negotiating with {negotiation.subscription.serviceName}</h3>
              <p>AI Agent is working on your behalf</p>
            </div>
          </div>
          {negotiation.status !== 'chatting' && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>

        <div className="chat-messages">
          {negotiation.messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <span className="message-sender">
                  {msg.role === 'ai' ? 'SubGuard AI' : `${negotiation.subscription.serviceName} Rep`}
                </span>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}

          {negotiation.status === 'chatting' && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {negotiation.status === 'success' && (
          <div className="negotiation-result success">
            <div className="result-icon">🎉</div>
            <h4>Negotiation Successful!</h4>
            <p className="discount-amount">{negotiation.discount}% discount secured</p>
            <p className="savings-detail">
              You'll save ${((negotiation.subscription.currentPrice * (negotiation.discount || 0)) / 100).toFixed(2)}/month
            </p>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        )}

        {negotiation.status === 'failed' && (
          <div className="negotiation-result failed">
            <div className="result-icon">😔</div>
            <h4>No Discount Available</h4>
            <p>The service wasn't able to offer a discount at this time. Try again in 30 days.</p>
            <button className="btn secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onNegotiate: () => void;
  isNegotiating: boolean;
}

function SubscriptionCard({ subscription, onNegotiate, isNegotiating }: SubscriptionCardProps) {
  return (
    <div className="subscription-card">
      <div className="subscription-icon">
        {getServiceIcon(subscription.serviceName)}
      </div>

      <div className="subscription-info">
        <h3>{subscription.serviceName}</h3>
        <span className="subscription-category">{subscription.category}</span>

        <div className="pricing">
          <span className="current-price">
            ${subscription.currentPrice}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>

        <div className="next-billing">
          Next billing: {formatDate(subscription.nextBillingDate)}
        </div>
      </div>

      <div className="subscription-actions">
        {isNegotiating ? (
          <div className="negotiating-badge">
            <div className="spinner small"></div>
            <span>Negotiating...</span>
          </div>
        ) : subscription.negotiationEligible ? (
          <button className="btn primary" onClick={onNegotiate}>
            🤝 Negotiate Price
          </button>
        ) : (
          <span className="not-eligible">Not eligible yet</span>
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
