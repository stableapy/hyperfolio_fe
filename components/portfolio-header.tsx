"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Eye, EyeOff, Settings, RefreshCw } from "lucide-react"
import { TerminalCard } from "./terminal-card"
import { useWalletStore } from "@/lib/store/wallet-store"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface PortfolioHeaderProps {
  totalValue: number
  change24h: number
  isLoading?: boolean
  onRefresh?: () => void
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

export function PortfolioHeader({ totalValue, change24h, isLoading = false, onRefresh }: PortfolioHeaderProps) {
  const { selectedWalletId, wallets } = useWalletStore()
  const [portfolioHistory, setPortfolioHistory] = useState<HistorySnapshot[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  // Helper function to safely parse numeric values
  const safeParseFloat = useCallback((value: unknown): number => {
    if (typeof value === 'number') {
      // Check for absurdly large numbers (likely corrupted data)
      if (Math.abs(value) > 1e15) return 0
      return value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) return 0
      // Check for absurdly large numbers
      if (Math.abs(parsed) > 1e15) return 0
      return parsed
    }
    return 0
  }, [])
  
  // Helper function to calculate total value from wallet data
  const calculateWalletTotalValue = useCallback((data: Record<string, any>) => {
    if (!data) return 0
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = (data.compositionRaw as any)?.data?.tokens || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nftsData = (data.nfts as any)?.data?.nfts || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positionsData = (data.positions as any)?.data?.protocols || []
    
    // Calculate token values by type directly from tokens
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spotValue = tokens.filter((t: any) => t.type === 'spot').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perpValue = tokens.filter((t: any) => t.type === 'perp').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stakingValue = tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vaultsValue = tokens.filter((t: any) => t.type === 'vault').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
    
    // Calculate NFTs value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nftValue = nftsData.reduce((sum: number, nft: any) => {
      const value = safeParseFloat(nft.usdValue || nft.fxValue)
      return sum + value
    }, 0)
    
    // Calculate DeFi positions value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defiValue = positionsData.reduce((sum: number, protocol: any) => {
      if (!Array.isArray(protocol.positions)) return sum
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sum + protocol.positions.reduce((posSum: number, pos: any) => {
        const value = safeParseFloat(pos.totalValueUSD)
        return posSum + value
      }, 0)
    }, 0)
    
    // Calculate Hypercore value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hypercoreValue = safeParseFloat((data.userData as any)?.data?.portfolioSummary?.totalValue)
    
    // Total value = sum of all categories
    return spotValue + perpValue + stakingValue + vaultsValue + nftValue + defiValue + hypercoreValue
  }, [safeParseFloat])
  
  // Fetch portfolio history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        // Get addresses based on selection
        const addresses = selectedWalletId
          ? [wallets.find(w => w.id === selectedWalletId)?.address].filter(Boolean)
          : wallets.map(w => w.address)

        if (addresses.length === 0) {
          setPortfolioHistory([])
          return
        }

        let data: PortfolioHistory

        if (addresses.length === 1) {
          // Single wallet: use simple endpoint
          const response = await fetch(`/api/portfolio-history?address=${addresses[0]}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch portfolio history')
          }
          
          data = await response.json()
        } else {
          // Multiple wallets: use aggregate endpoint
          const response = await fetch('/api/portfolio-history-aggregate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addresses }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch aggregated portfolio history')
          }
          
          data = await response.json()
        }
        
        // Take last 30 snapshots for the chart (roughly last month)
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

  // Get wallet data from store
  const { walletData } = useWalletStore()
  
  // Get data from selected wallet or aggregate
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
  
  const [privacyMode, setPrivacyMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Prepare chart data
  const chartData = useMemo(() => {
    if (portfolioHistory.length === 0) return []
    
    // Show only every nth point to avoid overcrowding
    const dataPoints = portfolioHistory.length
    const displayEveryNth = dataPoints > 20 ? Math.ceil(dataPoints / 10) : 1
    
    return portfolioHistory.map((snapshot, index) => ({
      date: index % displayEveryNth === 0 || index === portfolioHistory.length - 1
        ? new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '',
      value: snapshot.total_value_usd,
      timestamp: snapshot.snapshot_timestamp,
      fullDate: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }))
  }, [portfolioHistory])

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh?.()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const formatValue = (value: number) => {
    if (privacyMode) return "••••••"
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const isPositive = displayData.change24h >= 0

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullDate: string }; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f0f] border border-[#00ff41]/30 rounded px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="font-mono text-xs text-[#708090] mb-1">{payload[0].payload.fullDate}</p>
          <p className="font-mono text-sm text-[#00ff41] font-semibold">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <TerminalCard withScanLine className="mb-6 h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-[#708090]">&gt; TOTAL_PORTFOLIO_VALUE</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivacyMode(!privacyMode)}
                className="p-1.5 rounded hover:bg-[#1a2225] transition-colors text-[#00ff41]"
                aria-label={privacyMode ? "Show values" : "Hide values"}
              >
                {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 rounded hover:bg-[#1a2225] transition-colors text-[#00d9ff]"
                aria-label="Refresh data"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[#1a2225] transition-colors text-[#708090]"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Value and Change */}
          <div>
            {isLoading ? (
              <div className="h-12 w-48 bg-[#1a2225] animate-pulse rounded mb-4" />
            ) : (
              <div className="text-4xl font-bold font-mono text-glow-green mb-4">{formatValue(displayData.value)}</div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-[#708090]">24H CHANGE:</span>
              {isLoading ? (
                <div className="h-6 w-24 bg-[#1a2225] animate-pulse rounded" />
              ) : (
                <span className={`font-mono text-lg font-semibold ${isPositive ? "text-[#00ff41]" : "text-[#ff4444]"}`}>
                  {privacyMode ? "•••" : `${isPositive ? "+" : ""}${displayData.change24h.toFixed(2)}%`}
                </span>
              )}
            </div>
          </div>

          {/* Portfolio History Chart */}
          {!privacyMode && chartData.length > 0 && !isLoadingHistory && (
            <div className="h-32">
              <div className="mb-2">
                <span className="font-mono text-xs text-[#708090]">PORTFOLIO HISTORY (30D)</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2225" />
                  <XAxis
                    dataKey="date"
                    stroke="#708090"
                    tick={{ fill: '#708090', fontSize: 10 }}
                    tickLine={{ stroke: '#708090' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#708090"
                    tick={{ fill: '#708090', fontSize: 10 }}
                    tickLine={{ stroke: '#708090' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00ff41"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {isLoadingHistory && !privacyMode && (
            <div className="h-32">
              <div className="mb-2">
                <span className="font-mono text-xs text-[#708090]">PORTFOLIO HISTORY (30D)</span>
              </div>
              <div className="h-full bg-[#1a2225]/30 animate-pulse rounded" />
            </div>
          )}
        </div>
      </div>
    </TerminalCard>
  )
}
