'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatCompactValue } from './utils';
import type { TokenSummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying total value and token count
 */
export function TokenSummaryCards({
  totalValue,
  tokenCount,
  isLoading,
  privacyMode = false,
}: TokenSummaryCardsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Total Value */}
      {isLoading ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon=">_"
              color="accent"
              label="--total"
              value={`$${formatCompactValue(totalValue)}`}
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
                <span className="text-theme-accent">&gt;</span> tokens --total
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total value of all tokens held across all wallets
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : totalValue != null
                    ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Token Count */}
      {isLoading ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="#"
              color="cyan"
              label="count:"
              value={tokenCount}
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
                <span className="text-theme-cyan">&gt;</span> tokens --count
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total number of unique tokens held across all wallets
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
