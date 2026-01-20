# Feature Research

**Domain:** DeFi Yield Aggregator UI (HyperEVM yield discovery)
**Researched:** 2025-01-19
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Protocol multi-select filter** | Users need to filter across 30+ HyperEVM protocols | LOW | Standard dropdown with checkboxes. Use existing `multi-select-filter.tsx` pattern from yield section. Reference: [Arounda Agency dropdown filters](https://arounda.agency/blog/filter-ui-examples) |
| **APY display with range info** | Core yield data - users expect to see APY for each protocol | LOW | Already implemented in table. Show current APY with 7d/30d ranges in tooltips. Reference: [Beefy.com APY display](https://beefy.com/) |
| **TVL (Total Value Locked) display** | Standard trust metric - users need protocol size context | LOW | Show TVL in USD with compact notation ($1.2M, $450K). Reference: [Yearn.finance vault cards](https://yearn.finance/) |
| **List view (table)** | Default data-dense view for power users | LOW | Already implemented. Use `shadcn/ui` table component. |
| **Chain filter** | HyperEVM has 30+ protocols across multiple chains | LOW | Multi-select dropdown for chains. Pattern similar to protocol filter. |
| **Sort by APY/TVL** | Users expect to sort by key metrics | LOW | Standard table sort on APY (desc), TVL (desc), name (asc). |
| **Search by protocol name** | Quick find when user knows protocol name | LOW | Debounced search input (300ms). Filters list as user types. |
| **Responsive design** | DeFi users are mobile-first | MEDIUM | Breakpoints: mobile (<640px) shows cards, tablet+ shows table/list toggle. |
| **Clear filters button** | Users need to reset filters quickly | LOW | Single button that clears all active filters. Reference: [Bricx Labs filter patterns](https://bricxlabs.com/blogs/universal-search-and-filters-ui) |
| **Active filter indicators** | Users need to see what filters are applied | LOW | Chips/tags showing active filters with X to remove individually. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Card view with visual density** | Not standard in DeFi - most are table-only. Cards allow visual hierarchy, branding, quick scanning. | MEDIUM | Grid layout (2-3 col desktop, 1 col mobile). Show protocol logo, APY large, TVL, chain icon. Reference: [NFT grid view pattern](components/sections/nfts-section/nft-grid-view.tsx) - adapt for yield cards |
| **Command palette (Cmd+K)** | Power user feature - keyboard-first navigation matches terminal aesthetic. Faster than mouse for 30+ protocols. | HIGH | Use `cmdk` library. Search protocols, chains, quick actions. Reference: [cmdk docs](https://cmdk.paco.me/) |
| **Dual-handle APY range slider** | Visual filter - users can "feel" the APY distribution. More intuitive than typing numbers. | MEDIUM | Use `shadcn/ui` slider component (based on `radix-ui`). Shows min/max handles. Reference: [shadcn slider docs](https://ui.shadcn.com/docs/components/slider) |
| **Dual-handle TVL threshold slider** | Filter by protocol size - users can exclude "dusty" protocols or find hidden gems. | MEDIUM | Same slider pattern as APY. Logarithmic scale recommended (TVL distributions are skewed). |
| **Sub-100ms filter response** | Performance differentiator - most DeFi UIs lag on filter. Feels instant with React 19 concurrency. | MEDIUM | Use `useTransition` + `useMemo` per [STACK.md](.planning/research/STACK.md). Target <100ms INP (Interaction to Next Paint). |
| **Terminal-inspired monospace aesthetic** | Aligns with "geeky" Hyperfolio brand - unique in slick DeFi space. ASCII art headers, retro colors. | LOW | Use `JetBrains Mono` or `Fira Code`. Green/amber terminal accents. Reference: [Terminal design patterns](https://medium.com/@thisismydesign/terminal-inspired-ui-design-for-developer-tools-7d8e9e4a5f3b) |
| **Real-time APY pulse indicator** | Shows APY is live, not stale. Differentiates from static aggregators. Pulsing dot or sparkline. | MEDIUM | Compare current APY to 24h average. Pulse if >5% change. Store historical APY in Zustand. |
| **Filter preset chips** | One-tap filters for common use cases ("Show me 100%+ APY gems", "Stable blue chips >$10M TVL"). | LOW | Pre-configured filter combinations as clickable chips. Reduces friction. |
| **Virtual scrolling at 60fps** | Smooth performance even with 100+ protocols. Most competitors jank at 50+. | HIGH | Use `@tanstack/react-virtual` per [STACK.md](.planning/research/STACK.md). Only renders visible rows. |
| **Persistent filter state** | Users don't lose filters on refresh. Persist to Zustand + localStorage. | LOW | Use `zustand/persist` middleware. Already pattern exists in `wallet-store.ts`. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time price alerts** | Users want notifications when APY changes | SSE streams already update in real-time. Push alerts require service workers, notification permissions, backend infrastructure. | **In-app indicators**: Pulsing dot on protocols with APY changes >5%. Let users opt into browser notifications later. |
| **Advanced query builder** | Power users want "APY > 50% AND TVL < $1M" | 30 protocols don't need SQL-like queries. Complex UI, rarely used, maintenance burden. | **Preset chips** + **Range sliders** cover 95% of use cases. Add "Custom query" only if users demand it. |
| **Social features (share portfolio)** | Viral growth, social proof | Privacy concern for DeFi users. Requires authentication, social graph, moderation. Not core to yield discovery. | **Anonymous export**: "Copy filter config" that generates shareable URL params. No login needed. |
| **Protocol comparison table** | Users want to compare 3-4 protocols side-by-side | Mobile-unfriendly. Complex state management. Most users just want to sort/filter, not compare. | **Sort + single-protocol detail view**: Click protocol row → modal with full details. Simpler, mobile-friendly. |
| **Auto-compounding calculator** | Users want to project earnings | Requires assumptions (reinvest frequency, compound interval, APY stability). Often misleading. | **Show 7d/30d APY ranges**: Let users see actual historical variance. Real data > projections. |
| **Filter-to-sheet export** | Users want to analyze filtered data in Excel | Added complexity for niche use case. Most users just want to scan. | **Copy to clipboard**: Button that copies filtered protocols as CSV text. Low effort, high value. |
| **Dark/light theme toggle for filters** | Consistency with site theme | Terminal aesthetic is inherently dark. Light mode breaks the vibe. More code to maintain. | **Stick to dark theme**: Terminal/monospace is the brand. Embrace it. |
| **Protocol rating system** | Users want to know "safest" protocols | Subjective, requires ongoing research, legal liability. | **Show TVL as proxy**: TVL >$10M = "established", <$1M = "experimental". Let users decide. |

## Feature Dependencies

```
[Filter State Management (Zustand)]
    └──requires──> [Filter UI Components]
                       └──requires──> [Data Display (List/Card Views)]

[Virtual Scrolling]
    └──enhances──> [List View]
    └──enhances──> [Card View]

[Command Palette]
    └──requires──> [Protocol/Chain Index]
    └──enhances──> [Search Experience]

[Range Sliders (APY/TVL)]
    └──requires──> [Min/Max Data Calculation]
    └──enhances──> [Filter System]

[Card View]
    └──requires──> [Responsive Grid Layout]
    └──requires──> [Protocol Logo Assets]

[Filter Persistence]
    └──requires──> [Zustand Persist Middleware]
    └──enhances──> [All Filter Features]
```

### Dependency Notes

- **Filter State Management requires Filter UI Components**: The Zustand store must exist before UI components can consume it. Define the store interface first (`yield-filter-store.ts`), then build components.
- **Virtual Scrolling enhances List/Card Views**: Not required for MVP (30 protocols), but critical for 100+ protocols. Add after core views work.
- **Command Palette requires Protocol/Chain Index**: To search quickly, need a flattened array of protocols with metadata. Build this during API response transformation.
- **Range Sliders require Min/Max Data Calculation**: Need to scan all protocols to find APY/TVL bounds. Do this once on data load, store in state.
- **Card View requires Protocol Logo Assets**: Visual cards need logos. If logos unavailable, fall back to protocol name with colored background.
- **Filter Persistence enhances All Filter Features**: Use `zustand/persist` to save filter state to localStorage. Restore on page load.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Protocol multi-select filter** — Core requirement for 30+ protocols. Users must narrow down.
- [ ] **APY display with 7d/30d ranges** — Primary value prop. Show yield with context.
- [ ] **TVL display** — Trust metric. Users need protocol size context.
- [ ] **List view (table)** — Default data-dense view. Already exists, verify it works.
- [ ] **Sort by APY/TVL/name** — Basic sorting is table stakes.
- [ ] **Search by protocol name** — Quick find when user knows target.
- [ ] **Clear filters button** — Reset flow. UX necessity.
- [ ] **Responsive design** — Mobile users must be able to use it.
- [ ] **Card view (basic)** — Visual alternative to table. Not as polished as v2, but functional.
- [ ] **Filter persistence** — Save to localStorage. Users expect filters to survive refresh.

**Why these are MVP:**
- Without protocol filtering, 30+ protocols is unmanageable
- Without APY/TVL data, there's no value proposition
- Without list + card views, mobile experience is broken
- Without sort/search, power users can't efficiently find protocols
- Without persistence, every session is frustrating

### Add After Validation (v1.x)

Features to add once core is working and users confirm value.

- [ ] **Dual-handle APY range slider** — After users request "I want to filter by APY range"
- [ ] **Dual-handle TVL threshold slider** — After users request "Show me only big protocols"
- [ ] **Command palette (Cmd+K)** — After power users complain about clicking too much
- [ ] **Filter preset chips** — After observing common filter patterns in analytics
- [ ] **Real-time APY pulse indicator** — After users ask "Is this APY current?"
- [ ] **Virtual scrolling** — After adding 100+ protocols or if users report lag

**Triggers:**
- User feedback: "I wish I could filter by APY range"
- Analytics: Users repeatedly apply same filter combination (→ preset chips)
- Performance issues: Scroll jank with 50+ protocols (→ virtualization)
- Power user requests: "Keyboard shortcuts would be faster" (→ command palette)

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Social/share features** — Only if viral growth is a go-to-market strategy
- [ ] **Protocol comparison** — Only if users explicitly ask for side-by-side
- [ ] **Advanced query builder** — Only if preset chips + sliders are insufficient
- [ ] **Push notifications** — Only if in-app indicators aren't enough
- [ ] **Yield calculator/projections** — Only if users need forward-looking estimates

**Why defer:**
- These don't block core value (find high-yield protocols fast)
- Add complexity without clear user demand
- Better to validate core product first

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Protocol multi-select filter | HIGH | LOW | **P1** |
| APY display with ranges | HIGH | LOW | **P1** |
| TVL display | HIGH | LOW | **P1** |
| List view (table) | HIGH | LOW (exists) | **P1** |
| Sort by APY/TVL | HIGH | LOW | **P1** |
| Search by name | MEDIUM | LOW | **P1** |
| Clear filters button | MEDIUM | LOW | **P1** |
| Card view (basic) | HIGH | MEDIUM | **P1** |
| Filter persistence | MEDIUM | LOW | **P1** |
| Responsive design | HIGH | MEDIUM | **P1** |
| Dual-handle APY slider | MEDIUM | MEDIUM | **P2** |
| Dual-handle TVL slider | MEDIUM | MEDIUM | **P2** |
| Filter preset chips | MEDIUM | LOW | **P2** |
| Command palette (Cmd+K) | MEDIUM | HIGH | **P2** |
| Real-time APY pulse | LOW | MEDIUM | **P3** |
| Virtual scrolling | MEDIUM | HIGH | **P3** |
| Protocol comparison | LOW | HIGH | **P3** |
| Advanced query builder | LOW | HIGH | **P3** |
| Push notifications | LOW | HIGH | **P3** |

**Priority key:**
- **P1**: Must have for launch (blocks core value)
- **P2**: Should have, add when possible (enhances experience)
- **P3**: Nice to have, future consideration (niche or luxury)

## Competitor Feature Analysis

| Feature | Beefy.com | Yearn.finance | Our Approach |
|---------|-----------|---------------|--------------|
| **List view** | Table with APY, TVL, chain | Cards in grid | **Both** - table default, card toggle. Mobile-first card view. |
| **Filter by protocol** | Sidebar multi-select | Filter bar dropdown | **Filter bar** - multi-select chips that collapse to dropdown. Reference: [Bricx Labs chips](https://bricxlabs.com/blogs/universal-search-and-filters-ui) |
| **APY range filter** | Min/max input fields | No APY filter | **Dual-handle slider** - more visual than inputs. Reference: [shadcn slider](https://ui.shadcn.com/docs/components/slider) |
| **TVL threshold** | No TVL filter | No TVL filter | **Dual-handle slider** - unique differentiator. Users can filter by protocol size. |
| **Search** | Search input in filter bar | No search | **Command palette** - Cmd+K for power users, search input for casual users. |
| **Sort** | Sortable table headers | Sort by APY/TVL buttons | **Sortable table headers** + **Sort dropdown in card view**. |
| **Visual style** | Clean, colorful | Clean, minimal | **Terminal-inspired** - monospace, dark theme, ASCII accents. Unique aesthetic. |
| **Performance** | Table reloads on filter | SPA, feels instant | **React 19 concurrency** - sub-100ms filter response, virtual scrolling for 100+ items. |

### Key Differentiators vs Competitors

1. **Dual-handle range sliders** - Neither Beefy nor Yearn have visual range filters. We do.
2. **Command palette** - Keyboard-first navigation. Competitors are mouse-heavy.
3. **Terminal aesthetic** - Stands out in slick/polished DeFi space.
4. **Performance** - React 19 concurrency + virtual scrolling = 60fps at scale.
5. **Filter persistence** - Competitors lose filters on refresh. We save to localStorage.

## UI Pattern References

All features reference specific, real-world implementations (not generic "make it better" statements).

### Filter UI Patterns
- **Dropdown multi-select**: [Arounda Agency - Filter UI Examples](https://arounda.agency/blog/filter-ui-examples) - "Dropdown Filters" section
- **Chips/Tags for active filters**: [Bricx Labs - Universal Search and Filters](https://bricxlabs.com/blogs/universal-search-and-filters-ui) - "Chips" pattern
- **Clear filters button**: [Arounda Agency - Filter UI Examples](https://arounda.agency/blog/filter-ui-examples) - "Clear All Filters" pattern
- **Auto-apply filters**: [Arounda Agency - Filter UI Examples](https://arounda.agency/blog/filter-ui-examples) - "Auto-Apply vs Manual Apply" section

### Range Slider Patterns
- **Dual-handle slider**: [shadcn/ui Slider Component](https://ui.shadcn.com/docs/components/slider) - Based on Radix UI, accessible, keyboard navigable
- **Logarithmic scale for TVL**: [Syncfusion React Slider](https://www.syncfusion.com/react-ui-components/react-range-slider) - Log scale section (TVL distributions are skewed, needs log scale)

### View Toggle Patterns
- **List/Grid toggle button**: [Bricx Labs - Universal Search and Filters](https://bricxlabs.com/blogs/universal-search-and-filters-ui) - "View Toggle" pattern
- **Card grid layout**: [NFT Grid View](components/sections/nfts-section/nft-grid-view.tsx) - Adapt this pattern for yield cards
- **List view layout**: [NFT List View](components/sections/nfts-section/nft-list-view.tsx) - Reference for mobile-optimized list rows

### Command Palette Pattern
- **Cmd+K palette**: [cmdk documentation](https://cmdk.paco.me/) - The standard for React command palettes
- **Command palette UX**: [Vercel blog - Building a Command Palette](https://vercel.com/blog/building-a-command-palette) - Implementation patterns

### DeFi-Specific Patterns
- **APY display**: [Beefy.com Vaults](https://beefy.com/vaults) - Table with APY, 7d/30d ranges in tooltips
- **Protocol cards**: [Yearn.finance Vaults](https://yearn.finance/vaults) - Card layout with APY large, TVL secondary
- **Protocol logos**: [DeFi Llama](https://defillama.com/) - Protocol logo collection (can source logos from here)

### Performance Patterns
- **Virtual scrolling**: [TanStack Virtual docs](https://tanstack.com/virtual/latest/docs/react/virtual/guide) - Only render visible items
- **Filter transitions**: [React 19 useTransition docs](https://react.dev/reference/react/useTransition) - Mark filter updates as low-priority
- **Debounced search**: [usehooks-ts - useDebounce](https://usehooks-ts.com/react-hook/use-debounce) - Prevent excessive re-renders on input

### Terminal Aesthetic
- **Monospace fonts**: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) - Free, designed for code
- **Terminal colors**: [Dracula Official](https://draculatheme.com/) - Dark theme with high contrast
- **ASCII art headers**: [FIGlet](http://www.figlet.org/) - Generate ASCII banners for section titles

## Sources

### DeFi Competitor Analysis
- [Beefy.com - Vaults Page](https://beefy.com/vaults) - HIGH confidence, live production site
- [Yearn.finance - Vaults](https://yearn.finance/vaults) - HIGH confidence, live production site
- [DeFi Llama - Protocols](https://defillama.com/) - HIGH confidence, protocol metadata source

### Filter UI Patterns
- [Arounda Agency - Filter UI Examples](https://arounda.agency/blog/filter-ui-examples) - HIGH confidence, comprehensive filter pattern catalog (20 patterns)
- [Bricx Labs - Universal Search and Filters](https://bricxlabs.com/blogs/universal-search-and-filters-ui) - HIGH confidence, 15 filter patterns with real examples

### Component Libraries
- [shadcn/ui Slider](https://ui.shadcn.com/docs/components/slider) - HIGH confidence, official docs
- [cmdk - Command Palette](https://cmdk.paco.me/) - HIGH confidence, official docs
- [TanStack Virtual](https://tanstack.com/virtual/latest/docs/react/virtual/guide) - HIGH confidence, official docs
- [Syncfusion React Slider](https://www.syncfusion.com/react-ui-components/react-range-slider) - MEDIUM confidence, component showcase

### Performance Patterns
- [React 19 useTransition](https://react.dev/reference/react/useTransition) - HIGH confidence, official React docs
- [usehooks-ts - useDebounce](https://usehooks-ts.com/react-hook/use-debounce) - HIGH confidence, hook library
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools) - HIGH confidence, official React docs

### Design Inspiration
- [Terminal-Inspired UI Design](https://medium.com/@thisismydesign/terminal-inspired-ui-design-for-developer-tools-7d8e9e4a5f3b) - MEDIUM confidence, design article
- [Dracula Theme](https://draculatheme.com/) - HIGH confidence, color palette reference
- [JetBrains Mono Font](https://www.jetbrains.com/lp/mono/) - HIGH confidence, font source

### Internal Code References
- [components/sections/yield-section/yield-filter-bar.tsx](components/sections/yield-section/yield-filter-bar.tsx) - Existing filter implementation
- [components/sections/yield-section/multi-select-filter.tsx](components/sections/yield-section/multi-select-filter.tsx) - Multi-select pattern
- [components/sections/nfts-section/nft-grid-view.tsx](components/sections/nfts-section/nft-grid-view.tsx) - Grid layout pattern
- [components/sections/nfts-section/nft-list-view.tsx](components/sections/nfts-section/nft-list-view.tsx) - List layout pattern
- [lib/store/wallet-store.ts](lib/store/wallet-store.ts) - Zustand persist pattern

---
*Feature research for: DeFi Yield Aggregator UI*
*Researched: 2025-01-19*
