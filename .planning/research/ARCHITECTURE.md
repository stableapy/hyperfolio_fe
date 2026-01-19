# Architecture Research: React 19 Filter System Performance

**Domain:** React 19 filter/view system architecture
**Project:** Hyperfolio Frontend Yield Section Optimization
**Researched:** 2025-01-19
**Confidence:** HIGH

## Executive Summary

The Hyperfolio frontend requires a performant filter/view system for its yield section, which currently handles 5000+ opportunities. Research reveals that React 19's automatic memoization via the React Compiler significantly reduces the need for manual optimization, but strategic architecture decisions remain critical for filter-heavy interactions.

**Key finding:** The current implementation has already applied 11 optimizations achieving <50ms filter latency. Further improvements should focus on architectural patterns that scale gracefully rather than micro-optimizations.

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer (React 19)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ YieldFilterBar│  │  YieldStats  │  │ YieldSection │          │
│  │  (controls)  │  │  (summary)   │  │  (container) │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           VirtualizedYieldList (react-window)            │  │
│  │     Renders ~20 visible items from 5000+ total           │  │
│  └──────────────────────────┬───────────────────────────────┘  │
├─────────────────────────────┼───────────────────────────────────┤
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              useYieldData (custom hook)                   │  │
│  │  • Fetch normalization                                    │  │
│  │  • Filter application (AND logic)                         │  │
│  │  • Sort ordering                                          │  │
│  │  • Statistics calculation                                 │  │
│  └──────────────────────────┬───────────────────────────────┘  │
├─────────────────────────────┼───────────────────────────────────┤
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Data Sources                            │  │
│  │  • API: /api/yield/all (secureFetch with token refresh)  │  │
│  │  • Local state: filter selections (useState)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **YieldSection** | Container, orchestrates data flow and state | Server component with client children for interactivity |
| **YieldFilterBar** | Filter controls (search, dropdowns, toggles) | Client component with memoized filter option computations |
| **useYieldData** | Data fetching, filtering, sorting, stats | Custom hook with useMemo for expensive operations |
| **VirtualizedYieldList** | Windowed rendering of large lists | react-window List component with fixed item height |
| **YieldCard** | Individual opportunity display | React.memo with custom comparator (ID-based) |
| **YieldStats** | Aggregate statistics display | Presentational component, memoized props |

### Data Flow Architecture

```
User Interaction (filter change)
    ↓
YieldFilterBar.onFiltersChange(filters)
    ↓
YieldSection.handleFiltersChange(updates)
    ↓ (useTransition for non-blocking UI)
setFilters((prev) => ({ ...prev, ...updates }))
    ↓
useYieldData(filters) hook detects filter change
    ↓
[useMemo chain - single pass with stable dependencies]
    ├─→ normalizedFilters (Set creation, length-based deps)
    ├─→ normalizedDisplayItems (from raw data, cached)
    ├─→ filteredDisplayItems (AND logic filter, early exits)
    ├─→ displayItems (sort, only when sortOrder changes)
    └─→ filterOptions (from ALL items, not filtered - prevents circular dependency)
    ↓
VirtualizedYieldList renders visible subset
    ↓
YieldCard components display individual opportunities
```

## Recommended Project Structure

### Current Structure (Optimized)

```
components/sections/yield-section/
├── yield-section.tsx              # Container component (filters state, useTransition)
├── yield-filter-bar.tsx           # Filter controls (memoized options)
├── virtualized-yield-list.tsx     # react-window wrapper
├── yield-card.tsx                 # Individual item (React.memo)
├── yield-stats.tsx                # Statistics display
├── hooks/
│   └── use-yield-data.ts          # Data fetching, filtering, sorting logic
├── types.ts                       # TypeScript interfaces
├── utils.ts                       # Helper functions
└── PERFORMANCE.md                 # Documentation of 11 optimizations applied
```

### Structure Rationale

- **Feature folder pattern:** All yield-related code co-located for easy navigation
- **Custom hook isolation:** `use-yield-data.ts` encapsulates all data transformation logic
- **Separation of concerns:** Filter state lives in parent, data processing in hook, rendering in child components
- **Virtualization boundary:** Clear separation between list container and item renderer

## Architectural Patterns

### Pattern 1: Single-Pass Filtering with Stable Dependencies

**What:** Filter operations use useMemo with carefully chosen dependencies to prevent cascading recalculations.

**When to use:** Any filter system with multiple filter types (categories, protocols, tokens, search, toggles).

**Trade-offs:**
- ✅ Pros: Single render pass, minimal recomputation, predictable performance
- ❌ Cons: Requires careful dependency management, can be fragile if dependencies change

**Example:**
```typescript
// GOOD: Length-based dependencies prevent unnecessary recalculations
const normalizedFilters = useMemo(() => {
  const selectedCategoriesSet =
    deferredFilters.selectedCategories.length > 0
      ? new Set(deferredFilters.selectedCategories)
      : new Set();
  // ... similar for protocols/tokens
  return { searchQuery, selectedCategories: selectedCategoriesSet, ... };
}, [
  deferredFilters.searchQuery,
  deferredFilters.selectedCategories.length,  // Not the array itself
  deferredFilters.selectedProtocols.length,
  deferredFilters.selectedTokens.length,
  deferredFilters.stablecoinOnly,
  deferredFilters.hypeOnly,
]);
```

**Why this matters:** Using array length instead of the array reference means the memo only recalculates when the filter content actually changes, not when the array is recreated with identical items.

### Pattern 2: Filter Options from Unfiltered Data

**What:** Available filter options (protocols, tokens) are derived from ALL items, not filtered results.

**When to use:** Multi-select filters where users need to see all available options regardless of current selection.

**Trade-offs:**
- ✅ Pros: Eliminates circular dependency, better UX (users see all options), single memo pass
- ❌ Cons: Filter options include items that may not match current filters (intentional)

**Example:**
```typescript
// GOOD: filterOptions from normalizedDisplayItems (ALL data)
const { protocols, tokens } = useMemo(() => {
  // ... extract from normalizedDisplayItems
}, [normalizedDisplayItems]);

// BAD: filterOptions from filteredDisplayItems
const { protocols, tokens } = useMemo(() => {
  // ... extract from filteredDisplayItems
}, [filteredDisplayItems]); // ❌ Circular dependency!
```

**Critical insight:** This pattern eliminates the circular dependency that caused 5+ cascading memo recalculations in the original implementation.

### Pattern 3: Extract Sort-Only Dependencies

**What:** Sort operations only depend on sort order, not entire filter object.

**When to use:** Any sortable list with additional filters.

**Trade-offs:**
- ✅ Pros: Array only re-sorts when sort order changes, not on filter changes
- ❌ Cons: Requires explicit dependency extraction

**Example:**
```typescript
// GOOD: Only depends on sortOrder
const displayItems = useMemo(() => {
  const items = filteredDisplayItems.map((entry) => entry.item);
  const sortOrder = deferredFilters.sortOrder; // Extract only what's needed
  items.sort((a, b) => {
    const apyA = getDisplayItemApy(a);
    const apyB = getDisplayItemApy(b);
    return sortOrder === 'desc' ? apyB - apyA : apyA - apyB;
  });
  return items;
}, [filteredDisplayItems, deferredFilters.sortOrder]); // Only re-sort when sortOrder changes

// BAD: Depends on entire filters object
const displayItems = useMemo(() => {
  // ... sort logic
}, [filteredDisplayItems, deferredFilters]); // ❌ Re-sorts on ANY filter change
```

### Pattern 4: React Virtualization (react-window)

**What:** Windowed rendering that only displays visible items plus a small buffer.

**When to use:** Lists with 100+ items, especially when items have consistent height.

**Trade-offs:**
- ✅ Pros: 90% reduction in DOM nodes, smooth scrolling, minimal memory usage
- ❌ Cons: Fixed item height required, adds library dependency, more complex setup

**Example:**
```typescript
import { List } from 'react-window';

const ITEM_HEIGHT = 90;

export function VirtualizedYieldList({ opportunities }) {
  const Row = ({ index, style }) => {
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
      overscanCount={3}
    >
      {Row}
    </List>
  );
}
```

**Performance impact:**
- Before: 5000 DOM nodes, 2-5s initial render
- After: ~20 DOM nodes, <100ms initial render

### Pattern 5: Custom React.memo Comparator

**What:** YieldCard uses ID-based comparison instead of reference equality.

**When to use:** List items that have stable identifiers but may be recreated.

**Trade-offs:**
- ✅ Pros: Prevents unnecessary re-renders during filter changes
- ❌ Cons: Requires custom comparator function, slightly more complex

**Example:**
```typescript
export const YieldCard = React.memo(
  ({ opportunity }: YieldCardProps) => {
    // ... component implementation
  },
  (prevProps, nextProps) => {
    return prevProps.opportunity.id === nextProps.opportunity.id;
  }
);
```

### Pattern 6: useTransition for Non-Blocking UI

**What:** Filter updates wrapped in startTransition to prevent UI blocking.

**When to use:** User interactions that trigger expensive updates (filtering large datasets).

**Trade-offs:**
- ✅ Pros: UI remains responsive during expensive operations
- ❌ Cons: Adds slight latency to filter application, requires React 18+

**Example:**
```typescript
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

**Important:** Don't combine with `useDeferredValue` - causes double-deferral and perceived lag.

## Anti-Patterns

### Anti-Pattern 1: Circular Derived State

**What people do:**
```typescript
// ❌ BAD: Filter options derived from filtered results
const filteredItems = useMemo(() => {
  return items.filter(/* based on filters */);
}, [items, filters]);

const filterOptions = useMemo(() => {
  return extractOptions(filteredItems); // Circular dependency!
}, [filteredItems]);
```

**Why it's wrong:** Filter options depend on filtered results, which depend on filters, creating a cascade. Changing any filter triggers:
1. Filter recalculation
2. Filter options recalculation
3. Parent re-render
4. Child re-renders
5. Back to step 1 if options changed

**Do this instead:**
```typescript
// ✅ GOOD: Filter options from ALL items
const filterOptions = useMemo(() => {
  return extractOptions(items); // No circular dependency
}, [items]);

const filteredItems = useMemo(() => {
  return items.filter(/* based on filters */);
}, [items, filters]);
```

### Anti-Pattern 2: Double-Deferral with useDeferredValue

**What people do:**
```typescript
// ❌ BAD: Combining useTransition and useDeferredValue
const deferredFilters = useDeferredValue(filters);

const handleFiltersChange = (updates) => {
  startTransition(() => {
    setFilters((prev) => ({ ...prev, ...updates }));
  });
};
```

**Why it's wrong:** Both hooks defer updates, causing perceived lag. Filters feel sluggish.

**Do this instead:**
```typescript
// ✅ GOOD: Use only one deferral mechanism
const deferredFilters = filters; // Direct assignment

const handleFiltersChange = (updates) => {
  startTransition(() => {
    setFilters((prev) => ({ ...prev, ...updates }));
  });
};
```

### Anti-Pattern 3: JSON.stringify for Memo Dependencies

**What people do:**
```typescript
// ❌ BAD: String serialization on every render
const normalizedFilters = useMemo(() => {
  return {
    selectedCategories: new Set(deferredFilters.selectedCategories),
    // ...
  };
}, [
  JSON.stringify(deferredFilters.selectedCategories), // Slow!
  JSON.stringify(deferredFilters.selectedProtocols),
  JSON.stringify(deferredFilters.selectedTokens),
]);
```

**Why it's wrong:** String serialization is expensive and causes memo invalidation storms.

**Do this instead:**
```typescript
// ✅ GOOD: Use length for array comparisons
const normalizedFilters = useMemo(() => {
  return {
    selectedCategories:
      deferredFilters.selectedCategories.length > 0
        ? new Set(deferredFilters.selectedCategories)
        : new Set(),
    // ...
  };
}, [
  deferredFilters.selectedCategories.length,  // Fast!
  deferredFilters.selectedProtocols.length,
  deferredFilters.selectedTokens.length,
]);
```

### Anti-Pattern 4: Rendering Large Lists Without Virtualization

**What people do:**
```typescript
// ❌ BAD: Mapping over 5000 items
{opportunities.map((opp) => (
  <YieldCard key={opp.id} opportunity={opp} />
))}
```

**Why it's wrong:**
- Creates 5000 DOM nodes
- Slow initial render (2-5 seconds)
- Laggy scrolling
- High memory usage

**Do this instead:**
```typescript
// ✅ GOOD: Virtualized rendering
<VirtualizedYieldList opportunities={opportunities} />
// Renders only ~20 items at a time
```

### Anti-Pattern 5: Re-sorting on Every Filter Change

**What people do:**
```typescript
// ❌ BAD: Sort depends on entire filter object
const displayItems = useMemo(() => {
  const items = filteredDisplayItems.map((entry) => entry.item);
  items.sort((a, b) => {
    const sortOrder = deferredFilters.sortOrder; // Captured from closure
    // ... sort logic
  });
  return items;
}, [filteredDisplayItems, deferredFilters]); // Re-sorts on ANY filter change!
```

**Why it's wrong:** Sorting is O(n log n). Re-sorting on every filter change is expensive and unnecessary.

**Do this instead:**
```typescript
// ✅ GOOD: Only depend on sort order
const displayItems = useMemo(() => {
  const items = filteredDisplayItems.map((entry) => entry.item);
  const sortOrder = deferredFilters.sortOrder; // Extract only what's needed
  items.sort((a, b) => {
    // ... sort logic
  });
  return items;
}, [filteredDisplayItems, deferredFilters.sortOrder]); // Only re-sorts when sortOrder changes
```

## Scaling Considerations

| Dataset Size | Architecture Adjustments |
|--------------|--------------------------|
| **0-100 items** | No virtualization needed, simple `.map()` rendering is fine |
| **100-1,000 items** | Consider virtualization, useMemo for filters, basic React.memo |
| **1,000-10,000 items** | Virtualization required (react-window), optimized filter chain, custom memo comparators |
| **10,000+ items** | Virtualization + pagination, Web Workers for filtering, server-side filtering/sorting |

### Scaling Priorities for Yield Section

**Current state:** 5000+ opportunities

1. **First bottleneck:** Rendering all items to DOM
   - **Solution:** ✅ Already implemented with react-window
   - **Result:** 90% reduction in DOM nodes

2. **Second bottleneck:** Filter computation on every interaction
   - **Solution:** ✅ Already implemented with optimized memo chain
   - **Result:** <50ms filter latency

3. **Third bottleneck (future):** Data fetching time
   - **Solution:** Consider server-side filtering for very large datasets
   - **Current approach:** Client-side filtering works well for 5000 items

## React 19 Specific Considerations

### Automatic Memoization via React Compiler

React 19 introduces the React Compiler which automatically optimizes re-renders, reducing the need for manual `useMemo`, `useCallback`, and `React.memo`.

**Current state:** Hyperfolio doesn't use React Compiler yet (requires opt-in).

**Implications:**
- If React Compiler is enabled, many manual optimizations become redundant
- However, architectural patterns (circular dependency avoidance, virtualization) remain important
- Compiler can't fix algorithmic complexity issues (O(n²) vs O(n))

**Recommendation:** Keep current optimizations. They provide predictable performance without requiring compiler adoption.

### useTransition for Concurrent Rendering

React 19's concurrent features allow non-blocking UI updates during expensive operations.

**Current implementation:** ✅ Already using `useTransition` for filter updates

**Best practice:** Use for interactions that trigger expensive computations:
- Filter changes on large datasets
- Search queries
- Sort operations

**Avoid:** Don't overuse. Simple state updates don't need transition wrapping.

## Data Flow for Optimized Filtering

### Filter Update Flow (Current Implementation)

```
User changes filter
    ↓
handleFiltersChange(updates)
    ↓ (useTransition)
setFilters({ ...prev, ...updates })
    ↓
useYieldData hook detects filter change
    ↓
[useMemo chain - single pass]
    ├─→ normalizedFilters (length-based deps, no JSON.stringify)
    ├─→ filteredDisplayItems (early exits, AND logic, sorted by cost)
    ├─→ displayItems (sort only when sortOrder changes)
    └─→ filterOptions (from ALL items, prevents circular dependency)
    ↓
VirtualizedYieldList renders new visible subset
    ↓
YieldCard components with React.memo (ID-based comparison)
```

### Critical Performance Points

1. **Normalization:** Only when filter array lengths change, not when arrays are recreated
2. **Filtering:** Early exits for invalid items, cheap checks first, expensive checks last
3. **Sorting:** Only when sort order changes, not on filter changes
4. **Rendering:** Only visible items + overscan buffer, not all items

## Component Boundaries for State Management

### Local vs Global State

**Current approach:** Filter state is local to YieldSection component.

**Rationale:**
- Filters are specific to yield section, not shared across app
- Local state with `useTransition` provides sufficient performance
- No need for global state (Zustand) for filters

**When to use global state:**
- Filters need to persist across navigation
- Multiple components need to access/modify same filters
- Filters need to be synchronized across browser tabs

**Current recommendation:** Keep filter state local. Add Zustand store only if requirements change.

## Build Order for Implementation

If building a new filter system from scratch, follow this order:

### Phase 1: Foundation (No Optimization)
1. Create basic component structure
2. Implement simple filter logic (`.filter()`, `.sort()`)
3. Use useState for filter state
4. Render list with `.map()`
5. **Verify:** Correct functionality, ignore performance

### Phase 2: Data Layer Optimization
1. Extract filtering/sorting logic to custom hook (`useYieldData`)
2. Add useMemo for expensive operations
3. Implement pre-filtering (filter invalid items early)
4. Add filter options extraction from ALL items (prevent circular dependency)
5. **Verify:** Filter logic correct, options update properly

### Phase 3: Memoization Strategy
1. Add length-based dependencies for array filters
2. Extract sort-only dependencies (sortOrder)
3. Add React.memo to list items with custom comparator
4. Remove JSON.stringify from dependencies
5. **Verify:** Reduced re-renders, no cascading recalculations

### Phase 4: Concurrency
1. Wrap filter updates in `useTransition`
2. Remove `useDeferredValue` (double-deferral anti-pattern)
3. Add loading states if needed
4. **Verify:** UI remains responsive during filter changes

### Phase 5: Virtualization (If 1000+ items)
1. Install react-window
2. Create VirtualizedList wrapper component
3. Measure fixed item height
4. Configure overscanCount for smooth scrolling
5. **Verify:** Scroll performance, no blank space flash

### Phase 6: Polish
1. Add error handling
2. Implement empty states
3. Add statistics display
4. Optimize for mobile responsive
5. **Verify:** Complete user experience

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Yield API** | `secureFetch` with token refresh, retry logic (3 attempts) | Handled in `useFetchYieldData` |
| **Token Metadata** | Separate hook `useHyperEvmTokens` | Called in YieldFilterBar for logo URIs |
| **Wallet State** | Zustand store for privacy mode | Read-only access in YieldSection |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **YieldSection ↔ useYieldData** | Props (filters) → Return value (filtered data) | Hook owns data transformation logic |
| **YieldSection ↔ YieldFilterBar** | Props (filters, onFiltersChange, filterOptions) | One-way data flow, child emits events |
| **YieldSection ↔ VirtualizedYieldList** | Props (opportunities array) | Pure presentation, no state |
| **YieldSection ↔ YieldStats** | Props (stats object) | Read-only, pre-calculated in hook |

## Monitoring and Debugging

### Performance Monitoring

**Current approach:** Manual testing with browser DevTools.

**Recommended additions:**
```typescript
// Track filter change performance
useEffect(() => {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    console.log(`Filter change took ${endTime - startTime}ms`);
  };
}, [filters]);
```

### React DevTools Profiler

**Key metrics to monitor:**
- Render time of YieldSection on filter changes
- Re-render count of child components
- Memo hit/miss ratio

**What to look for:**
- YieldSection should re-render on filter changes (expected)
- YieldFilterBar should NOT re-render unless disabled state changes
- VirtualizedYieldList should re-render when opportunities array changes
- YieldCard should NOT re-render if opportunity ID hasn't changed

## Sources

### React 19 Performance
- [React 19 Automatic Optimization: Goodbye memo, useMemo and useCallback](https://medium.com/@priyankadaida/react-19-automatic-optimization-goodbye-memo-usememo-and-usecallback-f097152cc0af)
- [React 19 and Its Optimization Improvements via the New Compiler](https://dev.to/oussamabouyahia/react-19-and-its-optimization-improvements-via-the-new-compiler-g44)
- [React 19 Auto-Memoization: Cleaner Code, Better Performance](https://javascript.plainenglish.io/react-19-auto-memoization-cleaner-code-better-performance-e7a0629c5819)
- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)

### Virtualization
- [Virtualization in React: Improving Performance for Large Lists](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef)
- [How to Virtualize Large Lists Using React-Window](https://www.dhiwise.com/post/how-to-virtualize-large-lists-using-react-window)
- [Handling Large Lists Efficiently with React Window](https://thesheryar.com/handling-large-lists-efficiently-with-react-window/)

### Concurrent Rendering
- [React 19's Engine: A Quick Dive into Concurrent Rendering](https://medium.com/@ignatovich.dm/react-19s-engine-a-quick-dive-into-concurrent-rendering-6436d39efe2b)
- [React 19 Official Blog](https://react.dev/blog/2024/12/05/react-19)
- [Complete Guide to Concurrent Rendering in React](https://reliasoftware.com/blog/concurrent-rendering-in-react)

### Codebase Analysis
- [components/sections/yield-section/PERFORMANCE.md](../components/sections/yield-section/PERFORMANCE.md) - Detailed documentation of 11 optimizations applied
- [components/sections/yield-section/yield-section.tsx](../components/sections/yield-section/yield-section.tsx) - Container component implementation
- [components/sections/yield-section/hooks/use-yield-data.ts](../components/sections/yield-section/hooks/use-yield-data.ts) - Data processing hook
- [components/sections/yield-section/virtualized-yield-list.tsx](../components/sections/yield-section/virtualized-yield-list.tsx) - react-window implementation

---

## Roadmap Implications

### Immediate (MVP)
- Current implementation is production-ready with <50ms filter latency
- No further optimizations needed for current scale (5000 items)

### Phase 2: If Growth to 10,000+ Items
- Consider server-side filtering/sorting
- Implement pagination with virtualization
- Add Web Workers for client-side processing

### Phase 3: If Growth to 100,000+ Items
- Full server-side rendering with pagination
- Infinite scroll with virtualization
- IndexedDB caching for filtered results

### Research Flags for Roadmap
- **Phase 1 (Foundation):** No special research needed, patterns are well-established
- **Phase 2 (Scale):** Monitor performance metrics, consider server-side filtering
- **Phase 3 (Large Scale):** Need deeper research on Web Workers, IndexedDB, and server-side architecture

*Architecture research for: React 19 Filter System Performance*
*Researched: 2025-01-19*
