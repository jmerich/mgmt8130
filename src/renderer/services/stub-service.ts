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
  {
    id: '4',
    serviceName: 'Disney+',
    currentPrice: 13.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-18'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '5',
    serviceName: 'HBO Max',
    currentPrice: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-22'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '6',
    serviceName: 'Amazon Prime',
    currentPrice: 14.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-25'),
    category: 'shopping',
    negotiationEligible: true,
  },
  {
    id: '7',
    serviceName: 'YouTube Premium',
    currentPrice: 13.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-12'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '8',
    serviceName: 'Hulu',
    currentPrice: 17.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-28'),
    category: 'streaming',
    negotiationEligible: false,
  },
  {
    id: '9',
    serviceName: 'Microsoft 365',
    currentPrice: 12.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-08'),
    category: 'software',
    negotiationEligible: true,
  },
  {
    id: '10',
    serviceName: 'Dropbox',
    currentPrice: 11.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-14'),
    category: 'storage',
    negotiationEligible: true,
  },
  {
    id: '11',
    serviceName: 'Apple Music',
    currentPrice: 10.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-16'),
    category: 'music',
    negotiationEligible: true,
  },
  {
    id: '12',
    serviceName: 'NordVPN',
    currentPrice: 12.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-19'),
    category: 'security',
    negotiationEligible: true,
  },
  {
    id: '13',
    serviceName: 'Notion',
    currentPrice: 10.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-21'),
    category: 'productivity',
    negotiationEligible: true,
  },
  {
    id: '14',
    serviceName: 'Slack Pro',
    currentPrice: 8.75,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-23'),
    category: 'communication',
    negotiationEligible: true,
  },
  {
    id: '15',
    serviceName: 'Grammarly Premium',
    currentPrice: 12.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-24'),
    category: 'writing',
    negotiationEligible: true,
  },
  {
    id: '16',
    serviceName: 'Paramount+',
    currentPrice: 11.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-26'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '17',
    serviceName: 'Peacock Premium',
    currentPrice: 11.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-27'),
    category: 'streaming',
    negotiationEligible: true,
  },
  {
    id: '18',
    serviceName: 'LinkedIn Premium',
    currentPrice: 29.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-01'),
    category: 'professional',
    negotiationEligible: true,
  },
  {
    id: '19',
    serviceName: 'Canva Pro',
    currentPrice: 12.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-02'),
    category: 'design',
    negotiationEligible: true,
  },
  {
    id: '20',
    serviceName: 'ChatGPT Plus',
    currentPrice: 20.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-03'),
    category: 'ai',
    negotiationEligible: true,
  },
  {
    id: '21',
    serviceName: 'Duolingo Plus',
    currentPrice: 6.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-04'),
    category: 'education',
    negotiationEligible: true,
  },
  {
    id: '22',
    serviceName: 'New York Times',
    currentPrice: 17.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-05'),
    category: 'news',
    negotiationEligible: true,
  },
  {
    id: '23',
    serviceName: 'Peloton',
    currentPrice: 44.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-06'),
    category: 'fitness',
    negotiationEligible: true,
  },
  {
    id: '24',
    serviceName: 'Masterclass',
    currentPrice: 15.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-07'),
    category: 'education',
    negotiationEligible: true,
  },
  {
    id: '25',
    serviceName: 'Audible',
    currentPrice: 14.95,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-03-08'),
    category: 'entertainment',
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
