"use client"

import { TokenImage } from "@/components/sections/tokens-section/token-image"
import { formatCompactValue } from "./utils"
import type { SpotTabProps, SpotBalance } from "./types"

/**
 * Individual spot balance row component with terminal styling
 */
function SpotBalanceRow({ balance }: { balance: SpotBalance }) {
  const total = parseFloat(balance.total)
  const usdValue = parseFloat(balance.usdValue)
  
  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group hover:bg-theme-accent/5 border-l-2 border-l-transparent hover:border-l-[#00ff41]">
      <div className="flex items-center justify-between gap-2">
        {/* Terminal Prompt */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-sm font-bold text-[#00ff41] select-none">&gt;</span>
        </div>

        {/* Left: Token Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <TokenImage 
            src={balance.image_url || undefined} 
            symbol={balance.symbol} 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 ring-1 ring-theme-border" 
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold truncate tracking-wide">
                {balance.symbol}
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-theme-text-muted bg-theme-bg/50 border border-theme-border/50 px-1 sm:px-1.5 py-0.5 rounded">
                {formatCompactValue(total)}
              </span>
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-theme-text-muted truncate opacity-70">
              {balance.name}
            </div>
          </div>
        </div>

        {/* Center: Hold & Entry - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-theme-text-muted uppercase tracking-wider">hold:</span>
            <span className="font-mono text-xs text-theme-text-secondary tabular-nums">
              {parseFloat(balance.hold).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-theme-text-muted uppercase tracking-wider">entry:</span>
            <span className="font-mono text-xs text-theme-text-secondary tabular-nums">
              {parseFloat(balance.entryNtl).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: USD Value */}
        <div className="flex items-center gap-1.5 flex-shrink-0 min-w-[70px] justify-end">
          <span className="font-mono text-[10px] text-theme-text-muted">=</span>
          <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold tabular-nums">
            ${formatCompactValue(usdValue)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Spot balances tab content with terminal styling
 */
export function SpotTab({ balances }: SpotTabProps) {
  const filteredBalances = balances.filter(b => parseFloat(b.total) > 0)
  
  if (filteredBalances.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
          NO SPOT BALANCES
        </div>
        <div className="font-mono text-xs sm:text-sm text-theme-text-muted">
          <span className="text-[#00ff41]">&gt;</span> hypercore --spot returns empty
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-theme-border/30">
      {filteredBalances.map((balance) => (
        <SpotBalanceRow key={balance.coin} balance={balance} />
      ))}
    </div>
  )
}
