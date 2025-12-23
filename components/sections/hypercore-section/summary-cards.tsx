"use client"

import { StatPill, StatPillSkeleton } from "@/components/ui/stat-pill"
import { formatUsdCompact, safeParseFloat } from "./utils"
import type { SummaryCardsProps } from "./types"

/**
 * Terminal-style summary badges displaying Spot, Perp, Staked, and Vault values
 * Matches the styling pattern from tokens-section and defi-section
 */
export function SummaryCards({ data, showSkeleton }: SummaryCardsProps) {
  const spotValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.spotValue))
  const perpValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.perpValue))
  const stakedValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.stakedValue))
  const vaultValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.vaultValue))

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Spot Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <StatPill
          icon=">_"
          color="accent"
          label="--spot"
          value={spotValue}
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
        />
      )}
    </div>
  )
}
