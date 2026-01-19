---
paths: *
---

# Frontend Architecture - Hyperfolio

## Project Overview

**Hyperfolio Frontend** is a Next.js 16 DeFi portfolio tracker that aggregates data from 40+ blockchain protocols, featuring real-time SSE streaming and multi-wallet support.

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript 5.7+ with strict mode
- **State**: Zustand with persist middleware
- **Data Fetching**: TanStack Query + SSE streaming
- **Web3**: Wagmi 2.x + Viem 2.x
- **Styling**: Tailwind CSS 4.x
- **API**: https://api.hyperfolio.xyz

## Directory Structure

```
hyperfolio_fe/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (SSE, fetch)
│   │   ├── positions/stream/     # DeFi positions SSE
│   │   └── wallet/aggregate/stream/  # Wallet data SSE
│   ├── page.tsx                  # Home page (server component)
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # React providers wrapper
│
├── components/                   # React components
│   ├── sections/                 # Feature sections
│   │   ├── defi-section/         # DeFi positions display
│   │   ├── tokens-section/       # Token balances
│   │   ├── nfts-section/         # NFT collection
│   │   └── history-section/      # Transaction history
│   ├── portfolio-hero/           # Dashboard overview
│   ├── swap-widget/              # DEX integration
│   ├── wallet/                   # Wallet-related components
│   ├── home/                     # Home-specific (providers)
│   └── ui/                       # Reusable Radix components
│
├── hooks/                        # Custom React hooks
│   ├── use-positions-stream.ts   # DeFi SSE hook
│   ├── use-wallet-data-stream.ts # Wallet data SSE hook
│   └── use-sync-trigger.ts       # Sync state hook
│
├── lib/                          # Utilities and configuration
│   ├── api/                      # API client
│   │   ├── fetch.ts              # Secure fetch wrapper
│   │   └── token-management.tsx  # JWT/HMAC tokens
│   ├── store/                    # Zustand stores
│   │   └── wallet-store.ts       # Main state store
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Helper functions
│   └── wagmi/                    # Web3 configuration
│
├── public/                       # Static assets
├── styles/                       # Global styles
└── .claude/                      # AI assistant rules
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Interaction                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       app/page.tsx (Server)                         │
│  - Fetches initial data on server                                   │
│  - Renders layout and providers                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    components/home/*-stream-provider.tsx            │
│  - Monitors syncTrigger from store                                  │
│  - Manages SSE stream lifecycle                                     │
└────────────┬───────────────────────────────┬────────────────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐      ┌──────────────────────────────────┐
│  usePositionsStream    │      │  useWalletDataStream            │
│  - SSE to              │      │  - SSE to                        │
│    /api/positions/stream│     │    /api/wallet/aggregate/stream  │
└────────────┬───────────┘      └────────────┬─────────────────────┘
             │                               │
             └───────────────┬───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    lib/store/wallet-store.ts                        │
│  - Central state management                                         │
│  - Streaming progress tracking                                      │
│  - Wallet CRUD operations                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   UI Components (Consumers)                         │
│  - components/sections/*                                            │
│  - components/portfolio-hero/*                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## State Management Strategy

### Zustand Store Structure

The main store ([lib/store/wallet-store.ts](lib/store/wallet-store.ts)) is organized by domain:

```typescript
interface WalletStore {
  // Domain: Wallets
  wallets: Wallet[]
  selectedWalletId: string | null

  // Domain: Streaming
  streaming: {
    isStreaming: boolean
    isStreamComplete: boolean
    streamProgress: StreamProgress
    streamedProtocols: Map<string, StreamedProtocol>
  }

  // Domain: Wallet Data
  walletDataStreaming: {
    isStreaming: boolean
    isComplete: boolean
    progress: StreamProgress
  }

  // Domain: Settings
  settings: {
    currency: 'USD' | 'EUR' | 'ETH'
    privacyMode: boolean
  }

  // Actions
  addWallet: (address: string) => void
  removeWallet: (id: string) => void
  triggerSync: (skipCache?: boolean) => void
}
```

### Persist Strategy

- Uses `zustand/persist` middleware
- Persists to localStorage
- Only persists: wallets, selectedWalletId, settings
- Does NOT persist: streaming state, temporary data

## Component Architecture Patterns

### Server vs Client Components

```
Server Components (Default)
├── app/page.tsx                 # Main page
├── app/layout.tsx               # Root layout
└── components/sections/*        # Can be server if no hooks

Client Components ("use client")
├── app/providers.tsx            # Providers wrapper
├── components/home/*-provider   # Streaming providers
├── components/portfolio-hero/*  # Interactive dashboard
├── hooks/*                      # All hooks
└── components/ui/*              # Interactive UI components
```

### Feature Folder Pattern

Components are organized by feature with co-located files:

```
components/portfolio-hero/
├── portfolio-hero.tsx           # Main component
├── use-portfolio-data.ts        # Custom hook (if needed)
├── types.ts                     # Feature types (if needed)
└── portfolio-hero.test.tsx      # Tests (if needed)
```

### Provider Composition

```
app/page.tsx
└── <DefiStreamProvider>
    └── <WalletDataStreamProvider>
        └── <PortfolioHero>
            └── <Sections />
```

## API Integration Patterns

### Secure Fetch Wrapper

All API calls use the secure fetch wrapper ([lib/api/fetch.ts](lib/api/fetch.ts)):

```typescript
import { secureFetch } from '@/lib/api/fetch'

const response = await secureFetch(`/api/wallets/${address}`)
if (!response.ok) {
  throw new Error(`Failed: ${response.statusText}`)
}
const data = await response.json()
```

### Token Management

The app uses JWT tokens with automatic refresh ([lib/api/token-management.tsx](lib/api/token-management.tsx)):

- HMAC-signed tokens for API authentication
- Automatic token refresh before expiry
- Secure token storage in memory

### SSE Streaming

Streaming endpoints use Server-Sent Events:

```typescript
const eventSource = new EventSource(`/api/positions/stream?addresses=${addrs}`)

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // Handle: 'progress', 'data', 'complete', 'error'
}
```

## Web3 Integration

### Wagmi Configuration

[lib/wagmi/config.ts](lib/wagmi/config.ts) provides:

```typescript
const config = createConfig({
  chains: [hyperevm, mainnet, ...],
  connectors: [injected, coinbaseWallet, walletConnect],
  transports: {
    [hyperevm.id]: http(),
    [mainnet.id]: http(),
  },
})
```

### Wallet Connection Pattern

```typescript
import { useAccount, useConnect } from 'wagmi'

function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  return <button onClick={() => connect({ connector: connectors[0] })}>
    Connect Wallet
  </button>
}
```

## Styling Architecture

### Tailwind CSS Setup

- Uses **Tailwind CSS 4.x** with PostCSS
- CSS variables for theme values in [app/globals.css](app/globals.css)
- Design tokens defined in [tailwind.config.ts](tailwind.config.ts)

### Theme Variables

```css
/* app/globals.css */
:root {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 11%;
  /* ... more tokens */
}
```

Usage in components:

```tsx
<div className="bg-card text-card-foreground">
  Content
</div>
```

### Design Patterns

- **Terminal-inspired**: Monospace fonts, command-line aesthetic
- **Dark theme**: Default dark mode with light toggle support
- **Mobile-first**: Responsive design with breakpoints
- **Animations**: Subtle transitions for state changes

## Performance Optimizations

### Code Splitting

- Dynamic imports for non-critical features
- Route-based splitting with App Router
- Component lazy loading where appropriate

### Data Caching

- TanStack Query for server state caching
- Zustand persist for local state
- API-level cache with `?cache=false` bypass

### Streaming

- Progressive data loading via SSE
- Incremental UI updates as data arrives
- Progress indicators for user feedback

## Key Dependencies

### Core
- `next@16.0.0` - Framework
- `react@19` - UI library
- `typescript@5` - Type safety

### State & Data
- `zustand@5` - State management
- `@tanstack/react-query@5` - Server state

### Web3
- `wagmi@2` - Wallet connection
- `viem@2` - Ethereum client
- `ethers@6` - Contract interaction

### UI
- `tailwindcss@4` - Styling
- `@radix-ui/*` - Component primitives
- `recharts@2` - Charts
- `lucide-react` - Icons

## Testing Strategy

- **Vitest**: Unit tests for utilities and hooks
- **Playwright**: E2E tests for critical flows
- **Testing Library**: Component testing

```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:coverage  # Coverage report
```

## Build & Deployment

```bash
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Lint code
npm run type-check     # TypeScript check
```

## Related Documentation

- [react-patterns.md](.claude/rules/react-patterns.md) - React hooks patterns
- [streaming-architecture.md](.claude/rules/streaming-architecture.md) - SSE patterns
- [key-files.md](.claude/rules/key-files.md) - Quick file reference
