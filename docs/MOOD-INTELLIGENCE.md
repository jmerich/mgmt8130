# Mood-Aware Prediction System

## Overview

SubGuard's Mood Intelligence system is an AI-powered behavioral analysis engine that predicts impulse purchase risk by analyzing real-time browser, device, temporal, and purchase pattern signals. The system operates entirely on-device for privacy, processing signals locally to generate mood predictions and intervention recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOOD INTELLIGENCE SYSTEM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │   Browser   │   │   Device    │   │  Temporal   │   │  Purchase   │ │
│  │   Signals   │   │   Signals   │   │   Signals   │   │  Patterns   │ │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘ │
│         │                 │                 │                 │         │
│         └────────────┬────┴────────┬────────┴────────┬────────┘         │
│                      │             │                 │                  │
│                      ▼             ▼                 ▼                  │
│              ┌───────────────────────────────────────────┐              │
│              │         MOOD DETECTION SERVICE            │              │
│              │  ┌─────────────────────────────────────┐  │              │
│              │  │    Component Score Calculators      │  │              │
│              │  │  • Anxiety Score    • Stress Score  │  │              │
│              │  │  • Boredom Score    • Euphoria Score│  │              │
│              │  │  • Sadness Score                    │  │              │
│              │  └─────────────────────────────────────┘  │              │
│              │                    │                      │              │
│              │                    ▼                      │              │
│              │  ┌─────────────────────────────────────┐  │              │
│              │  │     Mood Classification Engine      │  │              │
│              │  │   Winner-take-all mood selection    │  │              │
│              │  └─────────────────────────────────────┘  │              │
│              │                    │                      │              │
│              │                    ▼                      │              │
│              │  ┌─────────────────────────────────────┐  │              │
│              │  │    Impulse Risk Calculator          │  │              │
│              │  │  Mood multipliers + temporal +      │  │              │
│              │  │  behavioral risk factors            │  │              │
│              │  └─────────────────────────────────────┘  │              │
│              └───────────────────────────────────────────┘              │
│                                   │                                     │
│                                   ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      OUTPUT: MoodPrediction                         ││
│  │  • primaryMood (7 states)    • impulseRiskScore (0-100)            ││
│  │  • confidence (0-95%)        • riskLevel (low/moderate/high/crit)  ││
│  │  • triggers[]                • recommendations[]                    ││
│  │  • protectionLevel           • secondaryMood (optional)            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                   │                                     │
│         ┌─────────────────────────┼─────────────────────────┐          │
│         ▼                         ▼                         ▼          │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐     │
│  │  Purchase   │          │  Spending   │          │   Smart     │     │
│  │  Intercept  │          │  Forecast   │          │ Notifications│    │
│  │     UI      │          │   Widget    │          │   System    │     │
│  └─────────────┘          └─────────────┘          └─────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Signal Collection Layer

The system collects four categories of behavioral signals every 30 seconds to build a comprehensive picture of user state.

### 1. Browser Signals

Browser signals capture web browsing behavior patterns that correlate with emotional states.

| Signal | Type | Description | Why It Matters |
|--------|------|-------------|----------------|
| `tabSwitchesPerMinute` | number | Frequency of switching between browser tabs | High rates (>8/min) indicate restlessness, anxiety, or inability to focus—states associated with impulsive decision-making |
| `averageTimeOnPage` | seconds | Mean time spent on each page before navigation | Short times (<15s) suggest scanning/seeking behavior rather than deliberate browsing |
| `scrollVelocity` | px/sec | Speed of page scrolling | Fast, erratic scrolling (>400px/s) correlates with impatience and reduced deliberation |
| `backButtonPresses` | number | Navigation reversals in session | High rates (>3) indicate indecision or dissatisfaction—emotional states linked to compensatory purchasing |
| `activeTabCount` | number | Total open browser tabs | Excessive tabs (>15) suggest cognitive overload and difficulty focusing |
| `socialMediaDwellTime` | minutes | Time on social platforms in last hour | Extended social media use (>30min) correlates with comparison-driven spending and FOMO purchases |
| `shoppingSiteVisits` | number | Shopping site visits in last hour | Multiple visits (>5) indicate active shopping intent combined with hesitation |
| `searchEmotionalScore` | 0-100 | Sentiment analysis of search queries | Emotionally-charged searches indicate heightened emotional state |
| `lateNightBrowsing` | boolean | Browsing between 10PM-4AM | Late night shopping has 2x higher regret rates due to reduced inhibition |
| `incognitoSwitches` | number | Switches to/from private browsing | May indicate shame-avoidance behavior around purchases |
| `sessionDuration` | minutes | Total browsing session length | Extended sessions (>90min) indicate reduced self-regulation capacity |

### 2. Device Signals

Device signals provide physiological and environmental context about the user's physical state.

| Signal | Type | Description | Why It Matters |
|--------|------|-------------|----------------|
| `screenUnlocksPerHour` | number | Phone unlock frequency | High rates (>15/hr) indicate compulsive checking behavior and anxiety |
| `appSwitchFrequency` | number | Application switching rate | Frequent switching (>30/session) suggests inability to focus and seeking behavior |
| `typingSpeed` | chars/min | Text input velocity | Abnormal speeds indicate emotional arousal (too fast = agitation, too slow = fatigue) |
| `typingErrorRate` | percentage | Ratio of corrections to keystrokes | High error rates (>10%) correlate with stress, fatigue, or intoxication |
| `timeSinceLastActivity` | minutes | Idle time detection | Returns from long idle periods may indicate mood state changes |
| `batteryLevel` | percentage | Device battery remaining | Low battery (<20%) creates urgency/scarcity mindset affecting decisions |
| `isCharging` | boolean | Charging status | Stationary + charging suggests more deliberate browsing context |
| `networkType` | wifi/cellular/offline | Connection type | Cellular browsing is often more impulsive (on-the-go context) |
| `ambientLightLevel` | dark/dim/normal/bright | Environmental lighting | Dark environments correlate with reduced inhibition |
| `deviceOrientation` | portrait/landscape | Screen orientation | Portrait suggests casual browsing, landscape suggests deliberate content consumption |
| `motionIntensity` | 0-100 | Accelerometer activity level | High motion (>50) indicates physical agitation or multitasking |

### 3. Temporal Signals

Temporal signals leverage known patterns in human behavior related to time, schedule, and financial cycles.

| Signal | Type | Description | Why It Matters |
|--------|------|-------------|----------------|
| `hourOfDay` | 0-23 | Current hour | Impulse control varies by circadian rhythm; lowest at night |
| `dayOfWeek` | 0-6 | Day of week (Sun=0) | Weekend spending averages 30-40% higher than weekdays |
| `isWeekend` | boolean | Saturday or Sunday | Leisure time correlates with recreational shopping |
| `daysUntilPayday` | number | Days to next paycheck | Proximity to payday affects perceived financial capacity |
| `daysSincePayday` | number | Days since last paycheck | First 2 days post-payday show 60% higher impulse purchases ("payday euphoria") |
| `isLateNight` | boolean | Between 10PM-4AM | Prefrontal cortex function reduced; impulse control impaired |
| `isPostWork` | boolean | Weekday 5PM-8PM | Post-work stress creates "retail therapy" vulnerability |

### 4. Purchase Pattern Signals

Purchase pattern signals analyze shopping-specific behaviors that indicate deliberation level.

| Signal | Type | Description | Why It Matters |
|--------|------|-------------|----------------|
| `browseToCartSpeed` | seconds | Time from product view to cart add | Fast additions (<60s) indicate impulse without deliberation |
| `cartAbandonmentRate` | percentage | Historical cart abandonment | Low abandonment may indicate reduced ability to reconsider |
| `averageOrderValue` | currency | Typical purchase amount | Deviations from baseline indicate unusual buying behavior |
| `recentOrderValueChange` | percentage | Change in order values | Sudden increases (>30%) suggest escalating spending patterns |
| `comfortCategoryBrowsing` | 0-100 | Browsing in "comfort" categories | High scores indicate emotional/comfort shopping patterns |
| `priceCheckingBehavior` | 0-100 | Price comparison activity | Low scores (<30) indicate reduced price sensitivity (impulse indicator) |
| `recentPurchaseCount` | number | Purchases in last 24 hours | Multiple recent purchases indicate active spending spree |
| `regretRateHistorical` | percentage | Past purchases with returns/regret | High rates (>25%) indicate pattern of impulsive decisions |

---

## Mood Classification Algorithm

The system uses a **weighted additive scoring model** to classify emotional state into one of seven mood categories.

### Mood States

| Mood | Description | Impulse Risk |
|------|-------------|--------------|
| `stressed` | Elevated cortisol indicators, seeking relief | HIGH - Retail therapy pattern |
| `bored` | Seeking stimulation, aimless browsing | HIGH - Entertainment shopping |
| `anxious` | Restless, scattered attention | MODERATE-HIGH - Uncertainty purchasing |
| `sad` | Low energy, seeking comfort | VERY HIGH - Emotional compensation |
| `euphoric` | Elevated mood, often post-payday | VERY HIGH - Overconfidence in spending |
| `happy` | Positive but regulated state | LOW - Deliberate purchasing |
| `neutral` | Baseline emotional state | LOW - Rational decision-making |

### Component Score Calculation

Each mood component is calculated using threshold-based additive scoring:

#### Anxiety Score Algorithm
```
anxietyScore = 0
if tabSwitchesPerMinute > 8:     score += 20
if scrollVelocity > 400:          score += 15
if backButtonPresses > 3:         score += 10
if screenUnlocksPerHour > 15:     score += 15
if typingErrorRate > 10%:         score += 10
if motionIntensity > 50:          score += 10
return min(100, score)
```

#### Boredom Score Algorithm
```
boredomScore = 0
if activeTabCount > 15:           score += 20
if socialMediaDwellTime > 30min:  score += 25
if averageTimeOnPage < 15s:       score += 15
if appSwitchFrequency > 30:       score += 20
if shoppingSiteVisits > 5:        score += 15
return min(100, score)
```

#### Stress Score Algorithm
```
stressScore = 0
if isPostWork (5-8PM weekday):    score += 20
if lateNightBrowsing:             score += 25
if searchEmotionalScore > 50:     score += 20
if batteryLevel < 20% (not charging): score += 10
if sessionDuration > 90min:       score += 15
return min(100, score)
```

#### Euphoria Score Algorithm
```
euphoriaScore = 0
if daysSincePayday <= 2:          score += 40  // Major factor
if isWeekend:                     score += 15
if recentOrderValueChange > 30%:  score += 20
if hourOfDay between 10-14:       score += 10  // Peak mood hours
return min(100, score)
```

#### Sadness Score Algorithm
```
sadnessScore = 0
if socialMediaDwellTime > 40min:  score += 25  // Doom scrolling
if isLateNight:                   score += 20
if searchEmotionalScore > 60:     score += 25
if weekday afternoon (2-4PM):     score += 15  // Afternoon slump
return min(100, score)
```

### Derived Mood Calculations
```
neutralScore = 50 - (anxiety + boredom + stress + sadness) / 4
happyScore = max(0, 60 - stress - anxiety)
```

### Winner Selection
The mood with the highest score becomes `primaryMood`. If the difference between the top two scores is less than 15 points, `secondaryMood` is also reported to indicate mixed emotional state.

---

## Impulse Risk Calculation

The impulse risk score (0-100) combines mood intensity with contextual risk multipliers.

### Base Risk Formula
```
baseRisk = moodIntensity × moodRiskMultiplier
```

### Mood Risk Multipliers

| Mood | Multiplier | Rationale |
|------|------------|-----------|
| euphoric | 1.6× | Overconfidence leads to largest overspending |
| sad | 1.5× | Emotional compensation spending highest |
| stressed | 1.4× | Retail therapy is common coping mechanism |
| bored | 1.3× | Entertainment shopping for stimulation |
| anxious | 1.3× | Uncertainty leads to "retail security" purchases |
| neutral | 1.0× | Baseline rational behavior |
| happy | 0.8× | Positive mood with maintained self-control |

### Contextual Risk Multipliers

These multipliers compound the base risk:

| Factor | Multiplier | Condition |
|--------|------------|-----------|
| Late Night | 1.3× | Browsing 10PM-4AM |
| Post-Payday | 1.4× | Within 2 days of payday |
| Post-Work | 1.2× | Weekday 5-8PM |
| Fast Cart Add | 1.3× | Browse-to-cart < 60 seconds |
| Comfort Shopping | 1.2× | comfortCategoryBrowsing > 50 |
| Shopping Spree | 1.2× | shoppingSiteVisits > 5 |
| Low Price Checking | 1.3× | priceCheckingBehavior < 30 |

### Final Risk Calculation
```
impulseRisk = baseRisk
if isLateNight:           impulseRisk *= 1.3
if daysSincePayday <= 2:  impulseRisk *= 1.4
if isPostWork:            impulseRisk *= 1.2
if browseToCartSpeed < 60: impulseRisk *= 1.3
if comfortCategory > 50:   impulseRisk *= 1.2
if shoppingSiteVisits > 5: impulseRisk *= 1.2
if priceChecking < 30:     impulseRisk *= 1.3
return min(100, impulseRisk)
```

### Risk Level Thresholds

| Score | Level | Protection Response |
|-------|-------|---------------------|
| 75-100 | Critical | Maximum intervention, full-screen intercept |
| 50-74 | High | Elevated intervention, strong warnings |
| 30-49 | Moderate | Gentle nudges, cooling-off suggestions |
| 0-29 | Low | Standard monitoring, no intervention |

---

## Intervention Components

### 1. Purchase Intercept Screen

Full-screen intervention UI triggered when impulse risk is elevated during checkout attempts.

**Features:**
- **Swipe-to-Decide Interface**: Left swipe = Block, Right swipe = Approve
- **Risk Gauge Visualization**: Animated needle showing real-time impulse score
- **Breathing Exercise**: 4-4-4 technique (inhale 4s, hold 4s, exhale 4s) for emotional regulation
- **Cooldown Timer**: Enforced waiting periods (1hr, 6hr, 24hr options)
- **AI Recommendations**: Contextual advice based on current mood and triggers

**Trigger Conditions:**
- Risk score > 40
- Risk level = high or critical
- Purchase amount > $100 (configurable threshold)

### 2. Spending Forecast Widget

Predictive spending visualization based on mood patterns and historical data.

**Algorithm:**
```
For each forecast day:
  1. Get day-of-week spending multiplier (Sun=1.4, Mon=0.7, ..., Fri=1.5, Sat=1.3)
  2. Calculate idealDailySpend = remainingBudget / remainingDays
  3. predictedSpend = idealDailySpend × dayMultiplier × (1 + random_variance)
  4. Assign risk level based on predictedSpend/idealDailySpend ratio
```

**Day-of-Week Multipliers:**
| Day | Multiplier | Typical Mood |
|-----|------------|--------------|
| Sunday | 1.4× | Bored - relaxed browsing |
| Monday | 0.7× | Stressed - work focus |
| Tuesday | 0.8× | Neutral |
| Wednesday | 0.9× | Neutral |
| Thursday | 1.1× | Happy - weekend anticipation |
| Friday | 1.5× | Euphoric - payday/weekend |
| Saturday | 1.3× | Happy - leisure spending |

### 3. Smart Notifications System

Context-aware notification system that delivers proactive alerts.

**Notification Types:**
| Type | Priority | Trigger |
|------|----------|---------|
| `mood-alert` | High/Urgent | Risk level high or critical |
| `pattern-warning` | Medium | Historical high-risk day approaching |
| `budget-alert` | High/Urgent | Budget threshold reached (>90% = urgent) |
| `cooldown-end` | Medium | Cooling-off period completed |
| `positive` | Low | Blocked purchases, savings milestones |
| `insight` | Low | AI tips and pattern observations |
| `milestone` | Low | Achievement unlocked |

**Smart Generation Rules:**
- Mood alerts only fire when risk transitions to high/critical (not continuously)
- Pattern warnings use historical day-of-week data
- Positive reinforcement follows successful intervention acceptance

---

## Scientific Basis

### Research Foundation

The mood-impulse correlation model is based on established behavioral economics and psychology research:

1. **Emotional Decision-Making** (Loewenstein, 2000): Emotions systematically influence economic decisions, often overriding rational cost-benefit analysis.

2. **Ego Depletion** (Baumeister et al., 1998): Self-control is a limited resource that depletes over time, explaining why late-night and post-work periods show higher impulse rates.

3. **Retail Therapy** (Atalay & Meloy, 2011): Shopping as mood repair is a documented phenomenon, with negative moods (stress, sadness) driving compensatory purchases.

4. **Payday Effect** (Shapiro, 2005): Consumer spending spikes immediately after income receipt, independent of actual financial need.

5. **Social Comparison** (Festinger, 1954): Social media exposure triggers upward comparison, driving "keeping up" purchases.

### Signal Validity

| Signal Category | Validation Source |
|-----------------|-------------------|
| Browser behavior | Eye-tracking studies correlating attention patterns with emotional state |
| Device signals | Smartphone sensor research linking usage patterns to mood (Likamwa et al., 2013) |
| Temporal patterns | Consumer spending data analysis from financial institutions |
| Purchase patterns | E-commerce conversion optimization research |

---

## Privacy Considerations

The Mood Intelligence system is designed with privacy as a core principle:

1. **On-Device Processing**: All signal collection and mood analysis occurs locally. No behavioral data is transmitted to external servers.

2. **No Persistent Storage**: Signal history is kept in memory only (last 100 snapshots, ~50 minutes) and cleared on session end.

3. **No PII Collection**: The system analyzes behavioral patterns, not personal content. Search queries are scored for emotional tone, not stored.

4. **User Control**: Users can pause/resume tracking, adjust intervention sensitivity, and view all collected signals.

5. **Transparency**: All triggers and recommendations are explained, allowing users to understand why interventions occur.

---

## Configuration

### Autonomy Levels

| Level | Daily Limit | Cooling-Off | Auto-Redirect | Checkout Block |
|-------|-------------|-------------|---------------|----------------|
| Minimal | $500 | None | No | $500 |
| Moderate | $200 | 5 min | No | $100 |
| High | $100 | 10 min | Yes | $50 |
| Full | $50 | 15 min | Yes | $25 |

### Tuning Parameters

Administrators can adjust these thresholds in `src/config.ts`:

```typescript
MOOD_INTELLIGENCE: {
  COLLECTION_INTERVAL: 30000,      // Signal collection frequency (ms)
  HISTORY_SIZE: 100,               // Number of snapshots retained
  RISK_THRESHOLDS: {
    LOW: 30,
    MODERATE: 50,
    HIGH: 75
  },
  INTERVENTION_TRIGGERS: {
    INTERCEPT_MIN_RISK: 40,
    INTERCEPT_MIN_AMOUNT: 100
  }
}
```

---

## Future Enhancements

1. **Machine Learning Model**: Replace threshold-based scoring with trained ML model using labeled historical data
2. **Biometric Integration**: Heart rate and skin conductance via wearables for physiological mood signals
3. **Social Context**: Calendar integration to understand life events affecting mood
4. **Personalization**: Individual baseline calibration and adaptive thresholds
5. **Outcome Tracking**: Correlate predictions with actual purchase regret to improve accuracy

---

## File Reference

| File | Purpose |
|------|---------|
| `src/renderer/services/mood-detection.ts` | Core mood detection service and algorithm |
| `src/renderer/features/mood-intelligence/PurchaseIntercept.tsx` | Full-screen intervention UI |
| `src/renderer/features/mood-intelligence/SpendingForecast.tsx` | Predictive spending widget |
| `src/renderer/features/mood-intelligence/SmartNotifications.tsx` | Notification system |
| `src/renderer/features/mood-intelligence/index.ts` | Feature module exports |
