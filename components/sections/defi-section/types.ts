// Types for DeFi Section components

import type { DeFiPositionDisplay } from "@/lib/utils/data-transformers"

export interface DefiSectionProps {
  isLoading?: boolean
}

export interface DefiStatsGridProps {
  isLoading: boolean
  hasData: boolean
  totalDeposited: number
  totalRewards: number
  weightedApy: number
  portfolioYield: PortfolioYield
  positionsWithApy: number
  totalPositions: number
}

export interface PortfolioYield {
  daily: number
  weekly: number
  monthly: number
}

export interface ProtocolGroup {
  id: string
  name: string
  logo: string | null
  url: string
  totalValue: number
  positions: DeFiPositionDisplay[]
  stats?: {
    weightedApyPercent?: number
    estimatedYield?: {
      daily: string
      weekly: string
      monthly: string
    }
  }
}

export interface ProtocolCardProps {
  protocol: ProtocolGroup
  isExpanded: boolean
  onToggle: () => void
  selectedWalletId: string | null
}

export interface PositionItemProps {
  position: DeFiPositionDisplay
  showWalletIndicator: boolean
}

export interface DefiStats {
  totalDeposited: number
  totalCurrent: number
  totalRewards: number
  weightedApy: number
  portfolioYield: PortfolioYield
  positionsWithApy: number
  totalPositions: number
}

