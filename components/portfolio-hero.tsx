"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { RefreshCw, TrendingUp, TrendingDown, ChevronDown, Wallet, Plus, Check, Sparkles, Trash2 } from "lucide-react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { transformDeFiPositions } from "@/lib/utils/data-transformers"

interface PortfolioHeroProps {
  totalValue: number
  change24h: number
  isLoading?: boolean
  onRefresh?: () => void
  onAddWallet?: () => void
}

interface HistorySnapshot {
  total_value_usd: number
  snapshot_date: string
  snapshot_timestamp: number
}

interface PortfolioHistory {
  snapshots: HistorySnapshot[]
  summary: {
    current_value: number
    change_24h: number
    percent_change_24h: number
  }
}

interface AssetBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

export function PortfolioHero({ totalValue, change24h, isLoading = false, onRefresh, onAddWallet }: PortfolioHeroProps) {
  const { selectedWalletId, wallets, walletData, aggregateData, selectWallet, removeWallet } = useWalletStore()
  const [portfolioHistory, setPortfolioHistory] = useState<HistorySnapshot[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [privacyMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  
  // Track chart display for smooth fade-in
  const [showChart, setShowChart] = useState(false)
  
  // Track scroll to hide scroll indicator
  const [hasScrolled, setHasScrolled] = useState(false)
  
  // Hide scroll indicator when user scrolls, show when back at top
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Delay chart display for smoother experience
  useEffect(() => {
    if (!isLoading && !isLoadingHistory && portfolioHistory.length > 0) {
      const timer = setTimeout(() => setShowChart(true), 300)
      return () => clearTimeout(timer)
    }
    if (isLoading) {
      setShowChart(false)
    }
  }, [isLoading, isLoadingHistory, portfolioHistory.length])

  // Helper function to safely parse numeric values
  const safeParseFloat = useCallback((value: unknown): number => {
    if (typeof value === 'number') {
      if (Math.abs(value) > 1e15) return 0
      return value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) return 0
      if (Math.abs(parsed) > 1e15) return 0
      return parsed
    }
    return 0
  }, [])

  // Helper function to calculate total value from wallet data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateWalletTotalValue = useCallback((data: any) => {
    if (!data) return 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = (data.compositionRaw || data.composition)?.data?.tokens || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nftsData = (data.nfts as any)?.data?.nfts || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positionsData = (data.positions as any)?.data?.protocols || []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spotValue = tokens.filter((t: any) => t.type === 'spot').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perpValue = tokens.filter((t: any) => t.type === 'perp').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stakingValue = tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vaultsValue = tokens.filter((t: any) => t.type === 'vault').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nftValue = nftsData.reduce((sum: number, nft: any) => {
      const value = safeParseFloat(nft.usdValue || nft.fxValue)
      return sum + value
    }, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defiValue = positionsData.reduce((sum: number, protocol: any) => {
      if (!Array.isArray(protocol.positions)) return sum
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sum + protocol.positions.reduce((posSum: number, pos: any) => {
        const value = safeParseFloat(pos.totalValueUSD)
        return posSum + value
      }, 0)
    }, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hypercoreValue = safeParseFloat((data.userData as any)?.data?.portfolioSummary?.totalValue)

    return spotValue + perpValue + stakingValue + vaultsValue + nftValue + defiValue + hypercoreValue
  }, [safeParseFloat])

  // Fetch portfolio history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const addresses = selectedWalletId
          ? [wallets.find(w => w.id === selectedWalletId)?.address].filter(Boolean)
          : wallets.map(w => w.address)

        if (addresses.length === 0) {
          setPortfolioHistory([])
          return
        }

        let data: PortfolioHistory

        if (addresses.length === 1) {
          const response = await fetch(`/api/portfolio-history?address=${addresses[0]}`)
          if (!response.ok) throw new Error('Failed to fetch portfolio history')
          data = await response.json()
        } else {
          const response = await fetch('/api/portfolio-history-aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses }),
          })
          if (!response.ok) throw new Error('Failed to fetch aggregated portfolio history')
          data = await response.json()
        }

        const recentSnapshots = data.snapshots.slice(-30)
        setPortfolioHistory(recentSnapshots)
      } catch (error) {
        console.error('Error fetching portfolio history:', error)
        setPortfolioHistory([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [selectedWalletId, wallets])

  // Get display data from selected wallet or aggregate
  const displayData = useMemo(() => {
    if (selectedWalletId) {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const data = walletData[selectedWallet.address]
        return {
          value: calculateWalletTotalValue(data),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          change24h: (data.composition as any)?.total_change_24h || change24h,
          walletName: selectedWallet.name
        }
      }
    }
    return {
      value: totalValue,
      change24h,
      walletName: null
    }
  }, [selectedWalletId, wallets, walletData, totalValue, change24h, calculateWalletTotalValue])

  // Calculate breakdown data
  const breakdown = useMemo((): AssetBreakdown[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = aggregateData

    if (selectedWalletId) {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const rawData = walletData[selectedWallet.address]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokens = ((rawData as any).compositionRaw || (rawData as any).composition)?.data?.tokens || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftsData = (rawData.nfts as any)?.data?.nfts || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const positionsData = (rawData.positions as any)?.data?.protocols || []

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
        const defiValue = positionsData.reduce((sum: number, protocol: any) => {
          if (!Array.isArray(protocol.positions)) return sum
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return sum + protocol.positions.reduce((posSum: number, pos: any) => posSum + safeParseFloat(pos.totalValueUSD), 0)
        }, 0)
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

    // Calculate NFT, DeFi and Staking values from all wallets or selected wallet
    let nftValue = 0
    let defiValue = 0
    let stakingValue = data.total_staking || 0

    if (selectedWalletId) {
      // Single wallet selected
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const rawData = walletData[selectedWallet.address]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftsData = (rawData.nfts as any)?.data?.nfts || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const positionsData = (rawData.positions as any)?.data?.protocols || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nftValue = nftsData.reduce((sum: number, nft: any) => sum + safeParseFloat(nft.usdValue || nft.fxValue), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defiValue = positionsData.reduce((sum: number, protocol: any) => {
          if (!Array.isArray(protocol.positions)) return sum
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return sum + protocol.positions.reduce((posSum: number, pos: any) => posSum + safeParseFloat(pos.totalValueUSD), 0)
        }, 0)
      }
    } else {
      // All wallets - aggregate from all
      wallets.forEach(wallet => {
        const rawData = walletData[wallet.address]
        if (rawData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nftsData = (rawData.nfts as any)?.data?.nfts || []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const positionsData = (rawData.positions as any)?.data?.protocols || []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tokens = ((rawData as any).compositionRaw || (rawData as any).composition)?.data?.tokens || []
          
          // NFTs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nftValue += nftsData.reduce((sum: number, nft: any) => sum + safeParseFloat(nft.usdValue || nft.fxValue), 0)
          
          // DeFi positions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          defiValue += positionsData.reduce((sum: number, protocol: any) => {
            if (!Array.isArray(protocol.positions)) return sum
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return sum + protocol.positions.reduce((posSum: number, pos: any) => posSum + safeParseFloat(pos.totalValueUSD), 0)
          }, 0)
          
          // Staking from tokens
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stakingValue += tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
        }
      })
    }

    return [
      { category: "Tokens", value: data.total_spot || 0, percentage: ((data.total_spot || 0) / totalVal) * 100, color: "#00ff41" },
      { category: "Staking", value: stakingValue, percentage: (stakingValue / totalVal) * 100, color: "#00d9ff" },
      { category: "DeFi", value: defiValue, percentage: (defiValue / totalVal) * 100, color: "#ffaa00" },
      { category: "NFTs", value: nftValue, percentage: (nftValue / totalVal) * 100, color: "#ff7f00" },
      { category: "Hypercore", value: data.total_hypercore || 0, percentage: ((data.total_hypercore || 0) / totalVal) * 100, color: "#a855f7" },
    ].filter(item => item.value > 0)
  }, [aggregateData, selectedWalletId, wallets, walletData, safeParseFloat])

  // Calculate APY and estimated yields from DeFi positions
  const apyData = useMemo(() => {
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

  // Prepare chart data
  const chartData = useMemo(() => {
    if (portfolioHistory.length === 0) return []

    return portfolioHistory.map((snapshot) => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.total_value_usd,
      timestamp: snapshot.snapshot_timestamp,
    }))
  }, [portfolioHistory])

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh?.()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const formatValue = (value: number): { intPart: string; decPart: string } => {
    if (privacyMode) return { intPart: "••••••", decPart: "" }
    
    // Format with larger integer part and smaller decimals
    const intPart = Math.floor(value).toLocaleString("en-US")
    const decPart = (value % 1).toFixed(2).substring(1)
    
    return { intPart, decPart }
  }

  const formatCompactValue = (value: number) => {
    if (privacyMode) return "••••"
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isPositive = displayData.change24h >= 0
  const formattedValue = formatValue(displayData.value)

  // Get selected wallet info
  const selectedWallet = selectedWalletId 
    ? wallets.find(w => w.id === selectedWalletId) 
    : null

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string }; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f0f]/95 border border-[#00ff41]/30 rounded-lg px-4 py-3 shadow-2xl backdrop-blur-md">
          <p className="font-mono text-xs text-[#708090] mb-1">{payload[0].payload.date}</p>
          <p className="font-mono text-lg text-[#00ff41] font-bold">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0f] via-[#0a0f0f] to-[#0d1214]/30" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(#00ff41 1px, transparent 1px),
            linear-gradient(90deg, #00ff41 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col container mx-auto px-6 md:px-10 lg:px-16">
        {/* Header with wallet selector */}
        <header className="pt-8 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#00ff41] text-2xl font-mono font-bold">&gt;</span>
                <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight">
                  <span className="text-[#00ff41] text-glow-green">HYPER</span>
                  <span className="text-white">FOLIO_</span>
                </h1>
              </div>
              <p className="text-[#708090] font-mono text-sm tracking-wide">
                Multi-wallet DeFi portfolio tracker
              </p>
            </div>
            
            {/* Wallet Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#00ff41]/30 bg-[#0a0f0f]/80 backdrop-blur-sm hover:border-[#00ff41]/60 transition-all"
              >
                <Wallet className="w-4 h-4 text-[#00ff41]" />
                <span className="font-mono text-sm text-white">
                  {selectedWallet ? selectedWallet.name : 'All Wallets'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#708090] transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isWalletDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsWalletDropdownOpen(false)}
                    aria-label="Close dropdown"
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 py-2 rounded-xl border border-[#1a2225] bg-[#0d1214]/95 backdrop-blur-md shadow-2xl z-50">
                    {/* All Wallets Option */}
                    <button
                      type="button"
                      onClick={() => {
                        selectWallet(null)
                        setIsWalletDropdownOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className="font-mono text-sm text-white">All Wallets</span>
                      {selectedWalletId === null && (
                        <Check className="w-4 h-4 text-[#00ff41]" />
                      )}
                    </button>
                    
                    <div className="h-px bg-[#1a2225] my-1" />
                    
                    {/* Individual Wallets */}
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center group hover:bg-white/5 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            selectWallet(wallet.id)
                            setIsWalletDropdownOpen(false)
                          }}
                          className="flex-1 flex items-center gap-3 px-4 py-3"
                        >
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: wallet.color }}
                          />
                          <div className="flex-1 text-left">
                            <span className="font-mono text-sm text-white">{wallet.name}</span>
                            <span className="font-mono text-xs text-[#708090] ml-2">
                              {formatAddress(wallet.address)}
                            </span>
                          </div>
                          {selectedWalletId === wallet.id && (
                            <Check className="w-4 h-4 text-[#00ff41]" />
                          )}
                        </button>
                        {/* Delete button - visible on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            // If deleting the selected wallet, switch to All Wallets
                            if (selectedWalletId === wallet.id) {
                              selectWallet(null)
                            }
                            removeWallet(wallet.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 mr-2 rounded-lg text-[#708090] hover:text-red-500 hover:bg-red-500/10 transition-all"
                          aria-label={`Delete ${wallet.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="h-px bg-[#1a2225] my-1" />
                    
                    {/* Add Wallet */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWalletDropdownOpen(false)
                        onAddWallet?.()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-[#708090] hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-mono text-sm">Add Wallet</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content - Portfolio Value & Stats - Centered vertically */}
        <div className="flex-1 flex flex-col justify-center pb-80">
          {/* Content with granular loading states - show UI immediately, skeleton only data */}
          <div className="max-w-4xl space-y-8">
            {/* Label with controls - Always visible immediately */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm uppercase tracking-widest text-[#708090]">Portfolio Value</span>
             
              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-white/5 transition-all text-[#708090] hover:text-[#00d9ff]"
                aria-label="Refresh data"
                disabled={isRefreshing || isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            {/* Portfolio Value - Inline skeleton when loading */}
            <div className="font-mono tracking-tight leading-none min-h-[6rem] md:min-h-[8rem]">
              {isLoading && displayData.value === 0 ? (
                <div className="h-24 md:h-32 w-[70%] max-w-lg bg-[#1a2225] rounded-xl animate-pulse" />
              ) : (
                <>
                  <span className="text-7xl md:text-8xl lg:text-9xl font-bold text-white transition-all duration-300">
                    {privacyMode ? "••••••" : `$${formattedValue.intPart}`}
                  </span>
                  {!privacyMode && (
                    <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#708090] transition-all duration-300">
                      {formattedValue.decPart}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Stats Pills - Granular loading for each section */}
            <TooltipProvider>
              <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* 24h Change - Inline skeleton */}
                {isLoading && displayData.value === 0 ? (
                  <div className="h-8 w-28 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
                ) : (
                  <div 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 shrink-0 ${
                      isPositive 
                        ? "bg-[#00ff41]/10 border-[#00ff41]/20" 
                        : "bg-[#ff4444]/10 border-[#ff4444]/20"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-[#00ff41]" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-[#ff4444]" />
                    )}
                    <span className={`font-mono text-xs font-semibold ${isPositive ? "text-[#00ff41]" : "text-[#ff4444]"}`}>
                      {privacyMode ? "•••" : `${isPositive ? "+" : ""}${displayData.change24h.toFixed(2)}%`}
                    </span>
                    <span className="font-mono text-[10px] text-[#708090]">24h</span>
                  </div>
                )}
                
                {/* APY Pill with Tooltip - Only show when data is available */}
                {apyData.hasPositions && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-help transition-all duration-300 shrink-0 bg-[#a855f7]/10 border-[#a855f7]/20 hover:border-[#a855f7]/40"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                        <span className="font-mono text-xs font-semibold text-[#a855f7]">
                          {privacyMode ? "•••" : `${apyData.weightedApy.toFixed(1)}%`}
                        </span>
                        <span className="font-mono text-[10px] text-[#708090]">APY</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#0d1214] border-[#1a2225] p-3 max-w-xs">
                      <div className="space-y-2">
                        <div className="font-mono text-[10px] text-[#708090] uppercase tracking-wider">Estimated Yield</div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <div className="font-mono text-[10px] text-[#708090]">Daily</div>
                            <div className="font-mono text-xs text-[#00ff41] font-semibold">
                              {privacyMode ? "•••" : `$${apyData.estimatedYield.daily.toFixed(2)}`}
                            </div>
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-[#708090]">Weekly</div>
                            <div className="font-mono text-xs text-[#00ff41] font-semibold">
                              {privacyMode ? "•••" : `$${apyData.estimatedYield.weekly.toFixed(2)}`}
                            </div>
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-[#708090]">Monthly</div>
                            <div className="font-mono text-xs text-[#00ff41] font-semibold">
                              {privacyMode ? "•••" : `$${apyData.estimatedYield.monthly.toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-[#708090] pt-2 border-t border-[#1a2225]">
                          Based on current DeFi positions APY
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {/* Breakdown Pills - Skeleton placeholders when loading, real data when available */}
                {isLoading && breakdown.length === 0 ? (
                  // Show skeleton placeholders for breakdown
                  <>
                    <div className="h-8 w-24 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
                    <div className="h-8 w-28 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
                    <div className="h-8 w-24 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
                  </>
                ) : (
                  breakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a2225]/60 border border-[#1a2225] hover:border-[#2a3235] transition-all duration-300 shrink-0"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-[10px] text-[#708090]">{item.category}</span>
                      <span className="font-mono text-xs text-white font-medium">
                        {formatCompactValue(item.value)}
                      </span>
                      <span className="font-mono text-[10px] text-[#708090]">
                        {privacyMode ? "•" : `${item.percentage.toFixed(0)}%`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Scroll indicator - Fades out when scrolling */}
        <div className={`pb-8 flex justify-center transition-opacity duration-500 ${hasScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center gap-2 text-[#708090] animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Interactive Chart Layer - positioned at bottom, above content for interactivity */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-[45%] z-20 transition-opacity duration-1000 ease-out ${
          showChart && !privacyMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="heroChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "#00ff41" : "#ff4444"} stopOpacity={0.25} />
                  <stop offset="40%" stopColor={isPositive ? "#00ff41" : "#ff4444"} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={isPositive ? "#00ff41" : "#ff4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#00ff41" : "#ff4444"}
                strokeWidth={2}
                fill="url(#heroChartGradient)"
                animationDuration={1500}
                activeDot={{ r: 6, fill: isPositive ? "#00ff41" : "#ff4444", stroke: "#0a0f0f", strokeWidth: 2 }}
              />
              <RechartsTooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: isPositive ? "#00ff41" : "#ff4444", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Bottom fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0f0f] to-transparent pointer-events-none z-30" />
    </section>
  )
}
