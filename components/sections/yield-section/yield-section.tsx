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
 * with filtering, sorting, pagination, and statistics
 */
export function YieldSection({ isLoading = false }: YieldSectionProps) {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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

  // Handle filter changes - reset to page 1 when filters change
  const handleFiltersChange = useCallback(
    (updates: Partial<YieldFilters>) => {
      startTransition(() => {
        setFilters((prev) => ({ ...prev, ...updates }));
        setPage(1); // Reset to first page when filters change
      });
    },
    [startTransition]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      // Scroll to top of yield section
      document
        .getElementById('yield-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    },
    []
  );

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  }, []);

  // Get privacy mode from wallet store
  const privacyMode = useWalletStore((state) => state.privacyMode);

  // Get view mode from wallet store for persistence
  const viewMode = useWalletStore((state) => state.yieldViewMode);
  const setViewMode = useWalletStore((state) => state.setYieldViewMode);

  // Fetch and process data with pagination
  const {
    opportunities,
    filterOptions,
    isLoading: isDataLoading,
    error,
    hasData,
    stats,
    pagination,
  } = useYieldData(filters, { page, pageSize });

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

  // Calculate showing range (e.g., "Showing 1-50 of 200")
  const showingRange = useMemo(() => {
    if (pagination.totalItems === 0) return null;
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(start + pagination.pageSize - 1, pagination.totalItems);
    return `${start}-${end} of ${pagination.totalItems}`;
  }, [pagination]);

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
          <TerminalCard showHeader title="yield --list" id="yield-section">
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

              {/* Pagination Controls */}
              {!showLoading && !error && hasData && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-b border-theme-border/30 px-4 py-3">
                  {/* Showing info */}
                  <div className="text-theme-text-muted font-mono text-sm">
                    {showingRange && `Showing ${showingRange} opportunities`}
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="font-mono text-xs disabled:text-theme-text-muted disabled:cursor-not-allowed hover:text-theme-text-secondary text-theme-text-secondary"
                    >
                      Previous
                    </button>

                    {/* Page indicator */}
                    <span className="font-mono text-sm text-theme-text-secondary">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!pagination.hasNext}
                      className="font-mono text-xs disabled:text-theme-text-muted disabled:cursor-not-allowed hover:text-theme-text-secondary text-theme-text-secondary"
                    >
                      Next
                    </button>
                  </div>

                  {/* Page size selector */}
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border-theme-border/30 bg-card text-theme-text-secondary font-mono text-xs rounded border px-2 py-1"
                  >
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
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
