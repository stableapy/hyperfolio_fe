'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PointImage } from './point-image';
import type { PointsRowProps, PointsRowMobileProps } from './types';

function formatCompactValue(value: number): string {
  if (value === 0) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(2);
}

export function PointsRow({
  point,
  selectedWalletId,
  privacyMode,
}: PointsRowProps) {
  const isGroupedView = !selectedWalletId;
  const showWalletInfo = isGroupedView && point.walletColor;

  const displayPoints = formatCompactValue(point.points);

  return (
    <div className="hidden items-center justify-between gap-3 sm:flex">
      {/* Terminal Prompt */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="text-theme-accent font-mono text-sm font-bold select-none">
          &gt;
        </span>
      </div>

      {/* Left: Protocol Info with icon */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative">
          <PointImage
            protocolName={point.protocolName}
            className="ring-theme-border h-9 w-9 flex-shrink-0 rounded-full ring-1"
          />
          {showWalletInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="border-theme-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2"
                    style={{ backgroundColor: point.walletColor }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                  <div className="font-mono text-xs">
                    <span className="text-theme-text-secondary">wallet: </span>
                    <span style={{ color: point.walletColor }}>
                      {point.walletName}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-theme-accent hover:text-theme-accent/80 truncate font-mono text-sm font-bold tracking-wide transition-colors">
              {point.protocolName}
            </span>
          </div>
          {showWalletInfo && (
            <div className="text-theme-text-muted truncate font-mono text-[11px] opacity-70">
              {point.walletName ||
                (point.walletAddress &&
                  `${point.walletAddress.slice(0, 6)}...${point.walletAddress.slice(-4)}`)}
            </div>
          )}
        </div>
      </div>

      {/* Center: Protocol - Terminal style */}
      <div className="hidden min-w-[160px] items-center gap-1.5 text-center md:flex">
        <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
          pts
        </span>
      </div>

      {/* Right: Points Value */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="flex min-w-[110px] items-center justify-end gap-1.5">
          <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
            {privacyMode ? '••••' : '='}
          </span>
          <span className="text-theme-accent font-mono text-sm font-bold tracking-tight tabular-nums">
            {privacyMode ? '••••' : displayPoints}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PointsRowMobile({
  point,
  selectedWalletId,
  privacyMode,
}: PointsRowMobileProps) {
  const isGroupedView = !selectedWalletId;
  const showWalletInfo = isGroupedView && point.walletColor;

  const displayPoints = formatCompactValue(point.points);

  return (
    <div className="flex items-center gap-2.5 sm:hidden">
      <span className="text-theme-accent flex-shrink-0 font-mono text-sm font-bold select-none">
        &gt;
      </span>

      <div className="relative flex-shrink-0">
        <PointImage
          protocolName={point.protocolName}
          className="ring-theme-border h-9 w-9 rounded-full ring-1"
        />
        {showWalletInfo && (
          <div
            className="border-theme-bg absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2"
            style={{ backgroundColor: point.walletColor }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-theme-accent hover:text-theme-accent/80 cursor-pointer truncate font-mono text-sm font-bold tracking-wide transition-colors">
            {point.protocolName}
          </span>
        </div>
        {showWalletInfo && (
          <div className="text-theme-text-muted truncate font-mono text-[10px] opacity-70">
            {point.walletName ||
              (point.walletAddress &&
                `${point.walletAddress.slice(0, 6)}...${point.walletAddress.slice(-4)}`)}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 text-right">
        <span className="text-theme-text-muted font-mono text-[10px]">
          {privacyMode ? '•••' : '='}
        </span>
        <span className="text-theme-accent font-mono text-sm font-bold tabular-nums">
          {privacyMode ? '••••' : displayPoints}
        </span>
      </div>
    </div>
  );
}
