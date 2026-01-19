# Yield Section Optimization

## What This Is

A performance and UX improvement for the existing yield section in Hyperfolio Frontend. The yield section displays yield opportunities across 30+ DeFi protocols on HyperEVM, currently implemented as a table-based view with filtering capabilities. The optimization will fix performance issues (lag, freeze) and enhance the UI with card view, better filters, and improved UX while maintaining the minimalistic-geeky aesthetic.

## Core Value

Users can quickly find and compare yield opportunities across 30+ HyperEVM protocols with smooth, responsive filtering and view switching.

## Requirements

### Validated

- ✓ Multi-wallet aggregation with SSE streaming — existing
- ✓ Yield data fetching from `/api/yield/all` endpoint — existing
- ✓ Table view with protocol, APY, TVL, and token information — existing
- ✓ Filter by categories, protocols, and tokens — existing
- ✓ Virtualized list rendering with react-window — existing
- ✓ Minimalistic-geeky UI with dark theme — existing
- ✓ Responsive design with mobile support — existing
- ✓ TypeScript strict mode with type safety — existing
- ✓ Zustand state management with persistence — existing
- ✓ Tailwind CSS styling with CSS variables — existing

### Active

- [ ] Fix performance issues (lag on first load, freeze on filter selection)
- [ ] Optimize data handling and re-renders for 60fps performance
- [ ] Add card view as alternative to table view with view toggle
- [ ] Improve filter UX (autocomplete, better multi-select, smoother feel)
- [ ] Redesign filter layout for better visual hierarchy
- [ ] Add APY range filter (min/max sliders)
- [ ] Add TVL threshold filter (min TVL slider)
- [ ] Ensure filter changes complete under 100ms
- [ ] Maintain minimalistic-geeky aesthetic

### Out of Scope

- Protocol search (deferred - may add if performance allows)
- Mobile-specific filter UI (mobile filters work but not optimized)
- Yield historical data/charts (different feature)
- Yield position tracking (user's existing positions vs available yields)
- Multi-chain support (HyperEVM only)

## Context

**Current Implementation:**
- Yield section located in `components/sections/yield-section/`
- Data fetched from `/api/yield/all` endpoint (30+ protocols)
- Uses react-window for virtualized list rendering
- Filter components: categories, protocols, token multi-selects
- Table view with columns: Protocol, APY, TVL, Chain, Category

**Performance Issues Identified:**
- Lag on first load (likely unoptimized data fetching/parsing)
- Freeze on filter selection (inefficient re-renders, missing memoization)
- Possible issues:
  - Not memoizing filtered data
  - Re-rendering entire list on filter change
  - Expensive computations in render path
  - Missing React.memo on components
  - Filter state updates causing cascading re-renders

**Design Philosophy:**
- Minimalistic-geeky aesthetic (terminal-inspired, monospace fonts)
- Dark theme with CSS variable-based theming
- Card view should be "between rich and simple" - not as sparse as table rows, not as dense as rich cards with charts
- Clean lines, technical feel, data-focused

## Constraints

- **Tech Stack**: Next.js 16, React 19, TypeScript 5.7+, Tailwind CSS 4.x, Zustand 5.x — must align with existing codebase
- **Performance**: Target 60fps, filter changes under 100ms — measurable requirements
- **Virtualization**: Must continue using react-window for list performance (30+ items)
- **API**: Existing `/api/yield/all` endpoint, backend cannot be modified
- **Chain**: HyperEVM only (chain ID 999), no multi-chain support
- **Design**: Must maintain minimalistic-geeky aesthetic, consistent with rest of app
- **Browser Compatibility**: Modern browsers with ES6 support (same as existing)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Performance first, then UI | Lag makes feature unusable; pretty UI doesn't matter if it freezes | — Pending |
| Add card view alongside table (not replace) | Users may prefer different views for different use cases; preserve existing functionality | — Pending |
| APY range and TVL threshold filters | Users want to filter by yield and TVL to find best opportunities; requested explicitly | — Pending |
| Improve filter UX with autocomplete | Better multi-select experience than current implementation; reduces clicks | — Pending |
| Keep minimalistic-geeky aesthetic | Consistency with rest of app; user preference | — Pending |

---
*Last updated: 2025-01-19 after initialization*
