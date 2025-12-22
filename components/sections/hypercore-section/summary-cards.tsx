"use client"

import { DollarSign, TrendingUp, Lock, Vault } from "lucide-react"
import { TerminalCard, TerminalContent } from "@/components/ui/terminal-card"
import { formatUsdCompact, safeParseFloat } from "./utils"
import type { SummaryCardsProps } from "./types"

interface SummaryCardItemProps {
  icon: React.ReactNode
  label: string
  value: string
  showSkeleton: boolean
  skeletonWidth?: string
}

/**
 * Individual summary card component
 */
function SummaryCardItem({ icon, label, value, showSkeleton, skeletonWidth = "w-16 sm:w-28" }: SummaryCardItemProps) {
  return (
    <TerminalCard>
      <TerminalContent className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
          {icon}
          <div className="font-mono text-[10px] sm:text-xs text-[#708090]">{label}</div>
        </div>
        {showSkeleton ? (
          <div className={`h-5 sm:h-7 ${skeletonWidth} bg-[#1a2225] rounded animate-pulse`} />
        ) : (
          <div className="font-mono text-base sm:text-xl text-white font-semibold">
            {value}
          </div>
        )}
      </TerminalContent>
    </TerminalCard>
  )
}

/**
 * Summary cards grid showing Spot, Perp, Staked, and Vaults values
 */
export function SummaryCards({ data, showSkeleton }: SummaryCardsProps) {
  const spotValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.spotValue))
  const perpValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.perpValue))
  const stakedValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.stakedValue))
  const vaultValue = formatUsdCompact(safeParseFloat(data?.portfolioSummary?.vaultValue))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <SummaryCardItem
        icon={<DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41]" />}
        label="SPOT"
        value={spotValue}
        showSkeleton={showSkeleton}
      />
      <SummaryCardItem
        icon={<TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00d9ff]" />}
        label="PERP"
        value={perpValue}
        showSkeleton={showSkeleton}
        skeletonWidth="w-14 sm:w-24"
      />
      <SummaryCardItem
        icon={<Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff00ff]" />}
        label="STAKED"
        value={stakedValue}
        showSkeleton={showSkeleton}
        skeletonWidth="w-14 sm:w-24"
      />
      <SummaryCardItem
        icon={<Vault className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffaa00]" />}
        label="VAULTS"
        value={vaultValue}
        showSkeleton={showSkeleton}
        skeletonWidth="w-14 sm:w-24"
      />
    </div>
  )
}

