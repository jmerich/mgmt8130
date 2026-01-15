// Types for Auto-Negotiation feature
import type { Subscription } from '../../shared/types';

export const AI_AGENTS = {
  polite: { name: 'Diplomatic Agent', icon: '🤝', style: 'Polite & Professional', successRate: 72 },
  angry: { name: 'Assertive Agent', icon: '😤', style: 'Firm & Demanding', successRate: 68 },
  legalistic: { name: 'Legal Expert', icon: '⚖️', style: 'Policy & Rights Focus', successRate: 81 },
  clueless: { name: 'Confused Customer', icon: '😕', style: 'Plays Dumb Strategy', successRate: 65 },
  finalWarning: { name: 'Churn Risk Agent', icon: '⚠️', style: 'Final Warning Bluff', successRate: 78 },
  silence: { name: 'Silence Pressure', icon: '🤫', style: 'Strategic Waiting', successRate: 74 },
  competitor: { name: 'Competitor Evaluator', icon: '🔍', style: 'Comparing Alternatives', successRate: 76 },
  bundle: { name: 'Bundle Threat', icon: '📦', style: 'Multi-Service Leverage', successRate: 85 },
} as const;

export type AgentKey = keyof typeof AI_AGENTS;

export interface NegotiationState {
  subscription: Subscription;
  messages: Array<{ role: 'ai' | 'rep'; message: string; turn?: number }>;
  status: 'chatting' | 'success' | 'failed';
  discount?: number;
  selectedAgent?: AgentKey;
  currentTurn: number;
  totalTurns: number;
}

export type TabType = 'subscriptions' | 'strategies' | 'intelligence' | 'channels' | 'safety' | 'legal' | 'pricing' | 'community' | 'protection';

export interface VendorIntel {
  generosityScore: number;
  negotiationDifficulty: string;
  avgDiscount: number;
  bestDay: string;
  bestTime: string;
  winBackLikelihood: number;
  retentionBudget: string;
  priceFloor: number;
  crowdSourcedTips: string[];
}
