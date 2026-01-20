# Claude Context for Hyperfolio Frontend

This file provides context for Claude Code (or any AI assistant) working on this project.

## Project Overview

**Hyperfolio Frontend** is a Next.js 16 DeFi portfolio tracker that aggregates data from 40+ blockchain protocols, featuring real-time SSE streaming and multi-wallet support.

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript 5.7+ (strict mode)
- **State Management**: Zustand with persist middleware
- **Data Fetching**: TanStack Query + SSE (Server-Sent Events) streaming
- **Web3**: Wagmi 2.x + Viem 2.x
- **Styling**: Tailwind CSS 4.x with CSS variables
- **API**: https://api.hyperfolio.xyz
- **Documentation**: https://api.hyperfolio.xyz/docs

## Directory Map

```
hyperfolio_fe/
├── app/
│   ├── api/                      # Next.js API routes (server-side)
│   │   ├── auth/token/           # JWT token generation endpoint
│   │   ├── health/               # Health check endpoint
│   │   ├── positions/            # DeFi positions SSE streaming endpoint
│   │   └── wallet/               # Wallet data SSE streaming endpoint
│   ├── layout.tsx                # Root layout with fonts and theme
│   ├── page.tsx                  # Home page (mounts streaming providers)
│   └── providers.tsx             # React providers wrapper (Query, Wagmi, Theme)
│
├── components/
│   ├── home/                     # Home page components and streaming providers
│   │   ├── defi-stream-provider.tsx      # DeFi positions streaming provider
│   │   └── wallet-data-stream-provider.tsx # Wallet data streaming provider
│   ├── portfolio-hero/           # Dashboard overview with sync button
│   ├── sections/                 # Main content sections (DeFi, tokens, NFTs, etc.)
│   └── ui/                       # Reusable Radix UI components
│
├── hooks/                        # Custom React hooks
│   ├── use-positions-stream.ts   # DeFi positions SSE hook
│   └── use-wallet-data-stream.ts # Wallet data SSE hook
│
├── lib/
│   ├── api/                      # API client and authentication
│   │   ├── fetch.ts              # Secure fetch wrapper with token refresh
│   │   └── token-management.tsx  # JWT and HMAC token management
│   ├── store/                    # Zustand state management
│   │   └── wallet-store.ts       # Main store (wallets, streaming, settings)
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions
│   └── wagmi/                    # Web3 configuration
│       ├── config.ts             # Wagmi client configuration
│       └── connectors.ts         # Wallet connectors
│
└── public/                       # Static assets
```

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 16 | React framework with App Router |
| Language | TypeScript 5.7+ | Type-safe development |
| State | Zustand | Global state management |
| Server State | TanStack Query | API caching and synchronization |
| Web3 | Wagmi 2.x + Viem 2.x | Wallet connection and contract interactions |
| UI | Radix UI | Accessible component primitives |
| Styling | Tailwind CSS 4.x | Utility-first CSS framework |
| Testing | Vitest (unit), Playwright (e2e) | Test frameworks |

## Key Architectural Patterns

### SSE Streaming Architecture

The app uses **two independent SSE streams** for progressive data loading:

| Stream | Endpoint | Purpose | Hook |
|--------|----------|---------|------|
| DeFi Positions | `/api/positions/stream` | Streams protocol positions | `usePositionsStream` |
| Wallet Data | `/api/wallet/aggregate/stream` | Streams tokens, NFTs, history | `useWalletDataStream` |

**Critical Pattern**: Always use refs for stream functions to prevent cleanup race conditions:

```typescript
// BAD - function in deps causes cleanup races
useEffect(() => {
  const timer = setTimeout(() => startStream(), 50)
  return () => clearTimeout(timer)
}, [syncTrigger, startStream]) // startStream changes trigger cleanup

// GOOD - use refs for stable references
const startStreamRef = useRef(startStream)
useEffect(() => {
  startStreamRef.current = startStream
}, [startStream])

useEffect(() => {
  if (shouldStart) {
    const timer = setTimeout(() => startStreamRef.current(), 50)
    return () => clearTimeout(timer)
  }
}, [shouldStart]) // Only depends on shouldStart
```

**Progressive Loading**: Both streams run independently, updating the UI progressively as data arrives from each protocol.

### State Management (Zustand)

The main store is organized by domain:

```typescript
interface WalletStore {
  // Wallets domain
  wallets: Wallet[]
  selectedWalletId: string | null

  // Streaming domain (NOT persisted)
  streaming: {
    isStreaming: boolean
    isStreamComplete: boolean
    streamProgress: StreamProgress
    streamedProtocols: Map<string, StreamedProtocol>
  }

  // Settings domain (persisted)
  settings: {
    currency: 'USD' | 'EUR' | 'ETH'
    privacyMode: boolean
  }
}
```

**Persistence Strategy**:
- **Persists**: wallets, selectedWalletId, settings
- **Does NOT persist**: streaming state, temporary data

**Important**: Always use immutable updates when modifying store state:

```typescript
setWallets(prev => [...prev, newWallet]) // GOOD
setWallets(prev => { prev.push(newWallet); return prev }) // BAD
```

### Sync Flow

When user clicks Sync button:

```
handleRefresh() → walletStore.triggerSync(true)
  ↓
syncTrigger increments, data clears, skipCache: true
  ↓
Both providers detect syncTrigger change
  ↓
Each provider restarts its stream independently
  ↓
Progressive updates until both streams complete
```

## Authentication & Security

### HMAC Token System

- **Token payload**: `{iat, exp, fingerprint}` where `fingerprint` = User-Agent hash
- **Token lifetime**: 10 minutes with automatic refresh
- **Generation**: Server-side via `generatePageToken()`
- **Storage**: Not persisted in localStorage (security)

### API Client Patterns

```typescript
// Secure fetch wrapper with auto-refresh
import { secureFetch } from '@/lib/api/fetch'

// Client functions for different data types
import {
  getWalletComposition,
  getWalletTransactions,
  getWalletNFTs
} from '@/lib/api/fetch'
```

**Error Handling**:
- Automatic token refresh before expiry
- No retry on 4xx errors
- Exponential backoff for other errors
- 5-minute stale time for TanStack Query

## Component Patterns

### Server vs Client Components

**Default to Server Components** - Only add `"use client"` when you need:
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (window, localStorage, etc.)
- Third-party libraries requiring client-side rendering

```typescript
// Server Component (default)
export async function MyComponent() {
  const data = await fetchData() // Can use async/await
  return <div>{data}</div>
}

// Client Component
"use client"
export function MyInteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Feature Folder Pattern

Components are organized in feature folders with co-located files:

```
components/portfolio-hero/
├── portfolio-hero.tsx     # Main component
├── use-portfolio-data.ts  # Custom hook
├── types.ts              # Feature types
└── portfolio-hero.test.tsx # Tests
```

### useEffect Best Practices

**Use refs for functions in dependencies** to prevent cleanup race conditions.

**Memoize arrays/objects used in effect dependencies**:

```typescript
// BAD - new array on every render
const addresses = wallets.map(w => w.address)
useEffect(() => {
  startStream()
}, [addresses]) // Effect runs every render!

// GOOD - memoized, only changes when dependencies change
const addresses = useMemo(() => {
  return selectedWalletId
    ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
    : wallets.map(w => w.address)
}, [selectedWalletId, wallets])

useEffect(() => {
  startStream()
}, [addresses]) // Effect runs only when addresses actually change
```

## Web3 Patterns

### Wallet Connection

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return <button onClick={() => disconnect()}>
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </button>
  }

  return <button onClick={() => connect({ connector: connectors[0] })}>
    Connect Wallet
  </button>
}
```

### Contract Interactions (Viem)

```typescript
import { useReadContract, useWriteContract } from 'wagmi'
import { abi } from './abi'

function TokenBalance() {
  const { data: balance } = useReadContract({
    abi,
    address: '0x...',
    functionName: 'balanceOf',
    args: [address],
  })

  const { writeContract } = useWriteContract()

  const transfer = () => {
    writeContract({
      abi,
      address: '0x...',
      functionName: 'transfer',
      args: [toAddress, amount],
    })
  }
}
```

## Code Conventions

### File Naming
- Components: `kebab-case.tsx` (`portfolio-hero.tsx`)
- Hooks: `kebab-case.ts` starting with `use` (`use-positions-stream.ts`)
- Utils: `kebab-case.ts` (`format-value.ts`)
- Types: `kebab-case.ts` or `index.ts` for exports

### Code Style
- Use **2 spaces** for indentation
- Target **80-100 characters** per line (hard limit: 120)
- **PascalCase** for components, types, interfaces
- **camelCase** for functions, variables, hooks
- **UPPER_SNAKE_CASE** for constants

### Import Organization

```typescript
// Group in order: 1) React/Next, 2) External packages, 3) Internal modules
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useWalletStore } from "@/lib/store/wallet-store"
import { formatValue } from "@/lib/utils"
```

## Common Tasks

### Adding a New Streaming Feature

1. **Create SSE endpoint** in `app/api/[feature]/stream/route.ts`
2. **Create streaming hook** in `hooks/use-[feature]-stream.ts`
3. **Create provider** in `components/home/[feature]-stream-provider.tsx`
4. **Add provider** to `app/page.tsx`

**Always use the ref pattern** to prevent cleanup race conditions.

### Adding a New UI Section

1. Create section in `components/sections/[section-name]/`
2. Follow feature folder pattern (co-located files)
3. Use existing UI components from `components/ui/`
4. Connect to Zustand store for state

### Debugging Sync/Stream Issues

Check in this order:
1. [lib/store/wallet-store.ts](lib/store/wallet-store.ts) - `triggerSync()` function
2. Provider files - syncTrigger useEffect dependencies
3. Hook files - `startStream`/`stopStream` dependency arrays
4. Browser console - Look for "[Provider]" or "Stream" logs
5. Network tab - Verify both SSE endpoints are called

### Working with Store

```typescript
// Read state
const { wallets, streaming } = useWalletStore()

// Write action
const { addWallet, removeWallet, triggerSync } = useWalletStore()

// Select specific slice (prevents re-renders)
const isStreaming = useWalletStore(state => state.streaming.isStreaming)
```

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix lint issues
npm run type-check   # TypeScript type check
npm run format       # Format with Prettier
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Key Files Reference

### Entry Points
- [app/page.tsx](app/page.tsx) - Home page (server component), mounts streaming providers
- [app/layout.tsx](app/layout.tsx) - Root layout with fonts and theme
- [app/providers.tsx](app/providers.tsx) - React providers wrapper (Query, Wagmi, Theme)

### Streaming Architecture
- [components/home/defi-stream-provider.tsx](components/home/defi-stream-provider.tsx) - DeFi positions streaming
- [components/home/wallet-data-stream-provider.tsx](components/home/wallet-data-stream-provider.tsx) - Wallet data streaming
- [hooks/use-positions-stream.ts](hooks/use-positions-stream.ts) - Positions SSE hook
- [hooks/use-wallet-data-stream.ts](hooks/use-wallet-data-stream.ts) - Wallet data SSE hook
- [app/api/positions/stream/route.ts](app/api/positions/stream/route.ts) - DeFi positions SSE endpoint
- [app/api/wallet/aggregate/stream/route.ts](app/api/wallet/aggregate/stream/route.ts) - Wallet data SSE endpoint

### State Management
- [lib/store/wallet-store.ts](lib/store/wallet-store.ts) - Zustand store (wallets, streaming, settings)

### API Client
- [lib/api/fetch.ts](lib/api/fetch.ts) - Secure fetch wrapper with token refresh
- [lib/api/token-management.tsx](lib/api/token-management.tsx) - JWT and HMAC token management

### Web3
- [lib/wagmi/config.ts](lib/wagmi/config.ts) - Wagmi client configuration
- [lib/wagmi/connectors.ts](lib/wagmi/connectors.ts) - Wallet connectors

## Additional Documentation

See `.claude/rules/` for more detailed documentation:
- [ai-workflow.md](.claude/rules/ai-workflow.md) - How I prefer to work with AI assistants
- [coding-standards.md](.claude/rules/coding-standards.md) - Frontend coding standards and patterns

## Contact

For questions: stableapy@hyperbeat.org
