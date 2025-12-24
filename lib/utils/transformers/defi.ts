// DeFi position transformation utilities
import type { DeFiPosition } from '@/lib/types/api'
import { safeFloat } from '../parsers'

export interface EstimatedYield {
  daily: string
  weekly: string
  monthly: string
}

export interface DeFiPositionDisplay {
  id: string
  protocol: string
  type: "lending" | "liquidity" | "staking" | "farming"
  assets: string[]
  deposited: number
  current: number
  apy: number
  rewards: number
  logo: string
  positionDetails?: any
  protocolUrl?: string
  estimatedYield?: EstimatedYield
  walletAddress?: string
  walletName?: string
  walletColor?: string
}

export interface ProtocolStats {
  weightedApyPercent: number | null
  positionsWithApy: number
  totalPositions: number
  estimatedYield: EstimatedYield
}

export interface ProtocolGroup {
  id: string
  name: string
  logo: string
  url: string
  totalValue: number
  positions: DeFiPositionDisplay[]
  stats?: ProtocolStats
}

/**
 * Transform DeFi positions from API response to display format
 */
export function transformDeFiPositions(
  positionsData: any,
  walletInfo?: { address: string; name: string; color: string }
): DeFiPositionDisplay[] {
  if (!positionsData?.data?.protocols) return []

  const positions: DeFiPositionDisplay[] = []

  positionsData.data.protocols.forEach((protocol: any) => {
    if (protocol.positions && protocol.positions.length > 0) {
      protocol.positions.forEach((position: any) => {
        const typeMap: Record<string, "lending" | "liquidity" | "staking" | "farming"> = {
          lending: "lending",
          liquidity: "liquidity",
          staking: "staking",
          farming: "farming",
        }

        const positionType = typeMap[position.type] || "lending"
        const tokens = []

        if (position.details?.token) {
          tokens.push(position.details.token.symbol)
        } else if (position.details?.token0 && position.details?.token1) {
          tokens.push(position.details.token0.symbol, position.details.token1.symbol)
        }

        // Calculate rewards (uncollected fees) with validation
        const positionValue = safeFloat(position.totalValueUSD)

        // Skip positions with zero value
        if (positionValue <= 0) {
          return
        }

        const rawRewards = safeFloat(position.details?.uncollectedFees?.usdValue)

        // Filter out absurd fees (e.g., when position is out of range and API returns bad data)
        // If fees are more than 10x the position value, it's clearly corrupted data
        const rewards = rawRewards > positionValue * 10 ? 0 : rawRewards

        // Extract APY from position if available (vault positions may have this)
        // Ensure APY is converted to a number
        const rawApy = position.apy || position.details?.apy || 0
        const apy = typeof rawApy === 'string' ? safeFloat(rawApy) : rawApy

        // Extract estimated yield if available
        const estimatedYield = position.details?.estimatedYield || position.estimatedYield

        positions.push({
          id: position.id,
          protocol: protocol.name,
          type: positionType,
          assets: tokens,
          deposited: positionValue,
          current: positionValue,
          apy,
          rewards,
          logo: protocol.logo || '',
          positionDetails: position.details, // Keep full details for display
          protocolUrl: protocol.url,
          estimatedYield,
          walletAddress: walletInfo?.address,
          walletName: walletInfo?.name,
          walletColor: walletInfo?.color,
        })
      })
    }
  })

  // Sort positions by current value (highest first)
  return positions.sort((a, b) => b.current - a.current)
}

/**
 * Group positions by protocol (with raw API data for stats)
 */
export function groupPositionsByProtocol(positions: DeFiPositionDisplay[], protocolsData?: any[]): ProtocolGroup[] {
  const protocolMap = new Map<string, ProtocolGroup>()

  positions.forEach((position) => {
    const existing = protocolMap.get(position.protocol)

    if (existing) {
      existing.positions.push(position)
      existing.totalValue += position.current
    } else {
      // Find protocol stats from raw API data
      const protocolData = protocolsData?.find((p: any) => p.name === position.protocol)
      const stats = protocolData?.protocolStats

      protocolMap.set(position.protocol, {
        id: position.protocol.toLowerCase().replace(/\s+/g, '-'),
        name: position.protocol,
        logo: position.logo,
        url: position.protocolUrl || '',
        totalValue: position.current,
        positions: [position],
        stats,
      })
    }
  })

  // Recalculate stats for each protocol based on aggregated positions
  const protocolGroups = Array.from(protocolMap.values()).map((protocol) => {
    // Sort positions within protocol by value (highest first)
    protocol.positions.sort((a, b) => b.current - a.current)

    const positionsWithApy = protocol.positions.filter(pos => pos.apy > 0)

    if (positionsWithApy.length > 0) {
      // Calculate weighted APY
      const weightedApy = positionsWithApy.reduce((sum, pos) => sum + (pos.apy * pos.current), 0) / protocol.totalValue

      // Calculate total estimated yield
      const totalYield = {
        daily: positionsWithApy.reduce((sum, pos) => {
          const daily = pos.estimatedYield ? safeFloat(pos.estimatedYield.daily) : 0
          return sum + daily
        }, 0).toFixed(2),
        weekly: positionsWithApy.reduce((sum, pos) => {
          const weekly = pos.estimatedYield ? safeFloat(pos.estimatedYield.weekly) : 0
          return sum + weekly
        }, 0).toFixed(2),
        monthly: positionsWithApy.reduce((sum, pos) => {
          const monthly = pos.estimatedYield ? safeFloat(pos.estimatedYield.monthly) : 0
          return sum + monthly
        }, 0).toFixed(2),
      }

      return {
        ...protocol,
        stats: {
          weightedApyPercent: weightedApy,
          positionsWithApy: positionsWithApy.length,
          totalPositions: protocol.positions.length,
          estimatedYield: totalYield,
        },
      }
    }

    return protocol
  })

  return protocolGroups.sort((a, b) => b.totalValue - a.totalValue)
}
