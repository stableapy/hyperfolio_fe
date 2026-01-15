'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProtocolLogo } from './protocol-logo';
import type {
  YieldCardProps,
  YieldDisplayItem,
  ConsolidatedLendingMarket,
} from './types';
import { isConsolidatedMarket } from './types';
import {
  formatApyDisplay,
  formatApyPercentage,
  getProtocolLogoPath,
} from './utils';
import type { YieldOpportunity } from '@/lib/types/api';

/**
 * Formats the token display based on pool type
 * - AMM: token0/token1 pair (e.g., "WETH/USDC")
 * - Derivatives: underlyingToken + collateralToken (e.g., "BTC / USDC")
 * - Lending/Staking/Yield: underlyingToken (single asset)
 * - Fallback: metadata.underlyingSymbol or pool.symbol
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
 * Formats TVL for display
 */
function formatTvl(tvlUsd?: number): string | null {
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
 * LendingMarketCard - Displays consolidated lending market with supply/borrow
 */
function LendingMarketCard({ market }: { market: ConsolidatedLendingMarket }) {
  const tokenDisplay = getTokenDisplay(market);
  const logoPath = getProtocolLogoPath(market.protocol.name);
  const tvl = formatTvl(market.pool.tvlUsd || market.pool.liquidityUsd);

  const supplyApyValue = getApyValue(market.supplyApy);
  const borrowApyValue = getApyValue(market.borrowApy);

  return (
    <div className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-3 transition-all duration-150 sm:px-4">
      {/* Main Content - Desktop */}
      <div className="hidden items-center justify-between gap-3 sm:flex">
        {/* Terminal Prompt */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-theme-accent font-mono text-sm font-bold select-none">
            &gt;
          </span>
        </div>

        {/* Left: Token & Protocol Info with logo */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <ProtocolLogo
            src={logoPath}
            name={market.protocol.name}
            className="h-9 w-9 flex-shrink-0"
          />
          <div className="flex min-w-0 flex-col">
            {/* Primary: Token Symbol */}
            <div className="flex items-center gap-2">
              {tokenDisplay.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-theme-accent truncate font-mono text-sm font-bold tracking-wide">
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
                <span className="text-theme-accent truncate font-mono text-sm font-bold tracking-wide">
                  {tokenDisplay.symbol}
                </span>
              )}
              <Badge
                variant="outline"
                className="text-theme-text-muted border-theme-border/30 text-[10px] uppercase"
              >
                lending
              </Badge>
            </div>
            {/* Secondary: Protocol Name */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={market.protocol.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-text-muted hover:text-theme-accent truncate font-mono text-[11px] transition-colors hover:underline"
                  >
                    {market.protocol.name}
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                  <div className="text-theme-text-primary flex items-center gap-1 font-mono text-xs">
                    <ExternalLink className="h-3 w-3" />
                    <span>Visit {market.protocol.name}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                market
              </span>
              {tvl && (
                <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  TVL {tvl}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Supply & Borrow APY Display */}
        <div className="flex min-w-[220px] items-center justify-end gap-4">
          {/* Supply APY */}
          {market.supplyApy && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
              <span className="text-theme-text-muted font-mono text-[10px] uppercase">
                supply
              </span>
              <span className="font-mono text-sm font-bold text-green-500 tabular-nums">
                {formatApyPercentage(supplyApyValue)}
              </span>
            </div>
          )}

          {/* Divider */}
          {market.supplyApy && market.borrowApy && (
            <span className="text-theme-border">|</span>
          )}

          {/* Borrow APY */}
          {market.borrowApy && (
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" />
              <span className="text-theme-text-muted font-mono text-[10px] uppercase">
                borrow
              </span>
              <span className="font-mono text-sm font-bold text-orange-500 tabular-nums">
                {formatApyPercentage(borrowApyValue)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Top: Token + Protocol */}
        <div className="flex items-center gap-3">
          <ProtocolLogo
            src={logoPath}
            name={market.protocol.name}
            className="h-10 w-10 flex-shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Primary: Token Symbol */}
            <div className="flex items-center gap-2">
              <span className="text-theme-accent truncate font-mono text-sm font-bold">
                {tokenDisplay.symbol}
              </span>
              <Badge
                variant="outline"
                className="text-theme-text-muted border-theme-border/30 flex-shrink-0 text-[9px] uppercase"
              >
                lending
              </Badge>
            </div>
            {/* Secondary: Protocol Name */}
            <div className="flex items-center gap-2">
              <span className="text-theme-text-muted font-mono text-xs">
                {market.protocol.name}
              </span>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px]">
                market
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Supply & Borrow APYs */}
        <div className="flex items-center justify-between gap-4">
          {/* Supply APY */}
          {market.supplyApy && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span className="text-theme-text-muted font-mono text-[10px] uppercase">
                supply
              </span>
              <span className="font-mono text-sm font-bold text-green-500 tabular-nums">
                {formatApyPercentage(supplyApyValue)}
              </span>
            </div>
          )}

          {/* Borrow APY */}
          {market.borrowApy && (
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-theme-text-muted font-mono text-[10px] uppercase">
                borrow
              </span>
              <span className="font-mono text-sm font-bold text-orange-500 tabular-nums">
                {formatApyPercentage(borrowApyValue)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * RegularOpportunityCard - Displays non-lending opportunities (AMM, yield, staking)
 */
function RegularOpportunityCard({
  opportunity,
}: {
  opportunity: YieldOpportunity;
}) {
  const tokenDisplay = getTokenDisplay(opportunity);
  const baseApy = opportunity.apy.baseApy;
  const totalApy = opportunity.apy.totalApy;
  const apyDisplay = formatApyDisplay(baseApy, totalApy);
  const logoPath = getProtocolLogoPath(opportunity.protocol.name);
  const tvl = formatTvl(
    opportunity.pool.tvlUsd || opportunity.pool.liquidityUsd
  );

  return (
    <div className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-3 transition-all duration-150 sm:px-4">
      {/* Main Content - Desktop */}
      <div className="hidden items-center justify-between gap-3 sm:flex">
        {/* Terminal Prompt */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-theme-accent font-mono text-sm font-bold select-none">
            &gt;
          </span>
        </div>

        {/* Left: Token & Protocol Info with logo */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <ProtocolLogo
            src={logoPath}
            name={opportunity.protocol.name}
            className="h-9 w-9 flex-shrink-0"
          />
          <div className="flex min-w-0 flex-col">
            {/* Primary: Token Symbol */}
            <div className="flex items-center gap-2">
              {tokenDisplay.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-theme-accent truncate font-mono text-sm font-bold tracking-wide">
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
                <span className="text-theme-accent truncate font-mono text-sm font-bold tracking-wide">
                  {tokenDisplay.symbol}
                </span>
              )}
              <Badge
                variant="outline"
                className="text-theme-text-muted border-theme-border/30 text-[10px] uppercase"
              >
                {opportunity.category}
              </Badge>
            </div>
            {/* Secondary: Protocol Name */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={opportunity.protocol.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-text-muted hover:text-theme-accent truncate font-mono text-[11px] transition-colors hover:underline"
                  >
                    {opportunity.protocol.name}
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                  <div className="text-theme-text-primary flex items-center gap-1 font-mono text-xs">
                    <ExternalLink className="h-3 w-3" />
                    <span>Visit {opportunity.protocol.name}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                {opportunity.type}
              </span>
              {tvl && (
                <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  TVL {tvl}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: APY Display */}
        <div className="flex min-w-[180px] items-center justify-end gap-2">
          <TrendingUp className="text-theme-accent h-4 w-4 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            {apyDisplay.base === null && apyDisplay.total === null ? (
              <span className="text-theme-text-muted font-mono text-sm">
                N/A
              </span>
            ) : apyDisplay.isSame ? (
              <span className="text-theme-accent font-mono text-base font-bold tabular-nums">
                {apyDisplay.base || apyDisplay.total}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-theme-text-secondary font-mono text-sm tabular-nums">
                  {apyDisplay.base}
                </span>
                <span className="text-theme-text-muted">→</span>
                <span className="text-theme-accent font-mono text-base font-bold tabular-nums">
                  {apyDisplay.total}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Top: Token + Protocol */}
        <div className="flex items-center gap-3">
          <ProtocolLogo
            src={logoPath}
            name={opportunity.protocol.name}
            className="h-10 w-10 flex-shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Primary: Token Symbol */}
            <div className="flex items-center gap-2">
              <span className="text-theme-accent truncate font-mono text-sm font-bold">
                {tokenDisplay.symbol}
              </span>
              <Badge
                variant="outline"
                className="text-theme-text-muted border-theme-border/30 flex-shrink-0 text-[9px] uppercase"
              >
                {opportunity.category}
              </Badge>
            </div>
            {/* Secondary: Protocol Name */}
            <div className="flex items-center gap-2">
              <span className="text-theme-text-muted font-mono text-xs">
                {opportunity.protocol.name}
              </span>
              <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px]">
                {opportunity.type}
              </span>
              {tvl && (
                <span className="text-theme-text-muted bg-theme-bg/50 border-theme-border/50 rounded border px-1 py-0.5 font-mono text-[9px]">
                  {tvl}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: APY */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-theme-accent h-4 w-4" />
            {apyDisplay.base === null && apyDisplay.total === null ? (
              <span className="text-theme-text-muted font-mono text-sm">
                N/A
              </span>
            ) : apyDisplay.isSame ? (
              <span className="text-theme-accent font-mono text-base font-bold tabular-nums">
                {apyDisplay.base || apyDisplay.total}
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-theme-text-secondary font-mono text-sm tabular-nums">
                  {apyDisplay.base}
                </span>
                <span className="text-theme-text-muted">→</span>
                <span className="text-theme-accent font-mono text-base font-bold tabular-nums">
                  {apyDisplay.total}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * YieldCard Component
 * Displays individual yield opportunity details
 * For lending markets, shows consolidated supply/borrow view
 * For other categories, shows standard opportunity view
 */
export const YieldCard = React.memo(
  ({ opportunity }: YieldCardProps) => {
    // Check if this is a consolidated lending market
    if (isConsolidatedMarket(opportunity)) {
      return <LendingMarketCard market={opportunity} />;
    }

    // Regular opportunity (AMM, yield, staking, or standalone lending)
    return <RegularOpportunityCard opportunity={opportunity} />;
  },
  (prevProps, nextProps) => {
    // Compare by opportunity ID to prevent unnecessary re-renders
    return prevProps.opportunity.id === nextProps.opportunity.id;
  }
);
