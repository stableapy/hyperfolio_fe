"use client"

import { useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTokens, groupTokensBySymbol } from "@/lib/utils/data-transformers"
import { filterTokens, sortTokens, calculateTotals } from "../utils"
import type { Token } from "../types"
import type { Wallet } from "@/lib/types/api"

interface UseTokensDataOptions {
  searchQuery: string
  isGrouped: boolean
}

interface UseTokensDataReturn {
  /** Filtered and sorted tokens ready for display */
  filteredTokens: Token[]
  /** Total value and count of filtered tokens */
  totals: { totalValue: number; tokenCount: number }
  /** Whether we have any token data loaded */
  hasData: boolean
  /** List of wallets from the store */
  wallets: Wallet[]
  /** Currently selected wallet ID */
  selectedWalletId: string | null
}

/**
 * Hook to manage token data fetching, transformation, filtering and sorting
 * Centralizes all token data logic for the TokensSection component
 */
export function useTokensData({ 
  searchQuery, 
  isGrouped 
}: UseTokensDataOptions): UseTokensDataReturn {
  const { wallets, walletData, selectedWalletId } = useWalletStore()

  // Get tokens from selected wallet or all wallets
  const rawTokens = useMemo(() => {
    if (wallets.length === 0) return []

    // Debug: log wallet data structure
    console.log('[useTokensData] wallets:', wallets)
    console.log('[useTokensData] walletData keys:', Object.keys(walletData))
    console.log('[useTokensData] walletData:', walletData)

    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      console.log('[useTokensData] selectedWalletId:', selectedWalletId, 'wallet:', wallet)
      console.log('[useTokensData] walletData[wallet.address]:', wallet ? walletData[wallet.address] : 'no wallet')
      const walletComposition = wallet ? walletData[wallet.address]?.compositionRaw : undefined
      if (walletComposition?.data?.tokens && wallet) {
        console.log('[useTokensData] Found tokens for selected wallet:', walletComposition.data.tokens.length)
        return transformTokens(
          walletComposition.data.tokens,
          { address: wallet.address, name: wallet.name, color: wallet.color }
        )
      }
      console.log('[useTokensData] No tokens found for selected wallet')
      return []
    } else {
      // Aggregate tokens from all wallets with wallet info
      const allTokens: Token[] = []
      wallets.forEach(wallet => {
        console.log('[useTokensData] Processing wallet:', wallet.address, 'has data:', !!walletData[wallet.address])
        console.log('[useTokensData] walletData[wallet.address]:', walletData[wallet.address])
        const walletComposition = walletData[wallet.address]?.compositionRaw
        if (walletComposition?.data?.tokens) {
          const tokens = walletComposition.data.tokens
          console.log('[useTokensData] Found tokens for wallet', wallet.address, ':', tokens.length)
          allTokens.push(...transformTokens(
            tokens,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ))
        }
      })
      console.log('[useTokensData] Total aggregated tokens:', allTokens.length)
      return allTokens
    }
  }, [wallets, walletData, selectedWalletId])
  
  // Check if we have any data loaded
  const hasData = rawTokens.length > 0

  // Apply grouping if enabled and in multi-wallet view
  const groupedTokens = useMemo(() => {
    if (!selectedWalletId && isGrouped && rawTokens.length > 0) {
      return groupTokensBySymbol(rawTokens)
    }
    return rawTokens
  }, [rawTokens, isGrouped, selectedWalletId])

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    const filtered = filterTokens(groupedTokens, searchQuery)
    return sortTokens(filtered)
  }, [groupedTokens, searchQuery])

  // Calculate totals
  const totals = useMemo(() => {
    return calculateTotals(filteredTokens)
  }, [filteredTokens])

  return {
    filteredTokens,
    totals,
    hasData,
    wallets,
    selectedWalletId,
  }
}

