'use client';

import { useMemo } from 'react';
import { TokenImage } from '@/components/sections/tokens-section/token-image';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCompactValue, safeParseFloat } from './utils';
import type { PerpTabProps, PerpPositionDetail } from './types';

/**
 * Format PnL percentage for display
 */
function formatPnlPercent(percent: string): string {
  const value = parseFloat(percent);
  if (isNaN(value)) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format position size with sign indicator
 */
function formatPositionSize(size: string, isLong: boolean): string {
  const value = parseFloat(size);
  if (isNaN(value)) return '0.00';
  const prefix = isLong ? '+' : '-';
  return `${prefix}${Math.abs(value).toFixed(4)}`;
}

/**
 * Format leverage value
 */
function formatLeverage(leverage: { type: string; value: number }): string {
  if (!leverage || leverage.value === 0) return '1x';
  return `${leverage.value.toFixed(1)}x`;
}

/**
 * Individual perpetual position row component with terminal styling
 */
function PerpPositionRow({
  position,
  privacyMode,
}: {
  position: PerpPositionDetail;
  privacyMode?: boolean;
}) {
  const pos = position.position;
  const szi = safeParseFloat(pos.szi);
  const entryPrice = safeParseFloat(pos.entryPx);
  const marginUsed = safeParseFloat(pos.marginUsed || '0');
  const positionValue = safeParseFloat(pos.positionValue || '0');
  const liquidationPx = safeParseFloat(pos.liquidationPx || '0');
  const unrealizedPnl = safeParseFloat(pos.unrealizedPnl);
  const returnOnEquity = safeParseFloat(pos.returnOnEquity);
  const leverage = pos.leverage ?? { type: 'cross', value: 1 };

  const isLong = szi > 0;
  const isProfitable = unrealizedPnl >= 0;

  return (
    <div
      className={`group hover:border-l-${
        isProfitable ? 'theme-accent' : 'theme-magenta'
      } hover:bg-${isProfitable ? 'theme-accent' : 'theme-magenta'}/5 border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3`}
    >
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
            src={pos.image_url || undefined}
            symbol={pos.symbol}
            className="ring-theme-border h-7 w-7 flex-shrink-0 rounded-full ring-1 sm:h-8 sm:w-8"
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-theme-accent truncate font-mono text-xs font-bold tracking-wide sm:text-sm">
                {pos.symbol}
              </span>
              <span
                className={`${
                  isLong
                    ? 'bg-theme-green/10 text-theme-green border-theme-green/20'
                    : 'bg-theme-red/10 text-theme-red border-theme-red/20'
                } border px-1 py-0.5 font-mono text-[9px] font-bold sm:px-1.5 sm:text-[10px]`}
              >
                {isLong ? 'LONG' : 'SHORT'}
              </span>
              {pos.isHip3 && pos.dexName && (
                <span className="bg-theme-cyan/10 text-theme-cyan border-theme-cyan/20 border px-1 py-0.5 font-mono text-[9px] font-bold sm:px-1.5 sm:text-[10px]">
                  {pos.dexName}
                </span>
              )}
              <div className="flex items-center gap-0.5">
                <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
                  size:
                </span>
                <span className="text-theme-text-secondary font-mono text-[9px] font-bold tabular-nums sm:text-[10px]">
                  {formatPositionSize(pos.szi, isLong)}
                </span>
              </div>
            </div>
            <div className="text-theme-text-muted truncate font-mono text-[10px] opacity-70 sm:text-[11px]">
              {pos.name} · {formatLeverage(leverage)}
            </div>
            {/* Mobile-only: Entry, ROI & Liquidation */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 md:hidden">
              <div className="flex items-center gap-1">
                <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
                  entry:
                </span>
                <span className="text-theme-text-secondary font-mono text-[9px] tabular-nums">
                  ${entryPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
                  roi:
                </span>
                <span
                  className={`font-mono text-[9px] font-bold tabular-nums ${
                    isProfitable ? 'text-theme-accent' : 'text-theme-magenta'
                  }`}
                >
                  {privacyMode ? '•••' : formatPnlPercent(pos.returnOnEquity)}
                </span>
              </div>
              {liquidationPx > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
                    liq:
                  </span>
                  <span className="text-theme-orange font-mono text-[9px] font-bold tabular-nums">
                    ${liquidationPx.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Entry Price, ROI, Position Value, Liquidation - Hidden on mobile */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              entry:
            </span>
            <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
              $
              {entryPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              roi:
            </span>
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                isProfitable ? 'text-theme-accent' : 'text-theme-magenta'
              }`}
            >
              {privacyMode ? '•••' : formatPnlPercent(pos.returnOnEquity)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              pos:
            </span>
            <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
              {privacyMode ? '•••' : `$${formatCompactValue(positionValue)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[9px] tracking-wider uppercase">
              liq:
            </span>
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                liquidationPx > 0 ? 'text-theme-orange' : 'text-theme-text-muted'
              }`}
            >
              {privacyMode
                ? '•••'
                : liquidationPx > 0
                  ? `$${liquidationPx.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : 'N/A'}
            </span>
          </div>
        </div>

        {/* Right: Position Value, Margin Used, Unrealized PnL */}
        <div className="flex min-w-[100px] flex-shrink-0 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[10px]">
              pos:
            </span>
            <span className="text-theme-accent font-mono text-xs font-bold tabular-nums sm:text-sm">
              {privacyMode ? '•••' : `$${formatCompactValue(positionValue)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[10px]">
              margin:
            </span>
            <span className="text-theme-text-secondary font-mono text-[10px] font-bold tabular-nums sm:text-xs">
              {privacyMode ? '•••' : `$${formatCompactValue(marginUsed)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-theme-text-muted font-mono text-[10px]">
              pnl:
            </span>
            <span
              className={`font-mono text-[10px] font-bold tabular-nums sm:text-[11px] ${
                isProfitable ? 'text-theme-accent' : 'text-theme-magenta'
              }`}
            >
              {privacyMode
                ? '•••'
                : `${isProfitable ? '+' : ''}$${unrealizedPnl.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Perpetual positions tab content with terminal styling
 */
export function PerpTab({
  positions = [],
  marginBalance = '0',
  privacyMode = false,
}: PerpTabProps) {
  const margin = safeParseFloat(marginBalance);

  // Filter to only show positions with non-zero size (memoized to avoid re-filtering on every render)
  const activePositions = useMemo(
    () =>
      positions.filter(
        (pos: PerpPositionDetail) => parseFloat(pos.position.szi) !== 0
      ),
    [positions]
  );

  if (activePositions.length === 0) {
    return (
      <div className="py-8 text-center sm:py-12">
        <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
          NO PERP POSITIONS
        </div>
        <div className="text-theme-text-muted mb-4 font-mono text-xs sm:text-sm">
          <span className="text-theme-cyan">&gt;</span> hypercore --perp returns
          empty
        </div>

        {/* Margin Balance - Terminal style badge */}
        <div className="bg-theme-card-bg border-theme-border/70 inline-flex items-center overflow-hidden rounded-sm border">
          <div className="bg-theme-cyan/10 border-theme-cyan/20 border-r px-2 py-1.5">
            <span className="text-theme-cyan font-mono text-[10px] font-bold sm:text-xs">
              $
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <span className="text-theme-text-muted font-mono text-[10px]">
              available margin
            </span>
            {!privacyMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-theme-cyan font-mono text-xs font-bold tabular-nums focus:ring-theme-accent focus:ring-2 focus:ring-offset-2 focus:outline-none sm:text-sm"
                    aria-describedby="tooltip-content"
                  >
                    ${margin.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-theme-bg border-theme-border max-w-xs border p-3"
                  role="tooltip"
                  id="tooltip-content"
                >
                  <div className="space-y-1">
                    <div className="text-theme-accent font-mono text-xs font-bold">
                      <span className="text-theme-accent">&gt;</span> hypercore --margin
                    </div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      Free cash available for trading
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {privacyMode && (
              <span className="text-theme-cyan font-mono text-xs font-bold tabular-nums sm:text-sm">
                •••
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-theme-border/30 divide-y">
      {/* Margin Balance Header - Terminal style badge */}
      <div className="bg-theme-bg/30 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="bg-theme-card-bg border-theme-border/70 inline-flex items-center overflow-hidden rounded-sm border">
          <div className="bg-theme-cyan/10 border-theme-cyan/20 border-r px-2 py-1.5">
            <span className="text-theme-cyan font-mono text-[10px] font-bold sm:text-xs">
              $
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <span className="text-theme-text-muted font-mono text-[10px]">
              available margin
            </span>
            {!privacyMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-theme-cyan font-mono text-xs font-bold tabular-nums focus:ring-theme-accent focus:ring-2 focus:ring-offset-2 focus:outline-none sm:text-sm"
                    aria-describedby="tooltip-content"
                  >
                    ${margin.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-theme-bg border-theme-border max-w-xs border p-3"
                  role="tooltip"
                  id="tooltip-content"
                >
                  <div className="space-y-1">
                    <div className="text-theme-accent font-mono text-xs font-bold">
                      <span className="text-theme-accent">&gt;</span> hypercore --margin
                    </div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      Free cash available for trading
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {privacyMode && (
              <span className="text-theme-cyan font-mono text-xs font-bold tabular-nums sm:text-sm">
                •••
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Position Rows */}
      {activePositions.map((position: PerpPositionDetail) => (
        <PerpPositionRow
          key={`${position.position.coin}-${position.position.entryPx}`}
          position={position}
          privacyMode={privacyMode}
        />
      ))}
    </div>
  );
}
