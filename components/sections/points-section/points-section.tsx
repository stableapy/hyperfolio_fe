'use client';

import { useState, useMemo } from 'react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { useWalletStore } from '@/lib/store/wallet-store';
import { PointsSummaryCards } from './points-summary-cards';
import { PointsSearchBar } from './points-search-bar';
import { PointsRow, PointsRowMobile } from './points-row';
import { PointsListSkeleton } from './points-list-skeleton';
import {
  usePointsData,
  useFilteredPoints,
  groupPointsByProtocol,
} from './hooks';
import type { PointsSectionProps, Point } from './types';

/**
 * Main PointsSection component
 * Displays a list of protocol points with search and grouping functionality
 */
export function PointsSection({ isLoading = false }: PointsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGrouped, setIsGrouped] = useState(true);

  // Subscribe to privacy mode and wallet state from wallet store
  const privacyMode = useWalletStore((state) => state.privacyMode);
  const { selectedWalletId } = useWalletStore();

  // Fetch points data
  const { points, hasData, totals, isLoading: isDataLoading } = usePointsData();

  // Filter points based on search query
  const filteredPoints = useFilteredPoints(points, searchQuery);

  // Group points by protocol if needed (only for multi-wallet mode)
  const displayPoints = useMemo(() => {
    let pointsToDisplay: Point[];

    // Apply grouping if enabled and in multi-wallet view
    if (!selectedWalletId && isGrouped && filteredPoints.length > 0) {
      pointsToDisplay = groupPointsByProtocol(filteredPoints);
    } else {
      pointsToDisplay = filteredPoints;
    }

    // Add ranks to all points
    return pointsToDisplay.map((point, index) => ({
      ...point,
      rank: index + 1,
    }));
  }, [filteredPoints, isGrouped, selectedWalletId]);

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData;

  // Show group toggle only when we have multiple wallets and not in single wallet view
  const { wallets } = useWalletStore();
  const showGroupToggle = !selectedWalletId && wallets.length > 1;

  // Determine if we're in aggregated mode (all wallets) or single wallet mode
  const isAggregated = !selectedWalletId;

  return (
    <div className="min-w-0 flex-1 space-y-3 pb-20 sm:space-y-4 lg:pb-0">
      {/* Summary Cards */}
      <PointsSummaryCards
        totalPoints={totals.totalPoints}
        protocolCount={totals.protocolCount}
        walletCount={wallets.length}
        isAggregated={isAggregated}
        isLoading={showSkeleton || isDataLoading}
        privacyMode={privacyMode}
      />

      {/* Search Bar */}
      <PointsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isGrouped={isGrouped}
        onGroupedChange={setIsGrouped}
        showGroupToggle={showGroupToggle}
      />

      {/* Points List - Terminal style */}
      <TerminalCard showHeader title="points --list">
        <div className="divide-theme-border/30 divide-y">
          {/* Show skeletons when loading and no data */}
          {showSkeleton && <PointsListSkeleton />}

          {/* Show real data */}
          {displayPoints.map((point) => (
            <div
              key={point.id}
              className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3"
            >
              {/* Mobile Layout - visibility handled inside component */}
              <PointsRowMobile
                point={point}
                selectedWalletId={selectedWalletId}
                privacyMode={privacyMode}
              />

              {/* Desktop Layout - visibility handled inside component */}
              <PointsRow
                point={point}
                selectedWalletId={selectedWalletId}
                privacyMode={privacyMode}
              />
            </div>
          ))}
        </div>
      </TerminalCard>

      {/* Empty State */}
      {displayPoints.length === 0 && !showSkeleton && !isDataLoading && (
        <div className="py-8 text-center sm:py-12">
          <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
            {searchQuery ? 'NO PROTOCOLS FOUND' : 'NO POINTS'}
          </div>
          <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No points in this wallet'}
          </div>
        </div>
      )}
    </div>
  );
}
