# Stack Research

**Domain:** React 19 Performance Optimization
**Researched:** 2025-01-19
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React 19 | Built-in to Next.js 16 | Concurrent rendering features | `useTransition` and `useDeferredValue` are built-in solutions for filter performance. No additional dependencies needed. |
| Next.js 16 | Current | App Router with Server Components | Server Components reduce client JS by default. React 19 concurrency features are fully integrated. |
| Zustand | 5.x | State management | Already in use. Selector pattern with `shallow` equality prevents unnecessary re-renders. 40% better performance than Redux. |
| TanStack Virtual | 3.13.18 | List virtualization | Modern, actively maintained, framework-agnostic. Better DX than react-window. 7.3M weekly downloads. |
| Tailwind CSS | 4.x | Styling | Already in use. Use `content-visibility: auto` CSS for large lists. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `usehooks-ts` | Latest | Custom hooks | `useDebounce` for filter input to prevent excessive re-renders |
| `@tanstack/react-virtual` | 3.13.18 | Virtual scrolling core | For lists 50+ items. Renders only visible items + buffer |
| `clsx` or `cn` utility | Existing | Conditional classes | Already in project. Use for conditional view switching classes |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| React DevTools Profiler | Identify render bottlenecks | Measure before optimizing. Look for long render times in yield section |
| why-did-you-render | Dev-only re-render detection | Run only in development to catch wasteful renders |
| Chrome Performance Tab | Web Vitals tracking | Monitor INP (Interaction to Next Paint) for filter responsiveness |

## Installation

```bash
# Virtualization (if not already installed)
npm install @tanstack/react-virtual@3.13.18

# Dev dependencies for performance monitoring
npm install -D @welldone-software/why-did-you-render

# Debounce hook (if needed)
npm install usehooks-ts
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TanStack Virtual 3.x | react-window 2.2.5 | Only if you need minimal bundle size and don't care about DX |
| useTransition (built-in) | External concurrency libraries | Never. Built-in React 19 features are superior |
| Zustand selectors | React Context | Use Context only for static/rarely-changing data (theme, locale) |
| useMemo for filters | Web Workers | Only for 1000+ items with complex sorting. Overkill for 30 items. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Manual `useCallback` everywhere | React Compiler (React 19) handles this automatically | Let React Compiler optimize. Only add `useCallback` when profiling shows need |
| react-virtualized | Deprecated, bulky, unmaintained | TanStack Virtual or react-window |
| Context for filters | Every context update re-renders all consumers | Zustand with selectors for granular updates |
| Anonymous functions in JSX | New reference every render triggers memoized children | Pre-define handlers or use `useCallback` |
| Inline style objects | New object every render breaks `React.memo` | `className` with Tailwind or CSS variables |
| Index as key | Breaks reordering/filtering | Unique stable IDs (protocol address, chain ID) |

## Stack Patterns by Variant

**If filtering < 50 items:**
- Use `useTransition` for filter state updates
- No virtualization needed
- `useMemo` for filtered results

**If filtering 50-100 items:**
- Use `useTransition` + `useDeferredValue`
- Add TanStack Virtual for smooth scrolling
- Memoize filter computation

**If filtering 100+ items:**
- All of the above
- Consider Web Workers for complex sort/filter
- Add loading skeleton during filter operation

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @tanstack/react-virtual@3.13.18 | React 18+ / 19 | Fully compatible with React 19 concurrent features |
| Zustand 5.x | React 18+ / 19 | No breaking changes. Selector pattern works identically |
| Next.js 16 | React 19 | Full integration. Server Components + concurrent client features |

## Performance Patterns for Yield Section

### Pattern 1: Filter with Transitions
```typescript
const [isPending, startTransition] = useTransition()
const [filters, setFilters] = useState<Filters>(initialFilters)

// Non-urgent filter update
const updateFilter = (key: string, value: string) => {
  startTransition(() => {
    setFilters(prev => ({ ...prev, [key]: value }))
  })
}
```

**Why:** `startTransition` marks filter updates as low-priority. Input stays responsive even if filtering takes 100ms.

### Pattern 2: Zustand Selector Pattern
```typescript
// In component
const protocols = useYieldStore(
  useShallow(state => state.protocols) // Only re-renders when protocols change
)

const filteredProtocols = useMemo(() => {
  return protocols.filter(/* filter logic */)
}, [protocols, filters])
```

**Why:** Selector with `shallow` prevents re-renders when other store slices change.

### Pattern 3: Virtualized List with TanStack
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: filteredProtocols.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80, // Estimated row height
  overscan: 5 // Render 5 extra items above/below viewport
})
```

**Why:** Only renders visible items. Smooth scrolling regardless of list size.

### Pattern 4: View Switching Optimization
```typescript
const [viewMode, setViewMode] = useState<'list' | 'card'>('list')

// Memoize component to prevent remount on view change
const YieldList = useMemo(() => (
  <YieldListVirtualized protocols={filteredProtocols} />
), [filteredProtocols])

const YieldGrid = useMemo(() => (
  <YieldGridCards protocols={filteredProtocols} />
), [filteredProtocols])
```

**Why:** Memoizing view components prevents expensive remounts during view switching.

## Target Metrics

| Metric | Current | Target | How to Achieve |
|--------|---------|--------|----------------|
| Filter change latency | > 500ms (freeze) | < 100ms | `useTransition` + `useMemo` |
| View switch time | Unknown | < 50ms | Memoized components + CSS transitions |
| Scroll FPS | Unknown | 60fps | TanStack Virtual for 30+ items |
| Initial render | Lag on load | < 200ms | Server Components + defer non-critical JS |

## Implementation Priority

1. **Phase 1: Quick Wins** (1-2 hours)
   - Add `useTransition` to filter state updates
   - Add `useMemo` for filtered results
   - Profile before/after with React DevTools

2. **Phase 2: State Optimization** (2-3 hours)
   - Ensure Zustand selectors use `shallow` equality
   - Verify no unnecessary re-renders from store updates
   - Add `why-died-you-render` in dev mode

3. **Phase 3: Virtualization** (3-4 hours)
   - Implement TanStack Virtual for yield list
   - Test with 30+ protocols
   - Verify smooth scrolling on mobile

4. **Phase 4: View Switching** (1-2 hours)
   - Memoize list and grid components
   - Add CSS transitions for smooth view change
   - Ensure filter state persists across view switches

## Sources

### React 19 Performance
- [React 19 Concurrency Deep Dive — Mastering useTransition](https://dev.to/a1guy/react-19-concurrency-deep-dive-mastering-usetransition-and-starttransition-for-smoother-uis-51eo) - HIGH confidence, official patterns
- [React 19's New Transition API Just Fixed UI Jank Forever](https://medium.com/@CodersWorld99/react-19s-new-transition-api-just-fixed-ui-jank-forever-here-s-how-it-works-608de47591af) - HIGH confidence, comprehensive guide
- [React Performance Optimization: Best Techniques for 2025](https://www.growin.com/blog/react-performance-optimization-2025/) - HIGH confidence, verified patterns
- [React 19 useDeferredValue Deep Dive](https://dev.to/a1guy/react-19-usedeferredvalue-deep-dive-how-to-keep-your-ui-smooth-when-things-get-heavy-1gdl) - HIGH confidence, specific to filtering
- [Official React useTransition docs](https://react.dev/reference/react/useTransition) - HIGH confidence, official source

### Virtualization
- [TanStack Virtual Official Docs](https://tanstack.com/virtual/latest/docs/react/virtual/guide) - HIGH confidence, official documentation
- [TanStack Virtualizer vs React-Window Comparison](https://mashuktamim.medium.com/react-virtualization-showdown-tanstack-virtualizer-vs-react-window-for-sticky-table-grids-69b738b36a83) - MEDIUM confidence, community comparison
- [NPM Trends: Virtualization Libraries](https://tanstack.com/stats/npm) - HIGH confidence, download statistics
- [List Virtualization: How to Smoothly Scroll Through 10,000 Items](https://medium.com/@ethanhaller02/list-virtualization-how-to-smoothly-scroll-through-10-000-items-cad39bfa7f3e) - MEDIUM confidence, practical guide

### Zustand Performance
- [Avoid performance issues when using Zustand](https://dev.to/devgrana/avoid-performance-issues-when-using-zustand-12ee) - HIGH confidence, verified patterns
- [Zustand vs Jotai vs Valtio: Performance Guide 2025](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025) - HIGH confidence, current comparison
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - HIGH confidence, official source
- [40% Performance Improvement Migrating from Redux to Zustand](https://juejin.cn/post/7593240931286548532) - MEDIUM confidence, real-world case study (Chinese)

### React 19 Filtering Performance
- [Svelte 5 vs React 19 vs Vue 4: The 2025 Framework War](https://jsgurujobs.com/blog/svelte-5-vs-react-19-vs-vue-4-the-2025-framework-war-nobody-expected-performance-benchmarks) - MEDIUM confidence, independent benchmark with specific timing data
- [React Performance Optimization: 15 Best Practices for 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9) - HIGH confidence, Web Workers recommendation
- [Mastering useTransition: Building High-Performance Search for 50k Records](https://dev.to/fpaghar/mastering-usetransition-in-react-building-a-high-performance-search-for-50k-record-case-study-1bdn) - HIGH confidence, real-world case study

---
*Stack research for: React 19 Performance Optimization*
*Researched: 2025-01-19*
