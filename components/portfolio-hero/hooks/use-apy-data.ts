"use client"

import { useMemo } from "react"
import type { ApyData } from "../types"
import { useWalletStore } from "@/lib/store/wallet-store"

interface Wallet {
  id: string
  address: string
  name: string
  color: string
}

interface UseApyDataOptions {
  selectedWalletId: string | null
  wallets: Wallet[]
}

/**
 * Custom hook for calculating APY and estimated yields from DeFi positions
 * Uses streaming data from wallet store as single source of truth
 */
export function useApyData({
  selectedWalletId,
  wallets,
}: UseApyDataOptions): ApyData {
  // Get streaming DeFi positions from wallet store
  const { streaming } = useWalletStore()

  return useMemo(() => {
    // Get positions from streamed protocols
    const streamedProtocols = Array.from(streaming.streamedProtocols.values())
    
    // Get wallet addresses to filter by
    const filterAddresses = selectedWalletId
      ? [wallets.find(w => w.id === selectedWalletId)?.address].filter(Boolean) as string[]
      : undefined

    // Collect all positions with APY data
    const allPositions: Array<{ apy: number; current: number; estimatedYield?: { daily: string; weekly: string; monthly: string } }> = []
    
    streamedProtocols.forEach(protocol => {
      if (!protocol.positions) return
      
      protocol.positions.forEach(pos => {
        // Filter by wallet address if specified
        if (filterAddresses && pos.walletAddress && !filterAddresses.includes(pos.walletAddress)) {
          return
        }
        
        const value = parseFloat(pos.totalValueUSD || '0')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const details = pos.details as any
        const apy = details?.apy ? (typeof details.apy === 'string' ? parseFloat(details.apy) : details.apy) : 0
        const estimatedYield = details?.estimatedYield
        
        allPositions.push({
          apy: apy || 0,
          current: value,
          estimatedYield: estimatedYield ? {
            daily: String(estimatedYield.daily || '0.00'),
            weekly: String(estimatedYield.weekly || '0.00'),
            monthly: String(estimatedYield.monthly || '0.00'),
          } : undefined,
        })
      })
    })
    
    const positionsWithApy = allPositions.filter(pos => pos.apy > 0)
    const totalPositionsValue = positionsWithApy.reduce((sum, pos) => sum + pos.current, 0)
    
    // Calculate weighted average APY
    const weightedApy = totalPositionsValue > 0 
      ? positionsWithApy.reduce((sum, pos) => sum + (pos.apy * pos.current), 0) / totalPositionsValue
      : 0
    
    // Calculate estimated yields
    const estimatedYield = {
      daily: positionsWithApy.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.daily) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
      weekly: positionsWithApy.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.weekly) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
      monthly: positionsWithApy.reduce((sum, pos) => {
        const yieldVal = pos.estimatedYield ? parseFloat(pos.estimatedYield.monthly) : 0
        return sum + (Number.isNaN(yieldVal) ? 0 : yieldVal)
      }, 0),
    }
    
    return {
      weightedApy,
      estimatedYield,
      hasPositions: positionsWithApy.length > 0
    }
  }, [selectedWalletId, wallets, streaming.streamedProtocols])
}

