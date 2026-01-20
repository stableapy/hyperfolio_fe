# Phase 1: Performance Foundation - Research

**Researched:** 2025-01-19
**Domain:** React performance optimization for filter-heavy UI
**Confidence:** HIGH

## Summary

The yield section is a filter-heavy React component that displays yield opportunities from 40+ blockchain protocols. Performance issues (lag/freeze during filter interactions) have been extensively documented in `PERFORMANCE.md` with 11 optimizations already implemented. The section uses:

- **react-window** for virtualized list rendering (handles 5000+ items)
- **useTransition** for non-blocking filter updates
- Comprehensive memoization strategy in `useYieldData` hook
- TanStack Query for data fetching with retry logic

**Primary recommendation:** The yield section already has sophisticated performance optimizations. Phase 1 should focus on measurement and verification rather than reimplementation. Measure baseline performance first, then optimize only what's actually slow.

## Standard Stack

The yield section uses established React performance libraries:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-window | 2.2.5 | List virtualization | Lightweight (~6KB), mature, best for large lists |
| useTransition | React 19 built-in | Non-blocking state updates | Native React 19 concurrent feature |
| useMemo/useCallback | React 19 built-in | Memoization | Core React optimization APIs |
| React.memo | React 19 built-in | Component memoization | Prevents unnecessary re-renders |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.5 | Server state management | Already used for data fetching |
| zustand | 5.0.2 | Global state | Used for wallet store, privacy mode |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-window | tanstack-virtual | Similar size (~5KB), tanstack more modern but react-window more mature |
| react-window | react-virtualized | 20KB bundle, overkill for simple list |

**Installation:** (Already installed)
```bash
npm install react-window @types/react-window
```

## Architecture Patterns

### Current Yield Section Structure

```
components/sections/yield-section/
├── yield-section.tsx              # Main container, filter state, useTransition
├── hooks/
│   └── use-yield-data.ts         # Data fetching, filtering, sorting logic
├── yield-filter-bar.tsx           # Filter controls UI
├── virtualized-yield-list.tsx     # react-window List wrapper
├── yield-card.tsx                 # Individual opportunity card (React.memo)
├── yield-stats.tsx                # Statistics display
├── types.ts                       # TypeScript definitions
├── utils.ts                       # Helper functions
└── PERFORMANCE.md                 # Detailed optimization documentation
```

### Pattern 1: Virtualized List Rendering
**What:** Only render visible items + small buffer, recycle DOM nodes on scroll
**When to use:** Lists with 100+ items, especially 5000+
**Example:**
```typescript
// Source: components/sections/yield-section/virtualized-yield-list.tsx
import { List } from 'react-window';

const ITEM_HEIGHT = 90; // Fixed height per item

export function VirtualizedYieldList({ opportunities }) {
  const Row = ({ index, style, opportunities }) => {
    const opportunity = opportunities[index];
    return (
      <div style={style}>
        <YieldCard opportunity={opportunity} />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={opportunities.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      overscanCount={3}  // Render 3 extra items above/below
      rowProps={{ opportunities }}
    />
  );
}
```

### Pattern 2: Filter State with useTransition
**What:** Defer filter updates to prevent blocking UI
**When to use:** Filter interactions that cause expensive recalculations
**Example:**
```typescript
// Source: components/sections/yield-section/yield-section.tsx
import { useTransition } from 'react';

export function YieldSection() {
  const [filters, setFilters] = useState<YieldFilters>({ ... });
  const [, startTransition] = useTransition();

  const handleFiltersChange = (updates: Partial<YieldFilters>) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, ...updates }));
    });
  };
}
```

### Pattern 3: Memoized Filter Logic
**What:** Cache filtered/sorted results until dependencies actually change
**When to use:** Expensive computations based on filter state
**Example:**
```typescript
// Source: components/sections/yield-section/hooks/use-yield-data.ts
const filteredDisplayItems = useMemo(() => {
  // Early return if no filters
  if (!hasActiveFilters) {
    return normalizedDisplayItems.filter(item => item.hasValidApy);
  }

  // Filter with ordered checks (cheapest first)
  const results = [];
  for (const item of normalizedDisplayItems) {
    if (!item.hasValidApy) continue;
    if (hasCategoryFilters && !categories.has(item.category)) continue;
    if (hasSearchQuery && !item.searchText.includes(query)) continue;
    // ... more filters
    results.push(item);
  }
  return results;
}, [normalizedDisplayItems, normalizedFilters]);
```

### Anti-Patterns to Avoid
- **useDeferredValue with useTransition:** Creates double-deferral, causing lag. Already fixed in codebase.
- **Derived state from filtered results:** Creates circular dependency. Filter options should derive from all items, not filtered items.
- **JSON.stringify in useMemo dependencies:** Slow serialization, causes memo storms. Use length checks or content comparison.

## Don't Hand-Roll

Problems with existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| List rendering for 5000+ items | Custom .map() rendering | react-window | DOM node explosion (5000 vs ~20), memory, scroll performance |
| Filter state debouncing | setTimeout custom hook | useTransition | Built-in concurrent rendering, better UX |
| Deep equality checks | Manual property comparison | lodash.isEqual or content-based memo | Edge cases, maintenance burden |
| Performance profiling | console.time scattered | React DevTools Profiler | Visual flame graphs, component-level insights |

**Key insight:** Custom virtualization is error-prone (scroll position, variable heights, RTL support). react-window handles these edge cases.

## Common Pitfalls

### Pitfall 1: Circular Dependency in Filter Options
**What goes wrong:** Filter options derived from filtered results → cascading memo recalculations (5+ sequential operations)
**Why it happens:** Filter options should show all available items regardless of current filters
**How to avoid:** Derive filter options from `normalizedDisplayItems` (all items), not `filteredDisplayItems`
**Warning signs:** Filter change triggers multiple re-renders, console shows cascading memo recalcs

### Pitfall 2: useDeferredValue + useTransition Double Deferral
**What goes wrong:** Filters feel laggy (500ms-1s) despite optimizations
**Why it happens:** Both APIs defer updates, compounding each other
**How to avoid:** Use one or the other, not both. For filters, useTransition alone is sufficient.
**Warning signs:** Input feels "detached" or sluggish

### Pitfall 3: Array Sorting Inconsistency
**What goes wrong:** Memo invalidations due to browser-dependent sort order
**Why it happens:** Default .sort() behavior varies by browser/locale
**How to avoid:** Use `Intl.Collator` for consistent sorting
**Example:**
```typescript
// Module-level constant
const COLLATOR = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
items.sort((a, b) => COLLATOR.compare(a.label, b.label));
```
**Warning signs:** Filters work differently across browsers, memo inexplicably recalculates

### Pitfall 4: Filter Loop Order
**What goes wrong:** Unnecessary per-item work when early items are rejected
**Why it happens:** Expensive checks (token loop) before cheap checks (boolean)
**How to avoid:** Order filters from cheapest to most expensive:
1. Boolean flags (hasValidApy, stablecoinOnly)
2. Set.has() checks (categories, protocols)
3. String operations (search query)
4. Loop operations (tokens)
**Warning signs:** Filter takes longer when first few items don't match

### Pitfall 5: React.memo Without Custom Comparator
**What goes wrong:** Memo doesn't prevent re-renders for object props
**Why it happens:** Default comparison is reference equality, objects have new references each render
**How to avoid:**
```typescript
export const YieldCard = React.memo(
  ({ opportunity }) => { /* ... */ },
  (prev, next) => prev.opportunity.id === next.opportunity.id  // Custom compare
);
```
**Warning signs:** React DevTools Profiler shows component re-rendering with identical props

## Code Examples

Verified patterns from the codebase:

### Virtualized List with react-window
```typescript
// Source: components/sections/yield-section/virtualized-yield-list.tsx
import { List, type RowComponentProps } from 'react-window';

const ITEM_HEIGHT = 90;

export function VirtualizedYieldList({ opportunities }) {
  const Row = ({
    index,
    style,
    opportunities: rowOpportunities,
  }: RowComponentProps<{ opportunities: YieldDisplayItem[] }>) => {
    const opportunity = rowOpportunities[index];
    if (!opportunity) return null;

    return (
      <div style={style}>
        <YieldCard opportunity={opportunity} />
      </div>
    );
  };

  return (
    <List
      rowComponent={Row}
      rowCount={opportunities.length}
      rowHeight={ITEM_HEIGHT}
      rowProps={{ opportunities }}
      overscanCount={3}
      style={{ height: 600, width: '100%' }}
    />
  );
}
```

### Filter State Management
```typescript
// Source: components/sections/yield-section/yield-section.tsx
const [filters, setFilters] = useState<YieldFilters>({
  selectedCategories: [],
  selectedProtocols: [],
  selectedTokens: [],
  stablecoinOnly: false,
  hypeOnly: false,
  searchQuery: '',
  sortOrder: 'desc',
});

const [, startTransition] = useTransition();

const handleFiltersChange = useCallback(
  (updates: Partial<YieldFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...updates }));
    });
  },
  [startTransition]
);
```

### Optimized Filter Loop
```typescript
// Source: components/sections/yield-section/hooks/use-yield-data.ts
const filteredDisplayItems = useMemo(() => {
  // Early return if no filters active
  if (!hasActiveFilters) {
    return normalizedDisplayItems.filter((item) => item.hasValidApy);
  }

  const results: NormalizedDisplayItem[] = [];

  for (const item of normalizedDisplayItems) {
    // 1. Cheapest check first
    if (!item.hasValidApy) continue;

    // 2. Simple Set.has
    if (hasCategoryFilters && !selectedCategories.has(item.category)) continue;

    // 3. String.includes (more expensive)
    if (hasSearchQuery && !item.searchText.includes(searchQuery)) continue;

    // 4. Set.has
    if (hasProtocolFilters && !selectedProtocols.has(item.protocolName)) continue;

    // 5. Loop check (most expensive, do last)
    if (hasTokenFilters) {
      let matchesToken = false;
      for (const symbol of item.tokenSymbols) {
        if (selectedTokens.has(symbol)) {
          matchesToken = true;
          break;
        }
      }
      if (!matchesToken) continue;
    }

    // 6. Boolean checks
    if (stablecoinOnly && !item.isStablecoin) continue;
    if (hypeOnly && !item.isHype) continue;

    results.push(item);
  }

  return results;
}, [normalizedDisplayItems, normalizedFilters]);
```

### React.memo with Custom Comparator
```typescript
// Source: components/sections/yield-section/yield-card.tsx
export const YieldCard = React.memo(
  ({ opportunity }: YieldCardProps) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Compare by opportunity ID to prevent unnecessary re-renders
    return prevProps.opportunity.id === nextProps.opportunity.id;
  }
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Render all 5000 items | Virtualization with react-window | Implemented (documented in PERFORMANCE.md) | DOM nodes: 5000 → ~20, render: 2-5s → <100ms |
| Direct filter updates | useTransition for non-blocking updates | Implemented (documented in PERFORMANCE.md) | UI freeze eliminated |
| Filter options from filtered items | Filter options from all items | Fixed (Round 1 optimizations) | Cascading recalcs: 5+ → 1 |
| JSON.stringify in deps | Length checks | Fixed (Round 2 optimizations) | Filter latency: 500ms-1s → <50ms |

**Deprecated/outdated:**
- **useDeferredValue with filters:** Removed in Round 2 fixes, caused double-deferral lag
- **Reference-based filter memo:** Replaced with content-based (length checks)

## Open Questions

1. **Current baseline performance:** What is the actual filter change latency in production? Need to measure before optimizing further.
   - What we know: PERFORMANCE.md documents <50ms after Round 2 optimizations
   - What's unclear: Is this still accurate? Are there regressions?
   - Recommendation: Measure baseline with React DevTools Profiler

2. **List view height:** Current virtualization uses fixed 600px height. May need responsive adjustment.
   - What we know: Fixed height works for desktop
   - What's unclear: Mobile experience, dynamic viewport handling
   - Recommendation: Test on mobile, consider dynamic height calculation

3. **Yield section location:** How is the yield section mounted in the app? Need to understand loading/caching.
   - What we know: It's a section component like defi-section, tokens-section
   - What's unclear: Is it code-split? Lazy loaded? Server-rendered?
   - Recommendation: Check app page structure, consider code splitting

## Sources

### Primary (HIGH confidence)
- **Codebase analysis:** components/sections/yield-section/ - Full review of implementation
- **PERFORMANCE.md:** components/sections/yield-section/PERFORMANCE.md - Detailed optimization documentation (11 fixes implemented)
- **useYieldData hook:** components/sections/yield-section/hooks/use-yield-data.ts - Core filtering logic
- **yield-section.tsx:** components/sections/yield-section/yield-section.tsx - Main container with useTransition

### Secondary (MEDIUM confidence)
- [React Performance Optimization: 15 Best Practices for 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9) - Published Dec 23, 2025
- [How I Optimize React Apps in 2025](https://medium.com/@vigneshuthra/how-i-optimize-react-apps-in-2025-a-practical-performance-guide-e079111f2554) - Practical optimization guide
- [React Performance in 2025 — 30 Tactics That Actually Work](https://princejain.dev/blog/react-performance-optimizations-2025) - Oct 3, 2025
- [Smooth Async Transitions in React 19](https://blog.appsignal.com/2025/08/27/smooth-async-transitions-in-react-19.html) - Aug 2025, useTransition coverage
- [How to Measure and Optimize React Performance](https://www.debugbear.com/blog/measuring-react-app-performance) - 7 days ago, measurement techniques
- [How To Track React Performance Programmatically](https://javascript.plainenglish.io/how-to-track-react-performance-programmatically-reacts-most-underrated-performance-weapon-e91341c48234) - Oct 28, 2025, Profiler API

### Tertiary (LOW confidence)
- [React Performance Optimization: Best Techniques for 2025](https://www.growin.com/blog/react-performance-optimization-2025/) - June 24, 2025, general patterns
- 突破千万数据渲染瓶颈：react-window性能预算实战指南 - CSDN (Chinese), Sept 22, 2025

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified from package.json and codebase
- Architecture: HIGH - Direct code analysis, working implementation
- Pitfalls: HIGH - Documented in PERFORMANCE.md with actual fixes
- Measurement: MEDIUM - WebSearch sources verify Profiler techniques

**Research date:** 2025-01-19
**Valid until:** 30 days (React 19 and react-window are stable, but best practices evolve)

**Key files for Phase 1:**
- components/sections/yield-section/ (entire directory)
- components/sections/yield-section/PERFORMANCE.md (optimization history)
- components/sections/yield-section/hooks/use-yield-data.ts (core logic)
- components/sections/yield-section/yield-section.tsx (main container)

**Next steps for planner:**
1. Verify PERFORMANCE.md claims are still accurate (measure baseline)
2. Determine if yield section needs additional optimizations
3. Plan measurement strategy using React DevTools Profiler
4. Consider if list view variations (card view) need separate optimization
