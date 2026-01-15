import type { SpendingForecast, SpendingCategory } from '../types';

interface ForecastTabProps {
  forecast: SpendingForecast[];
  categories: SpendingCategory[];
}

export function ForecastTab({ forecast, categories }: ForecastTabProps) {
  const maxValue = Math.max(...forecast.map(f => Math.max(f.predicted, f.actual || 0)));
  const budget = 1450;

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
            <div className="budget-line" style={{ bottom: `${(budget / maxValue) * 100}%` }}>
              <span className="budget-label">Budget: ${budget}</span>
            </div>

            <svg className="forecast-svg" viewBox="0 0 700 200" preserveAspectRatio="none">
              <polyline
                className="predicted-line"
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={forecast.map((f, i) => `${i * 100 + 50},${200 - (f.predicted / maxValue) * 180}`).join(' ')}
              />
              <polyline
                className="actual-line"
                fill="none"
                stroke="#4caf50"
                strokeWidth="3"
                points={forecast.filter(f => f.actual !== undefined).map((f, i) => `${i * 100 + 50},${200 - ((f.actual || 0) / maxValue) * 180}`).join(' ')}
              />
              {forecast.map((f, i) => (
                <g key={i}>
                  {f.actual !== undefined && (
                    <circle cx={i * 100 + 50} cy={200 - (f.actual / maxValue) * 180} r="6" fill="#4caf50" />
                  )}
                  <circle cx={i * 100 + 50} cy={200 - (f.predicted / maxValue) * 180} r="4" fill="#1976d2" />
                </g>
              ))}
            </svg>

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
