# SubGuard - AI-Powered Financial Protection

A cross-platform application for managing subscriptions, blocking unwanted purchases, and negotiating better prices. Includes a Chrome extension for real-time shopping behavior monitoring and AI-powered intervention.

## Quick Start (Demo)

```bash
# 1. Install dependencies
npm install

# 2. Start the web app + API server (single command)
npm run dev:web

# 3. Open http://localhost:5173 in your browser

# 4. Install the Chrome extension (see below)
```

## Chrome Extension Installation

The extension monitors shopping behavior and enforces your AI autonomy settings.

### Step-by-Step Installation

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/` in Chrome
   - Or: Menu (three dots) > Extensions > Manage Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" ON (top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension/` folder in this project

4. **Verify Installation**
   - You should see "SubGuard AI Shopping Assistant" in your extensions
   - The extension icon appears in your toolbar (puzzle piece icon > pin it)

5. **Start Using**
   - Visit any shopping site (Amazon, eBay, Target, etc.)
   - The extension analyzes pages automatically
   - Click the extension icon to see real-time activity

## AI Autonomy Levels

SubGuard offers 4 levels of AI autonomy for financial protection:

| Level | Description | Behavior |
|-------|-------------|----------|
| **Minimal** | Observe only | Tracks activity, no interventions |
| **Moderate** | Gentle nudges | Shows warnings on risky purchases |
| **High** | Active protection | Blocks high-risk checkouts, enforces cooling-off periods |
| **Full** | Complete autonomy | Auto-redirects from shopping sites, enforces all limits strictly |

### Configuring Autonomy

1. Open the dashboard at `http://localhost:5173`
2. Find the "AI Autonomy Level" section
3. Select your preferred level
4. Adjust settings:
   - **Daily Spending Limit**: Maximum daily shopping amount
   - **Max Shopping Time**: Minutes allowed on shopping sites
   - **Checkout Threshold**: Block checkouts above this amount
   - **Cooling-Off Period**: Mandatory wait time before purchases

## Project Structure

```
mgmt8130/
├── chrome-extension/        # Browser extension
│   ├── manifest.json        # Extension configuration
│   ├── content.js           # Page analysis & interventions
│   ├── background.js        # Service worker
│   ├── popup.html/css/js    # Extension popup UI
│   ├── styles/overlay.css   # Intervention overlays
│   └── icons/               # Extension icons
│
├── src/
│   ├── api-server.js        # Express API for extension
│   ├── electron/            # Electron main process
│   └── renderer/            # React frontend
│       ├── features/        # Feature modules
│       │   ├── purchase-blocking/
│       │   ├── card-masking/
│       │   └── auto-negotiation/
│       ├── services/        # API & stub services
│       └── App.tsx          # Main dashboard
│
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start web app + API server (recommended for demo) |
| `npm run dev` | Start full Electron app + renderer + API |
| `npm run dev:renderer` | Start only the Vite dev server |
| `npm run dev:api` | Start only the API server |
| `npm run build` | Build production Electron app |
| `npm run test` | Run tests |

## API Endpoints

The API server runs on `http://localhost:3001`

### Extension Activity
- `GET /api/health` - Health check
- `POST /api/extension/activity` - Log page activity
- `GET /api/extension/stats` - Get session statistics

### Autonomy Settings
- `GET /api/autonomy/settings` - Get current autonomy settings
- `POST /api/autonomy/settings` - Update autonomy settings
- `POST /api/autonomy/check` - Check if an action should be allowed

### Example: Update Autonomy Settings
```bash
curl -X POST http://localhost:3001/api/autonomy/settings \
  -H "Content-Type: application/json" \
  -d '{"settings": {"level": "full", "dailySpendingLimit": 100}}'
```

## Demo Flow

### 1. Basic Demo (Shopping Monitor)
1. Run `npm run dev:web`
2. Install the Chrome extension
3. Open the dashboard at `http://localhost:5173`
4. Visit Amazon, Target, or any shopping site
5. Watch the "Browser Activity" section update in real-time

### 2. AI Autonomy Demo
1. Set autonomy to "Full" in the dashboard
2. Enable "Auto-redirect from risky sites"
3. Visit a shopping site
4. The extension will show intervention overlays:
   - **Purple overlay**: Redirecting you away (with countdown)
   - **Red overlay**: Checkout blocked
   - **Amber overlay**: Cooling-off period active

### 3. Trigger Interventions
To see interventions in action:
- Set a low daily spending limit ($10)
- Set max shopping time to 1 minute
- Browse shopping sites to trigger time limit
- Try to checkout a high-priced item to trigger block

## Features Overview

### Purchase Blocking
Set rules to automatically block unwanted purchases by:
- Merchant name
- Category (gaming, gambling, etc.)
- Amount limits
- Time-based restrictions

### Card Masking
Generate virtual cards for:
- **Single-use**: One transaction, then expires
- **Merchant-locked**: Only works at specific merchants
- **Subscription**: For recurring payments with spend limits

### Auto-Negotiation
Automated subscription price negotiation:
- View all active subscriptions
- One-click negotiation initiation
- Track savings and results

### Browser Extension (NEW)
Real-time shopping behavior analysis:
- Detects shopping sites automatically
- Identifies urgency tactics and dark patterns
- Calculates purchase risk levels
- Enforces AI autonomy settings
- Tracks time spent shopping

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 28
- **Build**: Vite 5
- **State**: Zustand
- **Routing**: React Router 6
- **API**: Express.js
- **Extension**: Chrome Manifest V3

## Team Development

### Feature Assignments

| Feature | Directory | Owner |
|---------|-----------|-------|
| **Purchase Blocking** | `src/renderer/features/purchase-blocking/` | Team Member 1 |
| **Card Masking** | `src/renderer/features/card-masking/` | Team Member 2 |
| **Auto-Negotiation** | `src/renderer/features/auto-negotiation/` | Team Member 3 |

### Development Workflow

1. Each developer works in their feature directory
2. Shared types are in `src/renderer/shared/types.ts`
3. Use stub services for mock data during development
4. API server handles extension communication

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 5173 and 3001
lsof -ti:5173 -ti:3001 | xargs kill -9
```

### Extension Not Connecting
1. Ensure API server is running (`npm run dev:api` or `npm run dev:web`)
2. Check that you're on `http://localhost:3001`
3. Reload the extension in `chrome://extensions/`

### Extension Not Detecting Shopping Sites
- The extension detects major retailers (Amazon, eBay, Target, Walmart, etc.)
- Check the console for detection logs
- Refresh the page after installing the extension

---

*MGMT 8130 Project - AI-Powered Financial Protection Demo*
