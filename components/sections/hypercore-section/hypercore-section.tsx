"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Lock, Vault } from "lucide-react"
import { TerminalCard, TerminalContent } from "@/components/ui/terminal-card"
import { useHypercoreData } from "./hooks"
import { SummaryCards } from "./summary-cards"
import { TabNavigation } from "./tab-navigation"
import { ContentSkeleton } from "./content-skeleton"
import { SpotTab } from "./spot-tab"
import { PerpTab } from "./perp-tab"
import { StakingTab } from "./staking-tab"
import { VaultsTab } from "./vaults-tab"
import type { HypercoerSectionProps, TabId, TabConfig } from "./types"

// Tab configuration
const TABS: TabConfig[] = [
  { id: "spot", label: "Spot", icon: DollarSign, color: "#00ff41" },
  { id: "perp", label: "Perp", icon: TrendingUp, color: "#00d9ff" },
  { id: "staking", label: "Staking", icon: Lock, color: "#ff00ff" },
  { id: "vaults", label: "Vaults", icon: Vault, color: "#ffaa00" },
]

/**
 * Empty state component when no data is available
 */
function EmptyState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="font-mono text-xs sm:text-sm text-[#708090] mb-1 sm:mb-2">
        NO HYPERCORE DATA
      </div>
      <div className="font-mono text-[10px] sm:text-sm text-[#556070]">
        Add a wallet to view Hypercore data
      </div>
    </div>
  )
}

/**
 * Hypercore section component displaying spot, perp, staking, and vault data
 */
export function HypercoreSection({ isLoading = false }: HypercoerSectionProps) {
  const { hypercoreData } = useHypercoreData()
  const [activeTab, setActiveTab] = useState<TabId>("spot")

  // Determine display states
  const showSkeleton = isLoading && !hypercoreData
  const hasData = !!hypercoreData

  // Show empty state when not loading and no data
  if (!hasData && !isLoading) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <SummaryCards data={hypercoreData} showSkeleton={showSkeleton} />

      {/* Tab Navigation */}
      <TabNavigation 
        tabs={TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      <TerminalCard>
        <TerminalContent>
          {/* Loading skeleton */}
          {showSkeleton && <ContentSkeleton />}
          
          {/* Spot Tab */}
          {activeTab === "spot" && hasData && (
            <SpotTab balances={hypercoreData.spotBalances} />
          )}

          {/* Perp Tab */}
          {activeTab === "perp" && hasData && (
            <PerpTab 
              marginBalance={hypercoreData.perpPositions?.margin?.usdcBalance || "0"} 
            />
          )}

          {/* Staking Tab */}
          {activeTab === "staking" && hasData && (
            <StakingTab stakingInfo={hypercoreData.stakingInfo} />
          )}

          {/* Vaults Tab */}
          {activeTab === "vaults" && hasData && (
            <VaultsTab vaults={hypercoreData.vaultInfo?.vaults || []} />
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

