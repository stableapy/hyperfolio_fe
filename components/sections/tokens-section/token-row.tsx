"use client"

import { ArrowRightLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenImage } from "./token-image"
import { formatPriceDesktop, formatValue, formatBalance } from "./utils"
import type { TokenRowProps } from "./types"

/**
 * Desktop layout for token row (>= sm breakpoint)
 * Terminal-style layout with prompt indicator, wallet dot and swap button
 */
export function TokenRow({ 
  token, 
  selectedWalletId, 
  isGrouped,
  onSwapClick 
}: TokenRowProps) {
  return (
    <div className="hidden sm:flex items-center justify-between gap-3">
      {/* Terminal Prompt */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono text-sm font-bold text-theme-accent select-none">&gt;</span>
      </div>

      {/* Left: Token Info with icon */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <TokenImage 
            src={token.logo} 
            symbol={token.symbol} 
            className="w-9 h-9 rounded-full flex-shrink-0 ring-1 ring-theme-border" 
          />
          {/* Wallet indicator dot with tooltip */}
          {!selectedWalletId && !isGrouped && token.walletColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-theme-bg"
                    style={{ backgroundColor: token.walletColor }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border border-theme-border p-2">
                  <div className="font-mono text-xs">
                    <span className="text-theme-text-secondary">wallet: </span>
                    <span style={{ color: token.walletColor }}>{token.walletName}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-theme-accent font-bold truncate tracking-wide">
              {token.symbol}
            </span>
            <span className="font-mono text-[10px] text-theme-text-muted bg-theme-bg/50 border border-theme-border/50 px-1.5 py-0.5 rounded">
              @${formatPriceDesktop(token.price)}
            </span>
          </div>
          <div className="font-mono text-[11px] text-theme-text-muted truncate opacity-70">
            {token.name}
          </div>
        </div>
      </div>

      {/* Center: Balance - Terminal style */}
      <div className="hidden md:flex items-center gap-1.5 text-center min-w-[160px]">
        <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">bal:</span>
        <span className="font-mono text-xs text-theme-text-secondary tabular-nums">
          {formatBalance(token.balance)}
        </span>
        <span className="font-mono text-[10px] text-theme-cyan/70">{token.symbol}</span>
      </div>

      {/* Right: Value + Swap */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Value display - terminal style */}
        <div className="flex items-center gap-1.5 min-w-[110px] justify-end">
          <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">=</span>
          <span className="font-mono text-sm text-theme-accent font-bold tabular-nums tracking-tight">
            ${formatValue(token.value)}
          </span>
        </div>

        {/* Swap Button - Hidden on tablet, shown on lg+ */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => onSwapClick(token, e)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-transparent border border-theme-accent/30 rounded hover:bg-theme-accent/10 hover:border-theme-accent/50 transition-all duration-150 group/swap"
              >
                <ArrowRightLeft className="w-3 h-3 text-theme-accent/70 group-hover/swap:text-theme-accent transition-colors" />
                <span className="font-mono text-[11px] text-theme-accent/70 group-hover/swap:text-theme-accent uppercase tracking-wider transition-colors">swap</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-theme-bg border border-theme-border p-2">
              <div className="font-mono text-xs text-theme-text-secondary">
                <span className="text-theme-accent">&gt;</span> swap --from {token.symbol}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

