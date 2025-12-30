'use client';

import { formatCompactValue, formatAddress, safeParseFloat } from './utils';
import type { StakingTabProps, Delegation } from './types';

/**
 * Individual delegation row component with terminal styling
 */
function DelegationRow({
  delegation,
  privacyMode,
}: {
  delegation: Delegation;
  privacyMode?: boolean;
}) {
  return (
    <div className="group hover:bg-theme-accent/5 hover:border-l-theme-magenta border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Terminal Prompt */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-theme-magenta font-mono text-sm font-bold select-none">
            &gt;
          </span>
        </div>

        {/* Validator Address */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-theme-text-muted font-mono text-[10px]">
            validator:
          </span>
          <span className="text-theme-magenta truncate font-mono text-xs sm:text-sm">
            {formatAddress(delegation.address || '')}
          </span>
        </div>

        {/* Amount */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">=</span>
          <span className="text-theme-text-primary font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `${delegation.amount || '0'} HYPE`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Staking summary component with terminal style badges
 */
function StakingSummary({
  totalHype,
  totalStakedUsd,
  privacyMode,
}: {
  totalHype: number;
  totalStakedUsd: number;
  privacyMode?: boolean;
}) {
  return (
    <div className="border-theme-border/30 flex flex-wrap items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
      {/* Total HYPE - Terminal style */}
      <div className="bg-theme-card-bg border-theme-border/70 flex items-center overflow-hidden rounded-sm border">
        <div className="bg-theme-magenta/10 border-theme-magenta/20 border-r px-2 py-1.5">
          <span className="text-theme-magenta font-mono text-[10px] font-bold sm:text-xs">
            ⚡
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">
            --total
          </span>
          <span className="text-theme-magenta font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `${formatCompactValue(totalHype)} HYPE`}
          </span>
        </div>
      </div>

      {/* Staked USD Value - Terminal style */}
      <div className="bg-theme-card-bg border-theme-border/70 flex items-center overflow-hidden rounded-sm border">
        <div className="bg-theme-accent/10 border-theme-accent/20 border-r px-2 py-1.5">
          <span className="text-theme-accent font-mono text-[10px] font-bold sm:text-xs">
            $
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">
            --value
          </span>
          <span className="text-theme-accent font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `$${formatCompactValue(totalStakedUsd)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Staking tab content with terminal styling
 */
export function StakingTab({ stakingInfo, privacyMode }: StakingTabProps) {
  const totalHype = safeParseFloat(stakingInfo?.totalHype);
  const totalStakedUsd = safeParseFloat(
    stakingInfo?.delegatorSummary?.totalStakedUsd
  );
  const delegations = stakingInfo?.delegations || [];

  return (
    <div>
      {/* Summary Section */}
      <StakingSummary
        totalHype={totalHype}
        totalStakedUsd={totalStakedUsd}
        privacyMode={privacyMode}
      />

      {/* Delegations List */}
      {delegations.length > 0 ? (
        <div className="divide-theme-border/30 divide-y">
          {/* Section Header */}
          <div className="bg-theme-bg/30 px-3 py-2 sm:px-4">
            <div className="flex items-center gap-1.5">
              <span className="text-theme-text-muted font-mono text-[9px]">
                #
              </span>
              <span className="text-theme-magenta font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
                DELEGATIONS
              </span>
              <span className="text-theme-text-muted font-mono text-[9px] sm:text-[10px]">
                [{delegations.length}]
              </span>
            </div>
          </div>

          {delegations.map((delegation, index) => (
            <DelegationRow
              key={index}
              delegation={delegation}
              privacyMode={privacyMode}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center sm:py-12">
          <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
            NO DELEGATIONS
          </div>
          <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
            <span className="text-theme-magenta">&gt;</span> staking
            --delegations returns empty
          </div>
        </div>
      )}
    </div>
  );
}
