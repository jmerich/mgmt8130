/**
 * Shared type definitions for SubGuard
 * All team members should import types from this file
 */

// ============================================
// PURCHASE BLOCKING TYPES (Feature 1)
// ============================================
export interface BlockingRule {
  id: string;
  name: string;
  type: 'merchant' | 'category' | 'amount' | 'time';
  condition: {
    merchant?: string;
    category?: string;
    maxAmount?: number;
    blockedHours?: { start: number; end: number };
  };
  enabled: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'approved' | 'blocked';
}

// ============================================
// CARD MASKING TYPES (Feature 2)
// ============================================
export interface VirtualCard {
  id: string;
  maskedNumber: string;
  expiryDate: string;
  cvv: string;
  type: 'single-use' | 'merchant-locked' | 'subscription';
  linkedMerchant?: string;
  spendLimit?: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  createdAt: Date;
}

export interface CardGenerationOptions {
  type: VirtualCard['type'];
  merchantLock?: string;
  spendLimit?: number;
  expiryDays?: number;
}

// ============================================
// AUTO-NEGOTIATION TYPES (Feature 3)
// ============================================
export interface Subscription {
  id: string;
  serviceName: string;
  currentPrice: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  category: string;
  negotiationEligible: boolean;
}

export interface NegotiationSession {
  id: string;
  subscriptionId: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed';
  originalPrice: number;
  negotiatedPrice?: number;
  savingsPercent?: number;
  startedAt: Date;
  completedAt?: Date;
}

// ============================================
// APP-WIDE TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
