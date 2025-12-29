'use client';

import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Coins,
  Layers,
  Image,
  Zap,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatPill, StatPillSkeleton } from '@/components/ui/stat-pill';
import type { AssetBreakdown, ApyData } from './types';
import { formatCompactValue } from './utils';
import { formatPercentage } from '@/lib/utils/formatters';

interface StatPillsProps {
  isLoading: boolean;
  hasData: boolean;
  isPositive: boolean;
  change24h: number;
  privacyMode: boolean;
  breakdown: AssetBreakdown[];
  apyData: ApyData;
}

/**
 * Component displaying portfolio statistics as pills
 */
export function StatPills({
  isLoading,
  hasData,
  isPositive,
  change24h,
  privacyMode,
  breakdown,
  apyData,
}: StatPillsProps) {
  return (
    <TooltipProvider>
      <div className="scrollbar-hide -mx-1 flex flex-wrap items-center gap-1.5 overflow-x-auto px-1 pt-2 pb-2 sm:flex-nowrap sm:gap-2 sm:pt-4">
        {/* 24h Change */}
        {isLoading && !hasData ? (
          <StatPillSkeleton width="w-28 sm:w-36" />
        ) : (
          <StatPill
            icon={
              isPositive ? (
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )
            }
            color={isPositive ? 'accent' : 'red'}
            label="--24h"
            value={`${isPositive ? '+' : ''}${change24h.toFixed(2)}%`}
            privacyMode={privacyMode}
          />
        )}

        {/* APY Pill with Tooltip - Only show when data is available */}
        {apyData.hasPositions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon={<Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                color="purple"
                label="--apy"
                value={formatPercentage(apyData.weightedApy)}
                privacyMode={privacyMode}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-2">
                <div className="text-theme-purple font-mono text-xs font-bold">
                  <span className="text-theme-purple">&gt;</span> yield
                  --estimate
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      daily:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${apyData.estimatedYield.daily.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      weekly:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${apyData.estimatedYield.weekly.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted font-mono text-[9px]">
                      monthly:
                    </div>
                    <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
                      {privacyMode
                        ? '•••'
                        : `$${apyData.estimatedYield.monthly.toFixed(2)}`}
                    </div>
                  </div>
                </div>
                <div className="text-theme-text-muted border-theme-border/50 border-t pt-2 font-mono text-[9px]">
                  # based on current defi positions apy
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Breakdown Pills - Skeleton placeholders when loading, real data when available */}
        {isLoading && breakdown.length === 0 ? (
          <>
            <StatPillSkeleton width="w-24 sm:w-32" />
            <StatPillSkeleton width="w-28 sm:w-36" />
            <StatPillSkeleton
              width="w-24 sm:w-32"
              className="hidden sm:block"
            />
          </>
        ) : (
          breakdown.map((item) => {
            // Get category-specific icon
            const getCategoryIcon = () => {
              const iconClass = 'w-3 h-3 sm:w-3.5 sm:h-3.5';
              switch (item.category.toLowerCase()) {
                case 'tokens':
                  return <Coins className={iconClass} />;
                case 'defi':
                  return <Layers className={iconClass} />;
                case 'nfts':
                  return <Image className={iconClass} />;
                case 'hypercore':
                  return <Zap className={iconClass} />;
                default:
                  return '>';
              }
            };

            return (
              <StatPill
                key={item.category}
                icon={getCategoryIcon()}
                customColor={item.color}
                label={`--${item.category.toLowerCase().replace(' ', '-')}`}
                value={formatCompactValue(item.value)}
                secondaryValue={formatPercentage(item.percentage)}
                privacyMode={privacyMode}
                className="hover:border-theme-accent/30"
              />
            );
          })
        )}
      </div>
    </TooltipProvider>
  );
}
