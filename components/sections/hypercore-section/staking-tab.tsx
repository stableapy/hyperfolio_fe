"use client"

import { formatCompactValue, formatAddress, safeParseFloat } from "./utils"
import type { StakingTabProps, Delegation } from "./types"

/**
 * Individual delegation row component with terminal styling
 */
function DelegationRow({ delegation }: { delegation: Delegation }) {
  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group hover:bg-theme-accent/5 border-l-2 border-l-transparent hover:border-l-theme-magenta">
      <div className="flex items-center justify-between gap-2">
        {/* Terminal Prompt */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-sm font-bold text-theme-magenta select-none">&gt;</span>
        </div>
        
        {/* Validator Address */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-[10px] text-theme-text-muted">validator:</span>
          <span className="font-mono text-xs sm:text-sm text-theme-magenta truncate">
            {formatAddress(delegation.address || "")}
          </span>
        </div>
        
        {/* Amount */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[10px] text-theme-text-muted">=</span>
          <span className="font-mono text-xs sm:text-sm text-theme-text-primary font-bold tabular-nums">
            {delegation.amount || "0"} HYPE
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Staking summary component with terminal style badges
 */
function StakingSummary({ totalHype, totalStakedUsd }: { totalHype: number; totalStakedUsd: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 border-b border-theme-border/30">
      {/* Total HYPE - Terminal style */}
      <div className="flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="px-2 py-1.5 bg-theme-magenta/10 border-r border-theme-magenta/20">
          <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-magenta">⚡</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="font-mono text-[10px] text-theme-text-muted">--total</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-theme-magenta tabular-nums">
            {formatCompactValue(totalHype)} HYPE
          </span>
        </div>
      </div>

      {/* Staked USD Value - Terminal style */}
      <div className="flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="px-2 py-1.5 bg-theme-accent/10 border-r border-theme-accent/20">
          <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-accent">$</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="font-mono text-[10px] text-theme-text-muted">--value</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-theme-accent tabular-nums">
            ${formatCompactValue(totalStakedUsd)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Staking tab content with terminal styling
 */
export function StakingTab({ stakingInfo }: StakingTabProps) {
  const totalHype = safeParseFloat(stakingInfo?.totalHype)
  const totalStakedUsd = safeParseFloat(stakingInfo?.delegatorSummary?.totalStakedUsd)
  const delegations = stakingInfo?.delegations || []

  return (
    <div>
      {/* Summary Section */}
      <StakingSummary totalHype={totalHype} totalStakedUsd={totalStakedUsd} />

      {/* Delegations List */}
      {delegations.length > 0 ? (
        <div className="divide-y divide-theme-border/30">
          {/* Section Header */}
          <div className="px-3 sm:px-4 py-2 bg-theme-bg/30">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-theme-text-muted">#</span>
              <span className="font-mono text-[9px] sm:text-[10px] text-theme-magenta uppercase tracking-wider">
                DELEGATIONS
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-theme-text-muted">
                [{delegations.length}]
              </span>
            </div>
          </div>
          
          {delegations.map((delegation, index) => (
            <DelegationRow key={index} delegation={delegation} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
            NO DELEGATIONS
          </div>
          <div className="font-mono text-xs sm:text-sm text-theme-text-muted">
            <span className="text-theme-magenta">&gt;</span> staking --delegations returns empty
          </div>
        </div>
      )}
    </div>
  )
}
