'use client';

import { formatCompactValue, isVaultLocked, safeParseFloat } from './utils';
import type { VaultsTabProps, VaultDetail } from './types';

/**
 * Individual vault row component with terminal styling
 */
function VaultRow({
  vault,
  privacyMode,
}: {
  vault: VaultDetail;
  privacyMode?: boolean;
}) {
  const isLocked = isVaultLocked(vault.lockedUntilTimestamp);
  const equity = parseFloat(vault.equity);
  const pnl = parseFloat(vault.pnl);
  const maxWithdrawable = safeParseFloat(vault.maxWithdrawable);

  return (
    <div className="group hover:bg-theme-accent/5 hover:border-l-theme-orange border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3">
      {/* Header Row */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {/* Terminal Prompt + Vault Name */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-theme-orange flex-shrink-0 font-mono text-sm font-bold select-none">
            &gt;
          </span>
          <div className="text-theme-orange truncate font-mono text-xs font-bold tracking-wide sm:text-sm">
            {vault.name}
          </div>
          {isLocked && (
            <span className="bg-theme-orange/10 border-theme-orange/30 text-theme-orange rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              locked
            </span>
          )}
          {vault.isClosed && (
            <span className="bg-theme-red/10 border-theme-red/30 text-theme-red rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              closed
            </span>
          )}
        </div>

        {/* Right: Equity */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">=</span>
          <span className="text-theme-text-primary font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `$${formatCompactValue(equity)}`}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="ml-5 flex items-center gap-2 sm:gap-3">
        {/* APR Badge */}
        <div className="bg-theme-card-bg border-theme-cyan/30 flex items-center overflow-hidden rounded-sm border">
          <div className="bg-theme-cyan/10 border-theme-cyan/20 border-r px-1.5 py-1">
            <span className="text-theme-cyan font-mono text-[9px] font-bold">
              %
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1">
            <span className="text-theme-text-muted font-mono text-[9px]">
              apr:
            </span>
            <span className="text-theme-cyan font-mono text-[10px] font-bold tabular-nums">
              {vault.apr.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* P&L Badge */}
        <div
          className={`bg-theme-card-bg flex items-center overflow-hidden rounded-sm border ${
            pnl >= 0 ? 'border-theme-accent/30' : 'border-theme-red/30'
          }`}
        >
          <div
            className={`border-r px-1.5 py-1 ${
              pnl >= 0
                ? 'bg-theme-accent/10 border-theme-accent/20'
                : 'bg-theme-red/10 border-theme-red/20'
            }`}
          >
            <span
              className={`font-mono text-[9px] font-bold ${pnl >= 0 ? 'text-theme-accent' : 'text-theme-red'}`}
            >
              {pnl >= 0 ? '+' : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1">
            <span className="text-theme-text-muted font-mono text-[9px]">
              pnl:
            </span>
            <span
              className={`font-mono text-[10px] font-bold tabular-nums ${pnl >= 0 ? 'text-theme-accent' : 'text-theme-red'}`}
            >
              {privacyMode ? '•••' : `$${formatCompactValue(Math.abs(pnl))}`}
            </span>
          </div>
        </div>

        {/* Max Withdrawable - Hidden on mobile */}
        <span className="text-theme-text-muted hidden items-center gap-1.5 font-mono text-[10px] sm:flex">
          <span className="tracking-wider uppercase">max_wd:</span>
          <span className="text-theme-text-secondary tabular-nums">
            {privacyMode ? '•••' : `$${formatCompactValue(maxWithdrawable)}`}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Vaults tab content with terminal styling
 */
export function VaultsTab({ vaults, privacyMode }: VaultsTabProps) {
  if (!vaults || vaults.length === 0) {
    return (
      <div className="py-8 text-center sm:py-12">
        <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
          NO VAULTS
        </div>
        <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
          <span className="text-theme-orange">&gt;</span> hypercore --vaults
          returns empty
        </div>
      </div>
    );
  }

  return (
    <div className="divide-theme-border/30 divide-y">
      {vaults.map((vault, index) => (
        <VaultRow key={index} vault={vault} privacyMode={privacyMode} />
      ))}
    </div>
  );
}
