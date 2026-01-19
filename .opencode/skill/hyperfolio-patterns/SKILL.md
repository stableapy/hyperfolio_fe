---
name: hyperfolio-patterns
description: Hyperfolio project conventions, tech stack, and coding patterns for consistent development
license: MIT
compatibility: opencode
metadata:
  project: hyperfolio
  type: conventions
---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui |
| State | Zustand (client), TanStack Query (server) |
| Web3 | Wagmi, Viem, Ethers.js v6 |
| Chain | HyperEVM (L1) |
| Backend | NestJS, TypeScript strict |
| Database | PostgreSQL (Supabase), Redis |

## File Structure

```
app/                    # Next.js App Router
├── api/               # API routes
├── (routes)/          # Page routes
components/
├── ui/                # shadcn/ui primitives
├── sections/          # Page sections (tokens, defi, nfts...)
├── portfolio-hero/    # Portfolio components
hooks/                  # Custom React hooks
lib/
├── api/               # API client utilities
├── store/             # Zustand stores
├── utils/             # Helpers and transformers
```

## Component Patterns

### Server Component (default)

```typescript
// No 'use client' - fetches data directly
export default async function TokensSection() {
  const tokens = await getTokens();
  return <TokenList tokens={tokens} />;
}
```

### Client Component (when needed)

```typescript
'use client';
import { useState } from 'react';

export function TokenCard({ token }: { token: Token }) {
  const [expanded, setExpanded] = useState(false);
  return <div onClick={() => setExpanded(!expanded)}>...</div>;
}
```

## API Patterns

### Response Structure

```typescript
// Success
{ "data": T, "error": null }

// Error
{ "data": null, "error": { "code": "...", "message": "..." } }
```

### Endpoint Naming

```
GET    /api/wallets/:address
POST   /api/wallets
PATCH  /api/wallets/:address
```

## Token Decimals (CRITICAL)

| Token | Decimals |
|-------|----------|
| HYPE, stHYPE | 18 |
| USDT, USDC | 6 |
| WBTC | 8 |

Always use `formatUnits` and `parseUnits` from viem.

## When to Use

Load this skill when:
- Starting any task in Hyperfolio
- Unsure about project conventions
- Need to understand the tech stack

