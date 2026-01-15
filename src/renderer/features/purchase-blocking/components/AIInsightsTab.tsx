import type { RiskSignal, BehavioralContext } from '../types';
import { getRiskColor } from '../utils';

interface AIInsightsTabProps {
  riskSignals: RiskSignal[];
  context: BehavioralContext;
  onDismiss: (id: string) => void;
}

export function AIInsightsTab({ riskSignals, context, onDismiss }: AIInsightsTabProps) {
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
