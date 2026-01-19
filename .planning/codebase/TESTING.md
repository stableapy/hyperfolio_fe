# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- **Vitest** for unit testing
- Config: `vitest.config.ts`
- Environment: `happy-dom` (browser-like environment for React components)

**Assertion Library:**
- **Vitest** built-in assertions (Jest-compatible: `describe`, `it`, `expect`)

**Testing Library:**
- **@testing-library/react** for component testing
- Includes: `render`, `screen`, `fireEvent`, `waitFor`, `cleanup`

**Run Commands:**
```bash
npm test              # Run all tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run with coverage
npm run test:e2e      # Run Playwright E2E tests
```

## Test File Organization

**Location:**
- Co-located with source files: `components/sections/yield-section/yield-section.test.tsx`
- Utility tests in `test/` directory: `test/format-percentage.test.ts`

**Naming:**
- `*.test.ts` for TypeScript utility tests
- `*.test.tsx` for React component tests
- Matches source file name: `tokens-section.tsx` → `tokens-section.test.tsx`

**Structure:**
```
test/
├── setup.ts              # Test setup (globals, mocks)
└── format-percentage.test.ts  # Utility tests

components/sections/yield-section/
├── yield-section.tsx
├── yield-section.test.tsx     # Component tests
├── utils.ts
└── types.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

describe('YieldSection Components', () => {
  afterEach(() => {
    cleanup()
  })

  describe('formatApyPercentage', () => {
    it('should format APY as percentage', () => {
      expect(formatApyPercentage(4.5)).toBe('4.50%')
      expect(formatApyPercentage(0)).toBe('0.00%')
    })

    it('should handle null and undefined', () => {
      expect(formatApyPercentage(null)).toBe('N/A')
      expect(formatApyPercentage(undefined)).toBe('N/A')
    })

    it('should handle NaN', () => {
      expect(formatApyPercentage(NaN)).toBe('N/A')
    })
  })

  describe('YieldCard', () => {
    it('should render opportunity details', () => {
      const mockOpportunity = { /* ... */ }
      const { getByText } = render(<YieldCard opportunity={mockOpportunity} />)

      expect(getByText('Test Protocol')).toBeInTheDocument()
      expect(getByText('USDC')).toBeInTheDocument()
    })
  })
})
```

**Patterns:**
- **describe** blocks group related tests by component/function
- **it** blocks use descriptive names: `should format APY as percentage`
- **afterEach** with `cleanup()` for component tests
- **Arrange-Act-Assert** pattern within test blocks

**Setup:**
```typescript
// test/setup.ts
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any
```

## Mocking

**Framework:** Vitest built-in mocking (`vi.fn()`, `vi.mock()`)

**Patterns:**

**Mock Functions:**
```typescript
const onFiltersChange = vi.fn()

render(<YieldFilterBar onFiltersChange={onFiltersChange} />)

fireEvent.click(searchInput)
expect(onFiltersChange).toHaveBeenCalledWith({ searchQuery: 'USDC' })
```

**Mock Callbacks:**
```typescript
const defaultProps = {
  filters: { /* ... */ },
  onFiltersChange: vi.fn(),
  availableProtocols: [],
  availableTokens: [],
}
```

**Async Testing:**
```typescript
it('should handle async operations', async () => {
  const { findByText } = render(<AsyncComponent />)

  // waitFor is automatic with findBy queries
  expect(await findByText('Loaded')).toBeInTheDocument()
})
```

**What to Mock:**
- External dependencies (API calls, third-party libraries)
- Event callbacks passed as props
- Browser APIs (IntersectionObserver, ResizeObserver)

**What NOT to Mock:**
- Component logic under test
- State updates
- Utility functions (test them separately)

## Fixtures and Factories

**Test Data:**
```typescript
describe('YieldCard', () => {
  const mockOpportunity = {
    id: '1',
    protocol: {
      id: 'test-protocol',
      name: 'Test Protocol',
      category: 'lending',
      website: 'https://example.com',
      chainId: 1,
    },
    category: 'lending' as const,
    type: 'supply' as const,
    pool: { symbol: 'TEST' },
    apy: { baseApy: 2.5, totalApy: 4.5 },
    risk: { riskLevel: 'low' as const },
    metadata: { underlyingSymbol: 'USDC' },
    lastUpdated: '2024-01-01T00:00:00Z',
    dataSource: 'api' as const,
  }

  it('should render opportunity details', () => {
    const { getByText } = render(<YieldCard opportunity={mockOpportunity} />)
    expect(getByText('Test Protocol')).toBeInTheDocument()
  })
})
```

**Location:**
- Inline mock objects within test files
- No centralized fixture directory

## Coverage

**Requirements:** No specific coverage target enforced

**View Coverage:**
```bash
npm run test:coverage
```

**Config:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './test/setup.ts',
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'html'],
    // }
  },
})
```

## Test Types

**Unit Tests:**
- **Scope:** Pure functions, utilities, hooks (isolated logic)
- **Framework:** Vitest
- **Examples:**
  - `formatPercentage()` utility function
  - `getRiskColorClass()` utility
  - Data transformation functions

**Integration Tests:**
- **Scope:** Component integration with state and props
- **Framework:** Vitest + Testing Library
- **Examples:**
  - `YieldSection` component with filter interactions
  - `TokenRow` with props and store state

**E2E Tests:**
- **Framework:** Playwright (configured but no tests found)
- **Status:** Configured in `package.json` (`npm run test:e2e`)
- **No E2E test files found in codebase**

## Common Patterns

**Async Testing:**
```typescript
it('should handle async data fetching', async () => {
  const { findByText } = render(<Component fetchData={asyncData} />)

  // findBy automatically waits for the element
  expect(await findByText('Data loaded')).toBeInTheDocument()
})
```

**Error Testing:**
```typescript
it('should handle null APY', () => {
  const opportunity = { ...mockOpportunity, apy: {} }
  const { getByText } = render(<YieldCard opportunity={opportunity} />)

  expect(getByText('N/A')).toBeInTheDocument()
})

it('should handle NaN values', () => {
  expect(formatApyPercentage(NaN)).toBe('N/A')
})
```

**Event Testing:**
```typescript
it('should handle search input change', () => {
  const onFiltersChange = vi.fn()
  render(<YieldFilterBar onFiltersChange={onFiltersChange} />)

  const searchInput = screen.getByPlaceholderText('Search token symbol...')
  fireEvent.change(searchInput, { target: { value: 'USDC' } })

  expect(onFiltersChange).toHaveBeenCalledWith({ searchQuery: 'USDC' })
})
```

**Accessibility Testing:**
```typescript
it('should have proper accessibility labels', () => {
  render(<YieldFilterBar {...defaultProps} />)

  const searchInput = screen.getByPlaceholderText('Search token symbol...')
  expect(searchInput).toHaveAttribute(
    'aria-label',
    'Search yield opportunities by token symbol'
  )
})
```

**Conditional Rendering:**
```typescript
it('should show loading state', () => {
  const stats = { totalCount: 0, highestApy: 0, averageApy: 0 }

  const { getAllByText } = render(
    <YieldStats stats={stats} isLoading hasData={false} />
  )

  expect(getAllByText('...')).toHaveLength(3)
})

it('should show zero stats when no data', () => {
  const stats = { totalCount: 0, highestApy: 0, averageApy: 0 }

  const { getByText } = render(
    <YieldStats stats={stats} isLoading={false} hasData={false} />
  )

  expect(getByText('0')).toBeInTheDocument()
})
```

**Disabled State Testing:**
```typescript
it('should disable all controls when disabled prop is true', () => {
  render(<YieldFilterBar {...defaultProps} disabled />)

  const searchInput = screen.getByPlaceholderText('Search token symbol...') as HTMLInputElement
  expect(searchInput.disabled).toBe(true)

  const buttons = screen.getAllByRole('button')
  buttons.forEach((button) => {
    expect(button).toHaveClass('disabled:opacity-50')
  })
})
```

## Test Configuration

**Vitest Config (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',  // Browser-like environment
    globals: true,              // Use global describe/it/expect
    setupFiles: './test/setup.ts'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

**Path Aliases:**
- `@/*` maps to project root in tests (same as source code)

## Testing Best Practices

**DO:**
- Test behavior, not implementation
- Use descriptive test names: `should format APY as percentage`
- Test edge cases: `null`, `undefined`, `NaN`, empty arrays
- Mock external dependencies
- Cleanup after component tests (`afterEach(cleanup)`)
- Use `getBy*` queries for expecting elements to exist
- Use `queryBy*` queries for expecting elements to be absent

**DON'T:**
- Don't test internal implementation details
- Don't over-mock (only mock what's necessary)
- Don't forget to test error states
- Don't use `console.log` for debugging tests (use `screen.debug()`)
- Don't test third-party libraries

## Testing Checklist

Before committing code:
- [ ] New features have tests
- [ ] Edge cases covered (null, undefined, NaN, empty)
- [ ] Error paths tested
- [ ] Async operations properly awaited
- [ ] Mocks verified (toHaveBeenCalled, etc.)
- [ ] Accessibility attributes tested
- [ ] Tests are deterministic (no flaky tests)
- [ ] Cleanup in `afterEach` for component tests

---

*Testing analysis: 2026-01-19*
