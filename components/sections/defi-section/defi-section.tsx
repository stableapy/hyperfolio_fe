"use client"

import { useState, useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"

// Sub-components
import { DefiStatsGrid } from "./defi-stats-grid"
import { ProtocolCard } from "./protocol-card"
import { ProtocolSkeleton } from "./protocol-skeleton"
import { DefiEmptyState } from "./defi-empty-state"
import { StreamingProgress } from "./streaming-progress"

// Hooks
import { useDefiPositions, useDefiStats } from "./hooks"

// Types
import type { DefiSectionProps, ProtocolGroup } from "./types"
import type { DeFiPositionDisplay } from "@/lib/utils/data-transformers"

/**
 * Main DeFi Section component displaying portfolio positions grouped by protocol
 * Reads streamed positions from wallet store - streaming is initiated by DefiStreamProvider at page level
 */
export function DeFiSection({ isLoading = false }: DefiSectionProps) {
  const { wallets, walletData, selectedWalletId, streaming } = useWalletStore()
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(new Set())

  // Get wallet info map for position enrichment
  const walletInfoMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>()
    wallets.forEach(w => {
      map.set(w.address, { name: w.name, color: w.color })
    })
    return map
  }, [wallets])

  // Get streamed protocol groups from the store and enrich with wallet info
  const streamedGroups: ProtocolGroup[] = useMemo(() => {
    const protocols = Array.from(streaming.streamedProtocols.values())
    return protocols
      .filter(p => p.positions && p.positions.length > 0)
      .map(protocol => ({
        id: protocol.id,
        name: protocol.name,
        logo: protocol.logo || null,
        totalValue: parseFloat(protocol.totalValueUSD || '0'),
        positions: protocol.positions.map(pos => {
          const walletInfo = pos.walletAddress ? walletInfoMap.get(pos.walletAddress) : undefined
          return {
            id: pos.id,
            protocol: protocol.name,
            type: mapPositionType(pos.type),
            assets: extractAssets(pos.details),
            deposited: parseFloat(pos.totalValueUSD || '0'),
            current: parseFloat(pos.totalValueUSD || '0'),
            apy: extractApy(pos.details),
            rewards: extractRewards(pos.details),
            logo: protocol.logo,
            positionDetails: pos.details,
            protocolUrl: protocol.url,
            estimatedYield: extractEstimatedYield(pos.details),
            walletAddress: pos.walletAddress,
            walletName: walletInfo?.name,
            walletColor: walletInfo?.color,
          } as DeFiPositionDisplay
        }),
        stats: protocol.protocolStats ? {
          weightedApyPercent: protocol.protocolStats.weightedApyPercent ?? undefined,
          estimatedYield: protocol.protocolStats.estimatedYield,
        } : undefined,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
  }, [streaming.streamedProtocols, walletInfoMap])

  // Flatten positions from streamed data
  const streamedPositions: DeFiPositionDisplay[] = useMemo(() => {
    return streamedGroups.flatMap(group => group.positions)
  }, [streamedGroups])

  const hasStreamedData = streamedGroups.length > 0

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
  const showSkeleton = (isLoading || (streaming.isStreaming && !hasStreamedData)) && !hasData
  
  // Show streaming indicator while streaming is in progress
  const showStreamingIndicator = streaming.isStreaming && streaming.streamProgress.total > 0

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <DefiStatsGrid
        isLoading={isLoading || (streaming.isStreaming && !hasStreamedData)}
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
          completed={streaming.streamProgress.completed}
          total={streaming.streamProgress.total}
          isComplete={streaming.isStreamComplete}
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
      {protocolGroups.length === 0 && !showSkeleton && streaming.isStreamComplete && <DefiEmptyState />}
    </div>
  )
}

// Helper functions to extract data from position details
function mapPositionType(type: string): 'lending' | 'liquidity' | 'staking' | 'farming' {
  const typeMap: Record<string, 'lending' | 'liquidity' | 'staking' | 'farming'> = {
    lending: 'lending',
    liquidity: 'liquidity',
    staking: 'staking',
    farming: 'farming',
    options: 'lending',
    spot: 'staking',
  }
  return typeMap[type] || 'lending'
}

function extractAssets(details: Record<string, unknown>): string[] {
  const assets: string[] = []
  
  if (details?.token) {
    const token = details.token as Record<string, unknown>
    if (token.symbol) assets.push(String(token.symbol))
  }
  
  if (details?.token0) {
    const token0 = details.token0 as Record<string, unknown>
    if (token0.symbol) assets.push(String(token0.symbol))
  }
  
  if (details?.token1) {
    const token1 = details.token1 as Record<string, unknown>
    if (token1.symbol) assets.push(String(token1.symbol))
  }
  
  if (details?.pair) {
    return String(details.pair).split('/').map(s => s.trim())
  }
  
  return assets
}

function extractApy(details: Record<string, unknown>): number {
  const apy = details?.apy
  if (typeof apy === 'number') return apy
  if (typeof apy === 'string') return parseFloat(apy) || 0
  return 0
}

function extractRewards(details: Record<string, unknown>): number {
  const fees = details?.uncollectedFees as Record<string, unknown> | undefined
  if (fees?.usdValue) {
    const value = typeof fees.usdValue === 'string' 
      ? parseFloat(fees.usdValue) 
      : Number(fees.usdValue)
    return Number.isNaN(value) ? 0 : value
  }
  return 0
}

function extractEstimatedYield(details: Record<string, unknown>): { daily: string; weekly: string; monthly: string } | undefined {
  const yield_ = details?.estimatedYield as Record<string, unknown> | undefined
  if (yield_) {
    return {
      daily: String(yield_.daily || '0.00'),
      weekly: String(yield_.weekly || '0.00'),
      monthly: String(yield_.monthly || '0.00'),
    }
  }
  return undefined
}
