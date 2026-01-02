'use client';

import { TerminalCard } from '@/components/ui/terminal-card';
import type { YieldStatsProps } from './types';
import { formatApyPercentage } from './utils';

/**
 * YieldStats Component
 * Displays summary statistics for yield opportunities
 * Shows total count, highest APY, and average APY
 *
 * @param {YieldStatsProps} props - Component props
 */
export function YieldStats({ stats, isLoading, hasData }: YieldStatsProps) {
  // Stats are calculated in useYieldData hook and passed directly
  // to avoid duplicate calculations and unnecessary re-renders

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <TerminalCard compact className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
            Total Opportunities
          </span>
          <span className="text-theme-text-primary mt-1 font-mono text-lg font-bold">
            {isLoading ? '...' : stats.totalCount}
          </span>
        </div>
      </TerminalCard>

      <TerminalCard compact className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
            Highest APY
          </span>
          <span className="text-theme-accent mt-1 font-mono text-lg font-bold">
            {isLoading ? '...' : formatApyPercentage(stats.highestApy)}
          </span>
        </div>
      </TerminalCard>

      <TerminalCard compact className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
            Average APY
          </span>
          <span className="text-theme-text-primary mt-1 font-mono text-lg font-bold">
            {isLoading ? '...' : formatApyPercentage(stats.averageApy)}
          </span>
        </div>
      </TerminalCard>
    </div>
  );
}
