"use client"

import { useState, useEffect, useMemo } from "react"
import type { HistorySnapshot, PortfolioHistory, ChartDataPoint, ModalChartDataPoint, ChartTimeRange } from "../types"

interface Wallet {
  id: string
  address: string
  name: string
  color: string
}

interface UsePortfolioHistoryOptions {
  selectedWalletId: string | null
  wallets: Wallet[]
}

interface UsePortfolioHistoryReturn {
  portfolioHistory: HistorySnapshot[]
  isLoadingHistory: boolean
  chartData: ChartDataPoint[]
  getModalChartData: (timeRange: ChartTimeRange) => ModalChartDataPoint[]
}

/**
 * Custom hook for fetching and managing portfolio history data
 */
export function usePortfolioHistory({
  selectedWalletId,
  wallets,
}: UsePortfolioHistoryOptions): UsePortfolioHistoryReturn {
  const [portfolioHistory, setPortfolioHistory] = useState<HistorySnapshot[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

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

  // Prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    if (portfolioHistory.length === 0) return []

    return portfolioHistory.map((snapshot) => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.total_value_usd,
      timestamp: snapshot.snapshot_timestamp,
    }))
  }, [portfolioHistory])

  // Get filtered chart data for modal based on time range
  const getModalChartData = (timeRange: ChartTimeRange): ModalChartDataPoint[] => {
    if (portfolioHistory.length === 0) return []
    
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    
    let filteredSnapshots = portfolioHistory
    
    if (timeRange === '7d') {
      filteredSnapshots = portfolioHistory.filter(s => now - s.snapshot_timestamp * 1000 <= 7 * dayMs)
    } else if (timeRange === '30d') {
      filteredSnapshots = portfolioHistory.filter(s => now - s.snapshot_timestamp * 1000 <= 30 * dayMs)
    } else if (timeRange === '90d') {
      filteredSnapshots = portfolioHistory.filter(s => now - s.snapshot_timestamp * 1000 <= 90 * dayMs)
    }
    // 'all' uses all available data
    
    return filteredSnapshots.map((snapshot) => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      value: snapshot.total_value_usd,
      timestamp: snapshot.snapshot_timestamp,
    }))
  }

  return {
    portfolioHistory,
    isLoadingHistory,
    chartData,
    getModalChartData,
  }
}

