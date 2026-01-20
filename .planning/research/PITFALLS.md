# Pitfalls Research

**Domain:** React Performance Optimization for DeFi Yield Section
**Researched:** 2026-01-19
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Premature Memoization Overhead

**What goes wrong:**
Excessive use of `useMemo`, `useCallback`, and `React.memo` that actually degrades performance rather than improving it. The overhead of memoization comparisons exceeds the cost of recomputing values.

**Why it happens:**
Developers apply memoization reflexively without measuring actual bottlenecks. This is especially problematic with React 19's Compiler, which automatically optimizes re-renders, making manual memoization redundant and potentially harmful.

**How to avoid:**
- **Measure first, optimize second**: Use React DevTools Profiler to identify actual re-render problems before adding memoization
- **React 19 rule**: Default to NO manual memoization. Let the Compiler handle optimization. Only add `useMemo`/`useCallback` after profiling confirms a specific bottleneck.
- **Cost-benefit threshold**: Only memoize computations that take >1ms AND run frequently. Simple calculations (filter by category, sort by APY) should not be memoized.
- **Reference stability matters**: Memoization is only valuable when preventing reference changes that would cause child re-renders. If the value isn't passed to memoized children, skip it.

**Warning signs:**
- Profiler shows "Memoized component" slower than non-memoized version
- Lighthouse score decreases after adding memoization
- `useMemo` dependencies array has >3 items (sign of over-complexity)
- Memoized values are only used locally in the same component (not passed to children)

**Phase to address:**
Phase 2 (Performance Optimization). Do not add during initial implementation.

---

### Pitfall 2: Unstable Function References in Filter Handlers

**What goes wrong:**
Filter change handlers (`onCategoryChange`, `onProtocolChange`, etc.) are recreated on every render, causing all filter inputs to re-render even when only one filter changes.

**Why it happens:**
Inline arrow functions in JSX or handler functions that depend on changing state without proper memoization.

**How to avoid:**
```typescript
// BAD - Inline function, breaks child memoization
<CategoryFilter onChange={(cat) => setFilters(f => ({...f, category: cat}))} />

// GOOD - Stable reference with useCallback
const handleCategoryChange = useCallback((category: string) => {
  setFilters(prev => ({ ...prev, category }))
}, []) // Empty deps - function never changes

<CategoryFilter onChange={handleCategoryChange} />
```

**Better yet with React 19:**
Don't use `useCallback` unless profiling shows a problem. The Compiler handles this automatically in most cases.

**Warning signs:**
- All filter inputs re-render when any single filter changes (check React DevTools)
- Filter onChange handlers defined inline in JSX
- Profiler shows "Child component re-rendered due to props change" for unrelated filters

**Phase to address:**
Phase 1 (Implementation). Build stable handler patterns from the start.

---

### Pitfall 3: react-window Height Calculation Mismatches

**What goes wrong:**
Virtualized lists show incorrect scrolling behavior: items are cut off, extra white space, or jittery scrolling. The `VariableSizeList` or `FixedSizeList` height doesn't match the actual rendered item heights.

**Why it happens:**
react-window requires precise height measurements. When item heights vary due to:
- Dynamic content (protocol descriptions, different metadata per row)
- Responsive design (height changes at breakpoints)
- Font loading delays
- Images that load asynchronously

The `itemSize` callback returns stale or incorrect heights.

**How to avoid:**
```typescript
// BAD - Static size for variable-height items
<VariableSizeList
  itemSize={() => 80} // Assumes all items are 80px tall
  itemCount={protocols.length}
/>

// GOOD - Dynamic size measurement with cache
const getItemSize = useCallback((index: number) => {
  const protocol = protocols[index]
  // Calculate based on actual content
  const baseHeight = 80
  const descriptionLines = Math.ceil(protocol.description.length / 50)
  const hasExtraMetadata = protocol.tags.length > 3
  return baseHeight + (descriptionLines * 20) + (hasExtraMetadata ? 40 : 0)
}, [protocols])

<VariableSizeList
  itemSize={getItemSize}
  itemCount={protocols.length}
/>
```

**Better:** Migrate to `react-virtual` (see Pitfall 4).

**Warning signs:**
- Scroll position jumps when scrolling
- Items appear "squashed" or have excessive padding
- Last items in list are cut off
- Console warnings about estimated total size mismatch

**Phase to address:**
Phase 1 (Implementation). Height calculation is core to virtualization - must be correct from day one.

---

### Pitfall 4: State Update Loops During Filter Changes

**What goes wrong:**
Filter changes trigger infinite render loops or cascading re-renders. Each filter update triggers multiple state updates, causing 3-5 re-renders per user action.

**Why it happens:**
```typescript
// BAD - Multiple setState calls in one handler
const handleFilterChange = (key: string, value: any) => {
  setFilters(prev => ({ ...prev, [key]: value }))      // Render 1
  setFilteredProtocols(filterProtocols())              // Render 2
  setCurrentPage(1)                                    // Render 3
  setSortConfig({ field: 'apy', direction: 'desc' })  // Render 4
}
```

**How to avoid:**
```typescript
// GOOD - Batch updates atomically
const handleFilterChange = useCallback((key: string, value: any) => {
  startTransition(() => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      // Derive state, don't set it separately
      const filtered = applyFilters(next, protocols)
      return { ...next, filteredProtocols: filtered, currentPage: 1 }
    })
  })
}, [protocols])
```

Even better: **Derived state pattern** - don't store `filteredProtocols` at all. Compute it during render:

```typescript
// BEST - No setState for filtered results
const filteredProtocols = useMemo(() =>
  applyFilters(filters, protocols),
  [filters, protocols]
)
```

**Warning signs:**
- Profiler shows 3+ commits for a single filter change
- Console shows "Too many re-renders" error
- Filter input loses focus after each keystroke
- Network tab shows multiple identical API calls

**Phase to address:**
Phase 1 (Implementation). Use derived state pattern from the start.

---

### Pitfall 5: Missing Debouncing on Text Filters

**What goes wrong:**
Every keystroke in text search (protocol name, token filter) triggers a full filter computation and re-render of 30+ protocol cards. User types "uniswap" at 200ms/keystroke = 7 renders in 1.4 seconds.

**Why it happens:**
Direct binding of input `onChange` to filter state without debouncing.

**How to avoid:**
```typescript
// GOOD - Debounced text input
import { useDebouncedValue } from '@/hooks/use-debounced-value'

function ProtocolFilters() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const filtered = useMemo(() =>
    protocols.filter(p => p.name.includes(debouncedSearch)),
    [protocols, debouncedSearch]
  )

  return (
    <input
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      // Input updates immediately, but filter uses debounced value
    />
  )
}
```

**Debounce thresholds:**
- Local search (30 items): 150-200ms
- Large datasets (100+ items): 300-400ms
- API-backed search: 500ms+

**Warning signs:**
- Lag/stutter when typing in search box
- Filter operations visible in profiler timeline during typing
- Frame drops below 30fps during text input

**Phase to address:**
Phase 1 (Implementation). Add debouncing hook before building filter UI.

---

### Pitfall 6: View Switch Re-mounts Entire List

**What goes wrong:**
Switching between list/card view unmounts all components and re-mounts them, losing scroll position and causing visible flicker. All 30+ protocol items re-render simultaneously.

**Why it happens:**
```typescript
// BAD - Conditional rendering unmounts/remounts
{viewMode === 'list' ? (
  <ProtocolList protocols={protocols} />
) : (
  <ProtocolCardGrid protocols={protocols} />
)}
```

React unmounts one tree and mounts a new one, losing all internal state and scroll position.

**How to avoid:**
```typescript
// GOOD - Same components, different styling via props
<ProtocolVirtualList
  protocols={protocols}
  viewMode={viewMode} // Pass mode, don't conditionally render
/>

// Inside component - use className/props for layout
<div className={viewMode === 'card' ? 'grid grid-cols-3' : 'space-y-2'}>
```

Or if layouts truly differ, keep both mounted but hide one:
```typescript
<div>
  <ProtocolList className={viewMode === 'list' ? 'block' : 'hidden'} />
  <ProtocolCardGrid className={viewMode === 'card' ? 'block' : 'hidden'} />
</div>
```

**Warning signs:**
- Scroll position resets when switching views
- React DevTools shows all components unmounting/remounting
- Visible flash/flicker during view toggle
- Profiler shows "mount" spike on view switch

**Phase to address:**
Phase 1 (Implementation). Design view switching to preserve state.

---

### Pitfall 7: APY/TVL Range Slider Causing Excessive Re-renders

**What goes wrong:**
Dual-handle range sliders for APY/TVL filters trigger re-renders on every pixel of drag, not just on change. A smooth drag causes 60+ renders per second.

**Why it happens:**
Slider's `onValueChange` fires continuously during drag, and each update triggers state change and re-render.

**How to avoid:**
```typescript
// GOOD - Throttle or use onValueCommit
import { useThrottledValue } from '@/hooks/use-throttled-value'

function RangeFilters() {
  const [rawRange, setRawRange] = useState([0, 100])
  const throttledRange = useThrottledValue(rawRange, 100) // Update max 10x/sec

  const filtered = useMemo(() =>
    protocols.filter(p => p.apy >= throttledRange[0] && p.apy <= throttledRange[1]),
    [protocols, throttledRange]
  )

  return (
    <RangeSlider
      value={rawRange}
      onValueChange={setRawRange} // Immediate visual feedback
      // But filtering uses throttled value
    />
  )
}
```

**Better:** Use slider library with `onValueCommit` callback (fires after drag ends).

**Warning signs:**
- Slider feels "heavy" or laggy when dragging
- Profiler shows render spike during slider interaction
- Frame rate drops during range selection

**Phase to address:**
Phase 1 (Implementation). Choose slider component with proper event handling.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Filtering on every render without memoization | Less code, simpler logic | Performance degrades as protocol count grows beyond 50 | Only for MVP with <20 protocols. Must add memoization before scaling. |
| Using react-window instead of react-virtual | More familiar, more examples | Complex API, harder to maintain, worse DX | Never. Start with react-virtual. |
| Storing filtered results in Zustand store | Easy access across components | State synchronization issues, harder to debug | Never. Use derived state pattern. |
| Skipping debouncing for text search | Faster implementation | Terrible UX when typing, unnecessary renders | Never. 5-minute implementation cost vs permanent UX debt. |
| Inline filter handlers | Quicker to write | Breaks child component optimization | Never. useCallback pattern is trivial to set up. |
| Conditional rendering for view modes | Obvious code structure | Loses scroll position, causes flicker | Only if layouts are fundamentally incompatible. Otherwise use CSS/display toggling. |
| Skipping measurement before optimization | Faster to implement | Optimizations may be worthless or harmful | Never. "Measure first" is non-negotiable. |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| react-window with Tailwind | Assuming `h-` classes work correctly on list container | react-window needs explicit numeric heights. Use `style={{ height: 600 }}` not `className="h-600"` |
| react-virtual with resize observers | Not updating list size when container resizes | Wrap parent in `ResizeObserver` and call `list.resize()` on changes |
| Zustand store with filters | Subscribing entire component to store causing re-renders on unrelated changes | Use selector: `const filters = useFilterStore(s => s.filters)` not `const { filters } = useFilterStore()` |
| APY data from API | Filtering on client after fetching all protocols | Push filters to API with query params. Only fetch visible protocols. |
| TanStack Query for protocol list | Refetching entire list on every filter change | Use initial data for filters, only refetch when protocol data actually changes. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| O(n²) filter complexity | Filter operations take >100ms with 30 protocols, >500ms with 100 protocols | Pre-index protocols by category, protocol, token. Use Map/Set for O(1) lookups. | 50+ protocols |
| Unoptimized sort in render | Sorting 30 protocols on every render takes 5-10ms | Sort once when sort config changes, memoize result. | 20+ protocols |
| Virtualized list without item key stability | React loses component state on re-order/filter, inputs lose focus | Use stable IDs (protocol addresses) not array indices as keys. | Any time list re-orders |
| Expensive formatting in render | Currency formatting, number padding called 1000x per render | Memoize formatters or use lightweight formatting. | 50+ items visible |
| Layout thrashing on view switch | Reading offsetHeight then writing style causes forced reflows | Batch DOM reads, then batch DOM writes. Use React's batching. | Any layout change |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting APY values from API | User sees inflated/incorrect yields, makes bad financial decisions | Validate APY ranges (0-95% is realistic, 1000%+ is suspicious). Show "Verified" badges for audited protocols. | Input validation on API responses |
| Exposing user's filter preferences in URL | Leak sensitive financial interests (user only farms on specific protocols) | Don't encode wallet-specific filters in URL. Only encode safe, shareable filters (category, APY range). | URL encoding design |
| Protocol links without noreferrer | Protocols can track referral traffic, privacy leak | Add `rel="noreferrer"` to all external protocol links. | External link attributes |
| Storing filter state in localStorage without sanitization | XSS if malicious code injected into filters | Sanitize/filter all user input before storage. Never eval() stored values. | Input sanitization |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during filter computation | User doesn't know if app is frozen or working | Show skeleton/inline loading during filter operations >100ms |
| Resetting scroll position on filter change | User loses place in list, has to scroll back down | Preserve scroll position or smart-scroll to top only on major filter changes |
| View mode doesn't persist | User has to re-select card view every session | Persist viewMode in localStorage/user preferences |
| Category filter shows "No results" without clear feedback | User thinks app is broken | Show "Clear filters" CTA and explain why no protocols match |
| APY range slider has unrealistic bounds | User can select 1000% APY range that returns nothing | Set max bound to 95th percentile of actual protocol APYs |
| Search has no minimum characters | Searching "a" returns everything, feels broken | Require 2-3 characters before triggering search filter |
| No "active filters" indicator | User forgets which filters are applied, can't find protocols | Show pill badges for active filters with X to dismiss |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Virtualization**: Often missing height measurement for variable-sized items — verify by resizing browser window and checking for item cutoff
- [ ] **Filter debouncing**: Often missing debouncing on text inputs — verify by typing quickly and watching render count in DevTools
- [ ] **View switch state**: Often loses scroll position on view toggle — verify scroll position is preserved
- [ ] **Range slider throttling**: Often re-renders on every pixel drag — verify by watching Profiler during slider drag
- [ ] **APY format validation**: Often missing validation that prevents NaN or Infinity — verify by testing with extreme APY values
- [ ] **Empty state handling**: Often missing "no results" UX for impossible filter combinations — verify by setting contradictory filters (APY 0-1% + category "High Yield")
- [ ] **Keyboard navigation**: Often missing arrow key navigation in virtualized list — verify by Tab into list and use arrow keys
- [ ] **Mobile responsiveness**: Often virtualization breaks on mobile due to height changes — verify on mobile viewport

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Premature memoization overhead | LOW | Remove useMemo/useCallback. Run Profiler. Re-add only where actual bottlenecks exist. |
| react-window height issues | MEDIUM | Replace `itemSize` with dynamic sizing or migrate to react-virtual. Test at multiple breakpoints. |
| State update loops | LOW | Refactor to derived state pattern. Remove redundant setState calls. Test with Profiler. |
| Missing debouncing | LOW | Add useDebouncedValue hook. Wire text input through it. Test typing performance. |
| View switch re-mount | MEDIUM | Refactor to single component with viewMode prop. Test scroll position preservation. |
| Range slider excessive renders | LOW | Add throttling or switch to slider with onValueCommit. Verify with Profiler during drag. |
| O(n²) filter complexity | HIGH | Pre-index protocols into Map/Set structure. Rewrite filter logic to use O(1) lookups. Full regression test required. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unstable function references | Phase 1 (Implementation) | Profiler shows only changed filter re-renders, not all inputs |
| react-window height issues | Phase 1 (Implementation) | Resize window at 3 breakpoints, verify no item cutoff |
| State update loops | Phase 1 (Implementation) | Profiler shows single commit per filter change |
| Missing debouncing | Phase 1 (Implementation) | Type quickly in search, verify <3 renders total |
| View switch re-mount | Phase 1 (Implementation) | Switch views, verify scroll position unchanged |
| Range slider excessive renders | Phase 1 (Implementation) | Drag slider, verify <10 renders/second in Profiler |
| O(n²) filter complexity | Phase 2 (Performance Optimization) | Measure filter operation time with 100 protocols, must be <16ms |
| Premature memoization overhead | Phase 2 (Performance Optimization) | Compare before/after memoization in Profiler, verify improvement |
| UX pitfalls (empty states, loading indicators) | Phase 1 (Implementation) | Manual QA: test all edge cases and verify helpful feedback |
| Input validation and security | Phase 1 (Implementation) | Test with extreme/malicious inputs, verify graceful handling |

## Sources

- [LogRocket - React performance optimization techniques](https://blog.logrocket.com/optimizing-performance-react-applications/) - Verified 2026-01-19
- [TkDodo Blog - React Query vs setState & useEffect](https://tkdodo.eu/blog/react-query-vs-setstate-and-useeffect) - Verified 2026-01-19
- [The Developer Way - Most React performance mistakes are not memoization](https://www.developerway.com/posts/most-react-performance-mistakes-are-not-memoization) - Verified 2026-01-19
- [TanStack Blog - React 19 and the future of memoization](https://tanstack.com/blog) - Verified 2026-01-19
- [LogRocket - react-window vs react-virtual comparison](https://blog.logrocket.com/complete-guide-react-window/) - Verified 2026-01-19
- [react-virtual documentation](https://github.com/TanStack/virtual) - Verified 2026-01-19
- [React Docs - Concurrent Features and Transitions](https://react.dev/blog/2022/03/29/react-v18#concurrent-features) - Verified 2026-01-19
- [Web Search results 2025-2026](https://www.google.com/search?q=react+filtering+performance+optimization+2025) - General ecosystem patterns

---

*Pitfalls research for: React Performance Optimization in DeFi Yield Section*
*Researched: 2026-01-19*
