# Technology Stack

**Analysis Date:** 2025-01-19

## Languages

**Primary:**
- TypeScript 5.7+ - All source files with strict mode enabled

**Secondary:**
- JavaScript (for some configuration files)

## Runtime

**Environment:**
- Node.js 20 (Alpine Linux in Docker)

**Package Manager:**
- npm (primary) - Lockfile present: package-lock.json
- pnpm (supported) - pnpm-lock.yaml present for compatibility

## Frameworks

**Core:**
- Next.js 16.1.1 - React framework with App Router
- React 19 - UI library
- React 19 DOM - Browser bindings

**Testing:**
- Vitest 2.1.9 - Unit testing framework
- Playwright 1.48.0 - E2E testing framework
- Testing Library - Component testing utilities

**Build/Dev:**
- TypeScript 5 - Type checking and compilation
- PostCSS 8.5 - CSS processing
- Autoprefixer 10.4.20 - CSS vendor prefixes
- ESLint 9.18.0 - Code linting
- Prettier 3.4.2 - Code formatting

## Key Dependencies

**Critical:**
- zustand 5.0.2 - Global state management with persist middleware
- @tanstack/react-query 5.90.5 - Server state management and caching
- wagmi 2.19.1 - React hooks for Ethereum
- viem 2.38.5 - TypeScript interface for Ethereum
- ethers 6.16.0 - Ethereum contract interaction (for KyberSwap compatibility)

**Infrastructure:**
- jose 6.1.3 - JWT token creation and verification
- server-only 0.0.1 - Server-side code enforcement

**UI Components:**
- @radix-ui/* - Complete component library (25+ packages)
  - accordion, alert-dialog, avatar, checkbox, collapsible
  - context-menu, dialog, dropdown-menu, hover-card
  - label, menubar, navigation-menu, popover
  - progress, radio-group, scroll-area, select
  - separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip
- lucide-react 0.454.0 - Icon library
- recharts 2.15.4 - Chart components
- react-day-picker 9.8.0 - Date picker
- embla-carousel-react 8.5.1 - Carousel/slider
- sonner 1.7.4 - Toast notifications
- cmdk 1.0.4 - Command palette
- vaul 1.1.0 - Drawer/sheet component

**DEX Integrations:**
- @gluex/sdk 1.0.20 - GlueX DEX SDK
- @gluex/widget 1.0.38 - GlueX swap widget
- @kyberswap/widgets 2.1.1 - KyberSwap swap widget

**Utilities:**
- clsx 2.1.1 - Conditional class names
- tailwind-merge 2.5.5 - Tailwind class merging
- class-variance-authority 0.7.1 - Component variant management
- zod 3.25.76 - Schema validation
- react-hook-form 7.60.0 - Form management
- @hookform/resolvers 3.10.0 - Form validation resolvers
- date-fns 4.1.0 - Date manipulation
- react-window 2.2.5 - Virtual scrolling
- input-otp 1.4.1 - OTP input component
- react-resizable-panels 2.1.7 - Resizable layouts

**Styling:**
- tailwindcss 4.1.9 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.9 - PostCSS integration for Tailwind
- tailwindcss-animate 1.0.7 - Animation utilities
- tw-animate-css 1.3.3 - Additional animations
- next-themes 0.4.6 - Theme management (dark/light mode)

**Analytics:**
- @vercel/analytics 1.3.1 - Vercel analytics integration

## Configuration

**Environment:**
- Environment-based configuration via .env files
- Required env vars:
  - `NEXT_PUBLIC_API_URL` - Backend API URL (default: https://api.hyperfolio.xyz)
  - `NEXT_PUBLIC_CHAIN_ID` - Blockchain chain ID (default: 999)
  - `NEXT_PUBLIC_NETWORK_NAME` - Network name (default: HyperEVM)
  - `INTERNAL_API_SECRET` - Secret for token signing (server-only)
  - `HYPEREVM_API_KEY` - API key for backend authentication
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
  - `NEXT_PUBLIC_GLUEX_INTEGRATOR` - GlueX integrator ID
  - `NEXT_PUBLIC_GLUEX_API_KEY` - GlueX API key
  - `NEXT_PUBLIC_ANALYTICS_ID` - Google Analytics ID

**Build:**
- `next.config.mjs` - Next.js configuration with standalone output
- `tsconfig.json` - TypeScript strict mode configuration
- `vitest.config.ts` - Vitest testing configuration
- `.eslintrc.json` - ESLint rules (extends next/core-web-vitals, prettier)
- `.prettierrc` - Prettier formatting rules

**Runtime Options:**
- `output: 'standalone'` - Docker-optimized builds
- `removeConsole` - Production console.log removal (except error/warn)
- `images.unoptimized: true` - Disabled Next.js Image optimization

## Platform Requirements

**Development:**
- Node.js 18+ or 20+
- npm, pnpm, or yarn
- 4GB RAM minimum
- Modern browser with ES6 support

**Production:**
- Docker container with Alpine Linux base
- Standalone Next.js output (no node_modules required in production)
- Health check endpoint: `/health`
- Port 3000 (configurable via PORT env var)

---

*Stack analysis: 2025-01-19*
