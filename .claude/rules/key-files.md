---
paths: *
---

# Key Files Reference - Hyperfolio Frontend

Quick reference for the most important files in the codebase.

## Configuration

| File | Purpose |
|------|---------|
| [package.json](package.json) | Dependencies and scripts |
| [next.config.mjs](next.config.mjs) | Next.js configuration |
| [tsconfig.json](tsconfig.json) | TypeScript configuration |
| [tailwind.config.ts](tailwind.config.ts) | Design tokens and theme |
| [.env.example](.env.example) | Required environment variables |
| [app/layout.tsx](app/layout.tsx) | Root layout with fonts and theme |
| [app/providers.tsx](app/providers.tsx) | React providers (Query, Wagmi, etc.) |

## Main Application

| File | Purpose |
|------|---------|
| [app/page.tsx](app/page.tsx) | Home page, mounts streaming providers |
| [components/portfolio-hero/portfolio-hero.tsx](components/portfolio-hero/portfolio-hero.tsx) | Dashboard hero with sync button |

## Streaming Architecture

### Providers
| File | Purpose |
|------|---------|
| [components/home/defi-stream-provider.tsx](components/home/defi-stream-provider.tsx) | DeFi positions streaming provider |
| [components/home/wallet-data-stream-provider.tsx](components/home/wallet-data-stream-provider.tsx) | Wallet data streaming provider |

### Hooks
| File | Purpose |
|------|---------|
| [hooks/use-positions-stream.ts](hooks/use-positions-stream.ts) | SSE hook for positions streaming |
| [hooks/use-wallet-data-stream.ts](hooks/use-wallet-data-stream.ts) | SSE hook for wallet data streaming |

### API Routes
| File | Purpose |
|------|---------|
| [app/api/positions/stream/route.ts](app/api/positions/stream/route.ts) | SSE endpoint for DeFi positions |
| [app/api/wallet/aggregate/stream/route.ts](app/api/wallet/aggregate/stream/route.ts) | SSE endpoint for wallet data |

## State Management

| File | Purpose |
|------|---------|
| [lib/store/wallet-store.ts](lib/store/wallet-store.ts) | Zustand store for wallets, streaming state, settings |
| [lib/store/use-sync-trigger.ts](lib/store/use-sync-trigger.ts) | Hook for sync trigger state |

## API Client

| File | Purpose |
|------|---------|
| [lib/api/fetch.ts](lib/api/fetch.ts) | Secure fetch wrapper with token refresh |
| [lib/api/token-management.tsx](lib/api/token-management.tsx) | JWT and HMAC token management |
| [lib/api/index.ts](lib/api/index.ts) | API client exports |

## Web3 Configuration

| File | Purpose |
|------|---------|
| [lib/wagmi/config.ts](lib/wagmi/config.ts) | Wagmi client configuration |
| [lib/wagmi/connectors.ts](lib/wagmi/connectors.ts) | Wallet connectors |
| [lib/wagmi/chains.ts](lib/wagmi/chains.ts) | Chain configurations |

## Components - Sections

| File | Purpose |
|------|---------|
| [components/sections/defi-section](components/sections/defi-section) | DeFi positions display |
| [components/sections/tokens-section](components/sections/tokens-section) | Token balances display |
| [components/sections/nfts-section](components/sections/nfts-section) | NFT collection display |
| [components/sections/history-section](components/sections/history-section) | Transaction history display |

## Components - UI

| Directory | Purpose |
|-----------|---------|
| [components/ui/](components/ui/) | Reusable Radix UI components |
| [components/ui/button.tsx](components/ui/button.tsx) | Button component |
| [components/ui/dialog.tsx](components/ui/dialog.tsx) | Dialog/modal component |
| [components/ui/toast.tsx](components/ui/toast.tsx) | Toast notifications |

## Utilities

| File | Purpose |
|------|---------|
| [lib/utils/format.ts](lib/utils/format.ts) | Number and value formatting |
| [lib/utils/transformers.ts](lib/utils/transformers.ts) | Data transformation utilities |
| [lib/types/api.ts](lib/types/api.ts) | API response type definitions |
| [lib/types/index.ts](lib/types/index.ts) | Shared type exports |

## Swap Widget

| File | Purpose |
|------|---------|
| [components/swap-widget/](components/swap-widget/) | DEX swap integration |
| [components/swap-widget/gluex-widget.tsx](components/swap-widget/gluex-widget.tsx) | GlueX integration |
| [components/swap-widget/kyberswap-widget.tsx](components/swap-widget/kyberswap-widget.tsx) | KyberSwap integration |

## Debugging Sync Issues

When debugging sync/streaming issues, check files in this order:

1. **[lib/store/wallet-store.ts](lib/store/wallet-store.ts)** - `triggerSync()` function
2. **Provider files** - syncTrigger useEffect dependencies
3. **Hook files** - `startStream`/`stopStream` dependency arrays
4. **Browser console** - Look for "[Provider]" or "Stream" logs
5. **Network tab** - Verify both SSE endpoints are called

## When to Edit Each File

### Adding a new streaming endpoint
1. Create API route in [app/api/](app/api/)
2. Create hook in [hooks/](hooks/)
3. Create provider in [components/home/](components/home/)
4. Add provider to [app/page.tsx](app/page.tsx)

### Adding a new UI component
1. Check [components/ui/](components/ui/) for existing primitives
2. Create feature component in appropriate section folder
3. Follow feature folder pattern (co-located files)

### Modifying state
1. Check [lib/store/wallet-store.ts](lib/store/wallet-store.ts)
2. For local state, use useState
3. For server state, use TanStack Query

### Updating styling
1. Check [tailwind.config.ts](tailwind.config.ts) for theme values
2. Use CSS variables from [app/globals.css](app/globals.css)
3. Don't add new colors without checking theme first
