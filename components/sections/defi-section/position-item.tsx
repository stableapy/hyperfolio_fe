'use client';

import { TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PositionItemProps } from './types';
import { formatPercentage } from '@/lib/utils/formatters';

/**
 * Individual position row component with token details, value, and APY
 * Terminal-style layout with prompt indicators
 */
export function PositionItem({
  position,
  showWalletIndicator,
  privacyMode,
  totalPortfolioUSD,
}: PositionItemProps) {
  const isLiquidityPool = position.type === 'liquidity';

  return (
    <div className="hover:border-theme-accent/50 hover:bg-theme-accent/5 ml-3 rounded-sm border-l-2 border-transparent px-2 py-1.5 transition-all duration-150 sm:ml-4 sm:px-2.5 sm:py-2">
      {/* Horizontal layout on all screens */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Terminal prompt + Token Details */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          {/* Terminal sub-prompt */}
          <span className="text-theme-text-muted flex-shrink-0 font-mono text-[10px] select-none sm:text-xs">
            ├─
          </span>

          {/* Wallet Indicator - Only show in multi-wallet view */}
          {showWalletIndicator && position.walletColor && (
            <div
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full sm:h-2 sm:w-2"
              style={{ backgroundColor: position.walletColor }}
            />
          )}
          {/* Token icon(s) - Single token */}
          {position.positionDetails?.token &&
            !position.positionDetails?.pair && (
              <>
                {position.positionDetails.token.image_url && (
                  <img
                    src={position.positionDetails.token.image_url}
                    alt={position.positionDetails.token.symbol}
                    className="ring-theme-border/50 h-4 w-4 flex-shrink-0 rounded-full ring-1 sm:h-5 sm:w-5"
                  />
                )}
                <div className="flex min-w-0 items-center gap-1">
                  <span className="text-theme-text-primary truncate font-mono text-[10px] tabular-nums sm:text-[11px]">
                    {parseFloat(
                      position.positionDetails.token.formattedBalance
                    ) >= 1000
                      ? `${(parseFloat(position.positionDetails.token.formattedBalance) / 1000).toFixed(1)}K`
                      : parseFloat(
                          position.positionDetails.token.formattedBalance
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                  </span>
                  <span className="text-theme-cyan/70 font-mono text-[10px] sm:text-[11px]">
                    {position.positionDetails.token.symbol}
                  </span>
                </div>
              </>
            )}
          {/* Token icons - Pair */}
          {position.positionDetails?.pair && (
            <>
              <div className="flex flex-shrink-0 items-center">
                {position.positionDetails.token0?.image_url && (
                  <img
                    src={position.positionDetails.token0.image_url}
                    alt={position.positionDetails.token0.symbol}
                    className="ring-theme-border/50 h-4 w-4 rounded-full ring-1 sm:h-5 sm:w-5"
                  />
                )}
                {position.positionDetails.token1?.image_url && (
                  <img
                    src={position.positionDetails.token1.image_url}
                    alt={position.positionDetails.token1.symbol}
                    className="ring-theme-border/50 -ml-1.5 h-4 w-4 rounded-full ring-1 sm:h-5 sm:w-5"
                  />
                )}
              </div>
              <span className="text-theme-text-secondary truncate font-mono text-[10px] sm:text-[11px]">
                {position.positionDetails.pair}
              </span>
            </>
          )}
          {/* Fallback if no position details */}
          {!position.positionDetails?.token &&
            !position.positionDetails?.pair && (
              <span className="text-theme-text-secondary truncate font-mono text-[10px] sm:text-[11px]">
                {position.assets.join('/')}
              </span>
            )}
        </div>

        {/* Right: Value + APY Badge */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Value - terminal style */}
          <div className="flex items-center gap-1">
            <span className="text-theme-text-muted font-mono text-[9px]">
              =
            </span>
            <span className="text-theme-accent font-mono text-[10px] font-medium tabular-nums sm:text-[11px]">
              {privacyMode
                ? totalPortfolioUSD > 0
                  ? formatPercentage(
                      (position.current / totalPortfolioUSD) * 100
                    )
                  : formatPercentage(0)
                : position.current >= 1000
                  ? `$${(position.current / 1000).toFixed(1)}K`
                  : `$${position.current.toFixed(2)}`}
            </span>
          </div>

          {/* APY Badge */}
          {position.apy > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="bg-theme-accent/10 border-theme-accent/20 flex items-center gap-0.5 rounded border px-1 py-0.5">
                    <TrendingUp className="text-theme-accent h-2 w-2 sm:h-2.5 sm:w-2.5" />
                    <span className="text-theme-accent font-mono text-[9px] tabular-nums sm:text-[10px]">
                      {formatPercentage(position.apy)}
                    </span>
                  </span>
                </TooltipTrigger>
                {position.estimatedYield && (
                  <TooltipContent className="bg-theme-bg border-theme-border border p-3">
                    <div className="space-y-1 font-mono text-xs">
                      <div className="text-theme-accent mb-2 font-bold">
                        <span className="text-theme-accent">&gt;</span> yield
                        --position
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">daily:</span>
                        <span className="text-theme-text-primary tabular-nums">
                          {privacyMode
                            ? '•••'
                            : `$${position.estimatedYield.daily}`}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">weekly:</span>
                        <span className="text-theme-text-primary tabular-nums">
                          {privacyMode
                            ? '•••'
                            : `$${position.estimatedYield.weekly}`}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">monthly:</span>
                        <span className="text-theme-text-primary tabular-nums">
                          {privacyMode
                            ? '•••'
                            : `$${position.estimatedYield.monthly}`}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Uncollected Fees */}
          {isLiquidityPool && position.rewards > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="bg-theme-cyan/10 border-theme-cyan/20 flex items-center rounded border px-1 py-0.5">
                    <span className="text-theme-cyan font-mono text-[9px] tabular-nums sm:text-[10px]">
                      +$
                      {position.rewards >= 100
                        ? `${position.rewards.toFixed(0)}`
                        : position.rewards.toFixed(2)}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-3">
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-theme-cyan mb-2 font-bold">
                      <span className="text-theme-cyan">&gt;</span> fees
                      --uncollected
                    </div>
                    {position.positionDetails?.uncollectedFees && (
                      <>
                        {position.positionDetails.uncollectedFees.token0 &&
                          parseFloat(
                            position.positionDetails.uncollectedFees.token0
                          ) > 0 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-theme-text-muted">
                                {position.positionDetails.token0?.symbol}:
                              </span>
                              <span className="text-theme-text-primary tabular-nums">
                                {privacyMode
                                  ? '•••'
                                  : `$${position.positionDetails.uncollectedFees.token0UsdValue}`}
                              </span>
                            </div>
                          )}
                        {position.positionDetails.uncollectedFees.token1 &&
                          parseFloat(
                            position.positionDetails.uncollectedFees.token1
                          ) > 0 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-theme-text-muted">
                                {position.positionDetails.token1?.symbol}:
                              </span>
                              <span className="text-theme-text-primary tabular-nums">
                                {privacyMode
                                  ? '•••'
                                  : `$${position.positionDetails.uncollectedFees.token1UsdValue}`}
                              </span>
                            </div>
                          )}
                        <div className="border-theme-border/50 mt-2 flex justify-between gap-4 border-t pt-2">
                          <span className="text-theme-text-muted">total:</span>
                          <span className="text-theme-cyan font-bold tabular-nums">
                            {privacyMode
                              ? '•••'
                              : `$${position.positionDetails.uncollectedFees.usdValue}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
