'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import type { YieldStatsProps } from './types';
import { formatApyPercentage } from './utils';

/**
 * YieldStats Component
 * Displays summary statistics for yield opportunities using StatPill components
 * Shows total count, highest APY, and average APY with tooltips for accessibility
 *
 * @param {YieldStatsProps} props - Component props
 */
export function YieldStats({
  stats,
  isLoading,
  hasData,
  privacyMode = false,
}: YieldStatsProps) {
  const showSkeleton = isLoading && !hasData;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Total Opportunities */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="#"
              color="accent"
              label="--opportunities"
              value={stats.totalCount}
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
                <span className="text-theme-accent">&gt;</span> yield --total
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total number of yield opportunities across all protocols
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Highest APY */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="↑"
              color="cyan"
              label="--highest"
              value={formatApyPercentage(stats.highestApy)}
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
                <span className="text-theme-cyan">&gt;</span> yield --highest
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Highest APY available across all yield opportunities
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode ? '•••' : `${stats.highestApy.toFixed(4)}%`}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Average APY */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="%"
              color="purple"
              label="--average"
              value={formatApyPercentage(stats.averageApy)}
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
              <div className="text-theme-purple font-mono text-xs font-bold">
                <span className="text-theme-purple">&gt;</span> yield --average
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Average APY across all yield opportunities
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode ? '•••' : `${stats.averageApy.toFixed(4)}%`}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
