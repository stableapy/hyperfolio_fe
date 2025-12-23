"use client"

import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"

// Sub-components
import { DefiStatsGrid } from "./defi-stats-grid"
import { ProtocolCard } from "./protocol-card"
import { ProtocolSkeleton } from "./protocol-skeleton"
import { DefiEmptyState } from "./defi-empty-state"
import { StreamingProgress } from "./streaming-progress"

// Hooks
import { useDefiPositions, useDefiStats, useStreamingPositions } from "./hooks"

// Types
import type { DefiSectionProps } from "./types"

/**
 * Main DeFi Section component displaying portfolio positions grouped by protocol
 * Uses SSE streaming for progressive position loading
 */
export function DeFiSection({ isLoading = false }: DefiSectionProps) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(new Set())
  const [useStreaming, setUseStreaming] = useState(true)

  // Streaming positions hook - progressive loading via SSE
  const {
    protocolGroups: streamedGroups,
    positions: streamedPositions,
    isStreaming,
    isComplete,
    hasData: hasStreamedData,
    progress,
    error: streamError,
  } = useStreamingPositions({
    enabled: useStreaming && wallets.length > 0,
  })

  // Fallback: Get positions from walletData (traditional approach)
  const { positions: fallbackPositions, protocolGroups: fallbackGroups, hasData: hasFallbackData } = useDefiPositions({
    selectedWalletId,
    wallets,
    walletData,
  })

  // Use streamed data if available, otherwise fall back to traditional data
  const positions = hasStreamedData ? streamedPositions : fallbackPositions
  const protocolGroups = hasStreamedData ? streamedGroups : fallbackGroups
  const hasData = hasStreamedData || hasFallbackData

  // Fall back to traditional loading if streaming fails
  useEffect(() => {
    if (streamError && useStreaming) {
      console.warn('[DeFiSection] Streaming failed, falling back to traditional loading:', streamError)
      setUseStreaming(false)
    }
  }, [streamError, useStreaming])

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

  // Show skeleton when loading and no data yet (only for non-streaming or when streaming hasn't started)
  const showSkeleton = (isLoading || (isStreaming && !hasStreamedData)) && !hasData
  
  // Show streaming indicator while streaming is in progress
  const showStreamingIndicator = isStreaming && progress.total > 0

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <DefiStatsGrid
        isLoading={isLoading || (isStreaming && !hasStreamedData)}
        hasData={hasData}
        totalDeposited={stats.totalDeposited}
        totalRewards={stats.totalRewards}
        weightedApy={stats.weightedApy}
        portfolioYield={stats.portfolioYield}
        positionsWithApy={stats.positionsWithApy}
        totalPositions={stats.totalPositions}
      />

      {/* Streaming Progress */}
      {showStreamingIndicator && (
        <StreamingProgress
          completed={progress.completed}
          total={progress.total}
          isComplete={isComplete}
        />
      )}

      <div className="space-y-3">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && (
          <>
            {[1, 2, 3].map((i) => (
              <ProtocolSkeleton key={i} />
            ))}
          </>
        )}
        
        {/* Protocol Cards - Render progressively as they arrive */}
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

      {/* Empty State - Only show when complete and no data */}
      {protocolGroups.length === 0 && !showSkeleton && isComplete && <DefiEmptyState />}
    </div>
  )
}

