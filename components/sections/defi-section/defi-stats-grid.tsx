'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import type { DefiStatsGridProps } from './types';
import { formatPercentage } from '@/lib/utils/formatters';

/**
 * Format value with K/M suffix for compact display
 */
function formatCompactValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  privacyMode = false,
}: DefiStatsGridProps) {
  const showSkeleton = isLoading && !hasData;

  return (
    <TooltipProvider>
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
        {/* Deposited */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-32 sm:w-40" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon=">_"
                color="accent"
                label="--deposited"
                value={formatCompactValue(totalDeposited)}
                privacyMode={privacyMode}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-1">
                <div className="text-theme-accent font-mono text-xs font-bold">
                  <span className="text-theme-accent">&gt;</span> defi
                  --deposited
                </div>
                <div className="text-theme-text-muted font-mono text-[9px]">
                  Total value deposited in DeFi protocols
                </div>
                {totalDeposited != null && (
                  <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                    {privacyMode
                      ? '•••'
                      : `$${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Rewards */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-28 sm:w-36" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon="+"
                color="cyan"
                label="--rewards"
                value={formatCompactValue(totalRewards)}
                privacyMode={privacyMode}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-1">
                <div className="text-theme-cyan font-mono text-xs font-bold">
                  <span className="text-theme-cyan">&gt;</span> defi
                  --rewards
                </div>
                <div className="text-theme-text-muted font-mono text-[9px]">
                  Total rewards earned from DeFi positions
                </div>
                {totalRewards != null && (
                  <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                    {privacyMode
                      ? '•••'
                      : `$${totalRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Average APY with Tooltip */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-24 sm:w-32" />
        ) : weightedApy > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon="%"
                color="purple"
                label="--apy"
                value={formatPercentage(weightedApy)}
                privacyMode={privacyMode}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-2">
                <div className="text-theme-purple font-mono text-xs font-bold">
                  <span className="text-theme-purple">&gt;</span> yield
                  --estimate
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      daily:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${portfolioYield.daily.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      weekly:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${portfolioYield.weekly.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      monthly:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${portfolioYield.monthly.toFixed(2)}`}
                    </div>
                  </div>
                </div>
                <div className="text-theme-text-muted border-theme-border/50 border-t pt-2 font-mono text-[9px]">
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
            privacyMode={privacyMode}
            className="opacity-60"
          />
        )}
      </div>
    </TooltipProvider>
  );
}
