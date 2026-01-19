'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { SwapWidgetInline } from '@/components/swap-widget';
import { useWalletStore } from '@/lib/store/wallet-store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { YieldStats } from './yield-stats';
import { YieldFilterBar } from './yield-filter-bar';
import { YieldListSkeleton } from './yield-list-skeleton';
import { VirtualizedYieldList } from './virtualized-yield-list';
import { YieldCardGrid } from './yield-card-grid';
import { useYieldData } from './hooks/use-yield-data';
import type { YieldSectionProps, YieldFilters } from './types';

/**
 * Main YieldSection component
 * Displays yield opportunities across Hyperliquid protocols
 * with filtering, sorting, and statistics
 */
export function YieldSection({ isLoading = false }: YieldSectionProps) {
  // Combined filter state
  const [filters, setFilters] = useState<YieldFilters>({
    selectedCategories: [],
    selectedProtocols: [],
    selectedTokens: [],
    stablecoinOnly: false,
    hypeOnly: false,
    searchQuery: '',
    sortOrder: 'desc',
  });

  // State for pre-filling swap widget (for future swap click functionality)
  const [selectedSwapToken, setSelectedSwapToken] = useState<
    { address: string; symbol: string; chainId: number } | undefined
  >(undefined);

  const [, startTransition] = useTransition();

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (updates: Partial<YieldFilters>) => {
      startTransition(() => {
        setFilters((prev) => ({ ...prev, ...updates }));
      });
    },
    [startTransition]
  );

  // Get privacy mode from wallet store
  const privacyMode = useWalletStore((state) => state.privacyMode);

  // Get view mode from wallet store for persistence
  const viewMode = useWalletStore((state) => state.yieldViewMode);
  const setViewMode = useWalletStore((state) => state.setYieldViewMode);

  // Fetch and process data
  const {
    opportunities,
    filterOptions,
    isLoading: isDataLoading,
    error,
    hasData,
    stats,
  } = useYieldData(filters);

  // Show loading state until data is ready
  const showLoading = (isLoading || isDataLoading) && !hasData;

  const hasActiveFilters = useMemo(
    () =>
      filters.selectedCategories.length > 0 ||
      filters.selectedProtocols.length > 0 ||
      filters.selectedTokens.length > 0 ||
      filters.stablecoinOnly ||
      filters.hypeOnly ||
      filters.searchQuery.trim() !== '',
    [filters]
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Left: Yield Content */}
      <div className="min-w-0 flex-1 space-y-4 pb-20 sm:space-y-4 lg:pb-0">
        {/* Stats Grid */}
        <YieldStats
          stats={stats}
          isLoading={showLoading}
          hasData={hasData}
          privacyMode={privacyMode}
        />

        {/* Filter Bar */}
        <YieldFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableProtocols={filterOptions.protocols}
          availableTokens={filterOptions.tokens}
          disabled={showLoading}
        />

        {/* Yield Opportunities List */}
        <TooltipProvider>
          <TerminalCard showHeader title="yield --list">
            <div className="divide-theme-border/30 divide-y">
              {/* Error State */}
              {error && !showLoading && (
                <div className="py-8 text-center">
                  <div className="text-theme-text-secondary mb-2 font-mono text-sm">
                    ERROR LOADING YIELD DATA
                  </div>
                  <div className="text-theme-text-muted font-mono text-xs">
                    {error}
                  </div>
                </div>
              )}

              {/* Loading State - Skeleton */}
              {showLoading && !error && <YieldListSkeleton />}

              {/* Empty State */}
              {!showLoading && !error && hasData === false && (
                <div className="py-8 text-center">
                  <div className="text-theme-text-secondary mb-2 font-mono text-sm">
                    {hasActiveFilters
                      ? 'NO YIELD OPPORTUNITIES FOUND'
                      : 'NO YIELD OPPORTUNITIES'}
                  </div>
                  <div className="text-theme-text-muted font-mono text-xs">
                    {hasActiveFilters
                      ? 'Try adjusting your filters'
                      : 'Yield opportunities will appear here'}
                  </div>
                </div>
              )}

              {/* Yield Opportunities - List or Card View */}
              {!showLoading && !error && (
                <>
                  {viewMode === 'card' ? (
                    <YieldCardGrid opportunities={opportunities} isLoading={showLoading} />
                  ) : (
                    <VirtualizedYieldList opportunities={opportunities} />
                  )}
                </>
              )}
            </div>
          </TerminalCard>
        </TooltipProvider>
      </div>

      {/* Right: Sticky Swap Widget - Hidden on mobile, shown on lg+ */}
      <div className="hidden w-[380px] flex-shrink-0 lg:block">
        <div className="sticky top-25">
          <SwapWidgetInline fromToken={selectedSwapToken} />
        </div>
      </div>
    </div>
  );
}
