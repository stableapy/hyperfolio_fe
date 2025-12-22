"use client"

import { formatCompactValue, isVaultLocked, safeParseFloat } from "./utils"
import type { VaultsTabProps, VaultDetail } from "./types"

/**
 * Individual vault row component
 */
function VaultRow({ vault }: { vault: VaultDetail }) {
  const isLocked = isVaultLocked(vault.lockedUntilTimestamp)
  const equity = parseFloat(vault.equity)
  const pnl = parseFloat(vault.pnl)
  const maxWithdrawable = safeParseFloat(vault.maxWithdrawable)

  return (
    <div className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Left: Vault Name */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">
            {vault.name}
          </div>
          {isLocked && (
            <span className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-[#ffaa00]/20 text-[#ffaa00]">
              LOCK
            </span>
          )}
          {vault.isClosed && (
            <span className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-red-500/20 text-red-400">
              CLOSED
            </span>
          )}
        </div>

        {/* Right: Equity */}
        <div className="font-mono text-xs sm:text-sm text-white font-bold flex-shrink-0">
          ${formatCompactValue(equity)}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* APR */}
        <span className="px-1.5 py-0.5 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded flex items-center gap-1">
          <span className="font-mono text-[10px] text-[#00d9ff]">
            {vault.apr.toFixed(1)}% APR
          </span>
        </span>

        {/* P&L */}
        <span 
          className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
            pnl >= 0 
              ? 'bg-[#00ff41]/10 border border-[#00ff41]/20' 
              : 'bg-[#ff4444]/10 border border-[#ff4444]/20'
          }`}
        >
          <span className={`font-mono text-[10px] ${pnl >= 0 ? 'text-[#00ff41]' : 'text-[#ff4444]'}`}>
            {pnl >= 0 ? '+' : ''}${formatCompactValue(Math.abs(pnl))}
          </span>
        </span>

        {/* Max WD - hidden on mobile */}
        <span className="hidden sm:inline font-mono text-[10px] text-[#708090]">
          Max: ${formatCompactValue(maxWithdrawable)}
        </span>
      </div>
    </div>
  )
}

/**
 * Vaults tab content
 */
export function VaultsTab({ vaults }: VaultsTabProps) {
  if (!vaults || vaults.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="font-mono text-xs sm:text-sm text-[#708090]">NO VAULTS</div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#1a2225]">
      {vaults.map((vault, index) => (
        <VaultRow key={index} vault={vault} />
      ))}
    </div>
  )
}

