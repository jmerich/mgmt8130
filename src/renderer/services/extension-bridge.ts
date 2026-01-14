// Extension Bridge Service
// Handles communication between Chrome extension and the SubGuard app

export interface ExtensionData {
  sessionId: string;
  timestamp: number;
  dailyStats: {
    date: string;
    shoppingSitesVisited: number;
    totalTimeOnShoppingSites: number;
    cartInteractions: number;
    checkoutAttempts: number;
    interventionsShown: number;
    purchasesPrevented: number;
    totalPotentialSpend: number;
    riskEvents: RiskEvent[];
  };
  currentSession: {
    id: string;
    startTime: number;
    pagesVisited: number;
    shoppingSitesVisited: number;
    cartInteractions: number;
    checkoutAttempts: number;
    interventions: Intervention[];
    riskEvents: RiskEvent[];
    totalPotentialSpend: number;
  } | null;
}

export interface PageAnalysis {
  url: string;
  domain: string;
  title: string;
  timestamp: number;
  isShoppingSite: boolean;
  isCheckoutPage: boolean;
  isProductPage: boolean;
  prices: number[];
  cartItems: number;
  urgencyTactics: { phrase: string; type: string }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
}

export interface RiskEvent {
  id: string;
  timestamp: number;
  url: string;
  domain: string;
  riskLevel: string;
  factors: {
    isCheckout: boolean;
    urgencyTactics: number;
    highPrices: boolean;
  };
}

export interface Intervention {
  id: string;
  timestamp: number;
  type: string;
  outcome: 'continued' | 'paused' | 'left';
}

// In-memory store for extension data
class ExtensionBridgeStore {
  private data: ExtensionData | null = null;
  private pageAnalyses: PageAnalysis[] = [];
  private listeners: Set<(data: ExtensionData | null) => void> = new Set();

  updateData(newData: ExtensionData) {
    this.data = newData;
    this.notifyListeners();
  }

  addPageAnalysis(analysis: PageAnalysis) {
    this.pageAnalyses.unshift(analysis);
    // Keep last 100 analyses
    if (this.pageAnalyses.length > 100) {
      this.pageAnalyses = this.pageAnalyses.slice(0, 100);
    }
  }

  getData(): ExtensionData | null {
    return this.data;
  }

  getPageAnalyses(): PageAnalysis[] {
    return this.pageAnalyses;
  }

  getRecentRiskEvents(): RiskEvent[] {
    return this.data?.dailyStats.riskEvents || [];
  }

  subscribe(listener: (data: ExtensionData | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.data));
  }
}

export const extensionBridge = new ExtensionBridgeStore();

// Mock data for demo when extension isn't connected
export function getMockExtensionData(): ExtensionData {
  return {
    sessionId: 'demo_session',
    timestamp: Date.now(),
    dailyStats: {
      date: new Date().toISOString().split('T')[0],
      shoppingSitesVisited: 12,
      totalTimeOnShoppingSites: 2340,
      cartInteractions: 5,
      checkoutAttempts: 2,
      interventionsShown: 3,
      purchasesPrevented: 2,
      totalPotentialSpend: 487.99,
      riskEvents: [
        {
          id: 'evt_1',
          timestamp: Date.now() - 3600000,
          url: 'https://amazon.com/dp/B0xxxxx',
          domain: 'amazon.com',
          riskLevel: 'high',
          factors: { isCheckout: false, urgencyTactics: 2, highPrices: true }
        },
        {
          id: 'evt_2',
          timestamp: Date.now() - 1800000,
          url: 'https://bestbuy.com/checkout',
          domain: 'bestbuy.com',
          riskLevel: 'critical',
          factors: { isCheckout: true, urgencyTactics: 1, highPrices: true }
        }
      ]
    },
    currentSession: {
      id: 'sess_demo',
      startTime: Date.now() - 7200000,
      pagesVisited: 34,
      shoppingSitesVisited: 8,
      cartInteractions: 3,
      checkoutAttempts: 1,
      interventions: [
        { id: 'int_1', timestamp: Date.now() - 1800000, type: 'checkout_block', outcome: 'left' }
      ],
      riskEvents: [],
      totalPotentialSpend: 289.99
    }
  };
}

export function getMockPageAnalyses(): PageAnalysis[] {
  return [
    {
      url: 'https://amazon.com/dp/B0xxxxx',
      domain: 'amazon.com',
      title: 'Sony WH-1000XM5 Headphones',
      timestamp: Date.now() - 300000,
      isShoppingSite: true,
      isCheckoutPage: false,
      isProductPage: true,
      prices: [349.99, 279.99],
      cartItems: 0,
      urgencyTactics: [
        { phrase: 'only 3 left', type: 'scarcity' },
        { phrase: 'limited time deal', type: 'urgency' }
      ],
      riskLevel: 'high'
    },
    {
      url: 'https://bestbuy.com/site/apple-macbook',
      domain: 'bestbuy.com',
      title: 'Apple MacBook Air',
      timestamp: Date.now() - 600000,
      isShoppingSite: true,
      isCheckoutPage: false,
      isProductPage: true,
      prices: [999.99, 1099.99],
      cartItems: 0,
      urgencyTactics: [{ phrase: 'selling fast', type: 'scarcity' }],
      riskLevel: 'high'
    },
    {
      url: 'https://nike.com/t/air-max',
      domain: 'nike.com',
      title: 'Nike Air Max 90',
      timestamp: Date.now() - 900000,
      isShoppingSite: true,
      isCheckoutPage: false,
      isProductPage: true,
      prices: [130.00],
      cartItems: 0,
      urgencyTactics: [],
      riskLevel: 'medium'
    }
  ];
}
