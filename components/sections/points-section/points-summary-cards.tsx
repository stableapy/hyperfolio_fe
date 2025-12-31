'use client';

import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatCompactValue } from '../tokens-section/utils';
import type { PointsSummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying total points and protocol/wallet count
 */
export function PointsSummaryCards({
  totalPoints,
  protocolCount,
  walletCount,
  isAggregated,
  isLoading,
  privacyMode = false,
}: PointsSummaryCardsProps) {
  // Determine display mode
  const countLabel = isAggregated ? 'wallets:' : 'protocols:';
  const countValue = isAggregated ? walletCount : protocolCount;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Total Points */}
      {isLoading ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <StatPill
          icon=">_"
          color="magenta"
          label="--points"
          value={formatCompactValue(totalPoints)}
          privacyMode={privacyMode}
          tooltipValue={
            totalPoints != null
              ? totalPoints.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })
              : undefined
          }
        />
      )}

      {/* Count Badge - shows wallet count for aggregated view, protocol count otherwise */}
      {isLoading ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <StatPill
          icon="#"
          color="orange"
          label={countLabel}
          value={countValue}
          privacyMode={privacyMode}
        />
      )}
    </div>
  );
}
