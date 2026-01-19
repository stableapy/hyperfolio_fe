# Codebase Structure

**Analysis Date:** 2025-01-19

## Directory Layout

```
hyperfolio_fe/
├── app/                          # Next.js App Router (Server Components)
│   ├── api/                      # API routes (server-side)
│   │   ├── auth/token/           # JWT token generation endpoint
│   │   ├── health/               # Health check endpoint
│   │   ├── positions/stream/     # DeFi positions SSE streaming endpoint
│   │   ├── wallet/               # Wallet data endpoints
│   │   │   ├── aggregate/        # Multi-wallet aggregate data
│   │   │   │   └── stream/       # Wallet data SSE streaming endpoint
│   │   │   ├── [address]/        # Dynamic route for single wallet
│   │   │   │   └── points/       # Wallet points data
│   │   │   └── transactions/     # Wallet transactions endpoint
│   │   ├── portfolio-history/    # Portfolio history data
│   │   └── yield/                # Yield data endpoints
│   ├── api-docs/                 # API documentation page
│   ├── layout.tsx                # Root layout (fonts, metadata, providers)
│   ├── page.tsx                  # Home page (mounts streaming providers)
│   ├── providers.tsx             # React providers wrapper (Query, Wagmi, Theme)
│   ├── opengraph-image.tsx       # Dynamic OG image generation
│   ├── twitter-image.tsx         # Dynamic Twitter card generation
│   ├── robots.ts                 # SEO robots.txt
│   └── sitemap.ts                # SEO sitemap
│
├── components/                   # React components
│   ├── home/                     # Home page specific components
│   │   ├── defi-stream-provider.tsx        # DeFi positions streaming provider
│   │   ├── wallet-data-stream-provider.tsx # Wallet data streaming provider
│   │   ├── sticky-nav-header.tsx           # Sticky navigation with wallet selector
│   │   ├── floating-swap-button.tsx        # Floating swap action button
│   │   └── section-content.tsx             # Tab content switcher
│   ├── portfolio-hero/           # Dashboard overview with sync button
│   │   ├── portfolio-hero.tsx             # Main hero component
│   │   ├── wallet-selector.tsx             # Wallet selection dropdown
│   │   ├── hooks/                           # Hero-specific hooks
│   │   └── index.ts                         # Barrel export
│   ├── sections/                 # Main content sections (feature folders)
│   │   ├── defi-section/         # DeFi positions display
│   │   │   ├── defi-section.tsx            # Main component
│   │   │   ├── hooks/                     # Section-specific hooks
│   │   │   ├── protocol-skeleton.tsx       # Loading skeleton
│   │   │   └── defi-empty-state.tsx        # Empty state UI
│   │   ├── tokens-section/       # Token balances display
│   │   │   ├── tokens-section.tsx          # Main component
│   │   │   ├── token-row.tsx               # Desktop token row
│   │   │   ├── token-row-mobile.tsx        # Mobile token row
│   │   │   ├── token-summary-cards.tsx     # Summary statistics cards
│   │   │   ├── token-search-bar.tsx        # Search/filter controls
│   │   │   ├── token-image.tsx             # Token image component
│   │   │   ├── hooks/                     # Section-specific hooks
│   │   │   └── utils.ts                   # Token utilities
│   │   ├── nfts-section/         # NFT collection display
│   │   │   ├── nfts-section.tsx            # Main component
│   │   │   ├── hooks/                     # Section-specific hooks
│   │   │   ├── nft-grid-skeleton.tsx       # Loading skeleton
│   │   │   ├── nft-search-controls.tsx     # Search/filter controls
│   │   │   └── nft-empty-state.tsx         # Empty state UI
│   │   ├── transactions-section/ # Transaction history display
│   │   │   ├── transactions-section.tsx    # Main component
│   │   │   ├── hooks/                     # Section-specific hooks
│   │   │   ├── transaction-filters.tsx     # Filter controls
│   │   │   └── transaction-list-skeleton.tsx # Loading skeleton
│   │   ├── hypercore-section/   # Hyperliquid exchange data
│   │   │   ├── hypercore-section.tsx       # Main component
│   │   │   ├── hooks/                     # Section-specific hooks
│   │   │   ├── tab-navigation.tsx          # Tab switcher
│   │   │   ├── spot-tab.tsx               # Spot positions tab
│   │   │   ├── perp-tab.tsx               # Perpetual positions tab
│   │   │   ├── staking-tab.tsx            # Staking positions tab
│   │   │   └── vaults-tab.tsx             # Vault positions tab
│   │   ├── points-section/      # Points/rewards display
│   │   │   └── hooks/                     # Section-specific hooks
│   │   └── yield-section/        # Yield opportunities display
│   │       └── hooks/                     # Section-specific hooks
│   ├── swap-widget/              # DEX swap integration
│   │   ├── swap-widget.tsx               # Main component
│   │   ├── gluex-widget.tsx              # GlueX integration
│   │   ├── kyberswap-widget.tsx          # KyberSwap integration
│   │   ├── hooks/                         # Swap-specific hooks
│   │   ├── utils.ts                      # Swap utilities
│   │   ├── types.ts                      # Swap types
│   │   └── constants.ts                  # Swap constants
│   ├── wallet/                   # Wallet management components
│   │   ├── index.ts                     # Barrel export
│   │   ├── wallet-tabs.tsx               # Wallet switcher tabs
│   │   ├── add-wallet-dialog.tsx         # Add wallet modal
│   │   ├── types.ts                      # Wallet types
│   │   ├── utils.ts                      # Wallet utilities
│   │   └── constants.ts                  # Wallet constants
│   ├── theme-provider.tsx       # Theme provider wrapper
│   ├── token-provider.tsx       # API token provider
│   ├── api-banner.tsx           # API promotion banner
│   ├── welcome-modal.tsx        # First-visit welcome modal
│   ├── seo-footer.tsx           # SEO-optimized footer
│   ├── ui/                      # Reusable Radix UI components
│   │   ├── button.tsx, dialog.tsx, etc.   # 40+ UI primitives
│   │   ├── terminal-card.tsx             # Terminal-styled card
│   │   ├── loading-spinner.tsx           # Loading indicator
│   │   └── esc-close-button.tsx          # ESC close button
│   └── index.ts                 # Components barrel export
│
├── hooks/                        # Custom React hooks (shared)
│   ├── use-positions-stream.ts   # DeFi positions SSE hook
│   ├── use-wallet-data-stream.ts # Wallet data SSE hook
│   ├── use-mobile.ts             # Mobile viewport detection
│   ├── use-toast.ts              # Toast notifications
│   └── use-hyperevm-tokens.ts    # HyperEVM token utilities
│
├── lib/                          # Utilities and configuration
│   ├── api/                      # API client and authentication
│   │   ├── fetch.ts              # Secure fetch wrapper with token refresh
│   │   ├── token.ts              # JWT/HMAC token management
│   │   ├── security.ts           # Security utilities
│   │   ├── client.ts             # API client functions
│   │   └── server/               # Server-side API utilities
│   ├── config/                   # Configuration files
│   │   └── api.ts                # API timeouts and endpoints
│   ├── mock/                     # Mock data for development
│   │   └── yield-mock-data.ts    # Yield opportunity mock data
│   ├── store/                    # Zustand state management
│   │   └── wallet-store.ts       # Main store (wallets, streaming, settings)
│   ├── types/                    # Shared TypeScript types
│   │   └── api.ts                # API response type definitions
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Number and value formatting
│   │   ├── parsers.ts            # Data parsing utilities
│   │   ├── transformers/         # Data transformation utilities
│   │   │   ├── tokens.ts         # Token data transformers
│   │   │   ├── nfts.ts           # NFT data transformers
│   │   │   ├── transactions.ts   # Transaction transformers
│   │   │   └── defi.ts           # DeFi transformers
│   │   ├── data-transformers.ts  # Generic data transformers
│   │   ├── timeout.ts            # Timeout controller utilities
│   │   ├── env-validation.ts     # Environment variable validation
│   │   └── utils.ts              # General utility functions
│   └── wagmi/                    # Web3 configuration
│       ├── config.ts             # Wagmi client configuration
│       └── connectors.ts         # Wallet connectors
│
├── public/                       # Static assets
├── styles/                       # Global styles
│   └── globals.css               # Global CSS with theme variables
├── test/                         # Test utilities
├── test-results/                 # Playwright test results
├── playwright-report/            # Playwright test reports
├── .planning/                    # Planning documents (AI-generated)
│   └── codebase/                 # Codebase analysis documents
│
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variable template
└── vitest.config.ts              # Vitest test configuration
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js 16 App Router with Server Components
- Contains: Route handlers, API endpoints, metadata generation
- Key files: `app/page.tsx` (home), `app/layout.tsx` (root), `app/providers.tsx` (providers)
- Pattern: File-based routing, API routes in `app/api/`

**`app/api/`:**
- Purpose: Server-side API routes and SSE streaming endpoints
- Contains: Proxy routes to external API, token generation, health checks
- Key files: `positions/stream/route.ts`, `wallet/aggregate/stream/route.ts`
- Pattern: Route handler exports `GET`/`POST` functions, uses native fetch for proxying

**`components/`:**
- Purpose: React components organized by feature
- Contains: Feature sections, UI primitives, providers
- Key files: `components/portfolio-hero/`, `components/sections/`
- Pattern: Feature folders with co-located files (component, hooks, types, utils)

**`components/sections/`:**
- Purpose: Main content sections for portfolio data display
- Contains: DeFi positions, tokens, NFTs, transactions, Hyperliquid data, points, yield
- Key files: Each section has main component, hooks folder, types, utils
- Pattern: Feature folder structure - main component + hooks/index.ts barrel export

**`components/home/`:**
- Purpose: Home page specific components including streaming providers
- Contains: Streaming providers, navigation, floating action button
- Key files: `defi-stream-provider.tsx`, `wallet-data-stream-provider.tsx`
- Pattern: Non-rendering provider components that manage stream lifecycle

**`components/ui/`:**
- Purpose: Reusable Radix UI primitives and common UI patterns
- Contains: 40+ accessible UI components built on Radix primitives
- Key files: `button.tsx`, `dialog.tsx`, `terminal-card.tsx`
- Pattern: Headless UI components with Tailwind styling, no business logic

**`hooks/`:**
- Purpose: Shared custom React hooks
- Contains: SSE streaming hooks, utility hooks
- Key files: `use-positions-stream.ts`, `use-wallet-data-stream.ts`
- Pattern: Hooks return consistent shape `{ data, isLoading, error, ... }`

**`lib/`:**
- Purpose: Utilities, configuration, and business logic
- Contains: API client, state management, types, utilities
- Key files: `lib/store/wallet-store.ts`, `lib/api/fetch.ts`
- Pattern: No React dependencies (except providers), pure functions where possible

**`lib/api/`:**
- Purpose: API client layer with authentication
- Contains: Secure fetch wrapper, token management, API functions
- Key files: `fetch.ts`, `token.ts`, `client.ts`
- Pattern: Wrapper functions that add authentication headers and handle token refresh

**`lib/store/`:**
- Purpose: Zustand state management
- Contains: Global state stores
- Key files: `wallet-store.ts` (main store)
- Pattern: Zustand stores with persist middleware, organized by domain

**`lib/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: API response types, domain types
- Key files: `api.ts` (all API types)
- Pattern: Centralized type definitions to avoid duplication

**`lib/utils/`:**
- Purpose: Utility functions and data transformers
- Contains: Formatters, parsers, transformers
- Key files: `formatters.ts`, `transformers/`
- Pattern: Pure functions, no side effects

**`lib/wagmi/`:**
- Purpose: Web3 configuration
- Contains: Wagmi client config, wallet connectors
- Key files: `config.ts`
- Pattern: Singleton config exported for app-wide use

## Key File Locations

**Entry Points:**
- `app/page.tsx` - Home page, mounts streaming providers
- `app/layout.tsx` - Root layout, metadata, fonts, token generation
- `app/providers.tsx` - React providers wrapper (Query, Wagmi, Theme)

**Configuration:**
- `next.config.mjs` - Next.js config, CSP headers, optimization
- `tsconfig.json` - TypeScript config, path aliases (@/*)
- `tailwind.config.ts` - Tailwind config, design tokens
- `package.json` - Dependencies, scripts

**Core Logic:**
- `lib/store/wallet-store.ts` - Zustand store (wallets, streaming, settings)
- `lib/api/fetch.ts` - Secure fetch wrapper with token refresh
- `lib/api/token.ts` - JWT/HMAC token generation and verification

**Streaming Architecture:**
- `components/home/defi-stream-provider.tsx` - DeFi positions streaming
- `components/home/wallet-data-stream-provider.tsx` - Wallet data streaming
- `hooks/use-positions-stream.ts` - Positions SSE hook
- `hooks/use-wallet-data-stream.ts` - Wallet data SSE hook
- `app/api/positions/stream/route.ts` - DeFi positions SSE endpoint
- `app/api/wallet/aggregate/stream/route.ts` - Wallet data SSE endpoint

**Testing:**
- `test/` - Test utilities and fixtures
- `vitest.config.ts` - Vitest configuration
- Playwright tests in `test/e2e/` (if present)

## Naming Conventions

**Files:**
- `kebab-case.tsx` for components: `portfolio-hero.tsx`, `token-row.tsx`
- `kebab-case.ts` for utilities/hooks: `use-positions-stream.ts`, `format-value.ts`
- `kebab-case.ts` for types in feature folders: `types.ts` (co-located)
- `kebab-case.ts` for utils in feature folders: `utils.ts` (co-located)
- `index.ts` for barrel exports in directories

**Directories:**
- `kebab-case/` for all directories: `defi-section/`, `tokens-section/`, `portfolio-hero/`
- `hooks/` subdirectory for feature-specific hooks
- `ui/` for reusable UI primitives

**Components:**
- PascalCase for exports: `export function PortfolioHero`
- kebab-case for files: `portfolio-hero.tsx`

**Hooks:**
- `use` prefix camelCase: `usePositionsStream`, `useWalletData`, `useTokensData`
- kebab-case files: `use-positions-stream.ts`

**Types:**
- PascalCase for interfaces/types: `interface Token`, `type WalletData`
- Co-located `types.ts` in feature folders

**Constants:**
- UPPER_SNAKE_CASE: `API_BASE_URL`, `HYPEREVM_CHAIN_ID`

## Where to Add New Code

**New Feature Section:**
- Primary code: `components/sections/[section-name]/[section-name].tsx`
- Hooks: `components/sections/[section-name]/hooks/`
- Types: `components/sections/[section-name]/types.ts`
- Utils: `components/sections/[section-name]/utils.ts`
- Export from: `components/sections/[section-name]/index.ts`

**New Streaming Endpoint:**
- API route: `app/api/[feature]/stream/route.ts`
- Hook: `hooks/use-[feature]-stream.ts`
- Provider: `components/home/[feature]-stream-provider.tsx`
- Add to: `app/page.tsx` provider list

**New UI Component:**
- Reusable: `components/ui/[component-name].tsx`
- Feature-specific: `components/[feature]/[component-name].tsx`
- Use existing Radix primitives from `components/ui/` when possible

**New Utility Function:**
- Shared: `lib/utils/[utility-name].ts`
- Feature-specific: `components/[feature]/utils.ts`

**New Type Definition:**
- Shared: `lib/types/api.ts`
- Feature-specific: `components/[feature]/types.ts`

**New State:**
- Add to existing store: `lib/store/wallet-store.ts`
- New store: `lib/store/[store-name].ts`

## Special Directories

**`.planning/codebase/`:**
- Purpose: AI-generated codebase analysis documents
- Generated: Yes (by GSD codebase mapper)
- Committed: Yes

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by npm/pnpm)
- Committed: No

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by next build)
- Committed: No

**`test-results/`, `playwright-report/`:**
- Purpose: Test execution outputs
- Generated: Yes (by test runners)
- Committed: No

**`public/`:**
- Purpose: Static assets served from root
- Generated: No (manual)
- Committed: Yes

---

*Structure analysis: 2025-01-19*
