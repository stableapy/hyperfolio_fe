# Phase 2: Card View Implementation - Research

**Researched:** 2025-01-19
**Domain:** React state management, UI component architecture, responsive grid layouts
**Confidence:** HIGH

## Summary

This phase involves implementing a card view for the yield section that allows users to switch between list and card display modes. The NFT section already has a working implementation of this pattern that can be adapted for the yield section.

**Primary recommendations:**
1. Use the NFT section's view switching pattern as a template (conditional rendering based on state)
2. Add view mode state to the wallet store with persist middleware for cross-refresh persistence
3. Create a new `YieldCardGrid` component with responsive grid layout (2-3 cols desktop, 1 col mobile)
4. Add view toggle button to the filter bar using lucide-react's `List` and `Grid3x3` icons
5. Ensure card view maintains the terminal-inspired minimalistic-geeky aesthetic

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | Component state for view mode | Already in use, proven pattern from NFT section |
| Zustand | 5.0.2 | Global state with persist middleware | Already configured in wallet-store.ts |
| Tailwind CSS | 4.1.9 | Responsive grid layouts | Already in use throughout project |
| lucide-react | 0.454.0 | View toggle icons (List, Grid3x3) | Already used in NFT section |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-window | 2.2.5 | Virtualization for performance | Already used in list view, may not need for card view |

**Installation:**
No new dependencies needed - all required libraries are already installed.

## Architecture Patterns

### Recommended Project Structure
```
components/sections/yield-section/
├── yield-section.tsx           # Main component (add view mode state)
├── yield-card-grid.tsx         # NEW: Card grid layout component
├── yield-grid-card.tsx         # NEW: Individual card component
├── yield-grid-skeleton.tsx     # NEW: Loading skeleton for grid
├── yield-filter-bar.tsx        # MODIFIED: Add view toggle button
├── virtualized-yield-list.tsx  # Existing: List view (rename from VirtualizedYieldList)
├── yield-card.tsx              # Existing: List item component
└── types.ts                    # MODIFIED: Add ViewMode type
```

### Pattern 1: View Mode State Management (from NFT Section)

**What:** Local component state with optional store persistence for cross-refresh persistence

**When to use:** When you need view preference to persist across page refreshes

**Example from NFT section:**
```typescript
// components/sections/nfts-section/nfts-section.tsx
import { useState } from 'react';
import type { ViewMode } from './types';

export function NFTsSection({ isLoading = false }: NFTsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  // ... rest of component
}
```

**For yield section with persistence:**
```typescript
// Option 1: Local state (no persistence)
const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

// Option 2: Store state with persistence (recommended)
const viewMode = useWalletStore(state => state.yieldViewMode);
const setViewMode = useWalletStore(state => state.setYieldViewMode);
```

### Pattern 2: View Toggle Button (from NFT Section)

**What:** Terminal-style toggle button group using lucide-react icons

**When to use:** In filter bar to switch between views

**Example:**
```typescript
// Source: components/sections/nfts-section/nft-search-controls.tsx
import { Grid3x3, List } from 'lucide-react';

<div className="flex bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
  <button
    type="button"
    onClick={() => onViewModeChange("grid")}
    className={`px-2.5 py-2 transition-all duration-150 border-r border-theme-border/50 ${
      viewMode === "grid"
        ? "bg-theme-purple/10 text-theme-purple"
        : "text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50"
    }`}
  >
    <Grid3x3 className="w-4 h-4" />
  </button>
  <button
    type="button"
    onClick={() => onViewModeChange("list")}
    className={`px-2.5 py-2 transition-all duration-150 ${
      viewMode === "list"
        ? "bg-theme-purple/10 text-theme-purple"
        : "text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50"
    }`}
  >
    <List className="w-4 h-4" />
  </button>
</div>
```

### Pattern 3: Responsive Grid Layout (from NFT Section)

**What:** Tailwind CSS responsive grid with breakpoint-based column changes

**When to use:** For card view layout

**Example:**
```typescript
// Source: components/sections/nfts-section/nft-grid-view.tsx
<div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
  {nfts.map((nft) => (
    <NFTGridCard key={nft.id} nft={nft} privacyMode={privacyMode} />
  ))}
</div>
```

**For yield section (2-3 col desktop, 1 col mobile):**
```typescript
// Recommended: 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {opportunities.map((opp) => (
    <YieldGridCard key={opp.id} opportunity={opp} />
  ))}
</div>
```

### Pattern 4: Card Component Design (from NFT Section)

**What:** TerminalCard wrapper with hover effects and structured layout

**When to use:** For individual yield opportunity cards in grid view

**Example:**
```typescript
// Source: components/sections/nfts-section/nft-grid-card.tsx
import { TerminalCard } from '@/components/ui/terminal-card';

export function NFTGridCard({ nft, privacyMode = false }: NFTGridCardProps) {
  return (
    <TerminalCard className="group hover:border-theme-accent transition-all">
      <div className="aspect-square relative">
        {/* Image/content */}
      </div>
      <div className="p-2 sm:p-3">
        {/* Card details */}
      </div>
    </TerminalCard>
  );
}
```

### Anti-Patterns to Avoid

- **Conditional rendering in same component:** Don't use CSS display toggling - use separate view components for better separation of concerns
- **Re-mounting on view change:** Ensure view state change doesn't cause full component tree re-mount
- **Breaking filter integration:** Card view must work with all existing filters (category, protocol, token, search)
- **Losing virtualization:** List view should continue using react-window for performance

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| View toggle button group | Custom HTML/CSS | NFT section pattern | Already matches terminal aesthetic |
| Responsive grid | Custom grid system | Tailwind grid classes | Proven, responsive, matches breakpoints |
| State persistence | localStorage directly | Zustand persist middleware | Already configured, handles serialization |
| View icons | Custom SVG icons | lucide-react (List, Grid3x3) | Already installed, consistent size/stroke |

**Key insight:** The NFT section has already solved this problem. Adapting their pattern is faster and more consistent than building from scratch.

## Common Pitfalls

### Pitfall 1: Re-mounting components on view change

**What goes wrong:** Switching views causes all components to unmount and remount, losing scroll position and causing flicker

**Why it happens:** Using conditional rendering that destroys and recreates the component tree

**How to avoid:** Use stable keys and ensure view mode is a simple conditional render, not a component replacement

**Warning signs:** Flickering on view switch, scroll position reset, console logs showing component mount/unmount

### Pitfall 2: Breaking filter integration

**What goes wrong:** Card view shows unfiltered data or doesn't update when filters change

**Why it happens:** Creating separate data fetching logic for card view instead of using filtered opportunities from parent

**How to avoid:** Pass filtered opportunities from `useYieldData` hook to both list and card views

**Warning signs:** Card count doesn't match filter bar count, filters don't affect card view

### Pitfall 3: Inconsistent styling

**What goes wrong:** Card view doesn't match terminal aesthetic or looks out of place

**Why it happens:** Not using existing TerminalCard component or theme CSS variables

**How to avoid:** Always use TerminalCard wrapper and theme color variables from globals.css

**Warning signs:** Cards don't hover properly, colors don't match other sections

### Pitfall 4: Performance degradation

**What goes wrong:** Card view renders slowly with large datasets (5000+ items)

**Why it happens:** Not using virtualization or memoization for card grid

**How to avoid:** Consider react-window's VariableSizeGrid for card view, or use React.memo for individual cards

**Warning signs:** UI freezes when switching to card view with many items

## Code Examples

### Adding View Mode to Wallet Store

```typescript
// lib/store/wallet-store.ts

interface WalletState {
  // ... existing properties

  // NEW: Yield section view mode
  yieldViewMode: 'list' | 'card';

  // NEW: Action to set yield view mode
  setYieldViewMode: (mode: 'list' | 'card') => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // ... existing state
      yieldViewMode: 'list',

      setYieldViewMode: (mode) => {
        set({ yieldViewMode: mode });
      },
    }),
    {
      name: 'hyperfolio-wallets',
      partialize: (state) => ({
        wallets: state.wallets,
        selectedWalletId: state.selectedWalletId,
        privacyMode: state.privacyMode,
        yieldViewMode: state.yieldViewMode, // Add to persisted state
      }),
    }
  )
);
```

### Modified Yield Section with View Switching

```typescript
// components/sections/yield-section/yield-section.tsx
import { YieldCardList } from './yield-card-list'; // Renamed from VirtualizedYieldList
import { YieldCardGrid } from './yield-card-grid';

export function YieldSection({ isLoading = false }: YieldSectionProps) {
  const viewMode = useWalletStore((state) => state.yieldViewMode);
  const setViewMode = useWalletStore((state) => state.setYieldViewMode);

  // ... existing filter and data logic

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <YieldStats {...statsProps} />
        <YieldFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          viewMode={viewMode} // NEW
          onViewModeChange={setViewMode} // NEW
          availableProtocols={filterOptions.protocols}
          availableTokens={filterOptions.tokens}
          disabled={showLoading}
        />

        <TerminalCard showHeader title="yield --list">
          {viewMode === 'list' ? (
            <YieldCardList opportunities={opportunities} />
          ) : (
            <YieldCardGrid opportunities={opportunities} />
          )}
        </TerminalCard>
      </div>
    </div>
  );
}
```

### Grid Card Component

```typescript
// components/sections/yield-section/yield-grid-card.tsx
import { TerminalCard } from '@/components/ui/terminal-card';
import { TrendingUp } from 'lucide-react';
import { ProtocolLogo } from './protocol-logo';
import type { YieldDisplayItem } from './types';

export function YieldGridCard({ opportunity }: { opportunity: YieldDisplayItem }) {
  const apyValue = opportunity.apy.totalApy ?? opportunity.apy.baseApy ?? 0;
  const tvl = opportunity.pool.tvlUsd || opportunity.pool.liquidityUsd;

  return (
    <TerminalCard className="group hover:border-theme-accent transition-all">
      <div className="p-4">
        {/* Header: Protocol + Logo */}
        <div className="flex items-center gap-3 mb-4">
          <ProtocolLogo
            src={opportunity.protocol.name}
            name={opportunity.protocol.name}
            className="h-10 w-10"
          />
          <div className="flex-1 min-w-0">
            <div className="text-theme-accent font-mono text-sm font-bold truncate">
              {opportunity.metadata.underlyingSymbol || opportunity.pool.symbol}
            </div>
            <div className="text-theme-text-muted font-mono text-xs truncate">
              {opportunity.protocol.name}
            </div>
          </div>
        </div>

        {/* APY Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-theme-accent h-4 w-4" />
            <span className="text-theme-text-muted font-mono text-xs uppercase">
              APY
            </span>
          </div>
          <span className="text-theme-accent font-mono text-lg font-bold tabular-nums">
            {apyValue.toFixed(2)}%
          </span>
        </div>

        {/* TVL Badge */}
        {tvl && (
          <div className="mt-3 pt-3 border-t border-theme-border/50">
            <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-2 py-1 font-mono text-[10px]">
              TVL ${formatTvl(tvl)}
            </span>
          </div>
        )}
      </div>
    </TerminalCard>
  );
}
```

### Grid Layout Component

```typescript
// components/sections/yield-section/yield-card-grid.tsx
import { YieldGridCard } from './yield-grid-card';
import type { YieldDisplayItem } from './types';

export function YieldCardGrid({ opportunities }: { opportunities: YieldDisplayItem[] }) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-theme-text-secondary font-mono text-sm">
          NO YIELD OPPORTUNITIES
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opp) => (
        <YieldGridCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS display toggling | Conditional component rendering | React 18+ | Better separation of concerns |
| Local state only | Zustand persist middleware | Phase 2 | View preference persists across refreshes |
| Fixed layouts | Responsive grid with breakpoints | Tailwind 3+ | Mobile-first responsive design |

**Deprecated/outdated:**
- CSS display: none/block toggling (causes layout thrashing)
- localStorage directly (use Zustand persist for consistency)
- Fixed pixel widths (use Tailwind responsive utilities)

## Open Questions

None - all aspects of this feature have proven patterns in the existing codebase (NFT section).

## Sources

### Primary (HIGH confidence)
- [components/sections/nfts-section/nfts-section.tsx](components/sections/nfts-section/nfts-section.tsx) - View mode state pattern
- [components/sections/nfts-section/nft-search-controls.tsx](components/sections/nfts-section/nft-search-controls.tsx) - View toggle button pattern
- [components/sections/nfts-section/nft-grid-view.tsx](components/sections/nfts-section/nft-grid-view.tsx) - Responsive grid layout
- [components/sections/nfts-section/nft-grid-card.tsx](components/sections/nfts-section/nft-grid-card.tsx) - Card component design
- [lib/store/wallet-store.ts](lib/store/wallet-store.ts) - Zustand persist configuration
- [app/globals.css](app/globals.css) - Theme CSS variables
- [components/sections/yield-section/yield-section.tsx](components/sections/yield-section/yield-section.tsx) - Current yield section structure
- [components/sections/yield-section/yield-card.tsx](components/sections/yield-section/yield-card.tsx) - Current list item component

### Secondary (MEDIUM confidence)
- [package.json](package.json) - Dependency versions verification
- NFT section implementation (working reference for same feature pattern)

### Tertiary (LOW confidence)
- None - all findings from direct code inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies verified in package.json
- Architecture: HIGH - Direct code inspection of working NFT section implementation
- Pitfalls: HIGH - Based on common React patterns and project-specific issues

**Research date:** 2025-01-19
**Valid until:** 60 days (stable feature patterns, no major dependencies changing)
