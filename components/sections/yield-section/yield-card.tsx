'use client';

import { Badge } from '@/components/ui/badge';
import type { YieldCardProps } from './types';
import { formatApyDisplay, getRiskColorClass, getRiskLabel } from './utils';

/**
 * YieldCard Component
 * Displays individual yield opportunity details
 * Shows protocol, token, APY, risk, type, and category
 */
export function YieldCard({ opportunity }: YieldCardProps) {
  // Extract token symbol from metadata or pool
  const tokenSymbol =
    opportunity.metadata.underlyingSymbol || opportunity.pool.symbol || 'Unknown';
  
  // Extract APY values
  const baseApy = opportunity.apy.baseApy;
  const totalApy = opportunity.apy.totalApy;

  // Get primary APY for display priority
  const primaryApy = totalApy ?? baseApy ?? null;

  return (
    <div className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-3 transition-all duration-150 sm:px-4">
      {/* Main Content */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Protocol and Token */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Protocol Name */}
          <div className="flex items-center gap-2">
            <h3 className="text-theme-text-primary font-mono text-sm font-semibold truncate">
              {opportunity.protocol.name}
            </h3>
            {/* Category Badge */}
            <Badge variant="outline" className="text-theme-text-muted text-[10px] uppercase border-theme-border/30">
              {opportunity.category}
            </Badge>
          </div>

          {/* Token Symbol and Type */}
          <div className="flex items-center gap-2">
            <span className="text-theme-text-secondary font-mono text-sm">
              {tokenSymbol}
            </span>
            <Badge variant="outline" className="text-theme-text-muted text-[10px] uppercase border-theme-border/30">
              {opportunity.type}
            </Badge>
          </div>
        </div>

        {/* Middle: APY Display */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-theme-text-muted font-mono text-[10px] uppercase tracking-wider">
            APY
          </span>
          <span className="text-theme-accent mt-1 font-mono text-base font-bold">
            {formatApyDisplay(baseApy, totalApy)}
          </span>
        </div>

        {/* Right: Risk Level */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-theme-text-muted font-mono text-[10px] uppercase tracking-wider">
            Risk
          </span>
          <span
            className={`${getRiskColorClass(opportunity.risk.riskLevel)} mt-1 font-mono text-base font-semibold capitalize`}
          >
            {getRiskLabel(opportunity.risk.riskLevel)}
          </span>
        </div>
      </div>

      {/* Risk Indicators (Optional) */}
      {(opportunity.risk.liquidationRisk || opportunity.risk.impermanentLossRisk) && (
        <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-theme-border/20">
          {opportunity.risk.liquidationRisk && (
            <span className="text-theme-text-muted font-mono text-[10px]">
              ⚠️ Liquidation Risk
            </span>
          )}
          {opportunity.risk.impermanentLossRisk && (
            <span className="text-theme-text-muted font-mono text-[10px]">
              ⚠️ Impermanent Loss Risk
            </span>
          )}
        </div>
      )}
    </div>
  );
}
