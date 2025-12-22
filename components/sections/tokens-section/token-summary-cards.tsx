"use client"

import { TerminalCard, TerminalContent } from "@/components/ui/terminal-card"
import { formatCompactValue } from "./utils"
import type { TokenSummaryCardsProps } from "./types"

/**
 * Summary cards displaying total value and token count
 */
export function TokenSummaryCards({ 
  totalValue, 
  tokenCount, 
  isLoading 
}: TokenSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
      {/* Total Value Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090]">VALUE</div>
          </div>
          {isLoading ? (
            <div className="h-5 sm:h-7 w-20 sm:w-28 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
              ${formatCompactValue(totalValue)}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
      
      {/* Token Count Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090]">COUNT</div>
          </div>
          {isLoading ? (
            <div className="h-5 sm:h-7 w-10 sm:w-16 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-white font-semibold">
              {tokenCount}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

