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
 */

import { useState, useEffect, useMemo } from 'react';
import type { BlockingRule, Transaction } from '../../shared/types';
import type { SpendingCategory, RiskSignal, PurchaseAnalysis, Anomaly, TabType } from './types';
import { purchaseBlockingService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import { calculateOverallRiskScore, getRiskColor, getBehavioralContext } from './utils';
import {
  DEMO_CATEGORIES,
  DEMO_FORECAST,
  DEMO_RISK_SIGNALS,
  DEMO_PENDING_PURCHASE,
  DEMO_ANOMALIES,
  DEMO_TRANSACTIONS,
} from './demo-data';
import {
  PendingPurchaseCard,
  AIInsightsTab,
  ForecastTab,
  SpendingLimitsTab,
  AnomaliesTab,
  RulesTab,
} from './components';
import './PurchaseBlocking.css';

export function PurchaseBlockingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ai_insights');
  const [rules, setRules] = useState<BlockingRule[]>([]);
  const [categories] = useState<SpendingCategory[]>(DEMO_CATEGORIES);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(DEMO_ANOMALIES);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>(DEMO_RISK_SIGNALS);
  const [pendingPurchase, setPendingPurchase] = useState<PurchaseAnalysis | null>(DEMO_PENDING_PURCHASE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [behavioralContext] = useState(getBehavioralContext());
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
