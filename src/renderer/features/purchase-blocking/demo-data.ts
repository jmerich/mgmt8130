// Demo data for Purchase Blocking feature
import type { SpendingCategory, SpendingForecast, RiskSignal, PurchaseAnalysis, Anomaly } from './types';

export const DEMO_CATEGORIES: SpendingCategory[] = [
  {
    name: 'dining', icon: '🍽️', monthlyLimit: 400, currentSpend: 287,
    aiSuggested: 350, isAutoCalculated: true,
    predictedMonthEnd: 445, trend: 'increasing', riskLevel: 'high'
  },
  {
    name: 'entertainment', icon: '🎮', monthlyLimit: 150, currentSpend: 89,
    aiSuggested: 120, isAutoCalculated: true,
    predictedMonthEnd: 134, trend: 'stable', riskLevel: 'low'
  },
  {
    name: 'shopping', icon: '🛍️', monthlyLimit: 500, currentSpend: 423,
    aiSuggested: 450, isAutoCalculated: true,
    predictedMonthEnd: 612, trend: 'increasing', riskLevel: 'high'
  },
  {
    name: 'subscriptions', icon: '📱', monthlyLimit: 100, currentSpend: 82,
    aiSuggested: 85, isAutoCalculated: true,
    predictedMonthEnd: 97, trend: 'stable', riskLevel: 'low'
  },
  {
    name: 'transportation', icon: '🚗', monthlyLimit: 300, currentSpend: 156,
    aiSuggested: 250, isAutoCalculated: true,
    predictedMonthEnd: 248, trend: 'decreasing', riskLevel: 'low'
  },
];

export const DEMO_FORECAST: SpendingForecast[] = [
  { date: 'Jan 1', predicted: 0, actual: 0, confidence: 100 },
  { date: 'Jan 5', predicted: 180, actual: 195, confidence: 95 },
  { date: 'Jan 10', predicted: 420, actual: 478, confidence: 92 },
  { date: 'Jan 15', predicted: 680, actual: 712, confidence: 88 },
  { date: 'Jan 20', predicted: 920, actual: 1037, confidence: 85 },
  { date: 'Jan 25', predicted: 1180, confidence: 78 },
  { date: 'Jan 31', predicted: 1536, confidence: 72 },
];

export const DEMO_RISK_SIGNALS: RiskSignal[] = [
  {
    id: '1',
    type: 'behavioral',
    severity: 'warning',
    message: 'Late-night browsing detected (11:47 PM)',
    score: 72,
    suggestion: 'Purchases made after 10 PM have 3.2x higher regret rate for you'
  },
  {
    id: '2',
    type: 'velocity',
    severity: 'critical',
    message: 'Spending velocity 2.4x above your normal rate',
    score: 89,
    suggestion: 'You\'ve spent $312 in the last 48 hours vs your $130 average'
  },
  {
    id: '3',
    type: 'pattern',
    severity: 'warning',
    message: 'Post-payday surge pattern detected',
    score: 65,
    suggestion: 'Day 3 after payday - historically your highest regret period'
  },
  {
    id: '4',
    type: 'timing',
    severity: 'info',
    message: 'Weekend shopping mode active',
    score: 45,
    suggestion: 'Weekend purchases average 23% higher than weekday for you'
  },
];

export const DEMO_PENDING_PURCHASE: PurchaseAnalysis = {
  id: 'pending-1',
  merchant: 'Nike.com',
  amount: 189.99,
  category: 'shopping',
  timestamp: new Date(),
  regretProbability: 73,
  impulseScore: 82,
  necessityScore: 25,
  timingScore: 31,
  classification: 'impulse',
  riskFactors: [
    'Late night purchase (11:47 PM)',
    'Category already at 85% of limit',
    'No prior browsing history for this item',
    '3 days post-payday (high-risk window)',
    'Similar item purchased 2 weeks ago'
  ],
  recommendation: 'pause',
  aiReasoning: 'Based on your spending DNA, purchases matching this profile have a 73% regret rate within 7 days. You\'ve returned 4 of 5 similar late-night shopping purchases in the past 6 months.'
};

export const DEMO_ANOMALIES: Anomaly[] = [
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

export const DEMO_TRANSACTIONS = [
  { merchant: 'Steam Games', category: 'entertainment', amount: 59.99 },
  { merchant: 'Amazon', category: 'shopping', amount: 34.99 },
  { merchant: 'DraftKings', category: 'gambling', amount: 100.00 },
  { merchant: 'Uber Eats', category: 'dining', amount: 28.50 },
  { merchant: 'PlayStation Store', category: 'entertainment', amount: 69.99 },
  { merchant: 'Gucci Online', category: 'shopping', amount: 1250.00 },
  { merchant: 'Netflix', category: 'subscriptions', amount: 15.99 },
  { merchant: 'FanDuel', category: 'gambling', amount: 50.00 },
];
