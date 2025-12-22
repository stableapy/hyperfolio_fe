"use client"

import { useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import type { 
  HypercoreData, 
  SpotBalance, 
  PerpPosition, 
  StakingInfo, 
  VaultInfo, 
  PortfolioSummary 
} from "../types"

/**
 * Create initial empty aggregated data structure
 */
function createEmptyAggregatedData(): HypercoreData {
  return {
    spotBalances: [],
    perpPositions: { 
      positions: [], 
      margin: { usdcBalance: "0.0", lastUpdate: Date.now() } 
    },
    stakingInfo: {
      totalHype: "0.0",
      stakedHype: "0",
      availableHype: "0",
      delegations: [],
      delegatorSummary: {
        delegated: "0.0",
        undelegated: "0.0",
        totalPendingWithdrawal: "0.0",
        nPendingWithdrawals: 0,
        totalStakedUsd: "0"
      },
      usdPrice: "0",
      image_url: "",
      lastUpdate: Date.now()
    },
    vaultInfo: { vaults: [], totalVaultValue: "0" },
    portfolioSummary: {
      totalValue: "0",
      spotValue: "0",
      perpValue: "0",
      stakedValue: "0",
      vaultValue: "0",
      lastUpdate: Date.now()
    }
  }
}

/**
 * Aggregate spot balances from multiple wallets
 */
function aggregateSpotBalances(
  aggregated: SpotBalance[], 
  newBalances: SpotBalance[]
): void {
  newBalances.forEach((balance) => {
    const existing = aggregated.find(b => b.coin === balance.coin)
    if (existing) {
      existing.total = (parseFloat(existing.total) + parseFloat(balance.total)).toString()
      existing.usdValue = (parseFloat(existing.usdValue) + parseFloat(balance.usdValue)).toString()
    } else {
      aggregated.push({ ...balance })
    }
  })
}

/**
 * Aggregate staking info from multiple wallets
 */
function aggregateStakingInfo(
  aggregated: StakingInfo, 
  newStaking: StakingInfo
): void {
  aggregated.totalHype = (
    parseFloat(aggregated.totalHype) + parseFloat(newStaking.totalHype)
  ).toString()
  aggregated.stakedHype = (
    parseFloat(aggregated.stakedHype) + parseFloat(newStaking.stakedHype)
  ).toString()
  aggregated.delegatorSummary.totalStakedUsd = (
    parseFloat(aggregated.delegatorSummary.totalStakedUsd) + 
    parseFloat(newStaking.delegatorSummary?.totalStakedUsd || "0")
  ).toString()
}

/**
 * Aggregate vault info from multiple wallets
 */
function aggregateVaultInfo(
  aggregated: VaultInfo, 
  newVaults: VaultInfo
): void {
  aggregated.vaults.push(...newVaults.vaults)
  aggregated.totalVaultValue = (
    parseFloat(aggregated.totalVaultValue) + parseFloat(newVaults.totalVaultValue)
  ).toString()
}

/**
 * Aggregate portfolio summary from multiple wallets
 */
function aggregatePortfolioSummary(
  aggregated: PortfolioSummary, 
  newSummary: PortfolioSummary
): void {
  aggregated.totalValue = (
    parseFloat(aggregated.totalValue) + parseFloat(newSummary.totalValue)
  ).toString()
  aggregated.spotValue = (
    parseFloat(aggregated.spotValue) + parseFloat(newSummary.spotValue)
  ).toString()
  aggregated.perpValue = (
    parseFloat(aggregated.perpValue) + parseFloat(newSummary.perpValue)
  ).toString()
  aggregated.stakedValue = (
    parseFloat(aggregated.stakedValue) + parseFloat(newSummary.stakedValue)
  ).toString()
  aggregated.vaultValue = (
    parseFloat(aggregated.vaultValue) + parseFloat(newSummary.vaultValue)
  ).toString()
}

/**
 * Hook to get and aggregate Hypercore data from wallet store
 * Returns data for selected wallet or aggregated data from all wallets
 */
export function useHypercoreData() {
  const { wallets, walletData, selectedWalletId } = useWalletStore()

  const hypercoreData = useMemo((): HypercoreData | null => {
    if (wallets.length === 0) return null
    
    // Single wallet selected
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.userData?.data) {
        return walletData[wallet.address].userData.data as HypercoreData
      }
      return null
    }
    
    // Aggregate data from all wallets
    const aggregated = createEmptyAggregatedData()
    
    wallets.forEach(wallet => {
      const data = walletData[wallet.address]?.userData?.data
      if (!data) return
      
      // Aggregate spot balances
      if (data.spotBalances) {
        aggregateSpotBalances(aggregated.spotBalances, data.spotBalances)
      }
      
      // Aggregate staking
      if (data.stakingInfo) {
        aggregateStakingInfo(aggregated.stakingInfo, data.stakingInfo)
      }
      
      // Aggregate vaults
      if (data.vaultInfo) {
        aggregateVaultInfo(aggregated.vaultInfo, data.vaultInfo)
      }
      
      // Aggregate portfolio summary
      if (data.portfolioSummary) {
        aggregatePortfolioSummary(aggregated.portfolioSummary, data.portfolioSummary)
      }
    })
    
    return aggregated
  }, [wallets, walletData, selectedWalletId])

  return { hypercoreData }
}

