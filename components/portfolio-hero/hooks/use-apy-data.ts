"use client"

import { useMemo } from "react"
import { transformDeFiPositions } from "@/lib/utils/data-transformers"
import type { ApyData } from "../types"

interface Wallet {
  id: string
  address: string
  name: string
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletDataMap = Record<string, any>

interface UseApyDataOptions {
  selectedWalletId: string | null
  wallets: Wallet[]
  walletData: WalletDataMap
}

/**
 * Custom hook for calculating APY and estimated yields from DeFi positions
 */
export function useApyData({
  selectedWalletId,
  wallets,
  walletData,
}: UseApyDataOptions): ApyData {
  return useMemo(() => {
    // Get all DeFi positions
    const allPositions: Array<{ apy: number; current: number; estimatedYield?: { daily: string; weekly: string; monthly: string } }> = []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.positions) {
        const transformed = transformDeFiPositions(
          walletData[wallet.address].positions,
          { address: wallet.address, name: wallet.name, color: wallet.color }
        )
        allPositions.push(...transformed)
      }
    } else {
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.positions) {
          const transformed = transformDeFiPositions(
            walletData[wallet.address].positions,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          )
          allPositions.push(...transformed)
        }
      })
    }
    
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
  }, [selectedWalletId, wallets, walletData])
}

