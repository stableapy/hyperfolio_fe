"use client"

import { useMemo } from "react"
import type { DeFiPositionDisplay } from "@/lib/utils/data-transformers"
import type { DefiStats } from "../types"

interface UseDefiStatsOptions {
  positions: DeFiPositionDisplay[]
}

/**
 * Custom hook for calculating DeFi portfolio statistics
 * Computes totals, weighted APY, and estimated yields
 *
 * IMPORTANT: For lending protocols, borrowed positions subtract from total
 */
export function useDefiStats({ positions }: UseDefiStatsOptions): DefiStats {
  return useMemo(() => {
    const totalDeposited = positions.reduce((sum, pos) => {
      // For lending protocols, borrowed positions subtract from the total
      const value = pos.positionSubType === 'borrowed' ? -pos.deposited : pos.deposited
      return sum + value
    }, 0)
    const totalCurrent = positions.reduce((sum, pos) => {
      // For lending protocols, borrowed positions subtract from the total
      const value = pos.positionSubType === 'borrowed' ? -pos.current : pos.current
      return sum + value
    }, 0)
    const totalRewards = positions.reduce((sum, pos) => sum + pos.rewards, 0)
    
    // Calculate weighted portfolio APY
    const positionsWithApyList = positions.filter(pos => pos.apy > 0)
    const weightedApy = positionsWithApyList.length > 0 && totalCurrent > 0
      ? positionsWithApyList.reduce((sum, pos) => sum + (pos.apy * pos.current), 0) / totalCurrent
      : 0
    
    // Calculate portfolio-level estimated yield
    const portfolioYield = {
      daily: positionsWithApyList.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.daily) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
      weekly: positionsWithApyList.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.weekly) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
      monthly: positionsWithApyList.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.monthly) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
    }

    return {
      totalDeposited,
      totalCurrent,
      totalRewards,
      weightedApy,
      portfolioYield,
      positionsWithApy: positionsWithApyList.length,
      totalPositions: positions.length,
    }
  }, [positions])
}

