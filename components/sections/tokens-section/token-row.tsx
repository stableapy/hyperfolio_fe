'use client';

import { ArrowRightLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TokenImage } from './token-image';
import {
  formatPriceDesktop,
  formatValue,
  formatBalance,
  formatPercentage,
} from './utils';
import type { TokenRowProps } from './types';

/**
 * Desktop layout for token row (>= sm breakpoint)
 * Terminal-style layout with prompt indicator, wallet dot and swap button
 */
export function TokenRow({
  token,
  selectedWalletId,
  isGrouped,
  privacyMode,
  totalValue,
  onSwapClick,
}: TokenRowProps) {
  // Calculate percentage when privacy mode is enabled
  const percentage = totalValue > 0 ? (token.value / totalValue) * 100 : 0;
  const displayValue = privacyMode
    ? formatPercentage(percentage)
    : `$${formatValue(token.value)}`;

  return (
    <div className="hidden items-center justify-between gap-3 sm:flex">
      {/* Terminal Prompt */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="text-theme-accent font-mono text-sm font-bold select-none">
          &gt;
        </span>
      </div>

      {/* Left: Token Info with icon */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative">
          <TokenImage
            src={token.logo}
            symbol={token.symbol}
            className="ring-theme-border h-9 w-9 flex-shrink-0 rounded-full ring-1"
          />
          {/* Wallet indicator dot with tooltip */}
          {!selectedWalletId && !isGrouped && token.walletColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="border-theme-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2"
                    style={{ backgroundColor: token.walletColor }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                  <div className="font-mono text-xs">
                    <span className="text-theme-text-secondary">wallet: </span>
                    <span style={{ color: token.walletColor }}>
                      {token.walletName}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <a
              href={`https://hyperevmscan.io/address/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-accent hover:text-theme-accent/80 truncate font-mono text-sm font-bold tracking-wide transition-colors hover:underline"
            >
              {token.symbol}
            </a>
            <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1.5 py-0.5 font-mono text-[10px]">
              @${formatPriceDesktop(token.price)}
            </span>
          </div>
          <div className="text-theme-text-muted truncate font-mono text-[11px] opacity-70">
            {token.name}
          </div>
        </div>
      </div>

      {/* Center: Balance - Terminal style */}
      <div className="hidden min-w-[160px] items-center gap-1.5 text-center md:flex">
        <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
          bal:
        </span>
        <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
          {formatBalance(token.balance)}
        </span>
        <span className="text-theme-cyan/70 font-mono text-[10px]">
          {token.symbol}
        </span>
      </div>

      {/* Right: Value + Swap */}
      <div className="flex flex-shrink-0 items-center gap-3">
        {/* Value display - terminal style */}
        <div className="flex min-w-[110px] items-center justify-end gap-1.5">
          <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
            =
          </span>
          <span className="text-theme-accent font-mono text-sm font-bold tracking-tight tabular-nums">
            {displayValue}
          </span>
        </div>

        {/* Swap Button - Hidden on tablet, shown on lg+ */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => onSwapClick(token, e)}
                className="border-theme-accent/30 hover:bg-theme-accent/10 hover:border-theme-accent/50 group/swap hidden items-center gap-1.5 rounded border bg-transparent px-2.5 py-1.5 transition-all duration-150 lg:flex"
              >
                <ArrowRightLeft className="text-theme-accent/70 group-hover/swap:text-theme-accent h-3 w-3 transition-colors" />
                <span className="text-theme-accent/70 group-hover/swap:text-theme-accent font-mono text-[11px] tracking-wider uppercase transition-colors">
                  swap
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-theme-bg border-theme-border border p-2">
              <div className="text-theme-text-secondary font-mono text-xs">
                <span className="text-theme-accent">&gt;</span> swap --from{' '}
                {token.symbol}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
