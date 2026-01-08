'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatCompactValue } from '../tokens-section/utils';
import type { PointsSummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying total points and protocol/wallet count
 */
export function PointsSummaryCards({
  totalPoints,
  protocolCount,
  walletCount,
  isAggregated,
  isLoading,
  privacyMode = false,
}: PointsSummaryCardsProps) {
  // Determine display mode
  const countLabel = isAggregated ? 'wallets:' : 'protocols:';
  const countValue = isAggregated ? walletCount : protocolCount;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Total Points */}
      {isLoading ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon=">_"
              color="magenta"
              label="--points"
              value={formatCompactValue(totalPoints)}
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
              <div className="text-theme-magenta font-mono text-xs font-bold">
                <span className="text-theme-magenta">&gt;</span> points --total
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total accumulated points across all protocols
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : totalPoints != null
                    ? totalPoints.toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                      })
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Count Badge - shows wallet count for aggregated view, protocol count otherwise */}
      {isLoading ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="#"
              color="orange"
              label={countLabel}
              value={countValue}
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
              <div className="text-theme-orange font-mono text-xs font-bold">
                <span className="text-theme-orange">&gt;</span> points --count
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                {isAggregated
                  ? 'Number of tracked wallets'
                  : 'Number of protocols with points data'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
