import type { SpendingCategory } from '../types';

interface SpendingLimitsTabProps {
  categories: SpendingCategory[];
}

export function SpendingLimitsTab({ categories }: SpendingLimitsTabProps) {
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
