// Types for Portfolio Hero components

export interface PortfolioHeroProps {
  totalValue: number
  change24h: number
  isLoading?: boolean
  onRefresh?: () => void
  onAddWallet?: () => void
  onScrollToContent?: () => void
}

export interface HistorySnapshot {
  total_value_usd: number
  snapshot_date: string
  snapshot_timestamp: number
}

export interface PortfolioHistory {
  snapshots: HistorySnapshot[]
  summary: {
    current_value: number
    change_24h: number
    percent_change_24h: number
  }
}

export interface AssetBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

export interface ChartDataPoint {
  date: string
  value: number
  timestamp: number
}

export interface ModalChartDataPoint extends ChartDataPoint {
  fullDate: string
}

export interface ApyData {
  weightedApy: number
  estimatedYield: {
    daily: number
    weekly: number
    monthly: number
  }
  hasPositions: boolean
}

export interface DisplayData {
  value: number
  change24h: number
  walletName: string | null
}

export type ChartTimeRange = '7d' | '30d' | '90d' | 'all'

