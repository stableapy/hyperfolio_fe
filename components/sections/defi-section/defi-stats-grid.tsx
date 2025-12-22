"use client"

import { TrendingUp } from "lucide-react"
import { TerminalCard, TerminalContent } from "@/components/ui/terminal-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { DefiStatsGridProps } from "./types"

/**
 * Stats grid component displaying deposited amount, rewards, and average APY
 */
export function DefiStatsGrid({
  isLoading,
  hasData,
  totalDeposited,
  totalRewards,
  weightedApy,
  portfolioYield,
  positionsWithApy,
  totalPositions,
}: DefiStatsGridProps) {
  const showSkeleton = isLoading && !hasData

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
      {/* Deposited Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">DEPOSITED</div>
          {showSkeleton ? (
            <div className="h-5 sm:h-7 w-20 sm:w-32 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
              ${totalDeposited >= 1000 ? `${(totalDeposited / 1000).toFixed(1)}K` : totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>

      {/* Rewards Card */}
      <TerminalCard>
        <TerminalContent className="p-3 sm:p-4">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">REWARDS</div>
          {showSkeleton ? (
            <div className="h-5 sm:h-7 w-16 sm:w-24 bg-[#1a2225] rounded animate-pulse" />
          ) : (
            <div className="font-mono text-base sm:text-xl text-[#00d9ff] font-semibold">
              ${totalRewards >= 1000 ? `${(totalRewards / 1000).toFixed(1)}K` : totalRewards.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>

      {/* Average APY Card */}
      <TerminalCard className="col-span-2 sm:col-span-1">
        <TerminalContent className="p-3 sm:p-4">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">AVG APY</div>
          {showSkeleton ? (
            <div className="h-5 sm:h-7 w-14 sm:w-20 bg-[#1a2225] rounded animate-pulse" />
          ) : weightedApy > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
                      {weightedApy.toFixed(1)}%
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                  <div className="font-mono text-xs space-y-1">
                    <div className="text-[#00ff41] font-bold mb-2">Portfolio Estimated Yield</div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#708090]">Daily:</span>
                      <span className="text-white">${portfolioYield.daily.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#708090]">Weekly:</span>
                      <span className="text-white">${portfolioYield.weekly.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#708090]">Monthly:</span>
                      <span className="text-white">${portfolioYield.monthly.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#1a2225] mt-2 pt-2">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Positions with APY:</span>
                        <span className="text-white">{positionsWithApy} / {totalPositions}</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="font-mono text-base sm:text-xl text-[#708090] font-semibold">--</div>
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

