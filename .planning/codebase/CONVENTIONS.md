# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- **kebab-case** for all files: `portfolio-hero.tsx`, `use-positions-stream.ts`, `wallet-store.ts`
- Test files: `*.test.ts` or `*.test.tsx` (e.g., `format-percentage.test.ts`, `yield-section.test.tsx`)
- Co-located types: `types.ts` in feature folders

**Functions:**
- **camelCase** starting with verb for functions: `formatPercentage()`, `getRiskColorClass()`, `extractTokenSymbols()`
- **camelCase** starting with `use` for hooks: `usePositionsStream()`, `useWalletData()`, `useMobile()`
- **camelCase** for event handlers: `handleSwapClick()`, `onSearchChange()`, `onFiltersChange()`

**Variables:**
- **camelCase** for all variables: `searchQuery`, `filteredTokens`, `isGrouped`
- Prefix boolean variables with `is`, `has`, `should`: `isLoading`, `hasData`, `showSkeleton`
- Constants in components: **PascalCase** or **UPPER_SNAKE_CASE** for static values

**Types:**
- **PascalCase** for interfaces and type aliases: `WalletStore`, `StreamProgress`, `YieldDisplayItem`
- **PascalCase** for type parameters: `T`, `TData`, `TProps`
- Generic type suffixes: `Props`, `Return`, `Options`, `Result` (e.g., `UsePositionsStreamResult`)

**Components:**
- **PascalCase** for components: `TokensSection`, `TokenRow`, `YieldFilterBar`
- Compound component files match main component name: `yield-filter-bar.tsx`, `yield-stats.tsx`

## Code Style

**Formatting:**
- **Prettier** with specific configuration from `.prettierrc`
- Settings: `semi: true`, `singleQuote: true`, `printWidth: 80`, `tabWidth: 2`
- Plugin: `prettier-plugin-tailwindcss` for Tailwind class sorting
- Run: `npm run format` to format, `npm run format:check` to verify

**Linting:**
- **Next.js ESLint** configuration (`next lint`)
- Run: `npm run lint` to check, `npm run lint:fix` to auto-fix
- TypeScript strict mode enabled: `strict: true` in `tsconfig.json`

**Indentation:**
- **2 spaces** for all indentation
- No tabs allowed

**Line Length:**
- Target: **80 characters** (Prettier default)
- Hard limit: **120 characters** (only break if needed)
- Exception: Tailwind class strings may exceed

## Import Organization

**Order:**
1. React/Next.js imports
2. Third-party package imports
3. Internal module imports (using `@/` alias)
4. Type imports (if separate)
5. Relative imports (co-located files)

**Example:**
```typescript
'use client';

// React/Next.js
import { useState, useEffect } from 'react';

// Third-party
import { useQuery } from '@tanstack/react-query';
import { cva, type VariantProps } from 'class-variance-authority';

// Internal modules
import { useWalletStore } from '@/lib/store/wallet-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Co-located files
import type { Token, SwapToken, TokensSectionProps } from './types';
```

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json` and `vitest.config.ts`)
- Examples: `@/lib/store/wallet-store`, `@/components/ui/button`

**Import Statements:**
- Named imports preferred: `import { useState } from 'react'`
- Type imports: `import type { Token } from './types'`
- Avoid default exports in favor of named exports

**Sorting:**
- Imports are sorted alphabetically within each group by Prettier
- Grouping is automatic via Prettier

## Error Handling

**Patterns:**
- **Try-catch-finally** for async operations
- Early returns for error states
- Type guards for runtime validation
- Null/undefined checks before accessing properties

**API Errors:**
```typescript
// From lib/api/fetch.ts
export async function secureJsonFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await secureFetch(url, options)

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
```

**Component Error Handling:**
```typescript
// Early return pattern
export function TokensSection({ isLoading = false }: TokensSectionProps) {
  const showSkeleton = isLoading && !hasData

  if (showSkeleton) {
    return <TokenListSkeleton />
  }

  if (filteredTokens.length === 0) {
    return <EmptyState />
  }

  return <TokenList tokens={filteredTokens} />
}
```

**Type Guards:**
```typescript
// From components/sections/yield-section/types.ts
export function isConsolidatedMarket(
  item: YieldDisplayItem
): item is ConsolidatedLendingMarket {
  return item.type === 'market'
}
```

**Null/Undefined Handling:**
```typescript
// From lib/utils/formatters.ts
export function formatPercentage(percentage: number): string {
  // Handle NaN or infinite values
  if (!Number.isFinite(percentage)) return '0%'

  // Handle very small percentages
  if (percentage < 0.01 && percentage > 0) return '<0.01%'

  // Handle negative values
  if (percentage < 0) return '0%'

  // Format normally
  return percentage < 10
    ? percentage.toFixed(1) + '%'
    : percentage.toFixed(2) + '%'
}
```

## Logging

**Framework:** `console` (standard browser console)

**Patterns:**
- Error logging with context: `console.error('[fetch] Error syncing wallet:', error)`
- Info logging for debugging: `console.log('Testing formatPercentage utility...')`
- No structured logging library used

**Log Prefixes:**
- Use descriptive prefixes: `[fetch]`, `[stream]`, `[provider]`
- Component-specific logging uses component name

**Production Considerations:**
- Logs are present in production code
- No log level control implemented

## Comments

**When to Comment:**
- JSDoc comments for all exported functions and complex utilities
- Inline comments for non-obvious logic
- TODO/FIXME markers for temporary code

**JSDoc/TSDoc:**
```typescript
/**
 * Format percentage for display (1-2 decimal places)
 *
 * Edge cases handled:
 * - NaN values: returns "0%"
 * - Infinity values: returns "0%"
 * - Negative values: returns "0%"
 * - Very small percentages (< 0.01%): returns "<0.01%"
 *
 * Decimal precision rules:
 * - Values < 10%: formatted with 1 decimal place (e.g., "5.3%")
 * - Values ≥ 10%: formatted with 2 decimal places (e.g., "12.34%")
 *
 * @param percentage - The percentage value to format
 * @returns Formatted percentage string with percent sign
 *
 * @example
 * formatPercentage(5.123) // "5.1%"
 * formatPercentage(12.345) // "12.35%"
 */
export function formatPercentage(percentage: number): string
```

**Inline Comments:**
```typescript
// Show skeleton when loading and no data yet
const showSkeleton = isLoading && !hasData

// Note: clearPointsCache removed - no longer needed with wallet store as single source of truth
```

**Comment Style:**
- Use `//` for single-line comments
- Use `/* */` for multi-line comments
- JSDoc for function documentation (above function)

## Function Design

**Size:**
- Prefer smaller, focused functions under 50 lines
- Utility functions are typically 10-30 lines
- Complex data transformation may exceed but should be broken down

**Parameters:**
- Destructure object parameters for components: `({ title, count }: Props)`
- Use options object pattern for hooks: `({ addresses, skipCache, enabled })`
- Optional parameters last: `(url: string, options: FetchOptions = {})`

**Return Values:**
- Hooks return consistent shape: `{ data, error, isLoading, ... }`
- Type-safe returns using TypeScript
- Early returns for null/undefined states

**Example Hook Return Type:**
```typescript
export interface UsePositionsStreamResult {
  protocols: Map<string, StreamedProtocol>
  protocolGroups: StreamProtocolGroup[]
  isStreaming: boolean
  isComplete: boolean
  progress: StreamProgress
  portfolioStats: StreamPortfolioStats | null
  error: string | null
  startStream: () => void
  stopStream: () => void
}
```

## Module Design

**Exports:**
- Named exports preferred: `export function formatPercentage()`
- Component exports: `export { Button, buttonVariants }`
- Type exports: `export type { Token }` or `export interface Token`

**Barrel Files:**
- Used in `lib/utils/transformers/` with `index.ts`
- Not extensively used elsewhere

**Feature Folder Pattern:**
```
components/sections/tokens-section/
├── tokens-section.tsx       # Main component
├── types.ts                 # Component types
├── hooks.ts                 # Custom hook (useTokensData)
├── utils.ts                 # Helper functions
└── token-row.tsx            # Sub-component
```

**Type Organization:**
- Feature types co-located in `types.ts` within feature folder
- Shared types in `lib/types/api.ts`
- Re-export types for convenience: `export type { YieldOpportunity }`

## Component Patterns

**Component Declaration:**
```typescript
'use client';  // Only if needed (hooks, event handlers, browser APIs)

import { useState } from 'react';

interface Props {
  title: string;
  isLoading?: boolean;
}

export function MyComponent({ title, isLoading = false }: Props) {
  // Component logic
  return <div>{title}</div>;
}
```

**Props Destructuring:**
- Always destructure props in function signature
- Provide default values for optional props
- Use TypeScript interface for props

**State Management:**
- Local state with `useState`: `const [searchQuery, setSearchQuery] = useState('')`
- Global state with Zustand stores
- Derived state computed during render (no `useEffect` for derived state)

**Event Handlers:**
- Prefix with `handle`: `handleSwapClick`, `handleSubmit`
- Use proper event types: `e: React.MouseEvent`, `e: ChangeEvent<HTMLInputElement>`
- Stop propagation when needed: `e.stopPropagation()`

## TypeScript Patterns

**Type Safety:**
- Strict mode enabled in `tsconfig.json`
- No `any` types (use `unknown` if truly unknown)
- Use `satisfies` operator for better type inference

**Type Definitions:**
```typescript
// Interface for object shapes
interface WalletStore {
  wallets: Wallet[]
  selectedWalletId: string | null
}

// Type for unions and intersections
type YieldDisplayItem = YieldOpportunity | ConsolidatedLendingMarket

// Type parameters with constraints
function formatValue<T extends string | number>(value: T): string
```

**Null Checks:**
- Use optional chaining: `wallet.address?.slice(0, 6)`
- Use nullish coalescing: `displayName ?? 'Unknown'`
- Explicit null/undefined checks when needed

## Utility Patterns

**cn() Function:**
```typescript
import { cn } from '@/lib/utils'

// Use for merging Tailwind classes
<div className={cn('base-class', isActive && 'active-class', className)} />
```

**CVA (Class Variance Authority):**
```typescript
// For component variants
const buttonVariants = cva(baseClasses, {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { default: '...', sm: '...' }
  }
})
```

## Async Patterns

**Always use async/await:**
```typescript
async function fetchData() {
  try {
    const response = await secureFetch(url)
    if (!response.ok) throw new Error('Failed')
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

**Parallel Requests:**
```typescript
const results = await Promise.allSettled(requests)
results.forEach((result) => {
  if (result.status === 'rejected') {
    console.error('Request failed:', result.reason)
  }
})
```

---

*Convention analysis: 2026-01-19*
