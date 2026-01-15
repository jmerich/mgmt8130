// Utility functions for Purchase Blocking feature
import type { RiskSignal, BehavioralContext } from './types';

export function calculateOverallRiskScore(signals: RiskSignal[]): number {
  if (signals.length === 0) return 0;
  const weights = { critical: 1.5, warning: 1.0, info: 0.5 };
  const totalWeight = signals.reduce((sum, s) => sum + weights[s.severity], 0);
  const weightedSum = signals.reduce((sum, s) => sum + s.score * weights[s.severity], 0);
  return Math.round(weightedSum / totalWeight);
}

export function getRiskColor(score: number): string {
  if (score >= 70) return '#f44336';
  if (score >= 40) return '#ff9800';
  return '#4caf50';
}

export function getRegretColor(probability: number): string {
  if (probability >= 60) return '#f44336';
  if (probability >= 35) return '#ff9800';
  return '#4caf50';
}

export function getBehavioralContext(): BehavioralContext {
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
    daysSincePayday: 3,
    recentSpendingVelocity: 'high',
    emotionalRiskScore: 68,
    fatigueIndicator: hour >= 22 || hour < 6,
    isWeekend,
  };
}
