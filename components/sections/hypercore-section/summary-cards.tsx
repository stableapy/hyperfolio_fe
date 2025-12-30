'use client';

import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatUsdCompact, safeParseFloat } from './utils';
import type { SummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying Spot, Perp, Staked, and Vault values
 * Matches the styling pattern from tokens-section and defi-section
 */
export function SummaryCards({
  data,
  showSkeleton,
  privacyMode = false,
}: SummaryCardsProps) {
  const spotValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.spotValue)
  );
  const perpValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.perpValue)
  );
  const stakedValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.stakedValue)
  );
  const vaultValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.vaultValue)
  );

  // Tooltip values showing full formatted amounts
  const spotTooltip = data?.portfolioSummary?.spotValue
    ? `$${parseFloat(data.portfolioSummary.spotValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;
  const perpTooltip = data?.portfolioSummary?.perpValue
    ? `$${parseFloat(data.portfolioSummary.perpValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;
  const stakedTooltip = data?.portfolioSummary?.stakedValue
    ? `$${parseFloat(data.portfolioSummary.stakedValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;
  const vaultTooltip = data?.portfolioSummary?.vaultValue
    ? `$${parseFloat(data.portfolioSummary.vaultValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Spot Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <StatPill
          icon=">_"
          color="accent"
          label="--spot"
          value={spotValue}
          tooltipValue={spotTooltip}
          privacyMode={privacyMode}
        />
      )}

      {/* Perp Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <StatPill
          icon="~"
          color="cyan"
          label="--perp"
          value={perpValue}
          tooltipValue={perpTooltip}
          privacyMode={privacyMode}
        />
      )}

      {/* Staked Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <StatPill
          icon="::"
          color="magenta"
          label="--staked"
          value={stakedValue}
          tooltipValue={stakedTooltip}
          privacyMode={privacyMode}
        />
      )}

      {/* Vault Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <StatPill
          icon="[#]"
          color="orange"
          label="--vaults"
          value={vaultValue}
          tooltipValue={vaultTooltip}
          privacyMode={privacyMode}
        />
      )}
    </div>
  );
}
