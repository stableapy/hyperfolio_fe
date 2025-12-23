"use client"

import { TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PositionItemProps } from "./types"

/**
 * Individual position row component with token details, value, and APY
 * Terminal-style layout with prompt indicators
 */
export function PositionItem({ position, showWalletIndicator }: PositionItemProps) {
  const isLiquidityPool = position.type === 'liquidity'

  return (
    <div className="py-1.5 sm:py-2 ml-3 sm:ml-4 px-2 sm:px-2.5 rounded-sm border-l-2 border-transparent hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-150">
      {/* Horizontal layout on all screens */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Terminal prompt + Token Details */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {/* Terminal sub-prompt */}
          <span className="font-mono text-[10px] sm:text-xs text-theme-text-muted select-none flex-shrink-0">├─</span>
          
          {/* Wallet Indicator - Only show in multi-wallet view */}
          {showWalletIndicator && position.walletColor && (
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: position.walletColor }}
            />
          )}
          {/* Token icon(s) - Single token */}
          {position.positionDetails?.token && !position.positionDetails?.pair && (
            <>
              {position.positionDetails.token.image_url && (
                <img src={position.positionDetails.token.image_url} alt={position.positionDetails.token.symbol} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 ring-1 ring-theme-border/50" />
              )}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-[10px] sm:text-[11px] text-theme-text-primary tabular-nums truncate">
                  {parseFloat(position.positionDetails.token.formattedBalance) >= 1000 
                    ? `${(parseFloat(position.positionDetails.token.formattedBalance) / 1000).toFixed(1)}K` 
                    : parseFloat(position.positionDetails.token.formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#00d9ff]/70">{position.positionDetails.token.symbol}</span>
              </div>
            </>
          )}
          {/* Token icons - Pair */}
          {position.positionDetails?.pair && (
            <>
              <div className="flex items-center flex-shrink-0">
                {position.positionDetails.token0?.image_url && (
                  <img src={position.positionDetails.token0.image_url} alt={position.positionDetails.token0.symbol} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-1 ring-theme-border/50" />
                )}
                {position.positionDetails.token1?.image_url && (
                  <img src={position.positionDetails.token1.image_url} alt={position.positionDetails.token1.symbol} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full -ml-1.5 ring-1 ring-theme-border/50" />
                )}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-theme-text-secondary truncate">{position.positionDetails.pair}</span>
            </>
          )}
          {/* Fallback if no position details */}
          {!position.positionDetails?.token && !position.positionDetails?.pair && (
            <span className="font-mono text-[10px] sm:text-[11px] text-theme-text-secondary truncate">{position.assets.join("/")}</span>
          )}
        </div>

        {/* Right: Value + APY Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Value - terminal style */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-theme-text-muted">=</span>
            <span className="font-mono text-[10px] sm:text-[11px] text-theme-accent font-medium tabular-nums">
              ${position.current >= 1000 ? `${(position.current / 1000).toFixed(1)}K` : position.current.toFixed(2)}
            </span>
          </div>

          {/* APY Badge */}
          {position.apy > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1 py-0.5 bg-theme-accent/10 border border-theme-accent/20 rounded flex items-center gap-0.5">
                    <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-theme-accent" />
                    <span className="font-mono text-[9px] sm:text-[10px] text-theme-accent tabular-nums">
                      {Number(position.apy).toFixed(1)}%
                    </span>
                  </span>
                </TooltipTrigger>
                {position.estimatedYield && (
                  <TooltipContent className="bg-theme-bg border border-theme-border p-3">
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-theme-accent font-bold mb-2">
                        <span className="text-theme-accent">&gt;</span> yield --position
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">daily:</span>
                        <span className="text-theme-text-primary tabular-nums">${position.estimatedYield.daily}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">weekly:</span>
                        <span className="text-theme-text-primary tabular-nums">${position.estimatedYield.weekly}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-theme-text-muted">monthly:</span>
                        <span className="text-theme-text-primary tabular-nums">${position.estimatedYield.monthly}</span>
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
                  <span className="px-1 py-0.5 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded flex items-center">
                    <span className="font-mono text-[9px] sm:text-[10px] text-[#00d9ff] tabular-nums">
                      +${position.rewards >= 100 ? `${(position.rewards).toFixed(0)}` : position.rewards.toFixed(2)}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border border-theme-border p-3">
                  <div className="font-mono text-xs space-y-1">
                    <div className="text-[#00d9ff] font-bold mb-2">
                      <span className="text-[#00d9ff]">&gt;</span> fees --uncollected
                    </div>
                    {position.positionDetails?.uncollectedFees && (
                      <>
                        {position.positionDetails.uncollectedFees.token0 && parseFloat(position.positionDetails.uncollectedFees.token0) > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-theme-text-muted">{position.positionDetails.token0?.symbol}:</span>
                            <span className="text-theme-text-primary tabular-nums">${position.positionDetails.uncollectedFees.token0UsdValue}</span>
                          </div>
                        )}
                        {position.positionDetails.uncollectedFees.token1 && parseFloat(position.positionDetails.uncollectedFees.token1) > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-theme-text-muted">{position.positionDetails.token1?.symbol}:</span>
                            <span className="text-theme-text-primary tabular-nums">${position.positionDetails.uncollectedFees.token1UsdValue}</span>
                          </div>
                        )}
                        <div className="border-t border-theme-border/50 mt-2 pt-2 flex justify-between gap-4">
                          <span className="text-theme-text-muted">total:</span>
                          <span className="text-[#00d9ff] font-bold tabular-nums">${position.positionDetails.uncollectedFees.usdValue}</span>
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
  )
}

