"use client"

import { useMemo } from "react"
import { transformDeFiPositions, groupPositionsByProtocol, type DeFiPositionDisplay } from "@/lib/utils/data-transformers"
import type { ProtocolGroup } from "../types"

interface Wallet {
  id: string
  address: string
  name: string
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletDataMap = Record<string, any>

interface UseDefiPositionsOptions {
  selectedWalletId: string | null
  wallets: Wallet[]
  walletData: WalletDataMap
}

interface UseDefiPositionsResult {
  positions: DeFiPositionDisplay[]
  protocolGroups: ProtocolGroup[]
  hasData: boolean
}

/**
 * Custom hook for fetching and transforming DeFi positions
 * Handles both single wallet and aggregate views
 */
export function useDefiPositions({
  selectedWalletId,
  wallets,
  walletData,
}: UseDefiPositionsOptions): UseDefiPositionsResult {
  // Get positions from selected wallet or all wallets
  const { positions, protocolsData } = useMemo(() => {
    if (wallets.length === 0) return { positions: [], protocolsData: [] }
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.positions) {
        return {
          positions: transformDeFiPositions(
            walletData[wallet.address].positions,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ),
          protocolsData: walletData[wallet.address].positions?.data?.protocols || []
        }
      }
      return { positions: [], protocolsData: [] }
    } else {
      // Aggregate positions from all wallets with wallet info
      const allPositions: DeFiPositionDisplay[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allProtocolsData: any[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.positions) {
          allPositions.push(...transformDeFiPositions(
            walletData[wallet.address].positions,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ))
          if (walletData[wallet.address].positions?.data?.protocols) {
            allProtocolsData.push(...walletData[wallet.address].positions.data.protocols)
          }
        }
      })
      return { positions: allPositions, protocolsData: allProtocolsData }
    }
  }, [wallets, walletData, selectedWalletId])

  // Group positions by protocol
  const protocolGroups = useMemo(() => {
    return groupPositionsByProtocol(positions, protocolsData) as ProtocolGroup[]
  }, [positions, protocolsData])

  return {
    positions,
    protocolGroups,
    hasData: positions.length > 0,
  }
}

