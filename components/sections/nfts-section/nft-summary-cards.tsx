'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import type { NFTSummaryCardsProps } from './types';

/**
 * Format value with K/M suffix for compact display
 */
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Terminal-style summary badges showing total NFT value and count
 */
export function NFTSummaryCards({
  totalValue,
  nftCount,
  showSkeleton,
  privacyMode = false,
}: NFTSummaryCardsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon=">_"
              color="accent"
              label="--value"
              value={formatValue(totalValue)}
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
                <span className="text-theme-accent">&gt;</span> nfts --value
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total estimated value of all NFTs held across all wallets
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

      {/* Count */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-24 sm:w-32" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="#"
              color="purple"
              label="count:"
              value={nftCount}
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
                <span className="text-theme-purple">&gt;</span> nfts --count
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total number of NFTs held across all wallets
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
