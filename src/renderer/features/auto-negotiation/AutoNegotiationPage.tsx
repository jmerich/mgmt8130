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

import React, { useState, useEffect, useRef } from 'react';
import type { Subscription } from '../../shared/types';
import { autoNegotiationService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import './AutoNegotiation.css';

// ============================================
// AI AGENT PERSONALITIES
// ============================================
const AI_AGENTS = {
  polite: { name: 'Diplomatic Agent', icon: '🤝', style: 'Polite & Professional', successRate: 72 },
  angry: { name: 'Assertive Agent', icon: '😤', style: 'Firm & Demanding', successRate: 68 },
  legalistic: { name: 'Legal Expert', icon: '⚖️', style: 'Policy & Rights Focus', successRate: 81 },
  clueless: { name: 'Confused Customer', icon: '😕', style: 'Plays Dumb Strategy', successRate: 65 },
  finalWarning: { name: 'Churn Risk Agent', icon: '⚠️', style: 'Final Warning Bluff', successRate: 78 },
  silence: { name: 'Silence Pressure', icon: '🤫', style: 'Strategic Waiting', successRate: 74 },
  competitor: { name: 'Competitor Evaluator', icon: '🔍', style: 'Comparing Alternatives', successRate: 76 },
  bundle: { name: 'Bundle Threat', icon: '📦', style: 'Multi-Service Leverage', successRate: 85 },
};

// ============================================
// VENDOR INTELLIGENCE DATA
// ============================================
const VENDOR_INTELLIGENCE: Record<string, {
  generosityScore: number;
  negotiationDifficulty: string;
  avgDiscount: number;
  bestDay: string;
  bestTime: string;
  winBackLikelihood: number;
  retentionBudget: string;
  priceFloor: number;
  crowdSourcedTips: string[];
}> = {
  Netflix: {
    generosityScore: 72,
    negotiationDifficulty: 'Medium',
    avgDiscount: 25,
    bestDay: 'Tuesday',
    bestTime: '2-4 PM EST',
    winBackLikelihood: 89,
    retentionBudget: 'High (Q1)',
    priceFloor: 9.99,
    crowdSourcedTips: ['Mention competitor pricing', 'Ask for loyalty discount', 'Threaten to switch to ad tier'],
  },
  Spotify: {
    generosityScore: 65,
    negotiationDifficulty: 'Easy',
    avgDiscount: 30,
    bestDay: 'Wednesday',
    bestTime: '10 AM-12 PM EST',
    winBackLikelihood: 92,
    retentionBudget: 'Very High',
    priceFloor: 5.99,
    crowdSourcedTips: ['Compare to Apple Music', 'Student discount probe', 'Family plan leverage'],
  },
  'Adobe Creative Cloud': {
    generosityScore: 45,
    negotiationDifficulty: 'Hard',
    avgDiscount: 40,
    bestDay: 'Friday',
    bestTime: '3-5 PM EST',
    winBackLikelihood: 78,
    retentionBudget: 'Medium',
    priceFloor: 29.99,
    crowdSourcedTips: ['Annual commitment gets best rates', 'Photography plan as alternative', 'Educational pricing'],
  },
  'Disney+': {
    generosityScore: 58,
    negotiationDifficulty: 'Medium',
    avgDiscount: 20,
    bestDay: 'Monday',
    bestTime: '11 AM-1 PM EST',
    winBackLikelihood: 85,
    retentionBudget: 'High',
    priceFloor: 7.99,
    crowdSourcedTips: ['Bundle with Hulu mention', 'Annual plan savings', 'Competitor content gaps'],
  },
  'Amazon Prime': {
    generosityScore: 52,
    negotiationDifficulty: 'Hard',
    avgDiscount: 15,
    bestDay: 'Thursday',
    bestTime: '9-11 AM EST',
    winBackLikelihood: 95,
    retentionBudget: 'Very High',
    priceFloor: 10.99,
    crowdSourcedTips: ['Student/EBT discount', 'Prime Video only option', 'Shipping-only benefits'],
  },
  'HBO Max': {
    generosityScore: 68,
    negotiationDifficulty: 'Medium',
    avgDiscount: 28,
    bestDay: 'Tuesday',
    bestTime: '1-3 PM EST',
    winBackLikelihood: 87,
    retentionBudget: 'High',
    priceFloor: 9.99,
    crowdSourcedTips: ['Mention limited content updates', 'Compare to Netflix originals', 'Annual plan request'],
  },
  'YouTube Premium': {
    generosityScore: 55,
    negotiationDifficulty: 'Medium',
    avgDiscount: 22,
    bestDay: 'Wednesday',
    bestTime: '2-4 PM EST',
    winBackLikelihood: 82,
    retentionBudget: 'Medium',
    priceFloor: 8.99,
    crowdSourcedTips: ['Family plan conversion', 'Student eligibility', 'YouTube Music bundle value'],
  },
};

// ============================================
// NEGOTIATION SCRIPTS
// ============================================
const NEGOTIATION_SCRIPTS: Record<string, Array<{ role: 'ai' | 'rep'; message: string; turn?: number }>> = {
  Netflix: [
    { role: 'ai', message: "Hi! I'm reaching out on behalf of a loyal Netflix customer who's been subscribed for over 2 years.", turn: 1 },
    { role: 'rep', message: "Hello! Thank you for contacting Netflix support. How can I help you today?", turn: 1 },
    { role: 'ai', message: "My customer is considering canceling due to recent price increases. They love the service but are looking to reduce monthly expenses.", turn: 2 },
    { role: 'rep', message: "I understand. Let me check what options we have available...", turn: 2 },
    { role: 'ai', message: "[STRATEGY: Competitor Mention] They've been comparing prices with Disney+ and HBO Max bundles.", turn: 3 },
    { role: 'rep', message: "I see. We definitely want to keep you as a customer. Let me check our retention offers.", turn: 3 },
    { role: 'rep', message: "I can offer a 20% discount for the next 6 months. Would that work?", turn: 4 },
    { role: 'ai', message: "[STRATEGY: Push for More] That's a great start! Could we possibly extend that to 12 months given their loyalty?", turn: 5 },
    { role: 'rep', message: "Let me speak with my supervisor about that...", turn: 5 },
    { role: 'rep', message: "I can do 25% off for 12 months. That's our best retention offer.", turn: 6 },
    { role: 'ai', message: "[STRATEGY: Accept & Confirm] Perfect! My customer accepts. Thank you for your help!", turn: 7 },
  ],
  Spotify: [
    { role: 'ai', message: "Hello! I'm negotiating on behalf of a Premium subscriber who's been with Spotify for 18 months.", turn: 1 },
    { role: 'rep', message: "Hi there! How can I assist you?", turn: 1 },
    { role: 'ai', message: "[STRATEGY: Competitor Comparison] They're comparing prices with Apple Music and considering switching.", turn: 2 },
    { role: 'rep', message: "Let me look into your account... I see you've been a great customer.", turn: 2 },
    { role: 'rep', message: "I can offer 3 months at 50% off.", turn: 3 },
    { role: 'ai', message: "[STRATEGY: Counter Offer] That's helpful! Can we make it 6 months?", turn: 4 },
    { role: 'rep', message: "I can do 4 months at 50% off. Final offer!", turn: 4 },
    { role: 'ai', message: "Deal! Thank you for working with us.", turn: 5 },
  ],
  default: [
    { role: 'ai', message: "Hi! I'm reaching out about a subscription price negotiation.", turn: 1 },
    { role: 'rep', message: "Hello! How can I help you today?", turn: 1 },
    { role: 'ai', message: "My customer is a loyal subscriber looking to reduce their monthly bill.", turn: 2 },
    { role: 'rep', message: "I understand. Let me check what discounts are available...", turn: 2 },
    { role: 'ai', message: "[STRATEGY: Competitor Analysis] They've been researching alternative services in the market.", turn: 3 },
    { role: 'rep', message: "I can offer a 15% discount for the next 6 months.", turn: 3 },
    { role: 'ai', message: "[STRATEGY: Counter Offer] Is there any way to improve on that?", turn: 4 },
    { role: 'rep', message: "I can do 20% off for 6 months. That's my best offer.", turn: 4 },
    { role: 'ai', message: "Thank you! That works for us.", turn: 5 },
  ],
};

// ============================================
// TYPES
// ============================================
interface NegotiationState {
  subscription: Subscription;
  messages: Array<{ role: 'ai' | 'rep'; message: string; turn?: number }>;
  status: 'chatting' | 'success' | 'failed';
  discount?: number;
  selectedAgent?: keyof typeof AI_AGENTS;
  currentTurn: number;
  totalTurns: number;
}

type TabType = 'subscriptions' | 'strategies' | 'intelligence' | 'channels' | 'safety' | 'legal' | 'pricing' | 'community' | 'protection';

// ============================================
// MAIN COMPONENT
// ============================================
export function AutoNegotiationPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [negotiatedDiscounts, setNegotiatedDiscounts] = useState<Record<string, number>>({});
  const [activeNegotiation, setActiveNegotiation] = useState<NegotiationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [selectedAgent, setSelectedAgent] = useState<keyof typeof AI_AGENTS>('polite');
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
        {activeTab === 'intelligence' && <VendorIntelligenceTab subscriptions={subscriptions} />}
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

// ============================================
// SUBSCRIPTIONS TAB
// ============================================
function SubscriptionsTab({
  subscriptions,
  negotiatedDiscounts,
  onNegotiate,
  activeNegotiationId,
}: {
  subscriptions: Subscription[];
  negotiatedDiscounts: Record<string, number>;
  onNegotiate: (sub: Subscription) => void;
  activeNegotiationId?: string;
}) {
  return (
    <div className="subscriptions-tab">
      <div className="tab-header">
        <h2>Your Subscriptions</h2>
        <p>Select any subscription to start an AI-powered negotiation</p>
      </div>
      <div className="subscriptions-grid">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            discount={negotiatedDiscounts[subscription.id]}
            onNegotiate={() => onNegotiate(subscription)}
            isNegotiating={activeNegotiationId === subscription.id}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// AI STRATEGIES TAB
// ============================================
function StrategiesTab({
  selectedAgent,
  onSelectAgent,
}: {
  selectedAgent: keyof typeof AI_AGENTS;
  onSelectAgent: (agent: keyof typeof AI_AGENTS) => void;
}) {
  return (
    <div className="strategies-tab">
      <div className="tab-header">
        <h2>AI Negotiation Strategies</h2>
        <p>Choose your AI agent personality and advanced tactics</p>
      </div>

      {/* Agent Selection */}
      <section className="strategy-section">
        <h3>🤖 Agent Personalities</h3>
        <p className="section-desc">Select an AI personality that matches your negotiation style</p>
        <div className="agents-grid">
          {Object.entries(AI_AGENTS).map(([key, agent]) => (
            <div
              key={key}
              className={`agent-card ${selectedAgent === key ? 'selected' : ''}`}
              onClick={() => onSelectAgent(key as keyof typeof AI_AGENTS)}
            >
              <div className="agent-icon">{agent.icon}</div>
              <h4>{agent.name}</h4>
              <p className="agent-style">{agent.style}</p>
              <div className="agent-success">
                <div className="success-bar" style={{ width: `${agent.successRate}%` }}></div>
                <span>{agent.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Tactics */}
      <section className="strategy-section">
        <h3>🎯 Advanced Tactics</h3>
        <div className="tactics-grid">
          <TacticCard
            icon="🔄"
            title="Cancel-Rejoin Loop"
            description="Autonomously cancel and rejoin to trigger win-back offers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="⏰"
            title="Strategic Lapse"
            description="Let subscriptions lapse to trigger retention offers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="🔢"
            title="Multi-Round Negotiation"
            description="5-8 strategic turns for maximum discount extraction"
            status="active"
            risk="low"
          />
          <TacticCard
            icon="😢"
            title="Emotional Tone Switching"
            description="Adaptive emotional responses mid-conversation"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🚀"
            title="Auto-Escalation"
            description="Automatic escalation to human retention teams"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🕐"
            title="Strategic Delay"
            description="Wait days to reply for maximum pressure"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📉"
            title="Downgrade Threat"
            description="Threaten plan downgrade instead of full cancellation"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="❌"
            title="Offer Rejection"
            description="Reject initial offers to force better counteroffers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📦"
            title="Bundle Threat"
            description="Threaten to cancel multiple services simultaneously"
            status="ready"
            risk="high"
          />
          <TacticCard
            icon="📜"
            title="Loyalty Reference"
            description="Leverage historical subscription length"
            status="active"
            risk="low"
          />
          <TacticCard
            icon="🔍"
            title="Competitor Evaluation"
            description="Pretend to actively evaluate competitors"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🤫"
            title="Silence Pressure"
            description="Force vendor to follow up first"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📊"
            title="Historical Average"
            description="Auto-accept only if savings beat historical average"
            status="active"
            risk="low"
          />
        </div>
      </section>
    </div>
  );
}

function TacticCard({ icon, title, description, status, risk }: {
  icon: string;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'disabled';
  risk: 'low' | 'medium' | 'high';
}) {
  return (
    <div className={`tactic-card ${status}`}>
      <div className="tactic-header">
        <span className="tactic-icon">{icon}</span>
        <span className={`tactic-status ${status}`}>{status}</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className={`risk-badge ${risk}`}>
        {risk === 'low' ? '🟢' : risk === 'medium' ? '🟡' : '🔴'} {risk} risk
      </div>
    </div>
  );
}

// ============================================
// VENDOR INTELLIGENCE TAB
// ============================================
function VendorIntelligenceTab({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="intelligence-tab">
      <div className="tab-header">
        <h2>Vendor Intelligence Database</h2>
        <p>Real-time insights on vendor negotiation behavior and patterns</p>
      </div>

      {/* Global Stats */}
      <div className="intel-stats">
        <div className="intel-stat">
          <span className="intel-stat-icon">🌐</span>
          <span className="intel-stat-value">2.4M+</span>
          <span className="intel-stat-label">Negotiations Analyzed</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">💡</span>
          <span className="intel-stat-value">847</span>
          <span className="intel-stat-label">Crowd-Sourced Tips</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">📈</span>
          <span className="intel-stat-value">23%</span>
          <span className="intel-stat-label">Avg Discount Achieved</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">🎯</span>
          <span className="intel-stat-value">78%</span>
          <span className="intel-stat-label">Success Rate</span>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="vendor-intel-grid">
        {Object.entries(VENDOR_INTELLIGENCE).map(([vendor, intel]) => (
          <div key={vendor} className="vendor-intel-card">
            <div className="vendor-header">
              <span className="vendor-icon">{getServiceIcon(vendor)}</span>
              <h3>{vendor}</h3>
              <div className={`generosity-score ${intel.generosityScore >= 70 ? 'high' : intel.generosityScore >= 50 ? 'medium' : 'low'}`}>
                {intel.generosityScore}/100
              </div>
            </div>

            <div className="vendor-metrics">
              <div className="metric">
                <span className="metric-label">Difficulty</span>
                <span className={`metric-value difficulty-${intel.negotiationDifficulty.toLowerCase()}`}>
                  {intel.negotiationDifficulty}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Discount</span>
                <span className="metric-value">{intel.avgDiscount}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Win-Back</span>
                <span className="metric-value">{intel.winBackLikelihood}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Price Floor</span>
                <span className="metric-value">${intel.priceFloor}</span>
              </div>
            </div>

            <div className="best-timing">
              <span className="timing-icon">⏰</span>
              <span>Best: {intel.bestDay}, {intel.bestTime}</span>
            </div>

            <div className="retention-budget">
              <span className="budget-label">Retention Budget:</span>
              <span className={`budget-value ${intel.retentionBudget.includes('High') ? 'high' : 'medium'}`}>
                {intel.retentionBudget}
              </span>
            </div>

            <div className="crowd-tips">
              <h4>💡 What Works</h4>
              <ul>
                {intel.crowdSourcedTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Heat Map Section */}
      <section className="heatmap-section">
        <h3>🗓️ Negotiation Success Heatmap</h3>
        <p>Best days and times to negotiate across all vendors</p>
        <div className="heatmap">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="heatmap-row">
              <span className="day-label">{day}</span>
              {[...Array(12)].map((_, hour) => {
                const intensity = Math.random();
                return (
                  <div
                    key={hour}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: `rgba(76, 175, 80, ${intensity})`,
                    }}
                    title={`${day} ${hour + 8}:00 - ${Math.round(intensity * 100)}% success`}
                  ></div>
                );
              })}
            </div>
          ))}
          <div className="heatmap-legend">
            <span>8AM</span>
            <span>12PM</span>
            <span>4PM</span>
            <span>8PM</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// MULTI-CHANNEL TAB
// ============================================
function MultiChannelTab() {
  return (
    <div className="channels-tab">
      <div className="tab-header">
        <h2>Multi-Channel Tactics</h2>
        <p>Coordinate negotiations across multiple communication channels</p>
      </div>

      <div className="channels-grid">
        <ChannelCard
          icon="💬"
          title="Live Chat Takeover"
          description="AI takes over live chat negotiations in real-time"
          status="active"
          features={['Real-time response', 'Sentiment analysis', 'Auto-escalation']}
        />
        <ChannelCard
          icon="📧"
          title="Email + Chat Pressure"
          description="Simultaneous pressure across email and chat"
          status="active"
          features={['Coordinated timing', 'Message consistency', 'Follow-up automation']}
        />
        <ChannelCard
          icon="📝"
          title="Web Form Automation"
          description="Automatic submission of cancellation/negotiation forms"
          status="ready"
          features={['Form detection', 'Auto-fill', 'Submission loops']}
        />
        <ChannelCard
          icon="📱"
          title="SMS Escalation"
          description="Text message escalation when other channels fail"
          status="ready"
          features={['Opt-in required', 'Smart timing', 'Response tracking']}
        />
        <ChannelCard
          icon="📞"
          title="AI Voice Calls"
          description="Autonomous voice negotiation with natural speech"
          status="beta"
          features={['Speech synthesis', 'Tone adaptation', 'Call recording']}
        />
        <ChannelCard
          icon="🔄"
          title="Callback Manipulation"
          description="Strategic scheduling of callback requests"
          status="ready"
          features={['Optimal timing', 'Rep selection', 'Queue jumping']}
        />
        <ChannelCard
          icon="🎫"
          title="Ticket Reopening"
          description="Automatic reopening of closed support tickets"
          status="ready"
          features={['Persistence loops', 'Escalation triggers', 'Priority boost']}
        />
        <ChannelCard
          icon="🌍"
          title="Regional Support Hopping"
          description="Route to favorable regional support centers"
          status="ready"
          features={['Timezone advantage', 'Policy differences', 'Language options']}
        />
        <ChannelCard
          icon="🗣️"
          title="Language Switching"
          description="Switch languages for negotiation leverage"
          status="ready"
          features={['Multi-lingual AI', 'Cultural adaptation', 'Policy variations']}
        />
        <ChannelCard
          icon="🧪"
          title="Channel A/B Testing"
          description="Test which channel works best per vendor"
          status="active"
          features={['Success tracking', 'Auto-optimization', 'Vendor profiles']}
        />
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, description, status, features }: {
  icon: string;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'beta' | 'disabled';
  features: string[];
}) {
  return (
    <div className={`channel-card ${status}`}>
      <div className="channel-header">
        <span className="channel-icon">{icon}</span>
        <span className={`channel-status ${status}`}>{status}</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <ul className="channel-features">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// SAFETY TAB
// ============================================
function SafetyTab({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="safety-tab">
      <div className="tab-header">
        <h2>Safety & Guardrails</h2>
        <p>Protect your subscriptions with intelligent safety controls</p>
      </div>

      {/* Safety Status */}
      <div className="safety-status">
        <div className="safety-indicator active">
          <span className="safety-icon-large">🛡️</span>
          <span className="safety-text">All Safety Systems Active</span>
        </div>
      </div>

      <div className="safety-grid">
        <SafetyCard
          icon="🔒"
          title="Never Lose Access"
          description="Hard guardrail preventing accidental service loss"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="🧪"
          title="Shadow Sandbox"
          description="Simulate negotiations before executing"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="↩️"
          title="Auto-Rollback"
          description="Instant restoration after accidental cancellation"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="⏱️"
          title="Grace Period Engine"
          description="Exploit cancellation grace periods for safety"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="⚠️"
          title="Access Risk Detection"
          description="Real-time monitoring of access status"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="👤"
          title="Human Checkpoints"
          description="Require approval for high-risk services"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="📉"
          title="Partial Cancellation"
          description="Feature-level rollback instead of full cancel"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="🛡️"
          title="Downgrade Shields"
          description="Temporary protection during negotiations"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="🚨"
          title="Emergency Restore"
          description="One-click restoration after contract violations"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="🔴"
          title="Kill Switch"
          description="Per-subscription emergency stop control"
          enabled={true}
          critical={true}
        />
      </div>

      {/* Protected Services */}
      <section className="protected-services">
        <h3>🔐 Protected Services</h3>
        <div className="service-protection-list">
          {subscriptions.slice(0, 8).map(sub => (
            <div key={sub.id} className="protected-service">
              <span className="service-icon">{getServiceIcon(sub.serviceName)}</span>
              <span className="service-name">{sub.serviceName}</span>
              <span className="protection-level high">Full Protection</span>
              <button className="kill-switch-btn">Kill Switch</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SafetyCard({ icon, title, description, enabled, critical }: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  critical: boolean;
}) {
  return (
    <div className={`safety-card ${enabled ? 'enabled' : 'disabled'} ${critical ? 'critical' : ''}`}>
      <div className="safety-header">
        <span className="safety-card-icon">{icon}</span>
        {critical && <span className="critical-badge">CRITICAL</span>}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="safety-toggle">
        <span className={`toggle ${enabled ? 'on' : 'off'}`}></span>
        <span>{enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
    </div>
  );
}

// ============================================
// LEGAL TAB
// ============================================
function LegalTab() {
  return (
    <div className="legal-tab">
      <div className="tab-header">
        <h2>Legal & Compliance Tools</h2>
        <p>AI-powered legal protection and consumer rights enforcement</p>
      </div>

      <div className="legal-grid">
        <LegalCard
          icon="📜"
          title="AI ToS Reader"
          description="Automatically analyzes Terms of Service for hidden traps"
          features={['Plain language translation', 'Risk highlighting', 'Comparison alerts']}
        />
        <LegalCard
          icon="🚫"
          title="Illegal Price Hike Detection"
          description="Identifies price increases that violate regulations"
          features={['Regional law database', 'Auto-alert system', 'Documentation']}
        />
        <LegalCard
          icon="⚖️"
          title="Consumer Protection Citations"
          description="Auto-cite relevant consumer protection laws"
          features={['Multi-jurisdiction', 'Legal templates', 'Authority references']}
        />
        <LegalCard
          icon="🌍"
          title="Regional Legal Scripts"
          description="Location-specific legal pressure tactics"
          features={['GDPR (EU)', 'CCPA (California)', 'ACCC (Australia)']}
        />
        <LegalCard
          icon="🔍"
          title="Billing Error Forensics"
          description="Detect and document billing discrepancies"
          features={['Pattern analysis', 'Historical comparison', 'Evidence collection']}
        />
        <LegalCard
          icon="💸"
          title="Refund Automation"
          description="Automated refund demand generation"
          features={['Template generation', 'Escalation paths', 'Success tracking']}
        />
        <LegalCard
          icon="🕵️"
          title="Trial Abuse Detection"
          description="Identify vendor trial manipulation tactics"
          features={['Auto-renewal traps', 'Hidden charges', 'Conversion tricks']}
        />
        <LegalCard
          icon="🔄"
          title="Contract Trap Detection"
          description="Flag renewal and commitment traps"
          features={['Auto-renewal alerts', 'Lock-in warnings', 'Exit cost analysis']}
        />
        <LegalCard
          icon="📋"
          title="Dispute Playbooks"
          description="Step-by-step escalation strategies"
          features={['BBB complaints', 'FTC reports', 'Chargebacks']}
        />
        <LegalCard
          icon="💳"
          title="Chargeback Readiness"
          description="Prepare documentation for payment disputes"
          features={['Evidence bundling', 'Timeline creation', 'Bank templates']}
        />
      </div>
    </div>
  );
}

function LegalCard({ icon, title, description, features }: {
  icon: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="legal-card">
      <div className="legal-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <ul className="legal-features">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// PRICE INTELLIGENCE TAB
// ============================================
function PriceIntelligenceTab({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="pricing-tab">
      <div className="tab-header">
        <h2>Price Intelligence Engine</h2>
        <p>Uncover hidden pricing disparities and maximize savings</p>
      </div>

      {/* Price Alerts */}
      <div className="price-alerts">
        <div className="alert warning">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text"><strong>3 subscriptions</strong> have new-user pricing lower than your current rate</span>
          <button className="alert-action">Investigate</button>
        </div>
        <div className="alert info">
          <span className="alert-icon">💡</span>
          <span className="alert-text"><strong>LinkedIn Premium</strong> has regional pricing 40% lower in India</span>
          <button className="alert-action">View Options</button>
        </div>
      </div>

      <div className="pricing-grid">
        <PricingCard
          icon="👤"
          title="New vs Existing Price"
          description="Detect when new users get better deals"
          status="3 disparities found"
          statusType="warning"
        />
        <PricingCard
          icon="🌍"
          title="Geo-Pricing Arbitrage"
          description="Find lower prices in different regions"
          status="5 opportunities"
          statusType="success"
        />
        <PricingCard
          icon="🎓"
          title="Eligibility Probing"
          description="Check student, military, nonprofit discounts"
          status="2 eligible"
          statusType="success"
        />
        <PricingCard
          icon="😤"
          title="Loyalty Penalty Detection"
          description="Identify when loyalty costs you more"
          status="1 penalty found"
          statusType="warning"
        />
        <PricingCard
          icon="🔎"
          title="Competitor Price Crawler"
          description="Shadow pricing from alternative services"
          status="Active"
          statusType="active"
        />
        <PricingCard
          icon="🤝"
          title="Forced Price Matching"
          description="Leverage competitor prices in negotiation"
          status="Ready"
          statusType="ready"
        />
        <PricingCard
          icon="📈"
          title="Inflation Fairness Score"
          description="Track price increases vs inflation"
          status="2 unfair"
          statusType="warning"
        />
        <PricingCard
          icon="❓"
          title="Why Am I Paying More?"
          description="AI agent that demands pricing justification"
          status="Ready"
          statusType="ready"
        />
        <PricingCard
          icon="⏪"
          title="Retroactive Credits"
          description="Claim credits for past overcharges"
          status="$47.50 available"
          statusType="success"
        />
        <PricingCard
          icon="📦"
          title="Bundle Breaking"
          description="Optimize by unbundling services"
          status="1 opportunity"
          statusType="success"
        />
      </div>

      {/* Price Comparison Table */}
      <section className="price-comparison">
        <h3>💰 Your Prices vs Market</h3>
        <div className="comparison-table">
          <div className="comparison-header">
            <span>Service</span>
            <span>Your Price</span>
            <span>New User</span>
            <span>Best Available</span>
            <span>Status</span>
          </div>
          {subscriptions.slice(0, 6).map(sub => {
            const newUserPrice = sub.currentPrice * (0.7 + Math.random() * 0.2);
            const bestPrice = sub.currentPrice * (0.5 + Math.random() * 0.3);
            const isOverpaying = sub.currentPrice > newUserPrice;
            return (
              <div key={sub.id} className={`comparison-row ${isOverpaying ? 'overpaying' : ''}`}>
                <span className="service-name">
                  {getServiceIcon(sub.serviceName)} {sub.serviceName}
                </span>
                <span className="your-price">${sub.currentPrice.toFixed(2)}</span>
                <span className="new-user-price">${newUserPrice.toFixed(2)}</span>
                <span className="best-price">${bestPrice.toFixed(2)}</span>
                <span className={`price-status ${isOverpaying ? 'warning' : 'ok'}`}>
                  {isOverpaying ? '⚠️ Overpaying' : '✓ Fair'}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PricingCard({ icon, title, description, status, statusType }: {
  icon: string;
  title: string;
  description: string;
  status: string;
  statusType: 'success' | 'warning' | 'active' | 'ready';
}) {
  return (
    <div className="pricing-card">
      <div className="pricing-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className={`pricing-status ${statusType}`}>{status}</div>
    </div>
  );
}

// ============================================
// COMMUNITY TAB
// ============================================
function CommunityTab() {
  return (
    <div className="community-tab">
      <div className="tab-header">
        <h2>Community & Social</h2>
        <p>Leverage collective intelligence for better negotiations</p>
      </div>

      {/* Leaderboard */}
      <section className="leaderboard-section">
        <h3>🏆 Top Negotiators This Month</h3>
        <div className="leaderboard">
          <div className="leaderboard-item rank-1">
            <span className="rank">1</span>
            <span className="avatar">👤</span>
            <span className="name">SaverPro***</span>
            <span className="savings">$847 saved</span>
          </div>
          <div className="leaderboard-item rank-2">
            <span className="rank">2</span>
            <span className="avatar">👤</span>
            <span className="name">Budget***</span>
            <span className="savings">$623 saved</span>
          </div>
          <div className="leaderboard-item rank-3">
            <span className="rank">3</span>
            <span className="avatar">👤</span>
            <span className="name">Deal***</span>
            <span className="savings">$512 saved</span>
          </div>
        </div>
      </section>

      <div className="community-grid">
        <CommunityCard
          icon="🏆"
          title="Success Leaderboard"
          description="Anonymous ranking of top negotiators"
          metric="12,847 active users"
        />
        <CommunityCard
          icon="📊"
          title="Vendor Cooperation Score"
          description="Community-rated vendor negotiability"
          metric="156 vendors rated"
        />
        <CommunityCard
          icon="📈"
          title="Aggregate Churn Pressure"
          description="Collective bargaining through churn data"
          metric="Coming soon"
        />
        <CommunityCard
          icon="👥"
          title="Collective Bargaining"
          description="Group negotiations for maximum leverage"
          metric="Beta access"
        />
        <CommunityCard
          icon="🏅"
          title="Vendor Badges"
          description="'This vendor caves 42% of the time'"
          metric="23 badges available"
        />
        <CommunityCard
          icon="🧾"
          title="Savings Receipts"
          description="Shareable proof of your wins"
          metric="Share to social"
        />
        <CommunityCard
          icon="❤️"
          title="Subscription Health Score"
          description="Overall subscription portfolio health"
          metric="Your score: 87/100"
        />
        <CommunityCard
          icon="⏸️"
          title="Auto-Pause Unused"
          description="Automatically pause unused subscriptions"
          metric="2 candidates found"
        />
        <CommunityCard
          icon="⏰"
          title="Cancel Before Charge"
          description="Predictive cancellation before billing"
          metric="3 upcoming"
        />
        <CommunityCard
          icon="📉"
          title="Break-Even Optimizer"
          description="Calculate optimal subscription timing"
          metric="Active"
        />
      </div>
    </div>
  );
}

function CommunityCard({ icon, title, description, metric }: {
  icon: string;
  title: string;
  description: string;
  metric: string;
}) {
  return (
    <div className="community-card">
      <div className="community-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="community-metric">{metric}</div>
    </div>
  );
}

// ============================================
// ANTI-DARK PATTERN TAB
// ============================================
function AntiDarkPatternTab() {
  return (
    <div className="protection-tab">
      <div className="tab-header">
        <h2>Anti-Dark Pattern Shield</h2>
        <p>Protect yourself from manipulative subscription tactics</p>
      </div>

      {/* Shield Status */}
      <div className="shield-status">
        <div className="shield-visual">
          <span className="shield-icon-xl">🛡️</span>
          <div className="shield-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        </div>
        <div className="shield-info">
          <h3>Shield Active</h3>
          <p>Protecting against 47 known dark pattern types</p>
          <div className="blocked-count">
            <span className="count">23</span>
            <span className="label">Dark patterns blocked this month</span>
          </div>
        </div>
      </div>

      <div className="protection-grid">
        <ProtectionCard
          icon="🚨"
          title="Fake Urgency Detection"
          description="Identifies artificial scarcity and false deadlines"
          blocked={8}
        />
        <ProtectionCard
          icon="😢"
          title="Emotional Manipulation"
          description="Detects guilt-tripping and fear-based language"
          blocked={5}
        />
        <ProtectionCard
          icon="🏷️"
          title="Dark Pattern Classification"
          description="Categorizes and labels manipulation tactics"
          blocked={12}
        />
        <ProtectionCard
          icon="❄️"
          title="Cooling-Off Enforcer"
          description="Ensures mandatory waiting periods are respected"
          blocked={3}
        />
        <ProtectionCard
          icon="😈"
          title="Guilt-Trip Neutralizer"
          description="Blocks emotional manipulation in cancellation flows"
          blocked={7}
        />
        <ProtectionCard
          icon="😱"
          title="Scare Tactic Deflector"
          description="Neutralizes retention fear tactics"
          blocked={4}
        />
        <ProtectionCard
          icon="🚫"
          title="Do Nothing Pressure"
          description="Resists pressure to maintain status quo"
          blocked={6}
        />
        <ProtectionCard
          icon="⚖️"
          title="Benefits vs Cost Analyzer"
          description="Objective reframing of value propositions"
          blocked={2}
        />
        <ProtectionCard
          icon="💚"
          title="Subscription Shame Removal"
          description="Supportive UI for guilt-free decisions"
          blocked={0}
        />
        <ProtectionCard
          icon="📋"
          title="Vendor Report Card"
          description="Accountability scores for vendor behavior"
          blocked={0}
        />
      </div>

      {/* Recent Blocks */}
      <section className="recent-blocks">
        <h3>🚫 Recently Blocked Dark Patterns</h3>
        <div className="blocks-list">
          <div className="block-item">
            <span className="block-icon">🚨</span>
            <div className="block-details">
              <strong>Netflix</strong>: "Offer expires in 2 hours!" - Fake urgency detected
              <span className="block-time">2 hours ago</span>
            </div>
          </div>
          <div className="block-item">
            <span className="block-icon">😢</span>
            <div className="block-details">
              <strong>Spotify</strong>: "We'll miss you..." - Emotional manipulation blocked
              <span className="block-time">5 hours ago</span>
            </div>
          </div>
          <div className="block-item">
            <span className="block-icon">😱</span>
            <div className="block-details">
              <strong>Adobe</strong>: "You'll lose all your work!" - Scare tactic neutralized
              <span className="block-time">1 day ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProtectionCard({ icon, title, description, blocked }: {
  icon: string;
  title: string;
  description: string;
  blocked: number;
}) {
  return (
    <div className="protection-card">
      <div className="protection-header">
        <span className="protection-icon">{icon}</span>
        {blocked > 0 && <span className="blocked-badge">{blocked} blocked</span>}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

// ============================================
// NEGOTIATION CHAT MODAL
// ============================================
function NegotiationChat({ negotiation, onClose }: {
  negotiation: NegotiationState;
  onClose: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation.messages]);

  const agent = negotiation.selectedAgent ? AI_AGENTS[negotiation.selectedAgent] : AI_AGENTS.polite;

  return (
    <div className="negotiation-overlay">
      <div className="negotiation-modal advanced">
        <div className="chat-header">
          <div className="chat-title">
            <span className="chat-icon">{agent.icon}</span>
            <div>
              <h3>Negotiating with {negotiation.subscription.serviceName}</h3>
              <p>{agent.name} - {agent.style}</p>
            </div>
          </div>
          <div className="negotiation-progress">
            <span>Turn {negotiation.currentTurn}/{negotiation.totalTurns}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(negotiation.currentTurn / negotiation.totalTurns) * 100}%` }}
              ></div>
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
                {msg.role === 'ai' ? agent.icon : '👤'}
              </div>
              <div className="message-content">
                <span className="message-sender">
                  {msg.role === 'ai' ? agent.name : `${negotiation.subscription.serviceName} Rep`}
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

        {negotiation.status === 'success' && negotiation.discount && (
          <div className="negotiation-result success">
            <div className="result-icon">🎉</div>
            <h4>Negotiation Successful!</h4>
            <p className="discount-amount">{negotiation.discount}% discount secured</p>
            <p className="savings-detail">
              You'll save ${((negotiation.subscription.currentPrice * negotiation.discount) / 100).toFixed(2)}/month
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

// ============================================
// SUBSCRIPTION CARD
// ============================================
function SubscriptionCard({ subscription, discount, onNegotiate, isNegotiating }: {
  subscription: Subscription;
  discount?: number;
  onNegotiate: () => void;
  isNegotiating: boolean;
}) {
  const hasDiscount = discount && discount > 0;
  const discountedPrice = hasDiscount
    ? subscription.currentPrice * (1 - discount / 100)
    : subscription.currentPrice;

  const vendorIntel = VENDOR_INTELLIGENCE[subscription.serviceName];

  return (
    <div className={`subscription-card ${hasDiscount ? 'has-discount' : ''}`}>
      <div className="subscription-icon">
        {getServiceIcon(subscription.serviceName)}
      </div>

      <div className="subscription-info">
        <h3>{subscription.serviceName}</h3>
        <span className="subscription-category">{subscription.category}</span>

        {vendorIntel && (
          <div className="vendor-quick-intel">
            <span className={`generosity-badge ${vendorIntel.generosityScore >= 70 ? 'high' : vendorIntel.generosityScore >= 50 ? 'medium' : 'low'}`}>
              {vendorIntel.generosityScore}% generous
            </span>
            <span className="avg-discount">Avg: {vendorIntel.avgDiscount}% off</span>
          </div>
        )}

        <div className="pricing">
          {hasDiscount ? (
            <>
              <span className="original-price">${subscription.currentPrice.toFixed(2)}</span>
              <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
              <span className="discount-badge">-{discount}%</span>
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
          <div className="negotiating-badge">
            <div className="spinner small"></div>
            <span>Negotiating...</span>
          </div>
        ) : hasDiscount ? (
          <div className="success-badge">✓ Discount Applied</div>
        ) : subscription.negotiationEligible ? (
          <button className="btn primary negotiate-btn" onClick={onNegotiate}>
            🤖 AI Negotiate
          </button>
        ) : (
          <span className="not-eligible">Not eligible yet</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    Netflix: '🎬',
    Spotify: '🎵',
    'Adobe Creative Cloud': '🎨',
    'Amazon Prime': '📦',
    Hulu: '📺',
    'Disney+': '🏰',
    'HBO Max': '🎭',
    'YouTube Premium': '▶️',
    'Microsoft 365': '💼',
    Dropbox: '📁',
    'Apple Music': '🍎',
    NordVPN: '🔒',
    Notion: '📝',
    'Slack Pro': '💬',
    'Grammarly Premium': '✍️',
    'Paramount+': '⛰️',
    'Peacock Premium': '🦚',
    'LinkedIn Premium': '👔',
    'Canva Pro': '🎨',
    'ChatGPT Plus': '🤖',
    'Duolingo Plus': '🦉',
    'New York Times': '📰',
    Peloton: '🚴',
    Masterclass: '🎓',
    Audible: '🎧',
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
