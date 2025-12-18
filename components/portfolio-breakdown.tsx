"use client"

import { useMemo } from "react"
import { TerminalCard, TerminalHeader, TerminalContent } from "./terminal-card"
import { useWalletStore } from "@/lib/store/wallet-store"

interface AssetBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

export function PortfolioBreakdown({ isLoading = false }: { isLoading?: boolean }) {
  const { aggregateData, selectedWalletId, wallets, walletData } = useWalletStore()
  
  // Helper function to safely parse numeric values
  const safeParseFloat = (value: any): number => {
    if (typeof value === 'number') {
      // Check for absurdly large numbers (likely corrupted data)
      if (Math.abs(value) > 1e15) return 0
      return value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      if (isNaN(parsed)) return 0
      // Check for absurdly large numbers
      if (Math.abs(parsed) > 1e15) return 0
      return parsed
    }
    return 0
  }
  
  // Helper function to transform individual wallet data to AggregateData format
  const transformWalletData = (data: any) => {
    if (!data) return null
    
    // If it's already AggregateData format, return as is
    if (data.total_value !== undefined && data.total_spot !== undefined) {
      return data
    }
    
    // Transform individual wallet data
    const tokens = data.compositionRaw?.data?.tokens || []
    const nftsData = data.nfts?.data?.nfts || []
    const positionsData = data.positions?.data?.protocols || []
    
    // Calculate token values by type directly from tokens
    const spotValue = tokens.filter((t: any) => t.type === 'spot').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    const perpValue = tokens.filter((t: any) => t.type === 'perp').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    const stakingValue = tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    const vaultsValue = tokens.filter((t: any) => t.type === 'vault').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    
    // Calculate NFTs value
    const nftValue = nftsData.reduce((sum: number, nft: any) => {
      const value = safeParseFloat(nft.usdValue || nft.fxValue)
      return sum + value
    }, 0)
    
    // Calculate DeFi positions value
    const defiValue = positionsData.reduce((sum: number, protocol: any) => {
      if (!Array.isArray(protocol.positions)) return sum
      return sum + protocol.positions.reduce((posSum: number, pos: any) => {
        const value = safeParseFloat(pos.totalValueUSD)
        return posSum + value
      }, 0)
    }, 0)
    
    // Calculate Hypercore value
    const hypercoreValue = safeParseFloat(data.userData?.data?.portfolioSummary?.totalValue)
    
    // Total value = sum of all categories (not composition.total_value which might be incomplete)
    const calculatedTotal = spotValue + perpValue + stakingValue + vaultsValue + nftValue + defiValue + hypercoreValue
    
    return {
      total_value: calculatedTotal,
      total_change_24h: 0, // Individual wallets don't have this
      total_spot: spotValue,
      total_perp: perpValue,
      total_staking: stakingValue,
      total_vaults: vaultsValue,
      total_hypercore: hypercoreValue,
      tokens: tokens,
      nfts: nftsData,
      positions: positionsData.flatMap((p: any) => p.positions || []),
      transactions: data.transactions || [],
      history: data.history || []
    }
  }
  
  // Get data from selected wallet or aggregate
  const displayData = useMemo(() => {
    if (selectedWalletId) {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        return transformWalletData(walletData[selectedWallet.address])
      }
    }
    return aggregateData
  }, [selectedWalletId, wallets, walletData, aggregateData])

  // Calculate breakdown from display data
  const totalValue = displayData?.total_value || 0
  
  // Calculate NFTs total value
  const nftValue = displayData?.nfts?.reduce((sum: number, nft: any) => {
    const value = safeParseFloat(nft.usdValue || nft.fxValue)
    return sum + value
  }, 0) || 0
  
  // Calculate DeFi positions total value
  const defiValue = displayData?.positions?.reduce((sum: number, pos: any) => {
    const value = safeParseFloat(pos.totalValueUSD || pos.value_usd)
    return sum + value
  }, 0) || 0
  
  const breakdown: AssetBreakdown[] = totalValue > 0 && displayData
    ? [
        { 
          category: "Spot", 
          value: displayData.total_spot || 0, 
          percentage: ((displayData.total_spot || 0) / totalValue) * 100, 
          color: "#00ff41" 
        },
        { 
          category: "Perp", 
          value: displayData.total_perp || 0, 
          percentage: ((displayData.total_perp || 0) / totalValue) * 100, 
          color: "#00d9ff" 
        },
        { 
          category: "Staking", 
          value: displayData.total_staking || 0, 
          percentage: ((displayData.total_staking || 0) / totalValue) * 100, 
          color: "#ff00ff" 
        },
        { 
          category: "Vaults", 
          value: displayData.total_vaults || 0, 
          percentage: ((displayData.total_vaults || 0) / totalValue) * 100, 
          color: "#ffaa00" 
        },
        { 
          category: "Hypercore", 
          value: displayData.total_hypercore || 0, 
          percentage: ((displayData.total_hypercore || 0) / totalValue) * 100, 
          color: "#00ff41" 
        },
        { 
          category: "DeFi", 
          value: defiValue, 
          percentage: (defiValue / totalValue) * 100, 
          color: "#0099ff" 
        },
        { 
          category: "NFTs", 
          value: nftValue, 
          percentage: (nftValue / totalValue) * 100, 
          color: "#ff7f00" 
        },
      ].filter(item => item.value > 0) // Only show categories with value
    : []
  if (isLoading) {
    return (
      <TerminalCard className="h-full">
        <TerminalHeader className="border-none">
          <span className="text-[#00ff41]">&gt; PORTFOLIO_BREAKDOWN</span>
        </TerminalHeader>
        <TerminalContent>
          <div className="space-y-1 flex flex-col justify-between h-full py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#708090]">&gt;</span>
                  <span className="font-mono text-[#708090] animate-pulse">LOADING...</span>
                </div>
                <span className="font-mono text-[#708090] animate-pulse">$0.00</span>
              </div>
            ))}
          </div>
        </TerminalContent>
      </TerminalCard>
    )
  }

  return (
    <TerminalCard className="h-full">
      <TerminalHeader className="border-none">
        <span className="text-[#00ff41]">&gt; PORTFOLIO_BREAKDOWN</span>
      </TerminalHeader>
      <TerminalContent>
        <div className="space-y-1 flex flex-col justify-between h-full py-4">
          {breakdown.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#708090]">&gt;</span>
                <span className="font-mono text-[#00ff41]">{item.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-white">
                  ${item.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-[#708090] w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </TerminalContent>
    </TerminalCard>
  )
}
