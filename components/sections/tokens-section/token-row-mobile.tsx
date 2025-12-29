'use client';

import { TokenImage } from './token-image';
import {
  formatPrice,
  formatValue,
  formatBalance,
  formatPercentage,
} from './utils';
import type { TokenRowMobileProps } from './types';

/**
 * Mobile layout for token row (< sm breakpoint)
 * Terminal-style compact layout with prompt indicator
 */
export function TokenRowMobile({
  token,
  selectedWalletId,
  isGrouped,
  privacyMode,
  totalValue,
}: TokenRowMobileProps) {
  // Calculate percentage when privacy mode is enabled
  const percentage = totalValue > 0 ? (token.value / totalValue) * 100 : 0;
  const displayValue = privacyMode
    ? formatPercentage(percentage)
    : `$${formatValue(token.value)}`;

  return (
    <div className="flex items-center gap-2.5 sm:hidden">
      {/* Terminal Prompt */}
      <span className="text-theme-accent flex-shrink-0 font-mono text-sm font-bold select-none">
        &gt;
      </span>

      {/* Token Icon */}
      <div className="relative flex-shrink-0">
        <TokenImage
          src={token.logo}
          symbol={token.symbol}
          className="ring-theme-border h-9 w-9 rounded-full ring-1"
        />
        {/* Wallet indicator dot */}
        {!selectedWalletId && !isGrouped && token.walletColor && (
          <div
            className="border-theme-bg absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2"
            style={{ backgroundColor: token.walletColor }}
          />
        )}
      </div>

      {/* Token Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <a
            href={`https://hyperevmscan.io/address/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-accent hover:text-theme-accent/80 truncate font-mono text-sm font-bold tracking-wide transition-colors hover:underline"
          >
            {token.symbol}
          </a>
          <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px]">
            @${formatPrice(token.price)}
          </span>
        </div>
        <div className="text-theme-text-muted truncate font-mono text-[10px] opacity-70">
          {token.name}
        </div>
        <div className="text-theme-text-secondary mt-0.5 flex items-center gap-1 font-mono text-[9px]">
          <span className="text-theme-text-muted">bal:</span>
          <span className="tabular-nums">{formatBalance(token.balance)}</span>
          <span className="text-theme-cyan/60">{token.symbol}</span>
        </div>
      </div>

      {/* Value - Right aligned, terminal style */}
      <div className="flex flex-shrink-0 items-center gap-1 text-right">
        <span className="text-theme-text-muted font-mono text-[10px]">=</span>
        <span className="text-theme-accent font-mono text-sm font-bold tabular-nums">
          {displayValue}
        </span>
      </div>
    </div>
  );
}
