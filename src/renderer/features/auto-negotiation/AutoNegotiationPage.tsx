/**
 * AUTO-NEGOTIATION FEATURE - ADVANCED AI SYSTEM
 * Owner: [Team Member 3]
 *
 * This module handles:
 * - Advanced AI negotiation strategies with multiple agent personalities
 * - Vendor intelligence and behavioral analysis
 * - Multi-channel negotiation tactics
 * - Safety guardrails and risk management
 * - Legal compliance and consumer protection
 * - Price intelligence and fairness scoring
 * - Community-driven insights and social features
 * - Anti-dark pattern detection and protection
 */

import { useState, useEffect, useRef } from 'react';
import type { Subscription } from '../../shared/types';
import { autoNegotiationService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import { type AgentKey, type NegotiationState, type TabType } from './types';
import { NEGOTIATION_SCRIPTS } from './demo-data';
import {
  SubscriptionsTab,
  StrategiesTab,
  VendorIntelligenceTab,
  MultiChannelTab,
  SafetyTab,
  LegalTab,
  PriceIntelligenceTab,
  CommunityTab,
  AntiDarkPatternTab,
  NegotiationChat,
} from './components';
import './AutoNegotiation.css';

export function AutoNegotiationPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [negotiatedDiscounts, setNegotiatedDiscounts] = useState<Record<string, number>>({});
  const [activeNegotiation, setActiveNegotiation] = useState<NegotiationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [selectedAgent, setSelectedAgent] = useState<AgentKey>('polite');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadSubscriptions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
    const totalTurns = Math.max(...script.map(s => s.turn || 1));

    setActiveNegotiation({
      subscription,
      messages: [],
      status: 'chatting',
      selectedAgent,
      currentTurn: 0,
      totalTurns,
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index >= script.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        const success = true;
        const discount = Math.floor(15 + Math.random() * 25);

        setActiveNegotiation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: success ? 'success' : 'failed',
            discount,
          };
        });

        if (success) {
          setNegotiatedDiscounts((prev) => ({
            ...prev,
            [subscription.id]: discount,
          }));
          showToast(`Negotiation successful! ${discount}% discount secured.`, 'success', '🎉');
        }
        return;
      }

      const currentMessage = script[index];
      setActiveNegotiation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, currentMessage],
          currentTurn: currentMessage.turn || prev.currentTurn,
        };
      });
      index++;
    }, 1800);
  }

  function closeNegotiation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveNegotiation(null);
  }

  // Calculate totals
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const discount = negotiatedDiscounts[sub.id] || 0;
    const discountedPrice = sub.currentPrice * (1 - discount / 100);
    return sum + discountedPrice;
  }, 0);

  const originalTotal = subscriptions.reduce((sum, sub) => sum + sub.currentPrice, 0);
  const totalSavings = originalTotal - totalMonthly;
  const potentialSavings = (originalTotal - totalSavings) * 0.25;

  if (isLoading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="auto-negotiation advanced">
      {/* Hero Header */}
      <header className="hero-header">
        <div className="hero-content">
          <div className="hero-badge">AI-POWERED</div>
          <h1>SubGuard Negotiation Engine</h1>
          <p>Advanced autonomous AI that fights for the best prices on your subscriptions</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">${originalTotal.toFixed(2)}</span>
            <span className="hero-stat-label">Monthly Spend</span>
          </div>
          <div className="hero-stat savings">
            <span className="hero-stat-value">${totalSavings.toFixed(2)}</span>
            <span className="hero-stat-label">Saved This Month</span>
          </div>
          <div className="hero-stat potential">
            <span className="hero-stat-value">~${potentialSavings.toFixed(2)}</span>
            <span className="hero-stat-label">Potential Savings</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{subscriptions.length}</span>
            <span className="hero-stat-label">Active Subscriptions</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="feature-tabs">
        <button className={activeTab === 'subscriptions' ? 'active' : ''} onClick={() => setActiveTab('subscriptions')}>
          📋 Subscriptions
        </button>
        <button className={activeTab === 'strategies' ? 'active' : ''} onClick={() => setActiveTab('strategies')}>
          🧠 AI Strategies
        </button>
        <button className={activeTab === 'intelligence' ? 'active' : ''} onClick={() => setActiveTab('intelligence')}>
          📊 Vendor Intel
        </button>
        <button className={activeTab === 'channels' ? 'active' : ''} onClick={() => setActiveTab('channels')}>
          📡 Multi-Channel
        </button>
        <button className={activeTab === 'safety' ? 'active' : ''} onClick={() => setActiveTab('safety')}>
          🛡️ Safety
        </button>
        <button className={activeTab === 'legal' ? 'active' : ''} onClick={() => setActiveTab('legal')}>
          ⚖️ Legal
        </button>
        <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => setActiveTab('pricing')}>
          💰 Price Intel
        </button>
        <button className={activeTab === 'community' ? 'active' : ''} onClick={() => setActiveTab('community')}>
          👥 Community
        </button>
        <button className={activeTab === 'protection' ? 'active' : ''} onClick={() => setActiveTab('protection')}>
          🚫 Anti-Dark
        </button>
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptions={subscriptions}
            negotiatedDiscounts={negotiatedDiscounts}
            onNegotiate={startNegotiation}
            activeNegotiationId={activeNegotiation?.subscription.id}
          />
        )}
        {activeTab === 'strategies' && (
          <StrategiesTab
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        )}
        {activeTab === 'intelligence' && <VendorIntelligenceTab />}
        {activeTab === 'channels' && <MultiChannelTab />}
        {activeTab === 'safety' && <SafetyTab subscriptions={subscriptions} />}
        {activeTab === 'legal' && <LegalTab />}
        {activeTab === 'pricing' && <PriceIntelligenceTab subscriptions={subscriptions} />}
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'protection' && <AntiDarkPatternTab />}
      </div>

      {/* Negotiation Modal */}
      {activeNegotiation && (
        <NegotiationChat
          negotiation={activeNegotiation}
          onClose={closeNegotiation}
        />
      )}
    </div>
  );
}
