'use client';

import { TrendingUp, ChevronDown } from 'lucide-react';
import { TerminalCard } from '@/components/ui/terminal-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PositionItem } from './position-item';
import { TYPE_LABELS, TYPE_COLORS, type PositionType } from './constants';
import type { ProtocolCardProps } from './types';
import { formatPercentage } from '@/lib/utils/formatters';

/**
 * Expandable protocol card component showing grouped positions
 * Terminal-style layout with prompt indicators
 */
export function ProtocolCard({
  protocol,
  isExpanded,
  onToggle,
  selectedWalletId,
  privacyMode,
  totalPortfolioUSD,
}: ProtocolCardProps) {
  return (
    <TerminalCard className="hover:border-theme-accent/30 transition-all duration-150">
      {/* Protocol Header */}
      <button
        type="button"
        className="hover:border-l-theme-accent w-full border-l-2 border-l-transparent px-2.5 py-2 text-left transition-all duration-150 sm:px-3 sm:py-2.5"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Terminal prompt + Protocol info */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {/* Terminal Prompt */}
            <span className="text-theme-accent flex-shrink-0 font-mono text-sm font-bold select-none">
              &gt;
            </span>

            <img
              src={protocol.logo || '/placeholder.svg'}
              alt={protocol.name}
              className="ring-theme-border h-6 w-6 flex-shrink-0 rounded ring-1 sm:h-7 sm:w-7"
            />
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <a
                href={protocol.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-theme-accent truncate font-mono text-xs font-bold tracking-wide hover:opacity-80 sm:text-sm"
              >
                {protocol.name}
              </a>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px] sm:px-1.5 sm:text-[10px]">
                [{protocol.positions.length}]
              </span>
            </div>
          </div>

          {/* Right: Value + APY + Chevron */}
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {/* Protocol-level APY Badge */}
            {protocol.stats?.weightedApyPercent &&
              protocol.stats.weightedApyPercent > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="bg-theme-accent/10 border-theme-accent/20 flex items-center gap-1 rounded border px-1.5 py-0.5 sm:px-2 sm:py-1">
                        <TrendingUp className="text-theme-accent h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="text-theme-accent font-mono text-[10px] tabular-nums sm:text-xs">
                          {formatPercentage(protocol.stats.weightedApyPercent)}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-theme-bg border-theme-border border p-3">
                      <div className="space-y-1 font-mono text-xs">
                        <div className="text-theme-accent mb-2 font-bold">
                          <span className="text-theme-accent">&gt;</span> yield
                          --estimate
                        </div>
                        {protocol.stats.estimatedYield && (
                          <>
                            <div className="flex justify-between gap-4">
                              <span className="text-theme-text-muted">
                                daily:
                              </span>
                              <span className="text-theme-text-primary tabular-nums">
                                ${protocol.stats.estimatedYield.daily}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-theme-text-muted">
                                weekly:
                              </span>
                              <span className="text-theme-text-primary tabular-nums">
                                ${protocol.stats.estimatedYield.weekly}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-theme-text-muted">
                                monthly:
                              </span>
                              <span className="text-theme-text-primary tabular-nums">
                                ${protocol.stats.estimatedYield.monthly}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

            {/* Value - terminal style */}
            <div className="flex min-w-[60px] items-center justify-end gap-1">
              <span className="text-theme-text-muted font-mono text-[10px]">
                =
              </span>
              <span className="text-theme-accent font-mono text-xs font-bold tabular-nums sm:text-sm">
                {privacyMode
                  ? totalPortfolioUSD > 0
                    ? formatPercentage(
                        (protocol.totalValue / totalPortfolioUSD) * 100
                      )
                    : formatPercentage(0)
                  : protocol.totalValue >= 1000
                    ? `$${(protocol.totalValue / 1000).toFixed(1)}K`
                    : `$${protocol.totalValue.toFixed(2)}`}
              </span>
            </div>

            <ChevronDown
              className={`text-theme-text-muted h-3.5 w-3.5 transition-transform duration-150 sm:h-4 sm:w-4 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Positions List - Grouped by Type */}
      {isExpanded && (
        <div className="border-theme-border/50 border-t px-2 pt-2 pb-2 sm:px-3 sm:pb-3">
          {/* Group positions by type */}
          {(() => {
            const positionsByType = protocol.positions.reduce(
              (acc, pos) => {
                if (!acc[pos.type]) acc[pos.type] = [];
                acc[pos.type].push(pos);
                return acc;
              },
              {} as Record<string, typeof protocol.positions>
            );

            return Object.entries(positionsByType).map(
              ([type, typePositions]) => (
                <div key={type} className="mb-2 last:mb-0">
                  {/* Type Header - shown once per type, terminal style */}
                  <div className="mb-1 ml-4 flex items-center gap-1.5 py-1 sm:ml-5">
                    <span className="text-theme-text-muted font-mono text-[9px]">
                      #
                    </span>
                    <span
                      className="font-mono text-[9px] tracking-wider uppercase sm:text-[10px]"
                      style={{ color: TYPE_COLORS[type as PositionType] }}
                    >
                      {TYPE_LABELS[type as PositionType]}
                    </span>
                    {typePositions.length > 1 && (
                      <span className="text-theme-text-muted font-mono text-[9px] sm:text-[10px]">
                        [{typePositions.length}]
                      </span>
                    )}
                  </div>

                  {/* Positions under this type */}
                  {typePositions.map((position) => (
                    <PositionItem
                      key={position.id}
                      position={position}
                      showWalletIndicator={!selectedWalletId}
                      privacyMode={privacyMode}
                      totalPortfolioUSD={totalPortfolioUSD}
                    />
                  ))}
                </div>
              )
            );
          })()}
        </div>
      )}
    </TerminalCard>
  );
}
