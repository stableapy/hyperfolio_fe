# External Integrations

**Analysis Date:** 2025-01-19

## APIs & External Services

**Backend API:**
- Hyperfolio API - Portfolio data aggregation
  - Base URL: `https://api.hyperfolio.xyz` (configurable via `NEXT_PUBLIC_API_URL`)
  - Internal URL: `API_INTERNAL_URL` for Docker-to-Docker communication
  - Authentication: HMAC-signed tokens + API key (`HYPEREVM_API_KEY`)
  - Endpoints:
    - `/wallet/composition` - Token balances and values
    - `/wallet/transactions` - Transaction history
    - `/nfts` - NFT collection
    - `/positions` - DeFi positions
    - `/portfolio-history` - Historical portfolio value
    - `/points` - DeFi protocol points
    - `/vaults` - Vault APY data
    - `/hypercore/user/*` - User data
    - `/masterswap/user/*` - Swap statistics

**DEX Integrations:**
- KyberSwap - Decentralized exchange
  - SDK: `@kyberswap/widgets` 2.1.1
  - Widget: Modal-based swap interface
  - Authentication: Ethers signer from Wagmi
  - Configuration: `lib/wagmi/config.ts` (clientToSigner function)
  - Component: `components/swap-widget/swap-widget-modal.tsx`

- GlueX - Decentralized exchange
  - SDK: `@gluex/sdk` 1.0.20
  - Widget: `@gluex/widget` 1.0.38
  - Auth: `NEXT_PUBLIC_GLUEX_INTEGRATOR`, `NEXT_PUBLIC_GLUEX_API_KEY`

**Wallet Connection:**
- WalletConnect - Mobile wallet connection protocol
  - SDK: Built into Wagmi 2.x
  - Project ID: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - Connectors: `lib/wagmi/connectors.ts` (walletConnect connector)

- Injected Wallets - Browser extension wallets (MetaMask, Rabby, Coinbase, etc.)
  - SDK: Built into Wagmi 2.x
  - Connector: `lib/wagmi/config.ts` (injected connector)

**Analytics:**
- Google Analytics - User analytics and tracking
  - SDK: `@vercel/analytics` 1.3.1
  - ID: `NEXT_PUBLIC_ANALYTICS_ID`
  - CSP: `https://www.google-analytics.com`, `https://www.googletagmanager.com`

## Data Storage

**Databases:**
- None (frontend is stateless, all data from API)

**File Storage:**
- `public/` directory for static assets
- External image URLs supported (Next.js Image optimization disabled)

**Caching:**
- TanStack Query - Client-side data caching (5-minute stale time)
- Zustand persist - LocalStorage for user preferences and wallets
- Browser-level caching for static assets (1-year max-age)

## Authentication & Identity

**Auth Provider:**
- Custom HMAC token authentication
  - Implementation: `lib/api/token.ts` (server-side), `lib/api/fetch.ts` (client-side)
  - Token format: Base64-encoded JSON with HMAC-SHA256 signature
  - Token payload: `{ iat, exp, fp }` (issued at, expiration, fingerprint)
  - Fingerprint: User-Agent hash for token binding
  - Token lifetime: 10 minutes (auto-refresh at 8 minutes)
  - Storage: Window global `window.__API_TOKEN__` (not persisted)
  - Secret: `INTERNAL_API_SECRET` (server-side environment variable)

**Wallet Auth:**
- Wagmi 2.x + Viem 2.x - Ethereum wallet connection
  - Supported chains:
    - Ethereum Mainnet
    - Sepolia (testnet)
    - Arbitrum
    - Optimism
    - HyperEVM (chain 999, configurable)
  - Configuration: `lib/wagmi/config.ts`

## Monitoring & Observability

**Error Tracking:**
- Console logging (error/warn preserved in production)
- Custom error boundaries for graceful degradation

**Logs:**
- Console-based logging
- Development: All logs enabled
- Production: Console.log removed (except error/warn)

## CI/CD & Deployment

**Hosting:**
- Docker container deployment (standalone Next.js output)
- Base image: `node:20-alpine`
- Health checks enabled
- Supports Coolify deployment with rolling updates

**CI Pipeline:**
- GitHub Actions (implied by .gitignore patterns)
- Build scripts in `package.json`

## Environment Configuration

**Required env vars:**

**Public (client-side):**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_CHAIN_ID` - Blockchain chain ID (default: 999)
- `NEXT_PUBLIC_NETWORK_NAME` - Network display name
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect integration
- `NEXT_PUBLIC_GLUEX_INTEGRATOR` - GlueX DEX integration
- `NEXT_PUBLIC_GLUEX_API_KEY` - GlueX API key
- `NEXT_PUBLIC_ANALYTICS_ID` - Google Analytics tracking ID
- `NEXT_PUBLIC_APP_URL` - Application URL (for origin validation)

**Server-only (not exposed to client):**
- `INTERNAL_API_SECRET` - HMAC signing secret for token generation
- `HYPEREVM_API_KEY` - Backend API authentication key
- `API_INTERNAL_URL` - Docker-internal API URL for faster server-side calls

**Optional:**
- `VERCEL_URL` - Auto-set by Vercel deployment
- `NODE_ENV` - Environment (development/production)

**Secrets location:**
- Server-only: Environment variables (not committed)
- Client-side: Window global (not persisted, refreshed on page load)

## Webhooks & Callbacks

**Incoming:**
- None (frontend only, no webhook receivers)

**Outgoing:**
- Server-Sent Events (SSE) streams from backend:
  - `/api/positions/stream` - Progressive DeFi position loading
  - `/api/wallet/aggregate/stream` - Progressive wallet data loading
  - Client hooks: `hooks/use-positions-stream.ts`, `hooks/use-wallet-data-stream.ts`

**Browser-native:**
- WebSocket connections to WalletConnect relay
- RPC connections to blockchain nodes via Wagmi/Viem

## Third-Party Scripts

**Google Analytics:**
- Loaded via `@vercel/analytics`
- CSP allowlisted: `script-src 'self' https://www.google-analytics.com https://www.googletagmanager.com`

## External RPC Nodes

**Blockchain RPCs:**
- HyperEVM: `https://rpc.hyperlend.finance` (configurable via `NEXT_PUBLIC_API_URL`)
- Ethereum Mainnet: Public RPC (via Wagmi defaults)
- Arbitrum: Public RPC (via Wagmi defaults)
- Optimism: Public RPC (via Wagmi defaults)
- Sepolia: Public RPC (via Wagmi defaults)

**Configuration:** `lib/wagmi/config.ts` (transports object)

## CSP (Content Security Policy)

**Connect-src allowlist:**
- `self`
- `https://api.hyperfolio.xyz` - Backend API
- `https://rpc.hyperlend.finance` - HyperEVM RPC
- `https://www.google-analytics.com` - Analytics
- `https://*.google-analytics.com` - Analytics domains
- `https://*.walletconnect.com` - WalletConnect relay
- `https://*.cloudfront.net` - AWS CDN
- `https://raw.githubusercontent.com` - GitHub raw content
- `https://*.githubusercontent.com` - GitHub user content
- `https://api.etherscan.io` - Etherscan API
- `https://hyperliquid.xyz` - Hyperliquid DEX
- `https://rpc.hyperliquid.xyz` - Hyperliquid RPC
- `https://*.kyberswap.com` - KyberSwap API
- `ws://localhost:*`, `wss://localhost:*` - Local WebSockets (dev)

**Script-src allowlist:**
- `self`
- `unsafe-inline` - Required for Next.js and Tailwind
- `unsafe-eval` - Required for Next.js dev mode
- `https://www.google-analytics.com`
- `https://www.googletagmanager.com`

---

*Integration audit: 2025-01-19*
