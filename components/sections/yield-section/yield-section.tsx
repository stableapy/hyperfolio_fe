'use client';

import { useState } from 'react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { YieldStats } from './yield-stats';
import { YieldFilterBar } from './yield-filter-bar';
import { YieldCard } from './yield-card';
import { YieldListSkeleton } from './yield-list-skeleton';
import { useYieldData } from './hooks/use-yield-data';
import type { YieldSectionProps } from './types';

/**
 * Main YieldSection component
 * Displays yield opportunities across Hyperliquid protocols
 * with filtering, sorting, and statistics
 */
export function YieldSection({ isLoading = false }: YieldSectionProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'lending' | 'amm' | 'yield' | 'staking'
  >('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Fetch and process data
  const {
    opportunities,
    isLoading: isDataLoading,
    error,
    hasData,
    stats,
  } = useYieldData({
    searchQuery,
    selectedCategory,
    sortOrder,
  });

  // Show loading state
  const showLoading = isLoading || isDataLoading;

  return (
    <div className="min-w-0 flex-1 space-y-4 pb-20 sm:space-y-4 lg:pb-0">
      {/* Stats Grid */}
      <YieldStats stats={stats} isLoading={showLoading} hasData={hasData} />

      {/* Filter Bar */}
      <YieldFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        disabled={showLoading}
      />

      {/* Yield Opportunities List */}
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
          {showLoading && !error && !hasData && <YieldListSkeleton />}

          {/* Empty State */}
          {!showLoading && !error && hasData === false && (
            <div className="py-8 text-center">
              <div className="text-theme-text-secondary mb-2 font-mono text-sm">
                {searchQuery || selectedCategory !== 'all'
                  ? 'NO YIELD OPPORTUNITIES FOUND'
                  : 'NO YIELD OPPORTUNITIES'}
              </div>
              <div className="text-theme-text-muted font-mono text-xs">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Yield opportunities will appear here'}
              </div>
            </div>
          )}

          {/* Yield Cards */}
          {!showLoading && !error && hasData && (
            <>
              {opportunities.map((opportunity) => (
                <YieldCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </>
          )}
        </div>
      </TerminalCard>
    </div>
  );
}
