"use client"

import { ArrowRightLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenImage } from "./token-image"
import { formatPriceDesktop, formatValue, formatBalance } from "./utils"
import type { TokenRowProps } from "./types"

/**
 * Desktop layout for token row (>= sm breakpoint)
 * Clean horizontal layout with wallet indicator and swap button
 */
export function TokenRow({ 
  token, 
  selectedWalletId, 
  isGrouped,
  onSwapClick 
}: TokenRowProps) {
  return (
    <div className="hidden sm:flex items-center justify-between gap-4">
      {/* Left: Token Info with icon */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <TokenImage 
            src={token.logo} 
            symbol={token.symbol} 
            className="w-10 h-10 rounded-full flex-shrink-0" 
          />
          {/* Wallet indicator dot with tooltip */}
          {!selectedWalletId && !isGrouped && token.walletColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0e0f] "
                    style={{ backgroundColor: token.walletColor }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
                  <div className="font-mono text-xs">
                    <span className="text-[#708090]">Wallet: </span>
                    <span style={{ color: token.walletColor }}>{token.walletName}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[#00ff41] font-bold truncate">
              {token.symbol}
            </span>
            <span className="font-mono text-[11px] text-[#708090] bg-[#1a2225] px-2 py-0.5 rounded">
              ${formatPriceDesktop(token.price)}
            </span>
          </div>
          <div className="font-mono text-xs text-[#708090] truncate">
            {token.name}
          </div>
        </div>
      </div>

      {/* Center: Balance */}
      <div className="hidden md:block text-center min-w-[140px]">
        <div className="font-mono text-xs text-[#556070]">
          {formatBalance(token.balance)}{" "}
          <span className="text-[#708090]">{token.symbol}</span>
        </div>
      </div>

      {/* Right: Value + Swap */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right min-w-[100px]">
          <div className="font-mono text-base text-[#00ff41] font-bold">
            ${formatValue(token.value)}
          </div>
        </div>

        {/* Swap Button - Hidden on tablet, shown on lg+ */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => onSwapClick(token, e)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded-lg hover:bg-[#00ff41]/20 hover:border-[#00ff41]/40 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#00ff41]" />
                <span className="font-mono text-xs text-[#00ff41]">Swap</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
              <div className="font-mono text-xs text-[#708090]">
                Swap {token.symbol}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

