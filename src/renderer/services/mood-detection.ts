/**
 * Mood Detection Service
 *
 * Analyzes browser and device signals to predict user emotional state
 * and impulse purchase risk. All processing happens locally for privacy.
 */

import React from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export type MoodState = 'stressed' | 'bored' | 'happy' | 'sad' | 'anxious' | 'neutral' | 'euphoric';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface BrowserSignals {
  tabSwitchesPerMinute: number;
  averageTimeOnPage: number; // seconds
  scrollVelocity: number; // pixels per second
  backButtonPresses: number;
  activeTabCount: number;
  socialMediaDwellTime: number; // minutes in last hour
  shoppingSiteVisits: number; // in last hour
  searchEmotionalScore: number; // 0-100 based on search terms
  lateNightBrowsing: boolean;
  incognitoSwitches: number;
  sessionDuration: number; // minutes
}

export interface DeviceSignals {
  screenUnlocksPerHour: number;
  appSwitchFrequency: number;
  typingSpeed: number; // chars per minute
  typingErrorRate: number; // percentage
  timeSinceLastActivity: number; // minutes
  batteryLevel: number;
  isCharging: boolean;
  networkType: 'wifi' | 'cellular' | 'offline';
  ambientLightLevel: 'dark' | 'dim' | 'normal' | 'bright';
  deviceOrientation: 'portrait' | 'landscape';
  motionIntensity: number; // accelerometer activity 0-100
}

export interface TemporalSignals {
  hourOfDay: number;
  dayOfWeek: number;
  isWeekend: boolean;
  daysUntilPayday: number;
  daysSincePayday: number;
  isLateNight: boolean; // 10pm - 4am
  isPostWork: boolean; // 5pm - 8pm weekdays
}

export interface PurchasePatternSignals {
  browseToCartSpeed: number; // seconds
  cartAbandonmentRate: number; // percentage
  averageOrderValue: number;
  recentOrderValueChange: number; // percentage change
  comfortCategoryBrowsing: number; // 0-100
  priceCheckingBehavior: number; // 0-100 (higher = more careful)
  recentPurchaseCount: number; // last 24 hours
  regretRateHistorical: number; // percentage of purchases with regret
}

export interface MoodPrediction {
  primaryMood: MoodState;
  confidence: number; // 0-100
  secondaryMood?: MoodState;
  impulseRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  triggers: string[];
  recommendations: string[];
  protectionLevel: 'standard' | 'elevated' | 'maximum';
}

export interface MoodSignalSnapshot {
  timestamp: Date;
  browser: Partial<BrowserSignals>;
  device: Partial<DeviceSignals>;
  temporal: TemporalSignals;
  purchase: Partial<PurchasePatternSignals>;
}

// ============================================
// MOOD DETECTION ENGINE
// ============================================

class MoodDetectionService {
  private signalHistory: MoodSignalSnapshot[] = [];
  private currentPrediction: MoodPrediction | null = null;
  private listeners: ((prediction: MoodPrediction) => void)[] = [];

  constructor() {
    this.startSignalCollection();
  }

  // Start collecting signals periodically
  private startSignalCollection(): void {
    // Collect signals every 30 seconds
    setInterval(() => {
      this.collectAndAnalyze();
    }, 30000);

    // Initial collection
    this.collectAndAnalyze();
  }

  // Collect all available signals
  private async collectSignals(): Promise<MoodSignalSnapshot> {
    const temporal = this.getTemporalSignals();
    const browser = await this.getBrowserSignals();
    const device = await this.getDeviceSignals();
    const purchase = this.getPurchasePatternSignals();

    return {
      timestamp: new Date(),
      browser,
      device,
      temporal,
      purchase,
    };
  }

  // Get temporal/time-based signals
  private getTemporalSignals(): TemporalSignals {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Simulate payday (assume 1st and 15th of month)
    const dayOfMonth = now.getDate();
    const daysUntilPayday = dayOfMonth <= 15 ? 15 - dayOfMonth : (30 - dayOfMonth) + 1;
    const daysSincePayday = dayOfMonth <= 15 ? dayOfMonth - 1 : dayOfMonth - 15;

    return {
      hourOfDay: hour,
      dayOfWeek: day,
      isWeekend: day === 0 || day === 6,
      daysUntilPayday,
      daysSincePayday,
      isLateNight: hour >= 22 || hour <= 4,
      isPostWork: !this.isWeekend(day) && hour >= 17 && hour <= 20,
    };
  }

  private isWeekend(day: number): boolean {
    return day === 0 || day === 6;
  }

  // Get browser signals (simulated for demo, real implementation would use extension)
  private async getBrowserSignals(): Promise<Partial<BrowserSignals>> {
    // In production, this would communicate with a browser extension
    // For demo, we simulate realistic patterns
    const hour = new Date().getHours();
    const isLateNight = hour >= 22 || hour <= 4;

    // Simulate varying patterns based on time
    const baseAnxiety = isLateNight ? 0.7 : 0.3;
    const randomFactor = Math.random() * 0.4;

    return {
      tabSwitchesPerMinute: Math.floor(3 + (baseAnxiety + randomFactor) * 10),
      averageTimeOnPage: Math.floor(30 - (baseAnxiety * 20) + Math.random() * 20),
      scrollVelocity: Math.floor(200 + (baseAnxiety * 300) + Math.random() * 200),
      backButtonPresses: Math.floor((baseAnxiety + randomFactor) * 5),
      activeTabCount: Math.floor(5 + Math.random() * 20),
      socialMediaDwellTime: Math.floor(Math.random() * 45),
      shoppingSiteVisits: Math.floor(Math.random() * 8),
      searchEmotionalScore: Math.floor(baseAnxiety * 60 + Math.random() * 40),
      lateNightBrowsing: isLateNight,
      incognitoSwitches: Math.floor(Math.random() * 3),
      sessionDuration: Math.floor(15 + Math.random() * 120),
    };
  }

  // Get device signals (uses available APIs)
  private async getDeviceSignals(): Promise<Partial<DeviceSignals>> {
    const signals: Partial<DeviceSignals> = {};

    // Battery API
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        signals.batteryLevel = Math.floor(battery.level * 100);
        signals.isCharging = battery.charging;
      } catch (e) {
        signals.batteryLevel = 75;
        signals.isCharging = false;
      }
    }

    // Network Information API
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      signals.networkType = conn?.type === 'wifi' ? 'wifi' :
                           conn?.type === 'cellular' ? 'cellular' : 'wifi';
    }

    // Device orientation
    signals.deviceOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    // Simulate other signals for demo
    const hour = new Date().getHours();
    const stressFactor = (hour >= 22 || hour <= 6) ? 0.7 : 0.4;

    signals.screenUnlocksPerHour = Math.floor(5 + stressFactor * 20 + Math.random() * 10);
    signals.appSwitchFrequency = Math.floor(10 + stressFactor * 30 + Math.random() * 20);
    signals.typingSpeed = Math.floor(200 - stressFactor * 50 + Math.random() * 50);
    signals.typingErrorRate = Math.floor(stressFactor * 15 + Math.random() * 10);
    signals.timeSinceLastActivity = Math.floor(Math.random() * 30);
    signals.motionIntensity = Math.floor(stressFactor * 40 + Math.random() * 30);

    // Ambient light (if available)
    if ('AmbientLightSensor' in window) {
      signals.ambientLightLevel = 'normal';
    } else {
      // Estimate based on time
      signals.ambientLightLevel = hour >= 20 || hour <= 6 ? 'dim' : 'normal';
    }

    return signals;
  }

  // Get purchase pattern signals
  private getPurchasePatternSignals(): Partial<PurchasePatternSignals> {
    // In production, this would come from purchase history analysis
    // For demo, simulate patterns
    const randomStress = Math.random();

    return {
      browseToCartSpeed: Math.floor(30 + Math.random() * 300), // 30s to 5min
      cartAbandonmentRate: Math.floor(20 + Math.random() * 60),
      averageOrderValue: Math.floor(50 + Math.random() * 200),
      recentOrderValueChange: Math.floor(-20 + Math.random() * 60),
      comfortCategoryBrowsing: Math.floor(randomStress * 80),
      priceCheckingBehavior: Math.floor(30 + Math.random() * 50),
      recentPurchaseCount: Math.floor(Math.random() * 5),
      regretRateHistorical: Math.floor(15 + Math.random() * 35),
    };
  }

  // Main analysis function
  private async collectAndAnalyze(): Promise<void> {
    const snapshot = await this.collectSignals();
    this.signalHistory.push(snapshot);

    // Keep last 100 snapshots (about 50 minutes)
    if (this.signalHistory.length > 100) {
      this.signalHistory.shift();
    }

    // Analyze and predict
    this.currentPrediction = this.analyzeMood(snapshot);

    // Notify listeners
    this.listeners.forEach(listener => {
      if (this.currentPrediction) {
        listener(this.currentPrediction);
      }
    });
  }

  // Mood analysis algorithm
  private analyzeMood(snapshot: MoodSignalSnapshot): MoodPrediction {
    const { browser, device, temporal, purchase } = snapshot;

    // Calculate component scores
    const anxietyScore = this.calculateAnxietyScore(browser, device);
    const boredomScore = this.calculateBoredomScore(browser, device);
    const stressScore = this.calculateStressScore(browser, device, temporal);
    const euphoriaScore = this.calculateEuphoriaScore(temporal, purchase);
    const sadnessScore = this.calculateSadnessScore(browser, temporal);

    // Determine primary mood
    const moodScores = {
      anxious: anxietyScore,
      bored: boredomScore,
      stressed: stressScore,
      euphoric: euphoriaScore,
      sad: sadnessScore,
      neutral: 50 - (anxietyScore + boredomScore + stressScore + sadnessScore) / 4,
      happy: Math.max(0, 60 - stressScore - anxietyScore),
    };

    const sortedMoods = Object.entries(moodScores)
      .sort(([, a], [, b]) => b - a);

    const primaryMood = sortedMoods[0][0] as MoodState;
    const primaryScore = sortedMoods[0][1];
    const secondaryMood = sortedMoods[1][0] as MoodState;

    // Calculate impulse risk
    const impulseRiskScore = this.calculateImpulseRisk(
      snapshot, primaryMood, primaryScore
    );

    // Determine risk level
    const riskLevel = this.getRiskLevel(impulseRiskScore);

    // Generate triggers and recommendations
    const triggers = this.identifyTriggers(snapshot, primaryMood);
    const recommendations = this.generateRecommendations(primaryMood, impulseRiskScore, triggers);

    // Determine protection level
    const protectionLevel = impulseRiskScore > 75 ? 'maximum' :
                           impulseRiskScore > 50 ? 'elevated' : 'standard';

    return {
      primaryMood,
      confidence: Math.min(95, Math.floor(primaryScore + 20)),
      secondaryMood: primaryScore - sortedMoods[1][1] < 15 ? secondaryMood : undefined,
      impulseRiskScore: Math.floor(impulseRiskScore),
      riskLevel,
      triggers,
      recommendations,
      protectionLevel,
    };
  }

  private calculateAnxietyScore(
    browser: Partial<BrowserSignals>,
    device: Partial<DeviceSignals>
  ): number {
    let score = 0;

    if (browser.tabSwitchesPerMinute && browser.tabSwitchesPerMinute > 8) score += 20;
    if (browser.scrollVelocity && browser.scrollVelocity > 400) score += 15;
    if (browser.backButtonPresses && browser.backButtonPresses > 3) score += 10;
    if (device.screenUnlocksPerHour && device.screenUnlocksPerHour > 15) score += 15;
    if (device.typingErrorRate && device.typingErrorRate > 10) score += 10;
    if (device.motionIntensity && device.motionIntensity > 50) score += 10;

    return Math.min(100, score);
  }

  private calculateBoredomScore(
    browser: Partial<BrowserSignals>,
    device: Partial<DeviceSignals>
  ): number {
    let score = 0;

    if (browser.activeTabCount && browser.activeTabCount > 15) score += 20;
    if (browser.socialMediaDwellTime && browser.socialMediaDwellTime > 30) score += 25;
    if (browser.averageTimeOnPage && browser.averageTimeOnPage < 15) score += 15;
    if (device.appSwitchFrequency && device.appSwitchFrequency > 30) score += 20;
    if (browser.shoppingSiteVisits && browser.shoppingSiteVisits > 5) score += 15;

    return Math.min(100, score);
  }

  private calculateStressScore(
    browser: Partial<BrowserSignals>,
    device: Partial<DeviceSignals>,
    temporal: TemporalSignals
  ): number {
    let score = 0;

    if (temporal.isPostWork) score += 20;
    if (browser.lateNightBrowsing) score += 25;
    if (browser.searchEmotionalScore && browser.searchEmotionalScore > 50) score += 20;
    if (device.batteryLevel && device.batteryLevel < 20 && !device.isCharging) score += 10;
    if (browser.sessionDuration && browser.sessionDuration > 90) score += 15;

    return Math.min(100, score);
  }

  private calculateEuphoriaScore(
    temporal: TemporalSignals,
    purchase: Partial<PurchasePatternSignals>
  ): number {
    let score = 0;

    if (temporal.daysSincePayday <= 2) score += 40;
    if (temporal.isWeekend) score += 15;
    if (purchase.recentOrderValueChange && purchase.recentOrderValueChange > 30) score += 20;
    if (temporal.hourOfDay >= 10 && temporal.hourOfDay <= 14) score += 10;

    return Math.min(100, score);
  }

  private calculateSadnessScore(
    browser: Partial<BrowserSignals>,
    temporal: TemporalSignals
  ): number {
    let score = 0;

    if (browser.socialMediaDwellTime && browser.socialMediaDwellTime > 40) score += 25;
    if (temporal.isLateNight) score += 20;
    if (browser.searchEmotionalScore && browser.searchEmotionalScore > 60) score += 25;
    if (!temporal.isWeekend && temporal.hourOfDay >= 14 && temporal.hourOfDay <= 16) score += 15;

    return Math.min(100, score);
  }

  private calculateImpulseRisk(
    snapshot: MoodSignalSnapshot,
    primaryMood: MoodState,
    moodIntensity: number
  ): number {
    let risk = 0;
    const { browser, temporal, purchase } = snapshot;

    // Mood-based risk
    const moodRiskMultipliers: Record<MoodState, number> = {
      stressed: 1.4,
      bored: 1.3,
      sad: 1.5,
      anxious: 1.3,
      euphoric: 1.6,
      happy: 0.8,
      neutral: 1.0,
    };

    risk = moodIntensity * (moodRiskMultipliers[primaryMood] || 1);

    // Temporal risk factors
    if (temporal.isLateNight) risk *= 1.3;
    if (temporal.daysSincePayday <= 2) risk *= 1.4;
    if (temporal.isPostWork) risk *= 1.2;

    // Behavioral risk factors
    if (purchase.browseToCartSpeed && purchase.browseToCartSpeed < 60) risk *= 1.3;
    if (purchase.comfortCategoryBrowsing && purchase.comfortCategoryBrowsing > 50) risk *= 1.2;
    if (browser.shoppingSiteVisits && browser.shoppingSiteVisits > 5) risk *= 1.2;
    if (purchase.priceCheckingBehavior && purchase.priceCheckingBehavior < 30) risk *= 1.3;

    return Math.min(100, risk);
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  private identifyTriggers(snapshot: MoodSignalSnapshot, mood: MoodState): string[] {
    const triggers: string[] = [];
    const { browser, temporal, device, purchase } = snapshot;

    if (temporal.isLateNight) triggers.push('Late night browsing');
    if (temporal.daysSincePayday <= 2) triggers.push('Post-payday spending window');
    if (temporal.isPostWork) triggers.push('Post-work stress period');
    if (browser.socialMediaDwellTime && browser.socialMediaDwellTime > 30) triggers.push('Extended social media use');
    if (browser.shoppingSiteVisits && browser.shoppingSiteVisits > 5) triggers.push('Multiple shopping site visits');
    if (device.screenUnlocksPerHour && device.screenUnlocksPerHour > 15) triggers.push('High phone checking frequency');
    if (purchase.comfortCategoryBrowsing && purchase.comfortCategoryBrowsing > 50) triggers.push('Comfort shopping pattern detected');
    if (browser.tabSwitchesPerMinute && browser.tabSwitchesPerMinute > 10) triggers.push('Restless browsing behavior');
    if (mood === 'bored') triggers.push('Boredom-driven browsing detected');
    if (mood === 'stressed') triggers.push('Stress indicators elevated');

    return triggers.slice(0, 4); // Return top 4 triggers
  }

  private generateRecommendations(
    mood: MoodState,
    riskScore: number,
    triggers: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('Consider enabling maximum protection mode');
      recommendations.push('Set a 24-hour cooling period for purchases over $50');
    }

    if (mood === 'stressed' || mood === 'anxious') {
      recommendations.push('Take a 5-minute break before any purchase');
      recommendations.push('Try the breathing exercise feature');
    }

    if (mood === 'bored') {
      recommendations.push('This might be boredom shopping - close shopping tabs?');
      recommendations.push('Consider a 2-hour cooldown period');
    }

    if (mood === 'sad') {
      recommendations.push('Retail therapy purchases have 73% regret rate');
      recommendations.push('Would you like to talk to someone instead?');
    }

    if (mood === 'euphoric') {
      recommendations.push('Payday euphoria detected - stick to your planned purchases');
      recommendations.push('Review your budget before buying');
    }

    if (triggers.includes('Late night browsing')) {
      recommendations.push('Late night purchases have 2x higher regret rate');
    }

    return recommendations.slice(0, 3);
  }

  // Public API
  public getCurrentPrediction(): MoodPrediction | null {
    return this.currentPrediction;
  }

  public subscribe(listener: (prediction: MoodPrediction) => void): () => void {
    this.listeners.push(listener);

    // Immediately notify with current state
    if (this.currentPrediction) {
      listener(this.currentPrediction);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async forceUpdate(): Promise<MoodPrediction> {
    await this.collectAndAnalyze();
    return this.currentPrediction!;
  }

  public getSignalHistory(): MoodSignalSnapshot[] {
    return [...this.signalHistory];
  }

  // Simulate a purchase attempt detection
  public simulatePurchaseAttempt(amount: number, merchant: string, category: string): MoodPrediction & {
    purchaseContext: {
      amount: number;
      merchant: string;
      category: string;
      shouldIntervene: boolean;
      interventionReason: string;
    }
  } {
    const prediction = this.currentPrediction || this.analyzeMood({
      timestamp: new Date(),
      browser: {},
      device: {},
      temporal: this.getTemporalSignals(),
      purchase: {},
    });

    // Determine if we should intervene
    const shouldIntervene = prediction.impulseRiskScore > 40 ||
                           prediction.riskLevel === 'high' ||
                           prediction.riskLevel === 'critical' ||
                           amount > 100;

    let interventionReason = '';
    if (prediction.riskLevel === 'critical') {
      interventionReason = `High impulse risk detected (${prediction.impulseRiskScore}%). You appear to be ${prediction.primaryMood}.`;
    } else if (amount > 100) {
      interventionReason = `Large purchase detected. Your current emotional state suggests waiting.`;
    } else if (prediction.impulseRiskScore > 40) {
      interventionReason = `Moderate impulse risk. ${prediction.triggers[0] || 'Consider waiting.'}`;
    }

    return {
      ...prediction,
      purchaseContext: {
        amount,
        merchant,
        category,
        shouldIntervene,
        interventionReason,
      },
    };
  }
}

// Singleton instance
export const moodDetectionService = new MoodDetectionService();

// React hook for using mood detection
export function useMoodDetection() {
  const [moodPrediction, setMoodPrediction] = React.useState<MoodPrediction | null>(
    moodDetectionService.getCurrentPrediction()
  );
  const [isTracking, setIsTracking] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = moodDetectionService.subscribe(setMoodPrediction);
    return unsubscribe;
  }, []);

  const startTracking = React.useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = React.useCallback(() => {
    setIsTracking(false);
  }, []);

  return {
    moodPrediction,
    isTracking,
    startTracking,
    stopTracking,
    forceUpdate: () => moodDetectionService.forceUpdate(),
    simulatePurchase: (amount: number, merchant: string, category: string) =>
      moodDetectionService.simulatePurchaseAttempt(amount, merchant, category),
  };
}
