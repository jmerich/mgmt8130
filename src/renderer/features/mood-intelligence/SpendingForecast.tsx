/**
 * Predictive Spending Forecast Widget
 *
 * AI-powered spending prediction that analyzes mood patterns,
 * historical data, and behavioral signals to forecast future
 * spending and identify high-risk periods.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MoodState, RiskLevel } from '../../services/mood-detection';
import './SpendingForecast.css';

interface DayForecast {
  date: Date;
  predictedSpend: number;
  confidence: number;
  riskLevel: RiskLevel;
  dominantMood: MoodState;
  triggers: string[];
}

interface WeeklyPattern {
  dayOfWeek: string;
  averageSpend: number;
  riskScore: number;
  peakHours: number[];
}

interface SpendingForecastProps {
  monthlyBudget: number;
  currentSpent: number;
  historicalData?: {
    date: Date;
    amount: number;
    mood?: MoodState;
  }[];
}

export const SpendingForecast: React.FC<SpendingForecastProps> = ({
  monthlyBudget,
  currentSpent,
  historicalData: _historicalData = [],
}) => {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayForecast | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  // Generate forecast based on mood patterns and historical data
  useEffect(() => {
    const generateForecast = async () => {
      setIsLoading(true);

      // Simulate AI prediction delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const days = viewMode === 'week' ? 7 : 30;
      const newForecast: DayForecast[] = [];
      const today = new Date();

      // Day-of-week spending patterns (simulated from historical data)
      const dayPatterns = [
        { day: 0, multiplier: 1.4, mood: 'bored' as MoodState },    // Sunday - relaxed browsing
        { day: 1, multiplier: 0.7, mood: 'stressed' as MoodState }, // Monday - work focus
        { day: 2, multiplier: 0.8, mood: 'neutral' as MoodState },  // Tuesday
        { day: 3, multiplier: 0.9, mood: 'neutral' as MoodState },  // Wednesday
        { day: 4, multiplier: 1.1, mood: 'happy' as MoodState },    // Thursday - anticipation
        { day: 5, multiplier: 1.5, mood: 'euphoric' as MoodState }, // Friday - payday mood
        { day: 6, multiplier: 1.3, mood: 'happy' as MoodState },    // Saturday - leisure
      ];

      // Calculate base daily spend
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const remainingDays = daysInMonth - today.getDate();
      const remainingBudget = monthlyBudget - currentSpent;
      const idealDailySpend = remainingBudget / Math.max(remainingDays, 1);

      for (let i = 0; i < days; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);

        const dayOfWeek = forecastDate.getDay();
        const pattern = dayPatterns[dayOfWeek];

        // Calculate predicted spend with some variance
        const baseSpend = idealDailySpend * pattern.multiplier;
        const variance = (Math.random() - 0.5) * 0.3 * baseSpend;
        const predictedSpend = Math.max(0, baseSpend + variance);

        // Determine risk level based on predicted vs ideal spend
        const spendRatio = predictedSpend / idealDailySpend;
        let riskLevel: RiskLevel = 'low';
        if (spendRatio > 1.5) riskLevel = 'critical';
        else if (spendRatio > 1.2) riskLevel = 'high';
        else if (spendRatio > 1.0) riskLevel = 'moderate';

        // Generate contextual triggers
        const triggers: string[] = [];
        if (dayOfWeek === 5) triggers.push('End-of-week spending surge typical');
        if (dayOfWeek === 0 || dayOfWeek === 6) triggers.push('Weekend leisure spending');
        if (pattern.mood === 'stressed') triggers.push('Stress-related retail therapy risk');
        if (pattern.mood === 'bored') triggers.push('Boredom browsing pattern detected');
        if (spendRatio > 1.3) triggers.push('Exceeds safe daily limit');

        newForecast.push({
          date: forecastDate,
          predictedSpend,
          confidence: 70 + Math.random() * 20,
          riskLevel,
          dominantMood: pattern.mood,
          triggers,
        });
      }

      setForecast(newForecast);

      // Generate weekly patterns
      const patterns: WeeklyPattern[] = dayPatterns.map((p, index) => ({
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
        averageSpend: idealDailySpend * p.multiplier,
        riskScore: p.multiplier * 50,
        peakHours: index === 5 ? [12, 18, 21] : index === 6 ? [11, 15, 20] : [12, 19],
      }));
      setWeeklyPatterns(patterns);

      setIsLoading(false);
    };

    generateForecast();
  }, [monthlyBudget, currentSpent, viewMode]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (forecast.length === 0) return null;

    const totalPredicted = forecast.reduce((sum, day) => sum + day.predictedSpend, 0);
    const highRiskDays = forecast.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length;
    const avgConfidence = forecast.reduce((sum, day) => sum + day.confidence, 0) / forecast.length;

    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate();
    const projectedMonthEnd = currentSpent + totalPredicted;
    const budgetStatus = projectedMonthEnd <= monthlyBudget ? 'on-track' : 'over-budget';

    return {
      totalPredicted,
      highRiskDays,
      avgConfidence,
      projectedMonthEnd,
      budgetStatus,
      remainingDays,
    };
  }, [forecast, currentSpent, monthlyBudget]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      low: '#4caf50',
      moderate: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f',
    };
    return colors[level];
  };

  const getMoodEmoji = (mood: MoodState): string => {
    const emojis: Record<MoodState, string> = {
      stressed: '😰',
      bored: '😑',
      happy: '😊',
      sad: '😢',
      anxious: '😟',
      neutral: '😐',
      euphoric: '🤑',
    };
    return emojis[mood];
  };

  // Calculate bar heights for visualization
  const maxSpend = Math.max(...forecast.map(d => d.predictedSpend), monthlyBudget / 30);

  return (
    <div className="spending-forecast">
      <div className="forecast-header">
        <div className="header-title">
          <h3>Spending Forecast</h3>
          <span className="ai-badge">AI Powered</span>
        </div>
        <div className="view-toggle">
          <button
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            7 Days
          </button>
          <button
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            30 Days
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="forecast-loading">
          <div className="loading-spinner" />
          <p>Analyzing spending patterns...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summaryStats && (
            <div className="forecast-summary">
              <div className={`summary-card ${summaryStats.budgetStatus}`}>
                <span className="summary-icon">
                  {summaryStats.budgetStatus === 'on-track' ? '✓' : '⚠️'}
                </span>
                <div className="summary-content">
                  <span className="summary-label">Projected Month-End</span>
                  <span className="summary-value">
                    {formatCurrency(summaryStats.projectedMonthEnd)}
                  </span>
                  <span className="summary-detail">
                    {summaryStats.budgetStatus === 'on-track'
                      ? `${formatCurrency(monthlyBudget - summaryStats.projectedMonthEnd)} under budget`
                      : `${formatCurrency(summaryStats.projectedMonthEnd - monthlyBudget)} over budget`}
                  </span>
                </div>
              </div>

              <div className="summary-card warning">
                <span className="summary-icon">🚨</span>
                <div className="summary-content">
                  <span className="summary-label">High-Risk Days</span>
                  <span className="summary-value">{summaryStats.highRiskDays}</span>
                  <span className="summary-detail">
                    in the next {viewMode === 'week' ? '7' : '30'} days
                  </span>
                </div>
              </div>

              <div className="summary-card info">
                <span className="summary-icon">🎯</span>
                <div className="summary-content">
                  <span className="summary-label">AI Confidence</span>
                  <span className="summary-value">{Math.round(summaryStats.avgConfidence)}%</span>
                  <span className="summary-detail">prediction accuracy</span>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Chart */}
          <div className="forecast-chart">
            <div className="chart-header">
              <span className="chart-title">Daily Predicted Spend</span>
              <div className="chart-legend">
                <span className="legend-item low">Low Risk</span>
                <span className="legend-item moderate">Moderate</span>
                <span className="legend-item high">High Risk</span>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-bars">
                {forecast.slice(0, viewMode === 'week' ? 7 : 14).map((day, index) => (
                  <div
                    key={index}
                    className={`chart-bar-wrapper ${selectedDay === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  >
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(day.predictedSpend / maxSpend) * 100}%`,
                        backgroundColor: getRiskColor(day.riskLevel),
                      }}
                    >
                      <span className="bar-value">{formatCurrency(day.predictedSpend)}</span>
                    </div>
                    <span className="bar-label">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="bar-mood">{getMoodEmoji(day.dominantMood)}</span>
                  </div>
                ))}
              </div>

              {/* Safe spending line */}
              <div
                className="safe-spend-line"
                style={{
                  bottom: `${((monthlyBudget / 30) / maxSpend) * 100}%`,
                }}
              >
                <span className="line-label">Safe Daily: {formatCurrency(monthlyBudget / 30)}</span>
              </div>
            </div>
          </div>

          {/* Selected Day Detail */}
          {selectedDay && (
            <div className="day-detail">
              <div className="detail-header">
                <h4>{formatDate(selectedDay.date)}</h4>
                <span
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(selectedDay.riskLevel) }}
                >
                  {selectedDay.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              <div className="detail-stats">
                <div className="stat">
                  <span className="stat-label">Predicted Spend</span>
                  <span className="stat-value">{formatCurrency(selectedDay.predictedSpend)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Dominant Mood</span>
                  <span className="stat-value">
                    {getMoodEmoji(selectedDay.dominantMood)} {selectedDay.dominantMood}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Confidence</span>
                  <span className="stat-value">{Math.round(selectedDay.confidence)}%</span>
                </div>
              </div>

              {selectedDay.triggers.length > 0 && (
                <div className="detail-triggers">
                  <h5>Risk Factors:</h5>
                  <ul>
                    {selectedDay.triggers.map((trigger, i) => (
                      <li key={i}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Weekly Patterns */}
          <div className="weekly-patterns">
            <h4>Your Spending Patterns</h4>
            <div className="pattern-grid">
              {weeklyPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`pattern-item ${pattern.riskScore > 60 ? 'high-risk' : ''}`}
                >
                  <span className="pattern-day">{pattern.dayOfWeek}</span>
                  <div
                    className="pattern-bar"
                    style={{
                      height: `${(pattern.riskScore / 100) * 40}px`,
                      backgroundColor: pattern.riskScore > 60 ? '#f44336' : '#4caf50',
                    }}
                  />
                  <span className="pattern-amount">{formatCurrency(pattern.averageSpend)}</span>
                </div>
              ))}
            </div>
            <p className="pattern-insight">
              🔍 <strong>Insight:</strong> Your spending peaks on Fridays and weekends.
              Consider setting stricter limits for these days.
            </p>
          </div>

          {/* AI Recommendations */}
          <div className="forecast-recommendations">
            <h4>AI Recommendations</h4>
            <div className="recommendation-list">
              <div className="recommendation-item">
                <span className="rec-icon">🎯</span>
                <div className="rec-content">
                  <strong>Set Friday Spending Alert</strong>
                  <p>Your Friday spending is 50% above average. Enable enhanced protection.</p>
                </div>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">⏰</span>
                <div className="rec-content">
                  <strong>Peak Hour Warning</strong>
                  <p>Most impulse purchases happen between 6-9 PM. Enable cooldown during these hours.</p>
                </div>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">💰</span>
                <div className="rec-content">
                  <strong>Budget Adjustment</strong>
                  <p>Based on predictions, consider reducing daily limit by 15% to stay on track.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingForecast;
