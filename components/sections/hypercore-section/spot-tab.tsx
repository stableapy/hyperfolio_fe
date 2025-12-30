'use client';

import { TokenImage } from '@/components/sections/tokens-section/token-image';
import { formatCompactValue, formatPrice } from './utils';
import type { SpotTabProps, SpotBalance } from './types';

/**
 * Individual spot balance row component with terminal styling
 */
function SpotBalanceRow({
  balance,
  privacyMode,
}: {
  balance: SpotBalance;
  privacyMode?: boolean;
}) {
  const total = parseFloat(balance.total);
  const usdValue = parseFloat(balance.usdValue);
  const usdPrice = parseFloat(balance.usdPrice);

  return (
    <div className="group hover:bg-theme-accent/5 hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Terminal Prompt */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-theme-accent font-mono text-sm font-bold select-none">
            &gt;
          </span>
        </div>

        {/* Left: Token Info */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <TokenImage
            src={balance.image_url || undefined}
            symbol={balance.symbol}
            className="ring-theme-border h-7 w-7 flex-shrink-0 rounded-full ring-1 sm:h-8 sm:w-8"
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-theme-accent truncate font-mono text-xs font-bold tracking-wide sm:text-sm">
                {balance.symbol}
              </span>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px] sm:px-1.5 sm:text-[10px]">
                @{formatPrice(usdPrice)}
              </span>
            </div>
            <div className="text-theme-text-muted truncate font-mono text-[10px] opacity-70 sm:text-[11px]">
              {balance.name}
            </div>
          </div>
        </div>

        {/* Center: Hold & Entry - Hidden on mobile */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              hold:
            </span>
            <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
              {parseFloat(balance.hold).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              entry:
            </span>
            <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
              {parseFloat(balance.entryNtl).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: USD Value */}
        <div className="flex min-w-[70px] flex-shrink-0 items-center justify-end gap-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">=</span>
          <span className="text-theme-accent font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `$${formatCompactValue(usdValue)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Spot balances tab content with terminal styling
 */
export function SpotTab({ balances, privacyMode }: SpotTabProps) {
  const filteredBalances = balances.filter((b) => parseFloat(b.total) > 0);

  if (filteredBalances.length === 0) {
    return (
      <div className="py-8 text-center sm:py-12">
        <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
          NO SPOT BALANCES
        </div>
        <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
          <span className="text-theme-accent">&gt;</span> hypercore --spot
          returns empty
        </div>
      </div>
    );
  }

  return (
    <div className="divide-theme-border/30 divide-y">
      {filteredBalances.map((balance) => (
        <SpotBalanceRow
          key={balance.coin}
          balance={balance}
          privacyMode={privacyMode}
        />
      ))}
    </div>
  );
}
