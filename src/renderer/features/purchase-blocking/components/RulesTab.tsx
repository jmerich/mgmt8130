import { useState } from 'react';
import type { BlockingRule, Transaction } from '../../../shared/types';

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

export function RulesTab({
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
