/**
 * PURCHASE BLOCKING FEATURE
 * Owner: [Team Member 1]
 *
 * Ambient Intelligence Features:
 * - Smart category spend caps (AI-calculated)
 * - Outlier detection with cooling-off (>2σ triggers)
 * - Recurring charge anomaly detection
 * - Cross-retailer price arbitrage
 * - Price intelligence (timing, drops)
 *
 * Design Principle: "Invisible until valuable"
 * - Works without user attention
 * - Surfaces only when $ value exceeds cognitive cost
 * - Executes within guardrails without approval
 * - Builds trust through demonstrated savings
 */

import React, { useState, useEffect } from 'react';
import type { BlockingRule, Transaction } from '../../shared/types';
import { purchaseBlockingService } from '../../services/stub-service';
import { useToast } from '../../components/Toast';
import './PurchaseBlocking.css';

// Types for ambient intelligence features
interface SpendingCategory {
  name: string;
  icon: string;
  monthlyLimit: number;
  currentSpend: number;
  aiSuggested: number;
  isAutoCalculated: boolean;
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

interface PriceIntelligence {
  id: string;
  item: string;
  currentPrice: number;
  targetPrice: number;
  predictedDropDate: string;
  predictedSavings: number;
  cheaperAlternative?: {
    retailer: string;
    price: number;
    savings: number;
  };
}

// Demo data
const DEMO_CATEGORIES: SpendingCategory[] = [
  { name: 'dining', icon: '🍽️', monthlyLimit: 400, currentSpend: 287, aiSuggested: 350, isAutoCalculated: true },
  { name: 'entertainment', icon: '🎮', monthlyLimit: 150, currentSpend: 89, aiSuggested: 120, isAutoCalculated: true },
  { name: 'shopping', icon: '🛍️', monthlyLimit: 500, currentSpend: 423, aiSuggested: 450, isAutoCalculated: true },
  { name: 'subscriptions', icon: '📱', monthlyLimit: 100, currentSpend: 82, aiSuggested: 85, isAutoCalculated: true },
  { name: 'transportation', icon: '🚗', monthlyLimit: 300, currentSpend: 156, aiSuggested: 250, isAutoCalculated: true },
];

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

const DEMO_PRICE_INTEL: PriceIntelligence[] = [
  {
    id: '1',
    item: 'Sony WH-1000XM5 Headphones',
    currentPrice: 399,
    targetPrice: 299,
    predictedDropDate: 'Feb 14 (Presidents Day)',
    predictedSavings: 100,
    cheaperAlternative: { retailer: 'Best Buy', price: 349, savings: 50 },
  },
  {
    id: '2',
    item: 'Apple Watch Series 9',
    currentPrice: 429,
    targetPrice: 359,
    predictedDropDate: 'Mar 8 (Spring Sale)',
    predictedSavings: 70,
  },
];

const DEMO_TRANSACTIONS = [
  { merchant: 'Steam Games', category: 'entertainment', amount: 59.99 },
  { merchant: 'Amazon', category: 'shopping', amount: 34.99 },
  { merchant: 'DraftKings', category: 'gambling', amount: 100.00 },
  { merchant: 'Uber Eats', category: 'dining', amount: 28.50 },
  { merchant: 'PlayStation Store', category: 'entertainment', amount: 69.99 },
  { merchant: 'Gucci Online', category: 'shopping', amount: 1250.00 }, // Outlier
  { merchant: 'Netflix', category: 'subscriptions', amount: 15.99 },
  { merchant: 'FanDuel', category: 'gambling', amount: 50.00 },
];

type TabType = 'rules' | 'spending' | 'anomalies' | 'intelligence';

export function PurchaseBlockingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('spending');
  const [rules, setRules] = useState<BlockingRule[]>([]);
  const [categories, setCategories] = useState<SpendingCategory[]>(DEMO_CATEGORIES);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(DEMO_ANOMALIES);
  const [priceIntel, setPriceIntel] = useState<PriceIntelligence[]>(DEMO_PRICE_INTEL);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [coolingOffItem, setCoolingOffItem] = useState<{merchant: string; amount: number; timeLeft: number} | null>(null);
  const { showToast } = useToast();

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

  function updateCategoryLimit(name: string, newLimit: number) {
    setCategories(categories.map((cat) =>
      cat.name === name ? { ...cat, monthlyLimit: newLimit, isAutoCalculated: false } : cat
    ));
    showToast(`${name} limit updated to $${newLimit}`, 'success', '✅');
  }

  function resetToAiSuggested(name: string) {
    setCategories(categories.map((cat) =>
      cat.name === name ? { ...cat, monthlyLimit: cat.aiSuggested, isAutoCalculated: true } : cat
    ));
    showToast(`Reset to AI-suggested limit`, 'info', '🤖');
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

  // Demo: Simulate incoming transactions with intelligent blocking
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
      const category = categories.find((c) => c.name === demoTx.category);

      // Check for outlier (>2σ - simplified as >$500 for demo)
      const isOutlier = demoTx.amount > 500;

      // Check category limit
      const exceedsLimit = category && (category.currentSpend + demoTx.amount > category.monthlyLimit);

      // Check rules
      const matchingRule = rules.find(
        (rule) => rule.enabled && (
          rule.condition.category === demoTx.category ||
          rule.condition.merchant === demoTx.merchant ||
          (rule.condition.maxAmount && demoTx.amount > rule.condition.maxAmount)
        )
      );

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        merchant: demoTx.merchant,
        category: demoTx.category,
        amount: demoTx.amount,
        timestamp: new Date(),
        status: 'pending',
      };

      if (isOutlier) {
        // Trigger cooling-off period
        newTx.status = 'blocked';
        setCoolingOffItem({ merchant: demoTx.merchant, amount: demoTx.amount, timeLeft: 24 });
        showToast(`⏸️ Unusual purchase detected - 24hr cooling-off period`, 'warning', '🧊');
        setTimeout(() => setCoolingOffItem(null), 5000);
      } else if (matchingRule) {
        newTx.status = 'blocked';
        showToast(`Blocked: ${demoTx.merchant} ($${demoTx.amount})`, 'error', '🛡️');
      } else if (exceedsLimit) {
        newTx.status = 'blocked';
        showToast(`Over ${demoTx.category} budget - blocked`, 'warning', '📊');
      } else {
        newTx.status = 'approved';
        // Update category spend
        if (category) {
          setCategories((cats) => cats.map((c) =>
            c.name === demoTx.category ? { ...c, currentSpend: c.currentSpend + demoTx.amount } : c
          ));
        }
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

  const totalPriceIntelSavings = priceIntel.reduce((sum, p) => sum + p.predictedSavings, 0);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="purchase-blocking">
      <header className="page-header">
        <div>
          <h2>Purchase Intelligence</h2>
          <p>Ambient protection that works without your attention</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="mini-value">${totalAnomalySavings}</span>
            <span className="mini-label">Anomalies Found</span>
          </div>
          <div className="mini-stat">
            <span className="mini-value">${totalPriceIntelSavings}</span>
            <span className="mini-label">Price Intel Savings</span>
          </div>
        </div>
      </header>

      {/* Cooling-off notification */}
      {coolingOffItem && (
        <div className="cooling-off-banner">
          <div className="cooling-icon">🧊</div>
          <div className="cooling-content">
            <strong>Cooling-off Period Active</strong>
            <p>${coolingOffItem.amount} at {coolingOffItem.merchant} - This purchase is unusual for you. {coolingOffItem.timeLeft}hr delay to reconsider.</p>
          </div>
          <button className="btn small" onClick={() => setCoolingOffItem(null)}>Proceed Anyway</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab ${activeTab === 'spending' ? 'active' : ''}`} onClick={() => setActiveTab('spending')}>
          📊 Smart Limits
        </button>
        <button className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`} onClick={() => setActiveTab('anomalies')}>
          🔍 Anomalies {anomalies.filter((a) => a.status === 'new').length > 0 && (
            <span className="badge">{anomalies.filter((a) => a.status === 'new').length}</span>
          )}
        </button>
        <button className={`tab ${activeTab === 'intelligence' ? 'active' : ''}`} onClick={() => setActiveTab('intelligence')}>
          💡 Price Intel
        </button>
        <button className={`tab ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
          ⚙️ Rules
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'spending' && (
          <SpendingLimitsTab
            categories={categories}
            onUpdateLimit={updateCategoryLimit}
            onResetToAi={resetToAiSuggested}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomaliesTab
            anomalies={anomalies}
            onResolve={resolveAnomaly}
          />
        )}

        {activeTab === 'intelligence' && (
          <PriceIntelligenceTab priceIntel={priceIntel} />
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
// SMART SPENDING LIMITS TAB
// ============================================
interface SpendingLimitsTabProps {
  categories: SpendingCategory[];
  onUpdateLimit: (name: string, limit: number) => void;
  onResetToAi: (name: string) => void;
}

function SpendingLimitsTab({ categories, onUpdateLimit, onResetToAi }: SpendingLimitsTabProps) {
  return (
    <div className="spending-limits">
      <div className="section-header">
        <h3>AI-Calculated Spending Limits</h3>
        <p>Automatically adjusted based on your 90-day spending patterns. Override anytime.</p>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
          const percentUsed = (cat.currentSpend / cat.monthlyLimit) * 100;
          const isNearLimit = percentUsed > 80;
          const isOverLimit = percentUsed > 100;

          return (
            <div key={cat.name} className={`category-card ${isOverLimit ? 'over' : isNearLimit ? 'warning' : ''}`}>
              <div className="category-header">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                {cat.isAutoCalculated && <span className="ai-badge">🤖 AI</span>}
              </div>

              <div className="category-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                <div className="progress-labels">
                  <span>${cat.currentSpend.toFixed(0)} spent</span>
                  <span>${cat.monthlyLimit} limit</span>
                </div>
              </div>

              <div className="category-actions">
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={cat.monthlyLimit}
                  onChange={(e) => onUpdateLimit(cat.name, Number(e.target.value))}
                />
                {!cat.isAutoCalculated && (
                  <button className="btn-link" onClick={() => onResetToAi(cat.name)}>
                    Reset to AI (${cat.aiSuggested})
                  </button>
                )}
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
        <p>Silent audits surfaced {activeAnomalies.length} issues worth investigating.</p>
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
// PRICE INTELLIGENCE TAB
// ============================================
interface PriceIntelligenceTabProps {
  priceIntel: PriceIntelligence[];
}

function PriceIntelligenceTab({ priceIntel }: PriceIntelligenceTabProps) {
  return (
    <div className="price-intelligence">
      <div className="section-header">
        <h3>Price Intelligence</h3>
        <p>ML-powered predictions on your watched items. We'll alert you at the right time.</p>
      </div>

      {priceIntel.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👀</span>
          <p>Start browsing and we'll track prices for you automatically.</p>
        </div>
      ) : (
        <div className="intel-list">
          {priceIntel.map((item) => (
            <div key={item.id} className="intel-card">
              <div className="intel-main">
                <h4>{item.item}</h4>
                <div className="price-comparison">
                  <span className="current-price">${item.currentPrice}</span>
                  <span className="arrow">→</span>
                  <span className="target-price">${item.targetPrice}</span>
                  <span className="predicted-savings">Save ${item.predictedSavings}</span>
                </div>
                <p className="prediction">
                  📅 Predicted drop: <strong>{item.predictedDropDate}</strong>
                </p>
              </div>

              {item.cheaperAlternative && (
                <div className="cheaper-alternative">
                  <span className="alt-label">💡 Cheaper now at</span>
                  <span className="alt-retailer">{item.cheaperAlternative.retailer}</span>
                  <span className="alt-price">${item.cheaperAlternative.price}</span>
                  <span className="alt-savings">Save ${item.cheaperAlternative.savings} today</span>
                </div>
              )}

              <div className="intel-actions">
                <button className="btn primary small">Set Alert</button>
                <button className="btn secondary small">Stop Watching</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// RULES TAB (Original functionality)
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
            {isSimulating ? '⏳ Simulating...' : '▶️ Run Demo'}
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
                <p>No custom rules yet. The AI handles most blocking automatically.</p>
              </div>
            ) : (
              rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} onToggle={() => onToggleRule(rule.id)} />
              ))
            )}
          </div>
        </div>

        <div className="transactions-section">
          <h4>Live Transaction Feed</h4>
          <div className="transaction-feed">
            {transactions.length === 0 ? (
              <div className="empty-feed">
                <p>Click "Run Demo" to simulate transactions</p>
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
interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className={`transaction-item ${transaction.status}`}>
      <div className="tx-status">
        {transaction.status === 'blocked' ? '🛡️' : '✓'}
      </div>
      <div className="tx-info">
        <span className="tx-merchant">{transaction.merchant}</span>
        <span className="tx-category">{transaction.category}</span>
      </div>
      <div className="tx-amount">${transaction.amount.toFixed(2)}</div>
      <div className={`tx-badge ${transaction.status}`}>
        {transaction.status}
      </div>
    </div>
  );
}

interface RuleCardProps {
  rule: BlockingRule;
  onToggle: () => void;
}

function RuleCard({ rule, onToggle }: RuleCardProps) {
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

interface AddRuleFormProps {
  onSubmit: (data: Partial<BlockingRule>) => void;
  onCancel: () => void;
}

function AddRuleForm({ onSubmit, onCancel }: AddRuleFormProps) {
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
        <input
          type={type === 'amount' ? 'number' : 'text'}
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          required
        />
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
