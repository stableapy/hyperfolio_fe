'use client';

import { ExternalLink, TrendingUp } from 'lucide-react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProtocolLogo } from './protocol-logo';
import type { YieldDisplayItem } from './types';
import {
  formatApyDisplay,
  formatApyPercentage,
  getProtocolLogoPath,
} from './utils';
import { useMemo } from 'react';

interface YieldGridCardProps {
  opportunity: YieldDisplayItem;
}

/**
 * Formats TVL for display in grid cards
 */
function formatTvlCompact(tvlUsd?: number): string | null {
  if (!tvlUsd || tvlUsd <= 0) return null;
  if (tvlUsd >= 1_000_000) {
    return `$${(tvlUsd / 1_000_000).toFixed(2)}M`;
  } else if (tvlUsd >= 1_000) {
    return `$${(tvlUsd / 1_000).toFixed(1)}K`;
  }
  return `$${tvlUsd.toFixed(0)}`;
}

/**
 * Gets primary APY value from an APY object
 */
function getApyValue(apy?: { baseApy?: number; totalApy?: number }): number {
  if (!apy) return 0;
  return apy.totalApy ?? apy.baseApy ?? 0;
}

/**
 * Formats the token display based on pool type
 */
function getTokenDisplay(item: YieldDisplayItem): {
  symbol: string;
  tooltip?: string;
} {
  const { pool, category, metadata } = item;

  // AMM pools: show token pair
  if (category === 'amm' && pool.token0 && pool.token1) {
    const pairSymbol = `${pool.token0.symbol}/${pool.token1.symbol}`;
    const tooltip = `${pool.token0.name} / ${pool.token1.name}`;
    return { symbol: pairSymbol, tooltip };
  }

  // Derivatives: show underlying + collateral if both exist
  if (category === 'derivatives' && pool.collateralToken) {
    const underlying = pool.underlyingToken?.symbol || 'Asset';
    const collateral = pool.collateralToken.symbol;
    const symbol = `${underlying} / ${collateral}`;
    const tooltip = pool.underlyingToken
      ? `${pool.underlyingToken.name} settled in ${pool.collateralToken.name}`
      : `Settled in ${pool.collateralToken.name}`;
    return { symbol, tooltip };
  }

  // Single-asset positions: use underlyingToken if available
  if (pool.underlyingToken) {
    return {
      symbol: pool.underlyingToken.symbol,
      tooltip: pool.underlyingToken.name,
    };
  }

  // Fallback to legacy fields
  const symbol = metadata.underlyingSymbol || pool.symbol || 'Unknown';
  return { symbol };
}

/**
 * YieldGridCard Component
 * Displays individual yield opportunity in card format for grid view
 * Terminal-inspired aesthetic with hover effects
 */
export function YieldGridCard({ opportunity }: YieldGridCardProps) {
  const tokenDisplay = useMemo(() => getTokenDisplay(opportunity), [opportunity]);
  const logoPath = useMemo(() => getProtocolLogoPath(opportunity.protocol.name), [opportunity.protocol.name]);
  const apyValue = useMemo(
    () => getApyValue(opportunity.apy),
    [opportunity.apy]
  );
  const tvl = useMemo(
    () => formatTvlCompact(opportunity.pool.tvlUsd || opportunity.pool.liquidityUsd),
    [opportunity.pool.tvlUsd, opportunity.pool.liquidityUsd]
  );
  const apyDisplay = useMemo(
    () => formatApyDisplay(opportunity.apy.baseApy, opportunity.apy.totalApy),
    [opportunity.apy.baseApy, opportunity.apy.totalApy]
  );

  return (
    <TerminalCard className="group hover:border-theme-accent transition-all">
      <div className="p-4">
        {/* Header: Protocol + Logo */}
        <div className="flex items-center gap-3 mb-4">
          <ProtocolLogo
            src={logoPath}
            name={opportunity.protocol.name}
            className="h-10 w-10 flex-shrink-0"
          />
          <div className="flex min-w-0 flex-1">
            {/* Token Symbol */}
            {tokenDisplay.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-theme-accent truncate font-mono text-sm font-bold">
                    {tokenDisplay.symbol}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border max-w-xs border p-3">
                  <span className="text-theme-text-primary font-mono text-xs">
                    {tokenDisplay.tooltip}
                  </span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-theme-accent truncate font-mono text-sm font-bold">
                {tokenDisplay.symbol}
              </span>
            )}
            {/* Protocol Name */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={opportunity.protocol.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-text-muted hover:text-theme-accent truncate font-mono text-[11px] transition-colors hover:underline flex items-center gap-1"
                  >
                    {opportunity.protocol.name}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                  <div className="text-theme-text-primary flex items-center gap-1 font-mono text-xs">
                    <ExternalLink className="h-3 w-3" />
                    <span>Visit {opportunity.protocol.name}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <Badge
            variant="outline"
            className="text-theme-text-muted border-theme-border/30 text-[10px] uppercase"
          >
            {opportunity.category}
          </Badge>
        </div>

        {/* APY Display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-theme-accent h-4 w-4" />
            <span className="text-theme-text-muted font-mono text-xs uppercase">
              APY
            </span>
          </div>
          <div className="text-right">
            {apyDisplay.base === null && apyDisplay.total === null ? (
              <span className="text-theme-text-muted font-mono text-sm">
                N/A
              </span>
            ) : apyDisplay.isSame ? (
              <span className="text-theme-accent font-mono text-lg font-bold tabular-nums">
                {apyDisplay.base || apyDisplay.total}
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-theme-text-secondary font-mono text-xs tabular-nums">
                  {apyDisplay.base}
                </span>
                <span className="text-theme-text-muted text-xs">→</span>
                <span className="text-theme-accent font-mono text-sm font-bold tabular-nums">
                  {apyDisplay.total}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* TVL Badge */}
        {tvl && (
          <div className="pt-3 border-t border-theme-border/50">
            <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-2 py-1 font-mono text-[10px]">
              TVL {tvl}
            </span>
          </div>
        )}
      </div>
    </TerminalCard>
  );
}
