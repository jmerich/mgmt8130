# SubGuard - Subscription Protection Tool

A cross-platform desktop application for managing subscriptions, blocking unwanted purchases, and negotiating better prices.

## Team Development Guide

This project is scaffolded for **3 developers to work in parallel**. Each feature is self-contained in its own module.

### Feature Assignments

| Feature | Directory | Owner |
|---------|-----------|-------|
| **Purchase Blocking** | `src/renderer/features/purchase-blocking/` | Team Member 1 |
| **Card Masking** | `src/renderer/features/card-masking/` | Team Member 2 |
| **Auto-Negotiation** | `src/renderer/features/auto-negotiation/` | Team Member 3 |

### Project Structure

```
mgmt8130/
├── src/
│   ├── electron/           # Electron main process
│   │   ├── main.ts         # App entry point & IPC handlers
│   │   └── preload.ts      # Secure bridge to renderer
│   │
│   └── renderer/           # React frontend
│       ├── features/       # Feature modules (one per team member)
│       │   ├── purchase-blocking/
│       │   ├── card-masking/
│       │   └── auto-negotiation/
│       ├── services/       # Stub/mock services (MVP)
│       ├── shared/         # Shared types & utilities
│       └── App.tsx         # Main app shell & routing
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Development Workflow

1. **Each developer works in their feature directory**
   - All feature-specific components, styles, and logic stay in the feature folder
   - Import shared types from `@/shared/types`
   - Use stub services from `@/services/stub-service`

2. **Shared interfaces are in `src/renderer/shared/types.ts`**
   - Coordinate on type changes to avoid conflicts
   - Add new types as needed for your feature

3. **Stub services provide mock data**
   - Located in `src/renderer/services/stub-service.ts`
   - Replace with real API calls when ready
   - Simulates network delays for realistic demo

### MVP Notes

- **Stubbing is expected** - Mock data and simulated responses are built-in
- **Demo-focused** - UI is functional but uses fake data
- **Cross-platform ready** - Electron builds for Windows, macOS, and Linux

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 28
- **Build**: Vite 5
- **State**: Zustand (available, not required)
- **Routing**: React Router 6

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production app |
| `npm run test` | Run tests |
| `npm run lint` | Check code style |

## Features Overview

### 1. Purchase Blocking
Set rules to automatically block unwanted purchases by:
- Merchant name
- Category (gaming, gambling, etc.)
- Amount limits
- Time-based restrictions

### 2. Card Masking
Generate virtual cards for:
- **Single-use**: One transaction, then expires
- **Merchant-locked**: Only works at specific merchants
- **Subscription**: For recurring payments with spend limits

### 3. Auto-Negotiation
Automated subscription price negotiation:
- View all active subscriptions
- One-click negotiation initiation
- Track savings and results

---

*MGMT 8130 Project - MVP Demo*
