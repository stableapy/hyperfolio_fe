# Architecture

**Analysis Date:** 2025-01-19

## Pattern Overview

**Overall:** Next.js 16 App Router with Server-Sent Events (SSE) streaming and Zustand state management

**Key Characteristics:**
- Server Components by default, Client Components for interactivity
- Dual SSE streaming architecture for progressive data loading
- Zustand global state with persistence middleware
- Feature-based folder structure with co-located files
- API route proxy pattern for backend integration

## Layers

**Server Layer (App Router):**
- Purpose: Server-side rendering, API routes, SSE streaming endpoints
- Location: `app/`
- Contains: Route handlers, SSE proxy endpoints, metadata generation
- Depends on: External API (api.hyperfolio.xyz), Next.js server APIs
- Used by: Client components through fetch and SSE connections

**State Management Layer:**
- Purpose: Global state for wallets, streaming progress, user settings
- Location: `lib/store/wallet-store.ts`
- Contains: Zustand store with persist middleware, wallet CRUD operations, streaming state
- Depends on: Zustand library, localStorage (via persist)
- Used by: All client components that need wallet data or streaming status

**Data Fetching Layer:**
- Purpose: API client with token authentication, SSE hooks
- Location: `lib/api/`, `hooks/`
- Contains: Secure fetch wrapper, token management, SSE stream hooks
- Depends on: External API, JWT/HMAC tokens
- Used by: Components, providers

**Component Layer:**
- Purpose: UI components organized by feature
- Location: `components/sections/`, `components/portfolio-hero/`, `components/ui/`
- Contains: Feature components, reusable UI primitives, section layouts
- Depends on: State layer, data fetching layer, UI libraries (Radix, Tailwind)
- Used by: App routes

**Provider Layer:**
- Purpose: Top-level providers for streaming, theme, Web3
- Location: `app/providers.tsx`, `components/home/`
- Contains: React Query provider, Wagmi provider, theme provider, SSE stream providers
- Depends on: State layer, data fetching layer
- Used by: App root layout

## Data Flow

**Initial Page Load:**

1. Server renders `app/page.tsx` (Server Component)
2. `app/layout.tsx` generates signed API token server-side
3. Token and initial state passed to `Providers` wrapper
4. Client-side hydrates with providers (Query, Wagmi, Theme)

**Streaming Data Flow:**

1. User adds wallets → `walletStore.addWallet()` triggers `walletsChangedTrigger`
2. `DefiStreamProvider` and `WalletDataStreamProvider` detect trigger change
3. Each provider initiates SSE connection to respective API routes:
   - `/api/positions/stream` → DeFi positions
   - `/api/wallet/aggregate/stream` → tokens, NFTs, history
4. SSE routes proxy to external API (api.hyperfolio.xyz)
5. Server sends progressive updates as each protocol/endpoint completes
6. Client-side hooks parse SSE messages and update Zustand store
7. Components re-render as new data arrives
8. Progress indicators show real-time completion status

**Sync Flow (Manual Refresh):**

1. User clicks Sync button → `portfolioHero.handleRefresh()`
2. Calls `walletStore.triggerSync(true)` with `skipCache: true`
3. Store increments `syncTrigger` and clears existing data
4. Both providers detect `syncTrigger` change via refs
5. Providers stop current streams and restart with cache bypass
6. UI shows loading skeletons during stream restart
7. Progress updates as each protocol/endpoint completes

**State Management:**

- Wallets: Persisted in localStorage via Zustand persist middleware
- Streaming state: NOT persisted (ephemeral)
- Aggregate data: Stored in memory, cleared on sync
- Privacy mode: Persisted in localStorage

## Key Abstractions

**SSE Stream Hooks:**
- Purpose: Abstract SSE connection management, message parsing, progress tracking
- Examples: `hooks/use-positions-stream.ts`, `hooks/use-wallet-data-stream.ts`
- Pattern: Custom hook with `startStream`, `stopStream`, progress state, event handlers

**Stream Providers:**
- Purpose: Page-level stream lifecycle management, sync trigger handling
- Examples: `components/home/defi-stream-provider.tsx`, `components/home/wallet-data-stream-provider.tsx`
- Pattern: Non-rendering provider component with useEffect-based stream control, uses refs for stable function references

**Secure Fetch Wrapper:**
- Purpose: Automatic token injection and refresh for API calls
- Examples: `lib/api/fetch.ts`
- Pattern: Wrapper around native fetch that adds HMAC-signed JWT tokens, auto-refreshes before expiry

**Data Transformers:**
- Purpose: Convert raw API responses to component-friendly shapes
- Examples: `lib/utils/transformers/tokens.ts`, `lib/utils/transformers/nfts.ts`
- Pattern: Pure functions that normalize API data structure

## Entry Points

**`app/page.tsx` (Home):**
- Location: `app/page.tsx`
- Triggers: Initial page load
- Responsibilities: Renders streaming providers, hero section, content sections, handles wallet add/remove/sync

**`app/layout.tsx` (Root Layout):**
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Font configuration, metadata generation, token generation, provider mounting

**`app/providers.tsx` (Providers Wrapper):**
- Location: `app/providers.tsx`
- Triggers: App initialization
- Responsibilities: Configure QueryClient, Wagmi config, ThemeProvider

**API Routes:**
- `app/api/positions/stream/route.ts` - DeFi positions SSE endpoint
- `app/api/wallet/aggregate/stream/route.ts` - Wallet data SSE endpoint
- `app/api/wallet/aggregate/route.ts` - Aggregate wallet data (POST)
- `app/api/auth/token/route.ts` - JWT token generation

## Error Handling

**Strategy:** Graceful degradation with user feedback

**Patterns:**
- API errors: Stored in Zustand store, displayed as error banners
- Stream errors: Individual wallet errors logged, stream continues for other wallets
- Timeout errors: Configured timeouts with clear error messages
- Token refresh failures: Fallback to public API endpoints
- Loading states: Skeleton screens during data fetch
- Empty states: Friendly empty-state UI when no data

## Cross-Cutting Concerns

**Logging:** Console-based logging with prefixes (`[SSE]`, `[Provider]`) for debugging
**Validation:** Environment variable validation on app startup (`lib/utils/env-validation.ts`)
**Authentication:** HMAC-signed JWT tokens with fingerprint validation
**Caching:** API-level cache with `?cache=false` bypass for manual refresh
**Theming:** Dark theme default with CSS variables for theming
**Security:** CSP headers in next.config.mjs, token-based API authentication
**Performance:** Code splitting via dynamic imports, optimized package imports, image optimization disabled (external URLs)
