"use client"

import { TerminalCard, TerminalContent } from "@/components/ui/terminal-card"
import type { NFTSummaryCardsProps } from "./types"

/**
 * Summary cards showing total NFT value and count
 */
export function NFTSummaryCards({ totalValue, nftCount, showSkeleton }: NFTSummaryCardsProps) {
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
      {/* Value Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">VALUE</div>
          {showSkeleton ? (
            <div className="h-5 sm:h-7 w-20 sm:w-28 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
              {formatValue(totalValue)}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
      
      {/* Count Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">COUNT</div>
          {showSkeleton ? (
            <div className="h-5 sm:h-7 w-10 sm:w-16 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-white font-semibold">
              {nftCount}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

