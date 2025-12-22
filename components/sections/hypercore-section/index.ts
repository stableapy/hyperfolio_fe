// Barrel export for hypercore-section module

// Main component
export { HypercoreSection } from "./hypercore-section"

// Sub-components (exported for potential reuse)
export { SummaryCards } from "./summary-cards"
export { TabNavigation } from "./tab-navigation"
export { ContentSkeleton } from "./content-skeleton"
export { SpotTab } from "./spot-tab"
export { PerpTab } from "./perp-tab"
export { StakingTab } from "./staking-tab"
export { VaultsTab } from "./vaults-tab"

// Hooks
export { useHypercoreData } from "./hooks"

// Types
export type {
  SpotBalance,
  PerpPosition,
  DelegatorSummary,
  Delegation,
  StakingInfo,
  VaultDetail,
  VaultInfo,
  PortfolioSummary,
  HypercoreData,
  TabId,
  TabConfig,
  HypercoerSectionProps,
  SummaryCardsProps,
  TabNavigationProps,
  SpotTabProps,
  PerpTabProps,
  StakingTabProps,
  VaultsTabProps,
  ContentSkeletonProps,
} from "./types"

// Utils
export {
  formatCompactValue,
  formatUsdCompact,
  safeParseFloat,
  formatAddress,
  isVaultLocked,
} from "./utils"

