import type { PurchaseAnalysis, BehavioralContext } from '../types';
import { getRegretColor } from '../utils';

interface PendingPurchaseCardProps {
  analysis: PurchaseAnalysis;
  onDecision: (decision: 'approve' | 'block' | 'delay') => void;
  context: BehavioralContext;
}

export function PendingPurchaseCard({ analysis, onDecision, context }: PendingPurchaseCardProps) {
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
