"use client"

import { formatCompactValue, formatAddress, safeParseFloat } from "./utils"
import type { StakingTabProps, Delegation } from "./types"

/**
 * Individual delegation row component
 */
function DelegationRow({ delegation, index }: { delegation: Delegation; index: number }) {
  return (
    <div className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-xs sm:text-sm text-[#00ff41] truncate flex-1 min-w-0">
          {formatAddress(delegation.address || "")}
        </div>
        <div className="font-mono text-xs sm:text-sm text-white font-medium flex-shrink-0">
          {delegation.amount || "0"}
        </div>
      </div>
    </div>
  )
}

/**
 * Staking summary card component
 */
function StakingSummary({ totalHype, totalStakedUsd }: { totalHype: number; totalStakedUsd: number }) {
  return (
    <div className="p-2.5 sm:p-3 border border-[#1a2225] rounded-lg bg-[#0a0e0f]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-0.5 sm:mb-1">
            TOTAL HYPE
          </div>
          <div className="font-mono text-xs sm:text-sm text-white font-semibold">
            {formatCompactValue(totalHype)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-0.5 sm:mb-1">
            STAKED VALUE
          </div>
          <div className="font-mono text-xs sm:text-sm text-[#ff00ff] font-semibold">
            ${formatCompactValue(totalStakedUsd)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Staking tab content
 */
export function StakingTab({ stakingInfo }: StakingTabProps) {
  const totalHype = safeParseFloat(stakingInfo?.totalHype)
  const totalStakedUsd = safeParseFloat(stakingInfo?.delegatorSummary?.totalStakedUsd)
  const delegations = stakingInfo?.delegations || []

  return (
    <div className="space-y-2 sm:space-y-3">
      <StakingSummary totalHype={totalHype} totalStakedUsd={totalStakedUsd} />

      {delegations.length > 0 ? (
        <div className="divide-y divide-[#1a2225]">
          {delegations.map((delegation, index) => (
            <DelegationRow key={index} delegation={delegation} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <div className="font-mono text-xs sm:text-sm text-[#708090]">NO DELEGATIONS</div>
        </div>
      )}
    </div>
  )
}

