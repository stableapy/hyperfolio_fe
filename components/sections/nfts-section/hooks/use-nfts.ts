"use client"

import { useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformNFTs } from "@/lib/utils/data-transformers"
import type { NFT, NFTTotals } from "../types"

/**
 * Hook to fetch and aggregate NFTs from wallets
 * Returns NFTs based on selected wallet or aggregated from all wallets
 */
export function useNfts() {
  const { wallets, walletData, selectedWalletId } = useWalletStore()

  // Get NFTs from selected wallet or all wallets - no mock data
  const nfts = useMemo(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.nfts) {
        return transformNFTs(walletData[wallet.address].nfts)
      }
      return [] // No data yet
    } else {
      // Aggregate NFTs from all wallets
      const allNFTs: NFT[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.nfts) {
          allNFTs.push(...transformNFTs(walletData[wallet.address].nfts))
        }
      })
      return allNFTs
    }
  }, [wallets, walletData, selectedWalletId])

  // Check if we have any data loaded
  const hasData = nfts.length > 0

  return { nfts, hasData }
}

/**
 * Hook to filter NFTs based on search query
 */
export function useFilteredNfts(nfts: NFT[], searchQuery: string) {
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return nfts
    
    const query = searchQuery.toLowerCase()
    return nfts.filter(
      (nft) =>
        nft.name.toLowerCase().includes(query) ||
        nft.collection.toLowerCase().includes(query),
    )
  }, [nfts, searchQuery])

  return filteredNfts
}

/**
 * Hook to calculate NFT totals
 */
export function useNftTotals(nfts: NFT[]): NFTTotals {
  return useMemo(() => {
    const totalValue = nfts.reduce((sum, nft) => sum + nft.usdPrice, 0)
    const nftCount = nfts.length
    return { totalValue, nftCount }
  }, [nfts])
}

