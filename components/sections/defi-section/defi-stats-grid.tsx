"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatPill, StatPillSkeleton } from "@/components/ui/stat-pill"
import type { DefiStatsGridProps } from "./types"

/**
 * Format value with K/M suffix for compact display
 */
function formatCompactValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Terminal-style stats grid displaying deposited amount, rewards, and average APY
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
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Deposited */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-32 sm:w-40" />
        ) : (
          <StatPill
            icon=">_"
            color="accent"
            label="--deposited"
            value={formatCompactValue(totalDeposited)}
          />
        )}

        {/* Rewards */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-28 sm:w-36" />
        ) : (
          <StatPill
            icon="+"
            color="amber"
            label="--rewards"
            value={formatCompactValue(totalRewards)}
          />
        )}

        {/* Average APY with Tooltip */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-24 sm:w-32" />
        ) : weightedApy > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon="%"
                color="lime"
                label="--apy"
                value={`${weightedApy.toFixed(1)}%`}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-theme-bg border border-theme-border p-3 max-w-xs">
              <div className="space-y-2">
                <div className="font-mono text-xs text-[#b4ff00] font-bold">
                  <span className="text-[#b4ff00]">&gt;</span> yield --estimate
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <div className="font-mono text-[9px] text-theme-text-muted">daily:</div>
                    <div className="font-mono text-xs text-theme-accent font-bold tabular-nums">
                      ${portfolioYield.daily.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-theme-text-muted">weekly:</div>
                    <div className="font-mono text-xs text-theme-accent font-bold tabular-nums">
                      ${portfolioYield.weekly.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-theme-text-muted">monthly:</div>
                    <div className="font-mono text-xs text-theme-accent font-bold tabular-nums">
                      ${portfolioYield.monthly.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[9px] text-theme-text-muted pt-2 border-t border-theme-border/50">
                  # {positionsWithApy}/{totalPositions} positions with apy data
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <StatPill
            icon="%"
            color="muted"
            label="--apy"
            value="--"
            className="opacity-60"
          />
        )}
      </div>
    </TooltipProvider>
  )
}
