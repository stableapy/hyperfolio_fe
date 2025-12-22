// Types for Hypercore Section components

export interface SpotBalance {
  coin: string
  token: number
  total: string
  hold: string
  entryNtl: string
  usdPrice: string
  usdValue: string
  image_url: string | null
  symbol: string
  name: string
  decimals: string
}

export interface PerpPosition {
  positions: unknown[]
  margin: {
    usdcBalance: string
    lastUpdate: number
  }
}

export interface DelegatorSummary {
  delegated: string
  undelegated: string
  totalPendingWithdrawal: string
  nPendingWithdrawals: number
  totalStakedUsd: string
}

export interface Delegation {
  address?: string
  amount?: string
}

export interface StakingInfo {
  totalHype: string
  stakedHype: string
  availableHype: string
  delegations: Delegation[]
  delegatorSummary: DelegatorSummary
  usdPrice: string
  image_url: string
  lastUpdate: number
}

export interface VaultDetail {
  vaultAddress: string
  equity: string
  lockedUntilTimestamp: number
  name: string
  description: string
  leader: string
  apr: number
  maxDistributable: string
  maxWithdrawable: string
  isClosed: boolean
  allowDeposits: boolean
  allTimePnl: string
  pnl: string
  lastUpdate: number
}

export interface VaultInfo {
  vaults: VaultDetail[]
  totalVaultValue: string
}

export interface PortfolioSummary {
  totalValue: string
  spotValue: string
  perpValue: string
  stakedValue: string
  vaultValue: string
  lastUpdate: number
}

export interface HypercoreData {
  spotBalances: SpotBalance[]
  perpPositions: PerpPosition
  stakingInfo: StakingInfo
  vaultInfo: VaultInfo
  portfolioSummary: PortfolioSummary
}

export type TabId = "spot" | "perp" | "staking" | "vaults"

export interface TabConfig {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export interface HypercoerSectionProps {
  isLoading?: boolean
}

export interface SummaryCardsProps {
  data: HypercoreData | null
  showSkeleton: boolean
}

export interface TabNavigationProps {
  tabs: TabConfig[]
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export interface SpotTabProps {
  balances: SpotBalance[]
}

export interface PerpTabProps {
  marginBalance: string
}

export interface StakingTabProps {
  stakingInfo: StakingInfo
}

export interface VaultsTabProps {
  vaults: VaultDetail[]
}

export interface ContentSkeletonProps {
  count?: number
}

