# SubGuard Demo Guide

A structured 4-minute live demo showcasing SubGuard's key features.

**Related Documentation:**
- [Main README](../README.md) - Overview and quick start
- [Architecture](ARCHITECTURE.md) - System architecture and diagrams

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

---

## Demo Script (4 Minutes)

### Minute 1: Introduction & Dashboard Overview (0:00 - 1:00)

**Start on Tab 1 (Dashboard)**

> "SubGuard is an AI-powered financial protection platform that helps users manage subscriptions and control impulse spending."

**Point out key dashboard elements:**

1. **Savings Overview** (top)
   - "Here we see total savings from blocked purchases, cancelled trials, and negotiated subscriptions."

2. **Browser Activity Monitor**
   - "This shows real-time shopping activity detected by our Chrome extension."
   - "The extension is currently connected and tracking."

3. **AI Autonomy Levels** (scroll to section)
   - "Users can choose how much control to give the AI - from observe-only to full autonomy."
   - **Click through each level briefly**: Minimal → Moderate → High → Full
   - "For this demo, I'll set it to **Full** so we can see the AI actively intervene."

**Action:** Set autonomy to **Full** and set "Block Checkout Above" to **$1**.

---

### Minute 2: Card Masking Demo (1:00 - 2:00)

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

### Minute 3: AI Autonomy & Checkout Blocking (2:00 - 3:00)

**Switch to Tab 3 (Target.com)**

> "Now let's see how AI autonomy protects against impulse purchases."

**Live checkout blocking demo:**

1. "I'm on Target.com. Let me add something to cart."
   - Add any item to cart

2. "Now watch what happens when I try to checkout."
   - Click **"Sign in to check out"** or **"Check out"** button

3. **Show the blocking overlay:**
   - "SubGuard immediately blocked this checkout!"
   - Point out the red overlay with explanation
   - "It detected that this purchase exceeds our $1 limit and is protecting my financial goals."

4. **Explain the intervention options:**
   - "Users can go back to shopping or view the dashboard to adjust settings."
   - "This is the 'Full Autonomy' level - the AI actively prevents checkouts that don't align with your budget."

**Action:** Click "Go Back to Shopping" to dismiss.

---

### Minute 4: Feature Overview & Wrap-up (3:00 - 4:00)

**Return to Tab 1 (Dashboard)**

> "Let me quickly show you the other features."

**Navigate to Purchase Blocking page:**
- "Users can set custom rules - block specific merchants, categories, or set spending limits."
- Show the rules interface briefly

**Navigate to Auto-Negotiation page:**
- "SubGuard can automatically negotiate better prices on your subscriptions."
- "It shows all your subscriptions and potential savings."

**Return to Dashboard for closing:**

> "In summary, SubGuard provides:
> - Real-time shopping behavior monitoring
> - AI-powered interventions at 4 autonomy levels
> - Virtual card protection for subscriptions
> - Automated price negotiation
>
> All designed to help users take back control of their spending."

**End with the savings display:**
- "And as you can see, these features have already saved over $1,500 this year."

---

## Demo Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        4-MINUTE DEMO FLOW                        │
└─────────────────────────────────────────────────────────────────┘

 MINUTE 1                MINUTE 2               MINUTE 3              MINUTE 4
 ─────────              ─────────              ─────────             ─────────
    │                      │                      │                     │
    ▼                      ▼                      ▼                     ▼
┌─────────┐          ┌──────────┐          ┌──────────┐          ┌─────────┐
│Dashboard│──────────│ Netflix  │──────────│ Target   │──────────│Features │
│Overview │          │Mock Page │          │Checkout  │          │Overview │
└─────────┘          └──────────┘          └──────────┘          └─────────┘
    │                      │                      │                     │
    ▼                      ▼                      ▼                     ▼
• Savings stats      • Virtual card        • Add item to        • Purchase
• Browser activity     autofill              cart                 Blocking
• AI autonomy        • Click SubGuard      • Click checkout     • Auto-Negotiation
  levels               prompt              • Show blocking      • Savings recap
• Set to "Full"      • Show protected        overlay
                       subscription
```

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

2. **Business**: "How would this make money?"
   - Subscription management fees, premium features, affiliate partnerships with financial services

3. **Privacy**: "What data do you collect?"
   - Local-only by default; optional sync for cross-device features

4. **Competition**: "How is this different from browser extensions like Honey?"
   - Proactive protection vs. reactive coupons; AI autonomy levels; subscription lifecycle management

---

## Quick Reference: Key URLs

| Page | URL |
|------|-----|
| Dashboard | http://localhost:5173 |
| Purchase Blocking | http://localhost:5173/purchase-blocking |
| Card Masking | http://localhost:5173/card-masking |
| Auto-Negotiation | http://localhost:5173/auto-negotiation |
| Netflix Mock | http://localhost:5173/demo/netflix |
| API Health | http://localhost:3001/api/health |

---

*For technical architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md)*
