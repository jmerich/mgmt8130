# SubGuard Demo Guide

A structured 5-minute live demo showcasing SubGuard's key features, including the new AI-powered mood prediction system.

**Related Documentation:**
- [Main README](../README.md) - Overview and quick start
- [Architecture](ARCHITECTURE.md) - System architecture and diagrams
- [Mood Intelligence](MOOD-INTELLIGENCE.md) - Predictive AI system deep dive

---

## Pre-Demo Setup (Do Before Presenting)

### 1. Start the Application

```bash
cd mgmt8130
npm run dev:web
```

Verify both services are running:
- Dashboard: http://localhost:5173
- API: http://localhost:3001/api/health

### 2. Install Chrome Extension

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `chrome-extension/` folder
4. Pin SubGuard to your toolbar

### 3. Prepare Browser Tabs

Open these tabs in order:
1. **Tab 1**: SubGuard Dashboard (http://localhost:5173)
2. **Tab 2**: Netflix Mock Page (http://localhost:5173/demo/netflix)
3. **Tab 3**: Target.com (for live checkout blocking demo)

### 4. Reset Demo State

In the dashboard:
- Set autonomy level to **Moderate** (starting point)
- Ensure extension shows "Connected"
- Verify the **Mood Status Card** is displaying (below Spending Forecast)

---

## Demo Script (5 Minutes)

### Minute 1: Introduction & Predictive AI Dashboard (0:00 - 1:00)

**Start on Tab 1 (Dashboard)**

> "SubGuard is an AI-powered financial protection platform that helps users manage subscriptions and control impulse spending. What makes us unique is our **predictive mood intelligence system** that detects when you're at risk for impulse purchases before they happen."

**Point out the new AI features:**

1. **Spending Forecast Widget** (prominent on dashboard)
   - "This AI-powered forecast predicts your spending for the next 7 or 30 days."
   - Point out the **color-coded bars** (green = low risk, orange = moderate, red = high risk)
   - "Notice Friday and Sunday are flagged as high-risk days based on behavioral patterns."
   - Click on a bar to show the **day detail panel**
   - "Each day shows the dominant predicted mood, triggers, and confidence level."

2. **Summary Cards**
   - Point to "Projected Month-End: $X,XXX"
   - "The AI predicts whether you'll be under or over budget."
   - Show "High-Risk Days: X" - "We've identified X days where you're likely to overspend."
   - Show "AI Confidence: XX%" - "This is our prediction accuracy based on your patterns."

**Action:** Click "30 Days" toggle to show longer forecast, then back to "7 Days".

---

### Minute 2: Real-Time Mood Detection (1:00 - 2:00)

**Stay on Dashboard, scroll to Mood Status Card**

> "Now here's where it gets really interesting. SubGuard analyzes your behavior in real-time to predict your emotional state and impulse risk."

**Walk through the Mood Status Card:**

1. **Current Mood Indicator**
   - "Right now, the AI detects my mood as [stressed/bored/anxious/etc.]"
   - Point to the emoji and mood label
   - "This is based on signals like tab switching frequency, scroll speed, and time of day."

2. **Risk Score (0-100)**
   - "My impulse risk score is currently [XX]."
   - "Above 75 is critical, 50-74 is high, 30-49 moderate."
   - Explain: "The higher the score, the more likely I am to make a purchase I'll regret."

3. **Active Triggers**
   - "The AI identified these specific triggers elevating my risk:"
   - Read the triggers: "Late night browsing", "High phone checking frequency", etc.
   - "These are behavioral signals correlated with impulsive decisions."

4. **AI Recommendation**
   - Point to the lightbulb recommendation
   - "Based on my current state, the AI recommends: '[recommendation text]'"

**Interaction Demo:**
- "Watch what happens if I rapidly switch tabs and scroll quickly..."
- (Demonstrate frantic browsing behavior for 10 seconds)
- "The risk score adjusts in real-time. This is live behavioral analysis."

---

### Minute 3: Card Masking Demo (2:00 - 3:00)

**Switch to Tab 2 (Netflix Mock Page)**

> "One of our key features is Card Masking - generating virtual cards to protect your real payment information."

**Walk through the Netflix checkout:**

1. "This simulates a Netflix subscription signup page."

2. **Point to the SubGuard prompt** (bottom-right corner)
   - "Notice the SubGuard overlay offering to use a virtual card."

3. **Click the SubGuard prompt**
   - "When I click this, SubGuard automatically fills in a masked virtual card."
   - Show the fields turning blue (autofilled indicator)

4. "This card is merchant-locked to Netflix only - it can't be used elsewhere, protecting you from fraud."

5. **Click "Start Membership"**
   - Show the success screen
   - "The subscription is now protected with a virtual card."

**Action:** Navigate to Card Masking page briefly to show card management UI.

---

### Minute 4: AI Autonomy & Checkout Blocking (3:00 - 4:00)

**Switch to Tab 3 (Target.com)**

> "Now let's see how AI autonomy protects against impulse purchases. Remember, the AI detected I'm in a high-risk emotional state."

**Live checkout blocking demo:**

1. "I'm on Target.com. Let me add something to cart."
   - Add any item to cart

2. "Now watch what happens when I try to checkout with an elevated risk score."
   - Click **"Sign in to check out"** or **"Check out"** button

3. **Show the blocking overlay:**
   - "SubGuard immediately blocked this checkout!"
   - Point out the red overlay with explanation
   - "It detected that this purchase exceeds our limit AND my impulse risk is elevated."

4. **Explain the mood-aware intervention:**
   - "Notice it says my current mood is [X] with a [Y]% impulse risk."
   - "This isn't just a spending limit - it's contextual protection based on my emotional state."
   - "If I were in a calm, deliberate state, the threshold would be different."

**Action:** Click "Go Back to Shopping" to dismiss.

---

### Minute 5: Purchase Intercept & Wrap-up (4:00 - 5:00)

**Return to Tab 1 (Dashboard)**

> "Let me show you the full intervention experience and wrap up the features."

**Demonstrate Purchase Intercept (if time permits):**
- Navigate to Google Pay Demo (http://localhost:5173/demo/google-pay)
- "This shows our full-screen intervention UI for mobile payments."
- Point out the **Risk Gauge** visualization
- "Users can swipe left to block, right to approve."
- Mention the **Breathing Exercise** feature: "We even built in a 4-4-4 breathing technique to help users pause and reflect."

**Smart Notifications:**
- Click the notification bell in the header
- "The notification system sends proactive alerts: mood warnings, pattern alerts, and positive reinforcement."
- Show any notifications in the center

**Feature Summary:**

> "In summary, SubGuard provides:
> - **Predictive AI**: Forecasts spending risk days/weeks in advance
> - **Real-time mood detection**: Analyzes 30+ behavioral signals to predict impulse risk
> - **Contextual interventions**: Blocks adapt based on your emotional state, not just dollar amounts
> - Virtual card protection for subscriptions
> - Automated price negotiation
>
> The key differentiator is that we predict problems before they happen, rather than just reacting to overspending."

**End with the savings display:**
- "And as you can see, these features have already saved over $1,500 this year."

---

## Demo Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         5-MINUTE DEMO FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

 MINUTE 1              MINUTE 2             MINUTE 3            MINUTE 4            MINUTE 5
 ─────────            ─────────            ─────────           ─────────           ─────────
    │                    │                    │                    │                   │
    ▼                    ▼                    ▼                    ▼                   ▼
┌─────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌─────────┐
│Spending │        │  Mood    │        │ Netflix  │        │ Target   │        │ Wrap-up │
│Forecast │        │ Status   │        │Mock Page │        │Checkout  │        │& Notifs │
└─────────┘        └──────────┘        └──────────┘        └──────────┘        └─────────┘
    │                    │                    │                    │                   │
    ▼                    ▼                    ▼                    ▼                   ▼
• 7/30 day          • Current mood      • Virtual card      • Add item to       • Notification
  predictions         detection           autofill            cart                center
• Risk-colored      • Risk score        • Click SubGuard    • Click checkout    • Feature
  bars                (0-100)             prompt            • Show blocking       recap
• Click day         • Active triggers   • Show protected      overlay           • Savings
  details           • AI recommendation   subscription      • Mood-aware          highlight
• Summary cards     • Live demo:                              intervention
                      behavior →
                      score change
```

---

## Key Talking Points for Mood Intelligence

### "How does the mood detection actually work?"

> "We analyze over 30 behavioral signals across four categories:
> - **Browser signals**: Tab switching frequency, scroll speed, time on page
> - **Device signals**: Screen unlocks, typing errors, motion intensity
> - **Temporal signals**: Time of day, day of week, proximity to payday
> - **Purchase patterns**: How fast you add to cart, price checking behavior
>
> These feed into a weighted scoring algorithm that classifies your mood into one of seven states, each with a different impulse risk multiplier."

### "What's the science behind this?"

> "This is based on behavioral economics research. Studies show:
> - Late-night purchases have 2x higher regret rates
> - The first 2 days after payday see 60% more impulse purchases
> - Emotional states like boredom and stress drive 'retail therapy' patterns
>
> We've codified this research into algorithmic protections. The full methodology is documented in our Mood Intelligence technical spec."

### "Isn't this creepy? You're tracking my emotions."

> "Great question. All processing happens locally on your device - we never transmit your behavioral data to any server. You're in complete control: you can see every signal we track, adjust thresholds, or disable tracking entirely. Think of it like a fitness tracker for your spending habits."

### "What about false positives?"

> "The system has four autonomy levels. At 'Moderate', you just get gentle reminders - nothing is blocked. At 'Full', the AI actively intervenes. Users choose their comfort level. The confidence score also shows how certain the prediction is."

### "How is this different from just setting a spending limit?"

> "Traditional spending limits are static - $100/day regardless of context. Our system is dynamic. If you're browsing calmly at 2PM on a Tuesday after researching for a week, that $100 purchase gets different treatment than the same purchase at 11PM on payday when you've been doom-scrolling for an hour. Context matters."

---

## Talking Points & FAQ

### "How does the extension detect shopping sites?"

> "The extension maintains a list of known shopping domains (Amazon, Target, eBay, etc.) and also analyzes page content for shopping indicators like cart buttons, prices, and checkout forms."

### "What happens if I really need to make a purchase?"

> "Users can always adjust their autonomy level or override individual blocks. The system is designed to add friction to impulse purchases, not prevent all spending. At the 'Moderate' level, you just get reminders rather than blocks."

### "Is my payment data secure?"

> "Virtual cards are generated locally and only the masked version is stored. Your real card details are never transmitted to our servers."

### "How does price negotiation work?"

> "SubGuard analyzes your subscriptions, identifies negotiation opportunities based on market data and competitor pricing, and can initiate conversations with vendors on your behalf."

---

## Backup Plans

### If the mood detection shows "neutral" with low risk:

This can happen if the demo environment is calm. Options:
1. Explain: "Right now my browsing is calm, so risk is low. In a real scenario with more activity, scores would be higher."
2. Demonstrate rapid tab switching and erratic scrolling to elevate the score
3. Mention: "In testing, late-night demos tend to show higher stress scores naturally."

### If the Spending Forecast is still loading:

Wait 2-3 seconds - the widget has an 800ms simulated AI delay.
- If it's stuck, refresh the page
- Alternatively, explain what it would show while it loads

### If the extension isn't connecting:

1. Show the extension popup directly (click extension icon)
2. Explain the dashboard would normally show live data
3. Continue with Card Masking demo which works without extension

### If Target blocks the demo:

Use Amazon.com instead:
1. Add any item to cart
2. Click "Proceed to checkout"
3. The blocking overlay should appear

### If mock page isn't loading:

Navigate directly: http://localhost:5173/demo/netflix

Alternatively, demonstrate card masking from the Card Masking page in the dashboard (shows card generation UI).

---

## Post-Demo: Questions to Prepare For

1. **Technical**: "What frameworks are you using?"
   - React 18, TypeScript, Express.js API, Chrome Manifest V3
   - Mood detection uses weighted additive scoring model (not ML - deterministic)

2. **Technical**: "Why not use machine learning for mood detection?"
   - Explainability: Users can see exactly why they're flagged
   - Privacy: No model training data leaves the device
   - Latency: Real-time scoring without inference delay
   - Future: ML layer planned for personalized calibration

3. **Business**: "How would this make money?"
   - Subscription management fees, premium features, affiliate partnerships with financial services

4. **Privacy**: "What data do you collect?"
   - Local-only by default; optional sync for cross-device features
   - Behavioral signals are processed in-memory and not persisted

5. **Competition**: "How is this different from browser extensions like Honey?"
   - Proactive prediction vs. reactive coupons
   - Emotional state awareness
   - AI autonomy levels
   - Subscription lifecycle management

---

## Quick Reference: Key URLs

| Page | URL |
|------|-----|
| Dashboard | http://localhost:5173 |
| Purchase Blocking | http://localhost:5173/purchase-blocking |
| Card Masking | http://localhost:5173/card-masking |
| Auto-Negotiation | http://localhost:5173/auto-negotiation |
| Netflix Mock | http://localhost:5173/demo/netflix |
| Google Pay Mock | http://localhost:5173/demo/google-pay |
| API Health | http://localhost:3001/api/health |

---

## Mobile Demo (Pixel 6 / Android)

SubGuard includes a Progressive Web App (PWA) that can be installed on mobile devices for a native app-like experience.

### Mobile Setup

#### Option 1: Same WiFi Network (Recommended)

1. Find your computer's local IP address:
   ```bash
   # On Linux/Mac:
   ip addr | grep "inet " | grep -v 127.0.0.1

   # On Windows:
   ipconfig | findstr /i "IPv4"
   ```

2. Start the app with host binding:
   ```bash
   npm run dev:web
   ```

3. On your Pixel 6, open Chrome and navigate to:
   ```
   http://YOUR_COMPUTER_IP:5173
   ```
   Example: `http://192.168.1.100:5173`

#### Option 2: USB Debugging (More Reliable)

1. Enable Developer Options on Pixel 6:
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → System → Developer options → Enable USB debugging

2. Connect phone via USB cable

3. Forward the port using ADB:
   ```bash
   adb reverse tcp:5173 tcp:5173
   adb reverse tcp:3001 tcp:3001
   ```

4. On your Pixel 6, open Chrome and navigate to:
   ```
   http://localhost:5173
   ```

#### Option 3: Public URL with Tunnel (For Remote Demos)

```bash
npm run demo:mobile
```

This creates a public URL via Cloudflare tunnel and generates a QR code for easy mobile access.

### Installing the PWA

1. Open SubGuard in Chrome on your phone
2. Tap the three-dot menu (⋮)
3. Select **"Add to Home screen"** or **"Install app"**
4. The SubGuard icon will appear on your home screen
5. Open from home screen - it runs in standalone mode (no browser UI)

### Mobile Demo Script (3 Minutes)

#### Part 1: PWA Installation & Mood Dashboard (0:00 - 1:00)

1. **Show the PWA installation:**
   - "SubGuard is a Progressive Web App - it can be installed like a native app."
   - Open from home screen icon
   - "Notice it runs full-screen without browser chrome."

2. **Dashboard walkthrough:**
   - Show the **Spending Forecast** widget (scrolls naturally on mobile)
   - Tap on a day bar to show the detail panel
   - "The AI predicts Thursday is a high-risk day based on your patterns."

3. **Mood Status Card:**
   - Scroll to the mood card
   - "Real-time mood detection works on mobile too."
   - "My current state is [X] with [Y] risk score."

#### Part 2: Smart Notifications (1:00 - 1:30)

1. **Notification Bell:**
   - Tap the notification bell in the header
   - Show the notification center panel
   - "Proactive alerts: mood warnings, pattern predictions, positive reinforcement."

2. **Enable push notifications:**
   - "Users can opt into push notifications for real-time alerts."

#### Part 3: Google Pay Integration Demo (1:30 - 3:00)

1. **Navigate to Google Pay Demo:**
   - Use hamburger menu → "Google Pay Demo"
   - "This shows how SubGuard integrates with mobile payments."

2. **Show the payment flow:**
   - "A user is about to subscribe to Netflix for $19.99/month."
   - Point out the **SubGuard Protected** card is pre-selected
   - "The virtual card masks their real payment details."

3. **Purchase Intercept (if triggered):**
   - If risk is elevated, the **Purchase Intercept screen** may appear
   - "The full-screen intervention shows my risk gauge and triggers."
   - "I can swipe to decide, or use the breathing exercise to pause."

4. **Complete the payment:**
   - Tap **"Pay with Google Pay"**
   - Confirm payment
   - Show processing animation
   - **Success screen** with "Protected by SubGuard" badge

5. **Demonstrate blocking (optional):**
   - Go back and select "Personal Card" instead
   - Attempt payment
   - Show the **blocked** screen
   - "SubGuard detected an unprotected card and blocked the payment."
   - Tap "Use Protected Card" to switch back

### Mobile Demo Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MOBILE DEMO FLOW (3 MIN)                               │
└─────────────────────────────────────────────────────────────────────────────┘

    SETUP              PART 1                PART 2              PART 3
   ────────           ────────              ────────            ────────
      │                  │                     │                   │
      ▼                  ▼                     ▼                   ▼
┌───────────┐     ┌───────────┐         ┌───────────┐      ┌───────────────┐
│ Install   │────▶│ Dashboard │────────▶│  Smart    │─────▶│  Google Pay   │
│ PWA       │     │ + Mood AI │         │  Notifs   │      │  + Intercept  │
└───────────┘     └───────────┘         └───────────┘      └───────────────┘
      │                  │                     │                   │
      ▼                  ▼                     ▼                   ▼
• Add to home       • Spending           • Bell icon          • Protected card
  screen              Forecast           • Notification        • Payment flow
• Open standalone   • Tap day detail       center             • Risk gauge
                    • Mood status        • Push opt-in        • Swipe to decide
                      card
```

### Mobile Talking Points

**"Why a PWA instead of a native app?"**
> "PWAs offer the best of both worlds - native app feel with web development speed. Users can install instantly without app store approval, and we can push updates immediately."

**"Does the mood detection work on mobile?"**
> "Yes - the same behavioral analysis runs on mobile. We track scroll patterns, app switching, time of day, and more. The Spending Forecast and mood status update in real-time."

**"Does it work offline?"**
> "Yes, the service worker caches the app shell. Users can view their dashboard and settings offline. Real-time features require connectivity."

**"What about iOS?"**
> "PWAs work on iOS Safari too, though with some limitations. A native iOS app could be developed for deeper integration with Apple Pay."

### Mobile Troubleshooting

**Can't connect from phone:**
1. Ensure computer and phone are on same WiFi network
2. Check if firewall is blocking port 5173
3. Try USB debugging method instead

**PWA won't install:**
1. Make sure you're using Chrome (not Samsung Browser)
2. The site must be served over localhost or HTTPS
3. Try clearing Chrome cache

**Notifications not working:**
1. Check Chrome notification permissions in phone Settings
2. Ensure "Do Not Disturb" is off
3. Some notification features require HTTPS in production

**Mood status not updating:**
- The service collects signals every 30 seconds
- For faster updates, interact with the page (scroll, tap) to generate signals

---

*For technical architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md)*
*For mood intelligence algorithm details, see [MOOD-INTELLIGENCE.md](MOOD-INTELLIGENCE.md)*
