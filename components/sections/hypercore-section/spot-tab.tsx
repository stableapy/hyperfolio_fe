"use client"

import { TokenImage } from "@/components/sections/tokens-section/token-image"
import { formatCompactValue } from "./utils"
import type { SpotTabProps, SpotBalance } from "./types"

/**
 * Individual spot balance row component
 */
function SpotBalanceRow({ balance }: { balance: SpotBalance }) {
  const total = parseFloat(balance.total)
  const usdValue = parseFloat(balance.usdValue)
  
  return (
    <div className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Token Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TokenImage 
            src={balance.image_url || undefined} 
            symbol={balance.symbol} 
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" 
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">
              {balance.symbol}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-[#708090] bg-[#1a2225] px-1.5 py-0.5 rounded">
              {formatCompactValue(total)}
            </span>
          </div>
        </div>

        {/* Right: Value */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Hold - hidden on mobile */}
          <div className="hidden sm:block text-right">
            <div className="font-mono text-[10px] text-[#556070]">HOLD</div>
            <div className="font-mono text-xs text-[#708090]">
              {parseFloat(balance.hold).toLocaleString()}
            </div>
          </div>

          {/* Entry - hidden on mobile */}
          <div className="hidden md:block text-right">
            <div className="font-mono text-[10px] text-[#556070]">ENTRY</div>
            <div className="font-mono text-xs text-[#708090]">
              {parseFloat(balance.entryNtl).toLocaleString()}
            </div>
          </div>

          {/* USD Value */}
          <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
            ${formatCompactValue(usdValue)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Spot balances tab content
 */
export function SpotTab({ balances }: SpotTabProps) {
  const filteredBalances = balances.filter(b => parseFloat(b.total) > 0)
  
  if (filteredBalances.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="font-mono text-xs sm:text-sm text-[#708090]">NO SPOT BALANCES</div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#1a2225]">
      {filteredBalances.map((balance) => (
        <SpotBalanceRow key={balance.coin} balance={balance} />
      ))}
    </div>
  )
}

