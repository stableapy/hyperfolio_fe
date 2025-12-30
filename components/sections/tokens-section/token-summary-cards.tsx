'use client';

import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatCompactValue } from './utils';
import type { TokenSummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying total value and token count
 */
export function TokenSummaryCards({
  totalValue,
  tokenCount,
  isLoading,
  privacyMode = false,
}: TokenSummaryCardsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Total Value */}
      {isLoading ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <StatPill
          icon=">_"
          color="accent"
          label="--total"
          value={`$${formatCompactValue(totalValue)}`}
          privacyMode={privacyMode}
          tooltipValue={
            totalValue != null
              ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : undefined
          }
        />
      )}

      {/* Token Count */}
      {isLoading ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <StatPill
          icon="#"
          color="cyan"
          label="count:"
          value={tokenCount}
          privacyMode={privacyMode}
        />
      )}
    </div>
  );
}
