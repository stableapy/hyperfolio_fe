"use client"

import { TokenImage } from "./token-image"
import { formatPrice, formatValue, formatBalance } from "./utils"
import type { TokenRowMobileProps } from "./types"

/**
 * Mobile layout for token row (< sm breakpoint)
 * Terminal-style compact layout with prompt indicator
 */
export function TokenRowMobile({ 
  token, 
  selectedWalletId, 
  isGrouped 
}: TokenRowMobileProps) {
  return (
    <div className="flex sm:hidden items-center gap-2.5">
      {/* Terminal Prompt */}
      <span className="font-mono text-sm font-bold text-theme-accent select-none flex-shrink-0">&gt;</span>
      
      {/* Token Icon */}
      <div className="relative flex-shrink-0">
        <TokenImage 
          src={token.logo} 
          symbol={token.symbol} 
          className="w-9 h-9 rounded-full ring-1 ring-theme-border" 
        />
        {/* Wallet indicator dot */}
        {!selectedWalletId && !isGrouped && token.walletColor && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-theme-bg"
            style={{ backgroundColor: token.walletColor }}
          />
        )}
      </div>
      
      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm text-theme-accent font-bold truncate tracking-wide">
            {token.symbol}
          </span>
          <span className="font-mono text-[9px] text-theme-text-muted bg-theme-bg/50 border border-theme-border/50 px-1 py-0.5 rounded">
            @${formatPrice(token.price)}
          </span>
        </div>
        <div className="font-mono text-[10px] text-theme-text-muted truncate opacity-70">
          {token.name}
        </div>
        <div className="font-mono text-[9px] text-theme-text-secondary mt-0.5 flex items-center gap-1">
          <span className="text-theme-text-muted">bal:</span>
          <span className="tabular-nums">{formatBalance(token.balance)}</span>
          <span className="text-[#00d9ff]/60">{token.symbol}</span>
        </div>
      </div>
      
      {/* Value - Right aligned, terminal style */}
      <div className="text-right flex-shrink-0 flex items-center gap-1">
        <span className="font-mono text-[10px] text-theme-text-muted">=</span>
        <span className="font-mono text-sm text-theme-accent font-bold tabular-nums">
          ${formatValue(token.value)}
        </span>
      </div>
    </div>
  )
}

