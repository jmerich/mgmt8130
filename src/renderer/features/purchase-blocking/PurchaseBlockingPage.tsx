/**
 * PURCHASE BLOCKING FEATURE
 * Owner: [Team Member 1]
 *
 * This module handles:
 * - Creating and managing blocking rules
 * - Checking transactions against rules
 * - Displaying blocked transaction history
 */

import React, { useState, useEffect } from 'react';
import type { BlockingRule } from '../../shared/types';
import { purchaseBlockingService } from '../../services/stub-service';
import './PurchaseBlocking.css';

export function PurchaseBlockingPage() {
  const [rules, setRules] = useState<BlockingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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
    } catch (error) {
      console.error('Failed to add rule:', error);
    }
  }

  function toggleRule(id: string) {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  }

  if (isLoading) {
    return <div className="loading">Loading rules...</div>;
  }

  return (
    <div className="purchase-blocking">
      <header className="page-header">
        <h2>Purchase Blocking</h2>
        <p>Create rules to automatically block unwanted purchases</p>
        <button className="btn primary" onClick={() => setShowAddForm(true)}>
          + Add Rule
        </button>
      </header>

      {showAddForm && (
        <AddRuleForm
          onSubmit={handleAddRule}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="rules-list">
        {rules.length === 0 ? (
          <div className="empty-state">
            <p>No blocking rules yet. Create one to get started!</p>
          </div>
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => toggleRule(rule.id)}
            />
          ))
        )}
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
        <h3>{rule.name}</h3>
        <span className="rule-type">{rule.type}</span>
        <p className="rule-condition">
          {formatCondition(rule)}
        </p>
      </div>
      <div className="rule-actions">
        <label className="toggle">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={onToggle}
          />
          <span className="slider"></span>
        </label>
      </div>
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
      case 'category':
        condition.category = conditionValue;
        break;
      case 'merchant':
        condition.merchant = conditionValue;
        break;
      case 'amount':
        condition.maxAmount = Number(conditionValue);
        break;
    }

    onSubmit({ name, type, condition });
  }

  return (
    <form className="add-rule-form" onSubmit={handleSubmit}>
      <h3>Add New Rule</h3>

      <div className="form-group">
        <label>Rule Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Block Gaming Purchases"
          required
        />
      </div>

      <div className="form-group">
        <label>Rule Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as BlockingRule['type'])}>
          <option value="category">Category</option>
          <option value="merchant">Merchant</option>
          <option value="amount">Amount Limit</option>
          <option value="time">Time-based</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          {type === 'amount' ? 'Maximum Amount ($)' : `${type.charAt(0).toUpperCase() + type.slice(1)} Name`}
        </label>
        <input
          type={type === 'amount' ? 'number' : 'text'}
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          placeholder={type === 'amount' ? '100' : 'Enter value...'}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary">
          Add Rule
        </button>
      </div>
    </form>
  );
}

function formatCondition(rule: BlockingRule): string {
  const { condition } = rule;
  if (condition.category) return `Category: ${condition.category}`;
  if (condition.merchant) return `Merchant: ${condition.merchant}`;
  if (condition.maxAmount) return `Max amount: $${condition.maxAmount}`;
  if (condition.blockedHours) {
    return `Blocked hours: ${condition.blockedHours.start}:00 - ${condition.blockedHours.end}:00`;
  }
  return 'Custom rule';
}
