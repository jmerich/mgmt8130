# SubGuard Architecture

Technical architecture documentation for the SubGuard platform.

**Related Documentation:**
- [Main README](../README.md) - Overview and quick start
- [Demo Guide](DEMO-GUIDE.md) - 4-minute live demo workflow

---

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Chrome Extension Architecture](#chrome-extension-architecture)
- [API Server Architecture](#api-server-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Autonomy System](#autonomy-system)
- [Security Considerations](#security-considerations)

---

## System Overview

SubGuard consists of three main components that work together:

```mermaid
graph TB
    subgraph "User's Browser"
        EXT[Chrome Extension]
        WEB[React Dashboard]
    end

    subgraph "Local Server"
        API[Express API Server]
        STORE[(In-Memory Store)]
    end

    subgraph "External"
        SHOP[Shopping Sites]
        MOCK[Mock Payment Pages]
    end

    EXT -->|Page Analysis| API
    EXT -->|Autonomy Check| API
    API -->|Settings & Data| WEB
    WEB -->|Config Updates| API
    EXT -->|Monitor| SHOP
    EXT -->|Autofill| MOCK
    API --> STORE
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Chrome Extension** | Page monitoring, checkout interception, card autofill, overlay display |
| **API Server** | Data aggregation, autonomy rule evaluation, settings storage |
| **React Dashboard** | User interface, settings management, analytics display |

---

## Component Architecture

### High-Level Architecture

```mermaid
graph LR
    subgraph "Chrome Extension"
        CS[content.js<br/>Page Analysis]
        BG[background.js<br/>Service Worker]
        PP[popup.js<br/>Quick Stats]
    end

    subgraph "API Layer"
        API[api-server.js<br/>Express]
    end

    subgraph "React Frontend"
        APP[App.tsx<br/>Dashboard]
        PB[Purchase<br/>Blocking]
        CM[Card<br/>Masking]
        AN[Auto<br/>Negotiation]
    end

    CS --> BG
    BG --> API
    API --> APP
    APP --> PB
    APP --> CM
    APP --> AN
```

---

## Data Flow

### Shopping Detection & Intervention Flow

```mermaid
sequenceDiagram
    participant User
    participant Page as Shopping Page
    participant CS as content.js
    participant BG as background.js
    participant API as API Server
    participant DB as Dashboard

    User->>Page: Visit shopping site
    Page->>CS: Page load event
    CS->>CS: Analyze page content
    CS->>BG: Send page analysis
    BG->>API: POST /extension/page-analysis
    API->>API: Store analysis
    API-->>DB: Available via GET /extension/data

    Note over CS: User clicks checkout

    User->>Page: Click checkout button
    CS->>CS: Intercept click
    CS->>BG: Request autonomy check
    BG->>API: POST /autonomy/check
    API->>API: Evaluate rules
    API-->>BG: Decision (allow/block)
    BG-->>CS: Decision result

    alt Decision: Block
        CS->>Page: Show blocking overlay
    else Decision: Allow
        CS->>Page: Allow click to proceed
    end
```

### Card Masking Autofill Flow

```mermaid
sequenceDiagram
    participant User
    participant Page as Payment Page
    participant CS as content.js
    participant BG as background.js
    participant API as API Server

    User->>Page: Visit payment form
    CS->>CS: Detect card fields
    CS->>Page: Show autofill prompt

    User->>Page: Click "Use SubGuard"
    CS->>BG: GET_MERCHANT_CARD
    BG->>BG: Generate/retrieve card
    BG-->>CS: Card details
    CS->>Page: Autofill card fields
    CS->>BG: CARD_FIELD_FILLED
    BG->>API: POST /cards/autofill
    API->>API: Record autofill event
```

---

## Chrome Extension Architecture

### File Structure

```
chrome-extension/
├── manifest.json       # Extension manifest (V3)
├── background.js       # Service worker
├── content.js          # Content script (injected into pages)
├── config.js           # Configuration
├── popup.html/css/js   # Extension popup UI
├── styles/
│   └── overlay.css     # Intervention overlay styles
└── icons/              # Extension icons
```

### Content Script (content.js)

```mermaid
graph TD
    subgraph "Page Analysis"
        A[Page Load] --> B{Is Shopping Site?}
        B -->|Yes| C[Extract Prices]
        B -->|Yes| D[Detect Dark Patterns]
        B -->|Yes| E[Find Checkout Buttons]
        C --> F[Calculate Risk Level]
        D --> F
        E --> G[Attach Click Handlers]
    end

    subgraph "Intervention"
        G --> H{Checkout Clicked}
        H --> I[Check Autonomy Rules]
        I -->|Block| J[Show Overlay]
        I -->|Allow| K[Proceed]
    end

    subgraph "Card Detection"
        L[Detect Card Fields] --> M[Show Autofill Prompt]
        M --> N{User Accepts}
        N -->|Yes| O[Autofill Card]
    end
```

### Background Service Worker (background.js)

Responsibilities:
- **Data Aggregation**: Collects and stores session data
- **API Communication**: Syncs with the Express server
- **Card Storage**: Manages virtual card generation and storage
- **Message Handling**: Routes messages between content scripts and API

```mermaid
graph LR
    subgraph "Message Handlers"
        M1[PAGE_ANALYSIS]
        M2[CHECK_AUTONOMY]
        M3[GET_MERCHANT_CARD]
        M4[CARD_FIELD_FILLED]
        M5[SYNC_DATA]
    end

    subgraph "Storage"
        S1[aggregatedData]
        S2[merchantCards]
        S3[settings]
    end

    M1 --> S1
    M3 --> S2
    M5 --> API[API Server]
```

---

## API Server Architecture

### Endpoint Structure

```mermaid
graph TD
    subgraph "Express Server :3001"
        subgraph "Extension Endpoints"
            E1[POST /extension/sync]
            E2[POST /extension/page-analysis]
            E3[GET /extension/data]
        end

        subgraph "Autonomy Endpoints"
            A1[GET /autonomy/settings]
            A2[POST /autonomy/settings]
            A3[POST /autonomy/check]
        end

        subgraph "Card Endpoints"
            C1[GET /cards/merchant]
            C2[POST /cards/merchant]
            C3[POST /cards/autofill]
        end
    end

    subgraph "In-Memory Store"
        D1[extensionData]
        D2[autonomySettings]
        D3[merchantCards]
    end

    E1 --> D1
    E2 --> D1
    A1 --> D2
    A2 --> D2
    C1 --> D3
    C2 --> D3
```

### Autonomy Check Logic

```mermaid
flowchart TD
    A[Receive Check Request] --> B{Autonomy Level?}

    B -->|Minimal/Moderate| C[Return: Allow]
    B -->|High/Full| D{Daily Spend Exceeded?}

    D -->|Yes| E[Return: Block Checkout]
    D -->|No| F{Time Limit Exceeded?}

    F -->|Yes| G[Return: Redirect Away]
    F -->|No| H{Price > Threshold?}

    H -->|Yes| I[Return: Require Cooling-Off]
    H -->|No| J{Risk Level Critical?}

    J -->|Yes & Full Autonomy| K[Return: Redirect Away]
    J -->|No| C
```

---

## Frontend Architecture

### React Component Hierarchy

```mermaid
graph TD
    subgraph "App Structure"
        APP[App.tsx]
        APP --> TOAST[ToastProvider]
        APP --> ROUTER[BrowserRouter]
        ROUTER --> CONTENT[AppContent]
    end

    subgraph "AppContent"
        CONTENT --> NAV[Sidebar Navigation]
        CONTENT --> ROUTES[Routes]
    end

    subgraph "Routes"
        ROUTES --> DASH[Dashboard /]
        ROUTES --> PB[PurchaseBlockingPage]
        ROUTES --> CM[CardMaskingPage]
        ROUTES --> AN[AutoNegotiationPage]
        ROUTES --> DEMO[NetflixMockPage]
    end

    subgraph "Dashboard Components"
        DASH --> SAVINGS[Savings Overview]
        DASH --> BROWSER[Browser Activity]
        DASH --> AUTONOMY[Autonomy Settings]
        DASH --> FEATURES[Feature Cards]
    end
```

### State Management

```mermaid
graph LR
    subgraph "Local State"
        RS[React useState]
    end

    subgraph "API State"
        ED[extensionData]
        AS[autonomySettings]
    end

    subgraph "Polling"
        P1[5s: Extension Data]
        P2[On Change: Settings]
    end

    P1 --> ED
    P2 --> AS
    ED --> RS
    AS --> RS
```

---

## Autonomy System

### Autonomy Levels Comparison

```mermaid
graph TD
    subgraph "Minimal"
        M1[Track Only]
        M2[No Interventions]
    end

    subgraph "Moderate"
        MO1[Track + Warnings]
        MO2[5min Cooling-Off]
        MO3[Risk Nudges]
    end

    subgraph "High"
        H1[Active Intervention]
        H2[Auto-Redirect on Risk]
        H3[10min Cooling-Off]
        H4[Checkout Blocking]
    end

    subgraph "Full"
        F1[Complete AI Control]
        F2[15min Cooling-Off]
        F3[Auto-Redirect Always]
        F4[Strict Limit Enforcement]
    end
```

### Settings Schema

```typescript
interface AutonomySettings {
  level: 'minimal' | 'moderate' | 'high' | 'full';
  dailySpendingLimit: number;      // $ amount
  maxShoppingTime: number;         // minutes
  blockCheckoutAbove: number;      // $ threshold
  autoRedirectOnRisk: boolean;
  enforceCoolingOff: boolean;
  coolingOffMinutes: number;
}
```

---

## Security Considerations

### Data Flow Security

```mermaid
graph TD
    subgraph "Browser (Trusted)"
        EXT[Extension]
        DASH[Dashboard]
    end

    subgraph "Local Only"
        API[API Server]
        STORE[In-Memory Store]
    end

    subgraph "External (Untrusted)"
        SHOP[Shopping Sites]
    end

    EXT -->|localhost only| API
    DASH -->|localhost only| API
    EXT -.->|Read Only| SHOP

    style STORE fill:#90EE90
    style API fill:#90EE90
```

### Key Security Features

| Feature | Implementation |
|---------|---------------|
| **No External Data Transmission** | All data stays on localhost |
| **Card Data Isolation** | Virtual cards stored locally in extension |
| **Content Script Isolation** | Runs in isolated world from page scripts |
| **CORS Protection** | API only accepts requests from known origins |

### Virtual Card Security

```mermaid
graph LR
    subgraph "Generation"
        GEN[Generate Card] --> STORE[Local Storage]
    end

    subgraph "Usage"
        STORE --> MASK[Masked Display]
        STORE --> AUTO[Autofill]
    end

    subgraph "Never Transmitted"
        REAL[Real Card Numbers]
    end

    REAL -.->|Never Leaves| EXT[Extension]
```

---

## File Reference

### Key Files and Their Purposes

| File | Purpose |
|------|---------|
| `chrome-extension/content.js` | Page analysis, checkout interception, overlays |
| `chrome-extension/background.js` | Data aggregation, API sync, card storage |
| `chrome-extension/config.js` | Extension configuration |
| `src/api-server.js` | Express API server |
| `src/config.ts` | Centralized app configuration |
| `src/renderer/App.tsx` | Main dashboard and routing |
| `src/renderer/features/*/` | Feature-specific components |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `chrome-extension/manifest.json` | Extension manifest |

---

## Deployment Architecture

### Development Mode

```mermaid
graph LR
    subgraph "npm run dev:web"
        VITE[Vite Dev Server<br/>:5173]
        API[Express API<br/>:3001]
    end

    BROWSER[Browser] --> VITE
    BROWSER --> API
    EXT[Extension] --> API
```

### Production Mode (Electron)

```mermaid
graph LR
    subgraph "Electron App"
        MAIN[Main Process]
        RENDER[Renderer Process]
        API[Embedded API]
    end

    MAIN --> RENDER
    MAIN --> API
    EXT[Extension] --> API
```

---

*For demo instructions, see [DEMO-GUIDE.md](DEMO-GUIDE.md)*
*For quick start, see [README.md](../README.md)*
