"use client"

import { useState } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"

// Sub-components
import { DefiStatsGrid } from "./defi-stats-grid"
import { ProtocolCard } from "./protocol-card"
import { ProtocolSkeleton } from "./protocol-skeleton"
import { DefiEmptyState } from "./defi-empty-state"

// Hooks
import { useDefiPositions, useDefiStats } from "./hooks"

// Types
import type { DefiSectionProps } from "./types"

/**
 * Main DeFi Section component displaying portfolio positions grouped by protocol
 */
export function DeFiSection({ isLoading = false }: DefiSectionProps) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(new Set())

  // Get positions and protocol groups from hook
  const { positions, protocolGroups, hasData } = useDefiPositions({
    selectedWalletId,
    wallets,
    walletData,
  })

  // Calculate stats from positions
  const stats = useDefiStats({ positions })

  // Toggle protocol expansion
  const toggleProtocol = (protocolId: string) => {
    const newExpanded = new Set(expandedProtocols)
    if (newExpanded.has(protocolId)) {
      newExpanded.delete(protocolId)
    } else {
      newExpanded.add(protocolId)
    }
    setExpandedProtocols(newExpanded)
  }

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <DefiStatsGrid
        isLoading={isLoading}
        hasData={hasData}
        totalDeposited={stats.totalDeposited}
        totalRewards={stats.totalRewards}
        weightedApy={stats.weightedApy}
        portfolioYield={stats.portfolioYield}
        positionsWithApy={stats.positionsWithApy}
        totalPositions={stats.totalPositions}
      />

      <div className="space-y-3">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && (
          <>
            {[1, 2, 3].map((i) => (
              <ProtocolSkeleton key={i} />
            ))}
          </>
        )}
        
        {/* Protocol Cards */}
        {protocolGroups.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            isExpanded={expandedProtocols.has(protocol.id)}
            onToggle={() => toggleProtocol(protocol.id)}
            selectedWalletId={selectedWalletId}
          />
        ))}
      </div>

      {/* Empty State */}
      {protocolGroups.length === 0 && !showSkeleton && <DefiEmptyState />}
    </div>
  )
}

