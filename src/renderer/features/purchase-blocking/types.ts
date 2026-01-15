// AI/ML Type Definitions for Purchase Blocking

export interface SpendingCategory {
  name: string;
  icon: string;
  monthlyLimit: number;
  currentSpend: number;
  aiSuggested: number;
  isAutoCalculated: boolean;
  predictedMonthEnd: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface BehavioralContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late_night';
  dayOfWeek: string;
  daysSincePayday: number;
  recentSpendingVelocity: 'low' | 'normal' | 'high' | 'very_high';
  emotionalRiskScore: number;
  fatigueIndicator: boolean;
  isWeekend: boolean;
}

export interface PurchaseAnalysis {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: Date;
  regretProbability: number;
  impulseScore: number;
  necessityScore: number;
  timingScore: number;
  classification: 'planned' | 'semi_planned' | 'impulse' | 'compulsive';
  riskFactors: string[];
  recommendation: 'approve' | 'pause' | 'block' | 'delay';
  aiReasoning: string;
}

export interface SpendingForecast {
  date: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

export interface RiskSignal {
  id: string;
  type: 'behavioral' | 'pattern' | 'anomaly' | 'velocity' | 'timing';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  score: number;
  suggestion: string;
}

export interface Anomaly {
  id: string;
  type: 'price_creep' | 'duplicate' | 'zombie' | 'outlier';
  merchant: string;
  description: string;
  amount: number;
  potentialSavings: number;
  detectedAt: Date;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
}

export type TabType = 'ai_insights' | 'forecast' | 'spending' | 'anomalies' | 'rules';
