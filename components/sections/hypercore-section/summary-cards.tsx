'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import { formatUsdCompact, safeParseFloat } from './utils';
import type { SummaryCardsProps } from './types';

/**
 * Terminal-style summary badges displaying Spot, Perp, Staked, and Vault values
 * Matches the styling pattern from tokens-section and defi-section
 */
export function SummaryCards({
  data,
  showSkeleton,
  privacyMode = false,
}: SummaryCardsProps) {
  const spotValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.spotValue)
  );
  const perpValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.perpValue)
  );
  const stakedValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.stakedValue)
  );
  const vaultValue = formatUsdCompact(
    safeParseFloat(data?.portfolioSummary?.vaultValue)
  );

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      {/* Spot Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-32 sm:w-40" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon=">_"
              color="accent"
              label="--spot"
              value={spotValue}
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
                <span className="text-theme-accent">&gt;</span> hypercore --spot
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total value of spot trading positions
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : data?.portfolioSummary?.spotValue
                    ? `$${parseFloat(data.portfolioSummary.spotValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Perp Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="~"
              color="cyan"
              label="--perp"
              value={perpValue}
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
                <span className="text-theme-cyan">&gt;</span> hypercore --perp
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total value of perpetual futures positions
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : data?.portfolioSummary?.perpValue
                    ? `$${parseFloat(data.portfolioSummary.perpValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Staked Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="::"
              color="magenta"
              label="--staked"
              value={stakedValue}
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
                <span className="text-theme-magenta">&gt;</span> hypercore --staked
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total value of staked HYPE tokens
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : data?.portfolioSummary?.stakedValue
                    ? `$${parseFloat(data.portfolioSummary.stakedValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Vault Value */}
      {showSkeleton ? (
        <StatPillSkeleton width="w-28 sm:w-36" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <StatPill
              icon="[#]"
              color="orange"
              label="--vaults"
              value={vaultValue}
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
                <span className="text-theme-orange">&gt;</span> hypercore --vaults
              </div>
              <div className="text-theme-text-muted font-mono text-[9px]">
                Total value of vault positions
              </div>
              <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                {privacyMode
                  ? '•••'
                  : data?.portfolioSummary?.vaultValue
                    ? `$${parseFloat(data.portfolioSummary.vaultValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '--'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
