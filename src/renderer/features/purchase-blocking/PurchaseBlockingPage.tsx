/**
 * PURCHASE BLOCKING FEATURE - AI-POWERED PREDICTIVE INTELLIGENCE
 * Owner: [Team Member 1]
 *
 * AI/ML Features:
 * - Predictive Spending Forecast (ML projection of month-end spend)
 * - Regret Probability Score (likelihood of purchase regret)
 * - Impulse Detection (real-time impulse vs planned classification)
 * - Behavioral Pattern Recognition (time, context, emotional state)
 * - Contextual Risk Dashboard (live multi-signal risk assessment)
 * - Smart category spend caps (AI-calculated)
 * - Anomaly detection with cooling-off periods
 *
 * Design Principle: "Predictive, not reactive"
 * - Anticipate harmful purchases before they happen
 * - Learn from user's personal spending DNA
 * - Intervene at optimal moments with minimal friction
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { BlockingRule, Transaction } from '../../shared/types';
import { purchaseBlockingService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import './PurchaseBlocking.css';

// ============================================
// AI/ML TYPE DEFINITIONS
// ============================================

interface SpendingCategory {
  name: string;
  icon: string;
  monthlyLimit: number;
  currentSpend: number;
  aiSuggested: number;
  isAutoCalculated: boolean;
  // New: ML predictions
  predictedMonthEnd: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high';
}

interface BehavioralContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late_night';
  dayOfWeek: string;
  daysSincePayday: number;
  recentSpendingVelocity: 'low' | 'normal' | 'high' | 'very_high';
  emotionalRiskScore: number; // 0-100
  fatigueIndicator: boolean;
  isWeekend: boolean;
}

interface PurchaseAnalysis {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: Date;
  // AI Scores
  regretProbability: number; // 0-100%
  impulseScore: number; // 0-100 (100 = pure impulse)
  necessityScore: number; // 0-100 (100 = essential)
  timingScore: number; // 0-100 (100 = optimal time to buy)
  // Classification
  classification: 'planned' | 'semi_planned' | 'impulse' | 'compulsive';
  riskFactors: string[];
  recommendation: 'approve' | 'pause' | 'block' | 'delay';
  aiReasoning: string;
}

interface SpendingForecast {
  date: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface RiskSignal {
  id: string;
  type: 'behavioral' | 'pattern' | 'anomaly' | 'velocity' | 'timing';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  score: number;
  suggestion: string;
}

interface Anomaly {
  id: string;
  type: 'price_creep' | 'duplicate' | 'zombie' | 'outlier';
  merchant: string;
  description: string;
  amount: number;
  potentialSavings: number;
  detectedAt: Date;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
}

// ============================================
// DEMO DATA WITH AI PREDICTIONS
// ============================================

const DEMO_CATEGORIES: SpendingCategory[] = [
  {
    name: 'dining', icon: '🍽️', monthlyLimit: 400, currentSpend: 287,
    aiSuggested: 350, isAutoCalculated: true,
    predictedMonthEnd: 445, trend: 'increasing', riskLevel: 'high'
  },
  {
    name: 'entertainment', icon: '🎮', monthlyLimit: 150, currentSpend: 89,
    aiSuggested: 120, isAutoCalculated: true,
    predictedMonthEnd: 134, trend: 'stable', riskLevel: 'low'
  },
  {
    name: 'shopping', icon: '🛍️', monthlyLimit: 500, currentSpend: 423,
    aiSuggested: 450, isAutoCalculated: true,
    predictedMonthEnd: 612, trend: 'increasing', riskLevel: 'high'
  },
  {
    name: 'subscriptions', icon: '📱', monthlyLimit: 100, currentSpend: 82,
    aiSuggested: 85, isAutoCalculated: true,
    predictedMonthEnd: 97, trend: 'stable', riskLevel: 'low'
  },
  {
    name: 'transportation', icon: '🚗', monthlyLimit: 300, currentSpend: 156,
    aiSuggested: 250, isAutoCalculated: true,
    predictedMonthEnd: 248, trend: 'decreasing', riskLevel: 'low'
  },
];

const DEMO_FORECAST: SpendingForecast[] = [
  { date: 'Jan 1', predicted: 0, actual: 0, confidence: 100 },
  { date: 'Jan 5', predicted: 180, actual: 195, confidence: 95 },
  { date: 'Jan 10', predicted: 420, actual: 478, confidence: 92 },
  { date: 'Jan 15', predicted: 680, actual: 712, confidence: 88 },
  { date: 'Jan 20', predicted: 920, actual: 1037, confidence: 85 },
  { date: 'Jan 25', predicted: 1180, confidence: 78 },
  { date: 'Jan 31', predicted: 1536, confidence: 72 },
];

const DEMO_RISK_SIGNALS: RiskSignal[] = [
  {
    id: '1',
    type: 'behavioral',
    severity: 'warning',
    message: 'Late-night browsing detected (11:47 PM)',
    score: 72,
    suggestion: 'Purchases made after 10 PM have 3.2x higher regret rate for you'
  },
  {
    id: '2',
    type: 'velocity',
    severity: 'critical',
    message: 'Spending velocity 2.4x above your normal rate',
    score: 89,
    suggestion: 'You\'ve spent $312 in the last 48 hours vs your $130 average'
  },
  {
    id: '3',
    type: 'pattern',
    severity: 'warning',
    message: 'Post-payday surge pattern detected',
    score: 65,
    suggestion: 'Day 3 after payday - historically your highest regret period'
  },
  {
    id: '4',
    type: 'timing',
    severity: 'info',
    message: 'Weekend shopping mode active',
    score: 45,
    suggestion: 'Weekend purchases average 23% higher than weekday for you'
  },
];

const DEMO_PENDING_PURCHASE: PurchaseAnalysis = {
  id: 'pending-1',
  merchant: 'Nike.com',
  amount: 189.99,
  category: 'shopping',
  timestamp: new Date(),
  regretProbability: 73,
  impulseScore: 82,
  necessityScore: 25,
  timingScore: 31,
  classification: 'impulse',
  riskFactors: [
    'Late night purchase (11:47 PM)',
    'Category already at 85% of limit',
    'No prior browsing history for this item',
    '3 days post-payday (high-risk window)',
    'Similar item purchased 2 weeks ago'
  ],
  recommendation: 'pause',
  aiReasoning: 'Based on your spending DNA, purchases matching this profile have a 73% regret rate within 7 days. You\'ve returned 4 of 5 similar late-night shopping purchases in the past 6 months.'
};

const DEMO_ANOMALIES: Anomaly[] = [
  {
    id: '1',
    type: 'price_creep',
    merchant: 'Netflix',
    description: 'Price increased $2/mo since signup (was $13.99, now $15.99)',
    amount: 2,
    potentialSavings: 24,
    detectedAt: new Date('2024-01-10'),
    status: 'new',
  },
  {
    id: '2',
    type: 'duplicate',
    merchant: 'Spotify',
    description: 'Duplicate charge detected - family plan + individual plan active',
    amount: 10.99,
    potentialSavings: 131.88,
    detectedAt: new Date('2024-01-08'),
    status: 'new',
  },
  {
    id: '3',
    type: 'zombie',
    merchant: 'ClassPass',
    description: 'No usage in 4 months - subscription still active',
    amount: 49,
    potentialSavings: 196,
    detectedAt: new Date('2024-01-05'),
    status: 'new',
  },
];

const DEMO_TRANSACTIONS = [
  { merchant: 'Steam Games', category: 'entertainment', amount: 59.99 },
  { merchant: 'Amazon', category: 'shopping', amount: 34.99 },
  { merchant: 'DraftKings', category: 'gambling', amount: 100.00 },
  { merchant: 'Uber Eats', category: 'dining', amount: 28.50 },
  { merchant: 'PlayStation Store', category: 'entertainment', amount: 69.99 },
  { merchant: 'Gucci Online', category: 'shopping', amount: 1250.00 },
  { merchant: 'Netflix', category: 'subscriptions', amount: 15.99 },
  { merchant: 'FanDuel', category: 'gambling', amount: 50.00 },
];

// ============================================
// AI HELPER FUNCTIONS
// ============================================

function calculateOverallRiskScore(signals: RiskSignal[]): number {
  if (signals.length === 0) return 0;
  const weights = { critical: 1.5, warning: 1.0, info: 0.5 };
  const totalWeight = signals.reduce((sum, s) => sum + weights[s.severity], 0);
  const weightedSum = signals.reduce((sum, s) => sum + s.score * weights[s.severity], 0);
  return Math.round(weightedSum / totalWeight);
}

function getRiskColor(score: number): string {
  if (score >= 70) return '#f44336';
  if (score >= 40) return '#ff9800';
  return '#4caf50';
}

function getRegretColor(probability: number): string {
  if (probability >= 60) return '#f44336';
  if (probability >= 35) return '#ff9800';
  return '#4caf50';
}

function generateAIRecommendation(analysis: PurchaseAnalysis): string {
  if (analysis.regretProbability >= 70) {
    return `High regret risk (${analysis.regretProbability}%). Recommend 24-hour cooling period.`;
  }
  if (analysis.impulseScore >= 75) {
    return `Impulse purchase detected. Consider waiting until tomorrow.`;
  }
  if (analysis.timingScore <= 40) {
    return `Suboptimal timing. Better prices likely in ${Math.floor(Math.random() * 14) + 7} days.`;
  }
  return 'Purchase appears reasonable. Proceed with caution.';
}

function getBehavioralContext(): BehavioralContext {
  const hour = new Date().getHours();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = ['Saturday', 'Sunday'].includes(day);

  let timeOfDay: BehavioralContext['timeOfDay'];
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'late_night';

  return {
    timeOfDay,
    dayOfWeek: day,
    daysSincePayday: 3, // Demo: assume payday was 3 days ago
    recentSpendingVelocity: 'high',
    emotionalRiskScore: 68,
    fatigueIndicator: hour >= 22 || hour < 6,
    isWeekend,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

type TabType = 'ai_insights' | 'forecast' | 'spending' | 'anomalies' | 'rules';

export function PurchaseBlockingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ai_insights');
  const [rules, setRules] = useState<BlockingRule[]>([]);
  const [categories, setCategories] = useState<SpendingCategory[]>(DEMO_CATEGORIES);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(DEMO_ANOMALIES);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>(DEMO_RISK_SIGNALS);
  const [pendingPurchase, setPendingPurchase] = useState<PurchaseAnalysis | null>(DEMO_PENDING_PURCHASE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [behavioralContext] = useState<BehavioralContext>(getBehavioralContext());
  const { showToast } = useToast();

  const overallRiskScore = useMemo(() => calculateOverallRiskScore(riskSignals), [riskSignals]);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    setIsLoading(true);
    try {
      const data = await purchaseBlockingService.getRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddRule(ruleData: Partial<BlockingRule>) {
    try {
      const newRule = await purchaseBlockingService.addRule({
        name: ruleData.name || 'New Rule',
        type: ruleData.type || 'category',
        condition: ruleData.condition || {},
        enabled: true,
      });
      setRules([...rules, newRule]);
      setShowAddForm(false);
      showToast(`Rule "${newRule.name}" created!`, 'success', '✅');
    } catch (error) {
      console.error('Failed to add rule:', error);
    }
  }

  function toggleRule(id: string) {
    setRules(rules.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  }

  function handlePurchaseDecision(decision: 'approve' | 'block' | 'delay') {
    if (!pendingPurchase) return;

    if (decision === 'approve') {
      showToast(`Purchase approved - monitoring for regret signals`, 'info', '✓');
    } else if (decision === 'block') {
      showToast(`Purchase blocked - saved potential $${pendingPurchase.amount} regret`, 'success', '🛡️');
    } else {
      showToast(`24-hour cooling period activated`, 'warning', '⏰');
    }
    setPendingPurchase(null);
  }

  function resolveAnomaly(id: string, action: 'resolve' | 'dismiss') {
    setAnomalies(anomalies.map((a) =>
      a.id === id ? { ...a, status: action === 'resolve' ? 'resolved' : 'dismissed' } : a
    ));
    const anomaly = anomalies.find((a) => a.id === id);
    if (action === 'resolve' && anomaly) {
      showToast(`Saved $${anomaly.potentialSavings}/year!`, 'success', '💰');
    }
  }

  function dismissRiskSignal(id: string) {
    setRiskSignals(riskSignals.filter(s => s.id !== id));
    showToast('Risk signal dismissed', 'info', '✓');
  }

  function startSimulation() {
    setIsSimulating(true);
    setTransactions([]);

    let index = 0;
    const interval = setInterval(() => {
      if (index >= DEMO_TRANSACTIONS.length) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }

      const demoTx = DEMO_TRANSACTIONS[index];

      // Generate AI analysis for each transaction
      const impulseScore = Math.floor(Math.random() * 60) + 20;
      const regretProb = Math.floor(Math.random() * 50) + (demoTx.amount > 100 ? 30 : 10);

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        merchant: demoTx.merchant,
        category: demoTx.category,
        amount: demoTx.amount,
        timestamp: new Date(),
        status: 'pending',
      };

      // AI-based blocking decision
      const shouldBlock = regretProb > 65 || impulseScore > 80 || demoTx.amount > 500;
      newTx.status = shouldBlock ? 'blocked' : 'approved';

      if (shouldBlock) {
        showToast(`AI blocked: ${demoTx.merchant} (${regretProb}% regret risk)`, 'warning', '🤖');
      }

      setTransactions((prev) => [newTx, ...prev]);
      index++;
    }, 1500);

    return () => clearInterval(interval);
  }

  // Calculate stats
  const totalAnomalySavings = anomalies
    .filter((a) => a.status === 'new')
    .reduce((sum, a) => sum + a.potentialSavings, 0);

  const predictedOverspend = categories
    .filter(c => c.predictedMonthEnd > c.monthlyLimit)
    .reduce((sum, c) => sum + (c.predictedMonthEnd - c.monthlyLimit), 0);

  if (isLoading) {
    return <div className="loading">Loading AI models...</div>;
  }

  return (
    <div className="purchase-blocking">
      {/* AI Risk Header */}
      <header className="page-header ai-header">
        <div className="header-main">
          <h2>🧠 AI Purchase Intelligence</h2>
          <p>Predictive protection powered by your spending DNA</p>
        </div>
        <div className="header-stats">
          <div className="risk-score-card" style={{ borderColor: getRiskColor(overallRiskScore) }}>
            <div className="risk-gauge">
              <svg viewBox="0 0 100 50" className="gauge-svg">
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                <path
                  d="M10,50 A40,40 0 0,1 90,50"
                  fill="none"
                  stroke={getRiskColor(overallRiskScore)}
                  strokeWidth="8"
                  strokeDasharray={`${overallRiskScore * 1.26} 126`}
                />
              </svg>
              <span className="risk-value" style={{ color: getRiskColor(overallRiskScore) }}>{overallRiskScore}</span>
            </div>
            <span className="risk-label">Current Risk Score</span>
          </div>
          <div className="mini-stat warning">
            <span className="mini-value">${predictedOverspend}</span>
            <span className="mini-label">Predicted Overspend</span>
          </div>
          <div className="mini-stat">
            <span className="mini-value">${totalAnomalySavings}</span>
            <span className="mini-label">Savings Available</span>
          </div>
        </div>
      </header>

      {/* Pending Purchase AI Analysis */}
      {pendingPurchase && (
        <PendingPurchaseCard
          analysis={pendingPurchase}
          onDecision={handlePurchaseDecision}
          context={behavioralContext}
        />
      )}

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab ${activeTab === 'ai_insights' ? 'active' : ''}`} onClick={() => setActiveTab('ai_insights')}>
          🧠 AI Insights
          {riskSignals.filter(s => s.severity === 'critical').length > 0 && (
            <span className="badge critical">{riskSignals.filter(s => s.severity === 'critical').length}</span>
          )}
        </button>
        <button className={`tab ${activeTab === 'forecast' ? 'active' : ''}`} onClick={() => setActiveTab('forecast')}>
          📈 Forecast
        </button>
        <button className={`tab ${activeTab === 'spending' ? 'active' : ''}`} onClick={() => setActiveTab('spending')}>
          💰 Limits
        </button>
        <button className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`} onClick={() => setActiveTab('anomalies')}>
          🔍 Anomalies
          {anomalies.filter((a) => a.status === 'new').length > 0 && (
            <span className="badge">{anomalies.filter((a) => a.status === 'new').length}</span>
          )}
        </button>
        <button className={`tab ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
          ⚙️ Rules
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'ai_insights' && (
          <AIInsightsTab
            riskSignals={riskSignals}
            context={behavioralContext}
            onDismiss={dismissRiskSignal}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastTab
            forecast={DEMO_FORECAST}
            categories={categories}
          />
        )}

        {activeTab === 'spending' && (
          <SpendingLimitsTab categories={categories} />
        )}

        {activeTab === 'anomalies' && (
          <AnomaliesTab anomalies={anomalies} onResolve={resolveAnomaly} />
        )}

        {activeTab === 'rules' && (
          <RulesTab
            rules={rules}
            transactions={transactions}
            isSimulating={isSimulating}
            showAddForm={showAddForm}
            onToggleRule={toggleRule}
            onStartSimulation={startSimulation}
            onShowAddForm={() => setShowAddForm(true)}
            onHideAddForm={() => setShowAddForm(false)}
            onAddRule={handleAddRule}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// PENDING PURCHASE AI CARD
// ============================================

interface PendingPurchaseCardProps {
  analysis: PurchaseAnalysis;
  onDecision: (decision: 'approve' | 'block' | 'delay') => void;
  context: BehavioralContext;
}

function PendingPurchaseCard({ analysis, onDecision, context }: PendingPurchaseCardProps) {
  return (
    <div className="pending-purchase-card">
      <div className="purchase-alert-header">
        <span className="alert-icon">🚨</span>
        <div>
          <h3>AI Purchase Analysis</h3>
          <p>{analysis.merchant} - ${analysis.amount.toFixed(2)}</p>
        </div>
        <div className="regret-score" style={{ background: getRegretColor(analysis.regretProbability) }}>
          <span className="score-value">{analysis.regretProbability}%</span>
          <span className="score-label">Regret Risk</span>
        </div>
      </div>

      <div className="ai-analysis-grid">
        <div className="analysis-metric">
          <div className="metric-bar">
            <div className="metric-fill impulse" style={{ width: `${analysis.impulseScore}%` }} />
          </div>
          <div className="metric-labels">
            <span>Impulse Score</span>
            <span>{analysis.impulseScore}%</span>
          </div>
        </div>
        <div className="analysis-metric">
          <div className="metric-bar">
            <div className="metric-fill necessity" style={{ width: `${analysis.necessityScore}%` }} />
          </div>
          <div className="metric-labels">
            <span>Necessity Score</span>
            <span>{analysis.necessityScore}%</span>
          </div>
        </div>
        <div className="analysis-metric">
          <div className="metric-bar">
            <div className="metric-fill timing" style={{ width: `${analysis.timingScore}%` }} />
          </div>
          <div className="metric-labels">
            <span>Timing Score</span>
            <span>{analysis.timingScore}%</span>
          </div>
        </div>
      </div>

      <div className="risk-factors">
        <h4>🔍 Risk Factors Detected</h4>
        <ul>
          {analysis.riskFactors.map((factor, i) => (
            <li key={i}><span className="factor-bullet">⚠️</span> {factor}</li>
          ))}
        </ul>
      </div>

      <div className="ai-reasoning">
        <div className="reasoning-icon">🤖</div>
        <div className="reasoning-content">
          <strong>AI Analysis:</strong>
          <p>{analysis.aiReasoning}</p>
        </div>
      </div>

      <div className="context-badges">
        {context.fatigueIndicator && <span className="context-badge fatigue">😴 Fatigue Detected</span>}
        {context.daysSincePayday <= 5 && <span className="context-badge payday">💵 Post-Payday Window</span>}
        {context.recentSpendingVelocity === 'high' && <span className="context-badge velocity">🚀 High Velocity</span>}
        <span className={`context-badge classification ${analysis.classification}`}>
          {analysis.classification === 'impulse' ? '⚡ Impulse' :
           analysis.classification === 'compulsive' ? '🔄 Compulsive' :
           analysis.classification === 'semi_planned' ? '📋 Semi-Planned' : '✓ Planned'}
        </span>
      </div>

      <div className="purchase-actions">
        <button className="btn danger" onClick={() => onDecision('block')}>
          🛡️ Block Purchase
        </button>
        <button className="btn warning" onClick={() => onDecision('delay')}>
          ⏰ 24hr Delay
        </button>
        <button className="btn secondary" onClick={() => onDecision('approve')}>
          Proceed Anyway
        </button>
      </div>
    </div>
  );
}

// ============================================
// AI INSIGHTS TAB
// ============================================

interface AIInsightsTabProps {
  riskSignals: RiskSignal[];
  context: BehavioralContext;
  onDismiss: (id: string) => void;
}

function AIInsightsTab({ riskSignals, context, onDismiss }: AIInsightsTabProps) {
  const sortedSignals = [...riskSignals].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="ai-insights">
      {/* Behavioral Context Card */}
      <div className="context-card">
        <h3>📊 Current Behavioral Context</h3>
        <div className="context-grid">
          <div className="context-item">
            <span className="context-label">Time of Day</span>
            <span className={`context-value ${context.timeOfDay}`}>
              {context.timeOfDay === 'late_night' ? '🌙 Late Night' :
               context.timeOfDay === 'morning' ? '🌅 Morning' :
               context.timeOfDay === 'afternoon' ? '☀️ Afternoon' : '🌆 Evening'}
            </span>
          </div>
          <div className="context-item">
            <span className="context-label">Day</span>
            <span className="context-value">{context.dayOfWeek} {context.isWeekend ? '(Weekend)' : ''}</span>
          </div>
          <div className="context-item">
            <span className="context-label">Days Since Payday</span>
            <span className={`context-value ${context.daysSincePayday <= 5 ? 'warning' : ''}`}>
              {context.daysSincePayday} days
            </span>
          </div>
          <div className="context-item">
            <span className="context-label">Spending Velocity</span>
            <span className={`context-value velocity-${context.recentSpendingVelocity}`}>
              {context.recentSpendingVelocity.toUpperCase()}
            </span>
          </div>
          <div className="context-item full-width">
            <span className="context-label">Emotional Risk Score</span>
            <div className="emotion-bar">
              <div className="emotion-fill" style={{ width: `${context.emotionalRiskScore}%`, background: getRiskColor(context.emotionalRiskScore) }} />
            </div>
            <span className="emotion-value">{context.emotionalRiskScore}/100</span>
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      <div className="section-header">
        <h3>🚨 Active Risk Signals</h3>
        <p>AI-detected patterns that increase purchase regret probability</p>
      </div>

      {sortedSignals.length === 0 ? (
        <div className="empty-state success">
          <span className="empty-icon">✨</span>
          <p>All clear! No active risk signals detected.</p>
        </div>
      ) : (
        <div className="signals-list">
          {sortedSignals.map(signal => (
            <div key={signal.id} className={`signal-card ${signal.severity}`}>
              <div className="signal-icon">
                {signal.type === 'behavioral' ? '🧠' :
                 signal.type === 'velocity' ? '🚀' :
                 signal.type === 'pattern' ? '📊' :
                 signal.type === 'timing' ? '⏰' : '⚠️'}
              </div>
              <div className="signal-content">
                <div className="signal-header">
                  <span className={`signal-severity ${signal.severity}`}>{signal.severity.toUpperCase()}</span>
                  <span className="signal-type">{signal.type}</span>
                </div>
                <p className="signal-message">{signal.message}</p>
                <p className="signal-suggestion">💡 {signal.suggestion}</p>
              </div>
              <div className="signal-score">
                <div className="score-circle" style={{ borderColor: getRiskColor(signal.score) }}>
                  {signal.score}
                </div>
              </div>
              <button className="dismiss-btn" onClick={() => onDismiss(signal.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* AI Learning Summary */}
      <div className="learning-card">
        <h3>🎓 What Your AI Has Learned</h3>
        <div className="learnings-grid">
          <div className="learning-item">
            <span className="learning-stat">73%</span>
            <span className="learning-label">of late-night purchases you regret</span>
          </div>
          <div className="learning-item">
            <span className="learning-stat">$847</span>
            <span className="learning-label">saved by AI blocks this year</span>
          </div>
          <div className="learning-item">
            <span className="learning-stat">Day 3</span>
            <span className="learning-label">post-payday = your highest risk day</span>
          </div>
          <div className="learning-item">
            <span className="learning-stat">2.1x</span>
            <span className="learning-label">more impulse buys on weekends</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FORECAST TAB
// ============================================

interface ForecastTabProps {
  forecast: SpendingForecast[];
  categories: SpendingCategory[];
}

function ForecastTab({ forecast, categories }: ForecastTabProps) {
  const maxValue = Math.max(...forecast.map(f => Math.max(f.predicted, f.actual || 0)));
  const budget = 1450; // Monthly budget

  return (
    <div className="forecast-tab">
      <div className="section-header">
        <h3>📈 ML Spending Forecast</h3>
        <p>Predicted month-end spend based on your behavioral patterns</p>
      </div>

      {/* Forecast Chart */}
      <div className="forecast-chart">
        <div className="chart-container">
          <div className="chart-y-axis">
            <span>${maxValue}</span>
            <span>${Math.round(maxValue * 0.75)}</span>
            <span>${Math.round(maxValue * 0.5)}</span>
            <span>${Math.round(maxValue * 0.25)}</span>
            <span>$0</span>
          </div>
          <div className="chart-area">
            {/* Budget line */}
            <div className="budget-line" style={{ bottom: `${(budget / maxValue) * 100}%` }}>
              <span className="budget-label">Budget: ${budget}</span>
            </div>

            {/* Data points */}
            <svg className="forecast-svg" viewBox="0 0 700 200" preserveAspectRatio="none">
              {/* Predicted line */}
              <polyline
                className="predicted-line"
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={forecast.map((f, i) => `${i * 100 + 50},${200 - (f.predicted / maxValue) * 180}`).join(' ')}
              />
              {/* Actual line */}
              <polyline
                className="actual-line"
                fill="none"
                stroke="#4caf50"
                strokeWidth="3"
                points={forecast.filter(f => f.actual !== undefined).map((f, i) => `${i * 100 + 50},${200 - ((f.actual || 0) / maxValue) * 180}`).join(' ')}
              />
              {/* Data points */}
              {forecast.map((f, i) => (
                <g key={i}>
                  {f.actual !== undefined && (
                    <circle cx={i * 100 + 50} cy={200 - (f.actual / maxValue) * 180} r="6" fill="#4caf50" />
                  )}
                  <circle cx={i * 100 + 50} cy={200 - (f.predicted / maxValue) * 180} r="4" fill="#1976d2" />
                </g>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="chart-x-axis">
              {forecast.map((f, i) => (
                <span key={i}>{f.date}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-legend">
          <span className="legend-item actual"><span className="legend-dot" /> Actual Spend</span>
          <span className="legend-item predicted"><span className="legend-dot" /> ML Prediction</span>
          <span className="legend-item budget"><span className="legend-line" /> Monthly Budget</span>
        </div>
      </div>

      {/* Category Forecasts */}
      <div className="category-forecasts">
        <h4>Category Predictions</h4>
        <div className="forecast-grid">
          {categories.map(cat => {
            const overspend = cat.predictedMonthEnd - cat.monthlyLimit;
            const isOver = overspend > 0;

            return (
              <div key={cat.name} className={`forecast-card ${isOver ? 'overspend' : ''}`}>
                <div className="forecast-header">
                  <span className="forecast-icon">{cat.icon}</span>
                  <span className="forecast-name">{cat.name}</span>
                  <span className={`trend-badge ${cat.trend}`}>
                    {cat.trend === 'increasing' ? '📈' : cat.trend === 'decreasing' ? '📉' : '➡️'}
                  </span>
                </div>
                <div className="forecast-numbers">
                  <div className="current">
                    <span className="label">Current</span>
                    <span className="value">${cat.currentSpend}</span>
                  </div>
                  <div className="arrow">→</div>
                  <div className="predicted">
                    <span className="label">Predicted</span>
                    <span className={`value ${isOver ? 'over' : ''}`}>${cat.predictedMonthEnd}</span>
                  </div>
                </div>
                {isOver && (
                  <div className="overspend-warning">
                    ⚠️ ${overspend} over budget
                  </div>
                )}
                <div className="confidence-bar">
                  <span className="confidence-label">ML Confidence</span>
                  <div className="confidence-fill" style={{ width: '78%' }} />
                  <span className="confidence-value">78%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SPENDING LIMITS TAB
// ============================================

interface SpendingLimitsTabProps {
  categories: SpendingCategory[];
}

function SpendingLimitsTab({ categories }: SpendingLimitsTabProps) {
  return (
    <div className="spending-limits">
      <div className="section-header">
        <h3>AI-Calculated Spending Limits</h3>
        <p>Automatically adjusted based on your 90-day spending patterns and predicted behavior.</p>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
          const percentUsed = (cat.currentSpend / cat.monthlyLimit) * 100;
          const predictedPercent = (cat.predictedMonthEnd / cat.monthlyLimit) * 100;
          const isNearLimit = percentUsed > 80;
          const isOverLimit = percentUsed > 100;
          const willExceed = predictedPercent > 100;

          return (
            <div key={cat.name} className={`category-card ${isOverLimit ? 'over' : isNearLimit ? 'warning' : ''}`}>
              <div className="category-header">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                {cat.isAutoCalculated && <span className="ai-badge">🤖 AI</span>}
                <span className={`risk-indicator ${cat.riskLevel}`}>{cat.riskLevel}</span>
              </div>

              <div className="category-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(percentUsed, 100)}%` }} />
                  {willExceed && (
                    <div className="predicted-marker" style={{ left: `${Math.min(predictedPercent, 100)}%` }} />
                  )}
                </div>
                <div className="progress-labels">
                  <span>${cat.currentSpend.toFixed(0)} spent</span>
                  <span>${cat.monthlyLimit} limit</span>
                </div>
              </div>

              {willExceed && (
                <div className="prediction-warning">
                  📈 Predicted: ${cat.predictedMonthEnd} (+${cat.predictedMonthEnd - cat.monthlyLimit} over)
                </div>
              )}

              <div className="category-meta">
                <span className={`trend-indicator ${cat.trend}`}>
                  Trend: {cat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ANOMALIES TAB
// ============================================

interface AnomaliesTabProps {
  anomalies: Anomaly[];
  onResolve: (id: string, action: 'resolve' | 'dismiss') => void;
}

function AnomaliesTab({ anomalies, onResolve }: AnomaliesTabProps) {
  const activeAnomalies = anomalies.filter((a) => a.status === 'new');
  const resolvedAnomalies = anomalies.filter((a) => a.status !== 'new');

  const typeIcons: Record<Anomaly['type'], string> = {
    price_creep: '📈',
    duplicate: '👯',
    zombie: '🧟',
    outlier: '⚠️',
  };

  const typeLabels: Record<Anomaly['type'], string> = {
    price_creep: 'Price Creep',
    duplicate: 'Duplicate Charge',
    zombie: 'Unused Subscription',
    outlier: 'Unusual Purchase',
  };

  return (
    <div className="anomalies">
      <div className="section-header">
        <h3>Detected Anomalies</h3>
        <p>AI-powered audits surfaced {activeAnomalies.length} issues worth investigating.</p>
      </div>

      {activeAnomalies.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <p>No anomalies detected. Your finances look clean!</p>
        </div>
      ) : (
        <div className="anomaly-list">
          {activeAnomalies.map((anomaly) => (
            <div key={anomaly.id} className="anomaly-card">
              <div className="anomaly-icon">{typeIcons[anomaly.type]}</div>
              <div className="anomaly-content">
                <div className="anomaly-header">
                  <span className="anomaly-type">{typeLabels[anomaly.type]}</span>
                  <span className="anomaly-merchant">{anomaly.merchant}</span>
                </div>
                <p className="anomaly-description">{anomaly.description}</p>
                <div className="anomaly-savings">
                  <span className="savings-amount">💰 ${anomaly.potentialSavings}/year potential savings</span>
                </div>
              </div>
              <div className="anomaly-actions">
                <button className="btn primary small" onClick={() => onResolve(anomaly.id, 'resolve')}>
                  Fix This
                </button>
                <button className="btn secondary small" onClick={() => onResolve(anomaly.id, 'dismiss')}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedAnomalies.length > 0 && (
        <div className="resolved-section">
          <h4>Previously Resolved ({resolvedAnomalies.length})</h4>
          <p className="resolved-summary">
            Total saved: ${resolvedAnomalies.filter((a) => a.status === 'resolved').reduce((sum, a) => sum + a.potentialSavings, 0)}/year
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// RULES TAB
// ============================================

interface RulesTabProps {
  rules: BlockingRule[];
  transactions: Transaction[];
  isSimulating: boolean;
  showAddForm: boolean;
  onToggleRule: (id: string) => void;
  onStartSimulation: () => void;
  onShowAddForm: () => void;
  onHideAddForm: () => void;
  onAddRule: (data: Partial<BlockingRule>) => void;
}

function RulesTab({
  rules,
  transactions,
  isSimulating,
  showAddForm,
  onToggleRule,
  onStartSimulation,
  onShowAddForm,
  onHideAddForm,
  onAddRule,
}: RulesTabProps) {
  return (
    <div className="rules-tab">
      <div className="section-header">
        <h3>Custom Blocking Rules</h3>
        <div className="header-actions">
          <button
            className={`btn ${isSimulating ? 'secondary' : 'demo'}`}
            onClick={onStartSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? '⏳ AI Analyzing...' : '▶️ Run AI Demo'}
          </button>
          <button className="btn primary" onClick={onShowAddForm}>
            + Add Rule
          </button>
        </div>
      </div>

      <div className="rules-layout">
        <div className="rules-section">
          {showAddForm && (
            <AddRuleForm onSubmit={onAddRule} onCancel={onHideAddForm} />
          )}

          <div className="rules-list">
            {rules.length === 0 ? (
              <div className="empty-state">
                <p>No custom rules. The AI handles most blocking automatically based on your spending DNA.</p>
              </div>
            ) : (
              rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} onToggle={() => onToggleRule(rule.id)} />
              ))
            )}
          </div>
        </div>

        <div className="transactions-section">
          <h4>Live AI Transaction Analysis</h4>
          <div className="transaction-feed">
            {transactions.length === 0 ? (
              <div className="empty-feed">
                <p>Click "Run AI Demo" to see predictive blocking in action</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================

function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className={`transaction-item ${transaction.status}`}>
      <div className="tx-status">
        {transaction.status === 'blocked' ? '🤖' : '✓'}
      </div>
      <div className="tx-info">
        <span className="tx-merchant">{transaction.merchant}</span>
        <span className="tx-category">{transaction.category}</span>
      </div>
      <div className="tx-amount">${transaction.amount.toFixed(2)}</div>
      <div className={`tx-badge ${transaction.status}`}>
        {transaction.status === 'blocked' ? 'AI Blocked' : 'Approved'}
      </div>
    </div>
  );
}

function RuleCard({ rule, onToggle }: { rule: BlockingRule; onToggle: () => void }) {
  return (
    <div className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
      <div className="rule-info">
        <h4>{rule.name}</h4>
        <span className="rule-type">{rule.type}</span>
        <p className="rule-condition">{formatCondition(rule)}</p>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={rule.enabled} onChange={onToggle} />
        <span className="slider"></span>
      </label>
    </div>
  );
}

function AddRuleForm({ onSubmit, onCancel }: { onSubmit: (data: Partial<BlockingRule>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<BlockingRule['type']>('category');
  const [conditionValue, setConditionValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const condition: BlockingRule['condition'] = {};
    switch (type) {
      case 'category': condition.category = conditionValue; break;
      case 'merchant': condition.merchant = conditionValue; break;
      case 'amount': condition.maxAmount = Number(conditionValue); break;
    }
    onSubmit({ name, type, condition });
  }

  return (
    <form className="add-rule-form" onSubmit={handleSubmit}>
      <h4>Add Custom Rule</h4>
      <div className="form-group">
        <label>Rule Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Block Gaming" required />
      </div>
      <div className="form-group">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as BlockingRule['type'])}>
          <option value="category">Category</option>
          <option value="merchant">Merchant</option>
          <option value="amount">Amount Limit</option>
        </select>
      </div>
      <div className="form-group">
        <label>{type === 'amount' ? 'Max Amount ($)' : 'Value'}</label>
        <input type={type === 'amount' ? 'number' : 'text'} value={conditionValue} onChange={(e) => setConditionValue(e.target.value)} required />
      </div>
      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary">Add Rule</button>
      </div>
    </form>
  );
}

function formatCondition(rule: BlockingRule): string {
  const { condition } = rule;
  if (condition.category) return `Category: ${condition.category}`;
  if (condition.merchant) return `Merchant: ${condition.merchant}`;
  if (condition.maxAmount) return `Max: $${condition.maxAmount}`;
  if (condition.blockedHours) return `Hours: ${condition.blockedHours.start}:00-${condition.blockedHours.end}:00`;
  return 'Custom';
}
