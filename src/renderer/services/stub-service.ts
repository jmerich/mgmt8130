/**
 * STUB SERVICE - Mock implementations for MVP demo
 *
 * This service provides fake data and simulated responses
 * Replace with real API calls when integrating with actual services
 */

import type {
  BlockingRule,
  Transaction,
  VirtualCard,
  CardGenerationOptions,
  Subscription,
  NegotiationSession,
} from '../shared/types';

// ============================================
// MOCK DATA
// ============================================
const mockBlockingRules: BlockingRule[] = [
  {
    id: '1',
    name: 'Block Gaming Purchases',
    type: 'category',
    condition: { category: 'gaming' },
    enabled: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Limit Late Night Shopping',
    type: 'time',
    condition: { blockedHours: { start: 23, end: 6 } },
    enabled: true,
    createdAt: new Date('2024-01-15'),
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    serviceName: 'Netflix',
    currentPrice: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-15'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '2',
    serviceName: 'Spotify',
    currentPrice: 10.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-10'),
    category: 'music',
    negotiationEligible: true,
  },
  {
    id: '3',
    serviceName: 'Adobe Creative Cloud',
    currentPrice: 54.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-20'),
    category: 'software',
    negotiationEligible: true,
  },
];

// ============================================
// PURCHASE BLOCKING STUBS
// ============================================
export const purchaseBlockingService = {
  async getRules(): Promise<BlockingRule[]> {
    await simulateDelay();
    return [...mockBlockingRules];
  },

  async addRule(rule: Omit<BlockingRule, 'id' | 'createdAt'>): Promise<BlockingRule> {
    await simulateDelay();
    const newRule: BlockingRule = {
      ...rule,
      id: generateId(),
      createdAt: new Date(),
    };
    mockBlockingRules.push(newRule);
    return newRule;
  },

  async checkTransaction(tx: Transaction): Promise<{ blocked: boolean; rule?: BlockingRule }> {
    await simulateDelay();
    // Simulate rule checking
    const matchingRule = mockBlockingRules.find(
      (rule) => rule.enabled && rule.condition.category === tx.category
    );
    return { blocked: !!matchingRule, rule: matchingRule };
  },
};

// ============================================
// CARD MASKING STUBS
// ============================================
let mockCards: VirtualCard[] = [];

export const cardMaskingService = {
  async generateCard(options: CardGenerationOptions): Promise<VirtualCard> {
    await simulateDelay();
    const card: VirtualCard = {
      id: generateId(),
      maskedNumber: `4${Math.random().toString().slice(2, 5)}-XXXX-XXXX-${Math.random().toString().slice(2, 6)}`,
      expiryDate: generateExpiryDate(options.expiryDays || 30),
      cvv: '***',
      type: options.type,
      linkedMerchant: options.merchantLock,
      spendLimit: options.spendLimit,
      status: 'active',
      createdAt: new Date(),
    };
    mockCards.push(card);
    return card;
  },

  async listCards(): Promise<VirtualCard[]> {
    await simulateDelay();
    return [...mockCards];
  },

  async deactivateCard(id: string): Promise<void> {
    await simulateDelay();
    const card = mockCards.find((c) => c.id === id);
    if (card) {
      card.status = 'cancelled';
    }
  },
};

// ============================================
// AUTO-NEGOTIATION STUBS
// ============================================
const mockNegotiations: NegotiationSession[] = [];

export const autoNegotiationService = {
  async getSubscriptions(): Promise<Subscription[]> {
    await simulateDelay();
    return [...mockSubscriptions];
  },

  async startNegotiation(subscriptionId: string): Promise<NegotiationSession> {
    await simulateDelay();
    const subscription = mockSubscriptions.find((s) => s.id === subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    const session: NegotiationSession = {
      id: generateId(),
      subscriptionId,
      status: 'in-progress',
      originalPrice: subscription.currentPrice,
      startedAt: new Date(),
    };
    mockNegotiations.push(session);

    // Simulate negotiation completing after delay
    setTimeout(() => {
      session.status = Math.random() > 0.3 ? 'success' : 'failed';
      if (session.status === 'success') {
        const discount = 0.1 + Math.random() * 0.25; // 10-35% discount
        session.negotiatedPrice = Number((subscription.currentPrice * (1 - discount)).toFixed(2));
        session.savingsPercent = Math.round(discount * 100);
      }
      session.completedAt = new Date();
    }, 3000);

    return session;
  },

  async getNegotiationStatus(sessionId: string): Promise<NegotiationSession | null> {
    await simulateDelay();
    return mockNegotiations.find((n) => n.id === sessionId) || null;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function simulateDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateExpiryDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
}
