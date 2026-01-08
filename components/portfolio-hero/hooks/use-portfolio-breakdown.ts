"use client"

import { useMemo } from "react"
import type { AssetBreakdown } from "../types"
import { safeParseFloat, calculateStreamingTotalValue } from "../utils"
import { useWalletStore } from "@/lib/store/wallet-store"

interface Wallet {
  id: string
  address: string
  name: string
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletDataMap = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AggregateData = any

interface UsePortfolioBreakdownOptions {
  selectedWalletId: string | null
  wallets: Wallet[]
  walletData: WalletDataMap
  aggregateData: AggregateData
}

/**
 * Custom hook for calculating portfolio breakdown by asset category
 * Uses streaming data for DeFi positions to avoid duplicate fetching
 */
export function usePortfolioBreakdown({
  selectedWalletId,
  wallets,
  walletData,
  aggregateData,
}: UsePortfolioBreakdownOptions): AssetBreakdown[] {
  // Get streaming DeFi positions from wallet store
  const { streaming } = useWalletStore()

  return useMemo((): AssetBreakdown[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = aggregateData

    // Calculate DeFi value from streaming data
    // When ALL wallets selected: use server-calculated aggregate total (more accurate)
    // When specific wallet selected: filter positions by wallet address
    const defiValue = selectedWalletId
      ? (() => {
          const streamingAddresses = [wallets.find(w => w.id === selectedWalletId)?.address].filter(Boolean) as string[]
          return calculateStreamingTotalValue(streaming.streamedProtocols, streamingAddresses)
        })()
      : (streaming.streamPortfolioStats?.totalValueUSD
          ? parseFloat(streaming.streamPortfolioStats.totalValueUSD)
          : 0)

    if (selectedWalletId) {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const rawData = walletData[selectedWallet.address]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokens = ((rawData as any).compositionRaw || (rawData as any).composition)?.data?.tokens || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftsData = (rawData.nfts as any)?.data?.nfts || []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spotValue = tokens.filter((t: any) => t.type === 'spot').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perpValue = tokens.filter((t: any) => t.type === 'perp').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stakingValue = tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vaultsValue = tokens.filter((t: any) => t.type === 'vault').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftValue = nftsData.reduce((sum: number, nft: any) => sum + safeParseFloat(nft.usdValue || nft.fxValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hypercoreValue = safeParseFloat((rawData.userData as any)?.data?.portfolioSummary?.totalValue)

        data = {
          total_value: spotValue + perpValue + stakingValue + vaultsValue + nftValue + defiValue + hypercoreValue,
          total_spot: spotValue,
          total_perp: perpValue,
          total_staking: stakingValue,
          total_vaults: vaultsValue,
          total_hypercore: hypercoreValue,
        }
      }
    }

    if (!data || !data.total_value) return []

    const totalVal = data.total_value

    // Calculate NFT and Staking values from all wallets or selected wallet
    let nftValue = 0
    let stakingValue = data.total_staking || 0

    if (selectedWalletId) {
      // Single wallet selected
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const rawData = walletData[selectedWallet.address]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftsData = (rawData.nfts as any)?.data?.nfts || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nftValue = nftsData.reduce((sum: number, nft: any) => sum + safeParseFloat(nft.usdValue || nft.fxValue), 0)
      }
    } else {
      // All wallets - aggregate from all
      wallets.forEach(wallet => {
        const rawData = walletData[wallet.address]
        if (rawData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nftsData = (rawData.nfts as any)?.data?.nfts || []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tokens = ((rawData as any).compositionRaw || (rawData as any).composition)?.data?.tokens || []
          
          // NFTs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nftValue += nftsData.reduce((sum: number, nft: any) => sum + safeParseFloat(nft.usdValue || nft.fxValue), 0)
          
          // Staking from tokens
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stakingValue += tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        }
      })
    }

    return [
      { category: "Tokens", value: data.total_spot || 0, percentage: ((data.total_spot || 0) / totalVal) * 100, color: "var(--theme-accent)" },
      { category: "Staking", value: stakingValue, percentage: (stakingValue / totalVal) * 100, color: "var(--theme-magenta)" },
      { category: "DeFi", value: defiValue, percentage: (defiValue / totalVal) * 100, color: "var(--theme-cyan)" },
      { category: "NFTs", value: nftValue, percentage: (nftValue / totalVal) * 100, color: "var(--theme-purple)" },
      { category: "Hypercore", value: data.total_hypercore || 0, percentage: ((data.total_hypercore || 0) / totalVal) * 100, color: "var(--theme-orange)" },
    ].filter(item => item.value > 0)
  }, [aggregateData, selectedWalletId, wallets, walletData, streaming.streamPortfolioStats, streaming.streamedProtocols])
}

