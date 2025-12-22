"use client"

import { TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PositionItemProps } from "./types"

/**
 * Individual position row component with token details, value, and APY
 */
export function PositionItem({ position, showWalletIndicator }: PositionItemProps) {
  const isLiquidityPool = position.type === 'liquidity'

  return (
    <div className="py-1.5 sm:py-2 ml-1 sm:ml-2 px-1.5 sm:px-2 -mx-1 rounded-sm border-l-2 border-transparent hover:border-[#00ff41]/50 hover:bg-[#0a0e0f]/50 transition-colors cursor-pointer">
      {/* Horizontal layout on all screens */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Token Details */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
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
                <img src={position.positionDetails.token.image_url} alt={position.positionDetails.token.symbol} className="w-5 h-5 rounded-full flex-shrink-0" />
              )}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-[11px] sm:text-xs text-white truncate">
                  {parseFloat(position.positionDetails.token.formattedBalance) >= 1000 
                    ? `${(parseFloat(position.positionDetails.token.formattedBalance) / 1000).toFixed(1)}K` 
                    : parseFloat(position.positionDetails.token.formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-[11px] sm:text-xs text-[#708090]">{position.positionDetails.token.symbol}</span>
              </div>
            </>
          )}
          {/* Token icons - Pair */}
          {position.positionDetails?.pair && (
            <>
              <div className="flex items-center flex-shrink-0">
                {position.positionDetails.token0?.image_url && (
                  <img src={position.positionDetails.token0.image_url} alt={position.positionDetails.token0.symbol} className="w-5 h-5 rounded-full" />
                )}
                {position.positionDetails.token1?.image_url && (
                  <img src={position.positionDetails.token1.image_url} alt={position.positionDetails.token1.symbol} className="w-5 h-5 rounded-full -ml-1.5" />
                )}
              </div>
              <span className="font-mono text-[11px] sm:text-xs text-[#708090] truncate">{position.positionDetails.pair}</span>
            </>
          )}
          {/* Fallback if no position details */}
          {!position.positionDetails?.token && !position.positionDetails?.pair && (
            <span className="font-mono text-[11px] sm:text-xs text-[#708090] truncate">{position.assets.join("/")}</span>
          )}
        </div>

        {/* Right: Value + APY Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Value */}
          <span className="font-mono text-[11px] sm:text-xs text-white font-medium">
            ${position.current >= 1000 ? `${(position.current / 1000).toFixed(1)}K` : position.current.toFixed(2)}
          </span>

          {/* APY Badge */}
          {position.apy > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1 py-0.5 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-[#00ff41]" />
                    <span className="font-mono text-[10px] text-[#00ff41]">
                      {Number(position.apy).toFixed(1)}%
                    </span>
                  </span>
                </TooltipTrigger>
                {position.estimatedYield && (
                  <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-[#00ff41] font-bold mb-2">Estimated Yield</div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Daily:</span>
                        <span className="text-white">${position.estimatedYield.daily}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Weekly:</span>
                        <span className="text-white">${position.estimatedYield.weekly}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Monthly:</span>
                        <span className="text-white">${position.estimatedYield.monthly}</span>
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
                    <span className="font-mono text-[10px] text-[#00d9ff]">
                      +${position.rewards >= 100 ? `${(position.rewards).toFixed(0)}` : position.rewards.toFixed(2)}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                  <div className="font-mono text-xs space-y-1">
                    <div className="text-[#00d9ff] font-bold mb-2">Uncollected Fees</div>
                    {position.positionDetails?.uncollectedFees && (
                      <>
                        {position.positionDetails.uncollectedFees.token0 && parseFloat(position.positionDetails.uncollectedFees.token0) > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-[#708090]">{position.positionDetails.token0?.symbol}:</span>
                            <span className="text-white">${position.positionDetails.uncollectedFees.token0UsdValue}</span>
                          </div>
                        )}
                        {position.positionDetails.uncollectedFees.token1 && parseFloat(position.positionDetails.uncollectedFees.token1) > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-[#708090]">{position.positionDetails.token1?.symbol}:</span>
                            <span className="text-white">${position.positionDetails.uncollectedFees.token1UsdValue}</span>
                          </div>
                        )}
                        <div className="border-t border-[#1a2225] mt-2 pt-2 flex justify-between gap-4">
                          <span className="text-[#708090]">Total:</span>
                          <span className="text-[#00d9ff] font-bold">${position.positionDetails.uncollectedFees.usdValue}</span>
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

