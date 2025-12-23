"use client"

import { StatPill, StatPillSkeleton } from "@/components/ui/stat-pill"
import type { NFTSummaryCardsProps } from "./types"

/**
 * Format value with K/M suffix for compact display
 */
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

/**
 * Terminal-style summary badges showing total NFT value and count
 */
export function NFTSummaryCards({ totalValue, nftCount, showSkeleton }: NFTSummaryCardsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <StatPill
          icon=">_"
          color="accent"
          label="--value"
          value={formatValue(totalValue)}
        />
      )}
      
      {/* Count */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <StatPill
          icon="#"
          color="purple"
          label="count:"
          value={nftCount}
        />
      )}
    </div>
  )
}
