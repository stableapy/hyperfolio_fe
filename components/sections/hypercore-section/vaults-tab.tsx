"use client"

import { formatCompactValue, isVaultLocked, safeParseFloat } from "./utils"
import type { VaultsTabProps, VaultDetail } from "./types"

/**
 * Individual vault row component with terminal styling
 */
function VaultRow({ vault }: { vault: VaultDetail }) {
  const isLocked = isVaultLocked(vault.lockedUntilTimestamp)
  const equity = parseFloat(vault.equity)
  const pnl = parseFloat(vault.pnl)
  const maxWithdrawable = safeParseFloat(vault.maxWithdrawable)

  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group hover:bg-theme-accent/5 border-l-2 border-l-transparent hover:border-l-[#ffaa00]">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Terminal Prompt + Vault Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-sm font-bold text-[#ffaa00] select-none flex-shrink-0">&gt;</span>
          <div className="font-mono text-xs sm:text-sm text-[#ffaa00] font-bold truncate tracking-wide">
            {vault.name}
          </div>
          {isLocked && (
            <span className="font-mono text-[9px] sm:text-[10px] bg-[#ffaa00]/10 border border-[#ffaa00]/30 text-[#ffaa00] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              locked
            </span>
          )}
          {vault.isClosed && (
            <span className="font-mono text-[9px] sm:text-[10px] bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              closed
            </span>
          )}
        </div>

        {/* Right: Equity */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[10px] text-theme-text-muted">=</span>
          <span className="font-mono text-xs sm:text-sm text-theme-text-primary font-bold tabular-nums">
            ${formatCompactValue(equity)}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 sm:gap-3 ml-5">
        {/* APR Badge */}
        <div className="flex items-center bg-theme-card-bg border border-[#ffb000]/30 rounded-sm overflow-hidden">
          <div className="px-1.5 py-1 bg-[#ffb000]/10 border-r border-[#ffb000]/20">
            <span className="font-mono text-[9px] font-bold text-[#ffb000]">%</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1">
            <span className="font-mono text-[9px] text-theme-text-muted">apr:</span>
            <span className="font-mono text-[10px] text-[#ffb000] font-bold tabular-nums">
              {vault.apr.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* P&L Badge */}
        <div 
          className={`flex items-center bg-theme-card-bg border rounded-sm overflow-hidden ${
            pnl >= 0 
              ? 'border-theme-accent/30' 
              : 'border-[#ff4444]/30'
          }`}
        >
          <div 
            className={`px-1.5 py-1 border-r ${
              pnl >= 0 
                ? 'bg-theme-accent/10 border-theme-accent/20' 
                : 'bg-[#ff4444]/10 border-[#ff4444]/20'
            }`}
          >
            <span className={`font-mono text-[9px] font-bold ${pnl >= 0 ? 'text-theme-accent' : 'text-[#ff4444]'}`}>
              {pnl >= 0 ? '+' : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1">
            <span className="font-mono text-[9px] text-theme-text-muted">pnl:</span>
            <span className={`font-mono text-[10px] font-bold tabular-nums ${pnl >= 0 ? 'text-theme-accent' : 'text-[#ff4444]'}`}>
              ${formatCompactValue(Math.abs(pnl))}
            </span>
          </div>
        </div>

        {/* Max Withdrawable - Hidden on mobile */}
        <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-theme-text-muted">
          <span className="uppercase tracking-wider">max_wd:</span>
          <span className="text-theme-text-secondary tabular-nums">${formatCompactValue(maxWithdrawable)}</span>
        </span>
      </div>
    </div>
  )
}

/**
 * Vaults tab content with terminal styling
 */
export function VaultsTab({ vaults }: VaultsTabProps) {
  if (!vaults || vaults.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
          NO VAULTS
        </div>
        <div className="font-mono text-xs sm:text-sm text-theme-text-muted">
          <span className="text-[#ffaa00]">&gt;</span> hypercore --vaults returns empty
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-theme-border/30">
      {vaults.map((vault, index) => (
        <VaultRow key={index} vault={vault} />
      ))}
    </div>
  )
}
