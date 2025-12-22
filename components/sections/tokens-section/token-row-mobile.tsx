"use client"

import { TokenImage } from "./token-image"
import { formatPrice, formatValue, formatBalance } from "./utils"
import type { TokenRowMobileProps } from "./types"

/**
 * Mobile layout for token row (< sm breakpoint)
 * Compact horizontal layout with value on right
 */
export function TokenRowMobile({ 
  token, 
  selectedWalletId, 
  isGrouped 
}: TokenRowMobileProps) {
  return (
    <div className="flex sm:hidden items-center gap-3">
      {/* Token Icon */}
      <div className="relative">
        <TokenImage 
          src={token.logo} 
          symbol={token.symbol} 
          className="w-10 h-10 rounded-full flex-shrink-0" 
        />
        {/* Wallet indicator dot */}
        {!selectedWalletId && !isGrouped && token.walletColor && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0e0f]"
            style={{ backgroundColor: token.walletColor }}
          />
        )}
      </div>
      
      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm text-[#00ff41] font-bold truncate">
            {token.symbol}
          </span>
          <span className="font-mono text-[10px] text-[#708090] bg-[#1a2225] px-1.5 py-0.5 rounded">
            ${formatPrice(token.price)}
          </span>
        </div>
        <div className="font-mono text-[11px] text-[#708090] truncate">
          {token.name}
        </div>
        <div className="font-mono text-[10px] text-[#556070] mt-0.5">
          {formatBalance(token.balance)} {token.symbol}
        </div>
      </div>
      
      {/* Value - Right aligned */}
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-sm text-[#00ff41] font-bold">
          ${formatValue(token.value)}
        </div>
      </div>
    </div>
  )
}

