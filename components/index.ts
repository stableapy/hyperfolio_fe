// Barrel export for components
// This file provides clean imports for all major components

// Feature modules (explicit exports to avoid naming conflicts)
export { 
  PortfolioHero, 
  WalletSelector, 
  StatPills, 
  PortfolioChart, 
  ChartModal,
  usePortfolioHistory, 
  usePortfolioBreakdown, 
  useApyData,
  safeParseFloat,
  formatValue,
  formatCompactValue,
  calculateWalletTotalValue,
  formatAddress as formatAddressShort,
} from "./portfolio-hero"
export type {
  PortfolioHeroProps,
  HistorySnapshot,
  PortfolioHistory,
  AssetBreakdown,
  ChartDataPoint,
  ModalChartDataPoint,
  ApyData,
  DisplayData,
  ChartTimeRange,
} from "./portfolio-hero"

export { 
  SwapWidgetModal, 
  SwapWidgetInline, 
  useSwapConfig, 
  useSwapWallet,
  getWalletIcon,
  HYPEREVM_CHAIN_ID, 
  DEFAULT_TO_TOKEN,
} from "./swap-widget"
export type {
  TokenInfo,
  SwapWidgetBaseProps,
  SwapWidgetModalProps,
  SwapWidgetInlineProps,
  KyberSwapTheme,
  FeeSetting,
} from "./swap-widget"

export { 
  AddWalletDialog, 
  WalletTabs,
  isValidEthereumAddress, 
  formatAddress, 
  formatAddressCompact,
  PRESET_COLORS,
} from "./wallet"
export type {
  Wallet,
  AddWalletFormData,
  AddWalletDialogProps,
  WalletTabsProps,
  PresetColor,
} from "./wallet"

// Standalone components
export { WelcomeModal, resetWelcomeState, hasSeenWelcome } from "./welcome-modal"
export { ApiBanner } from "./api-banner"
export { SectionNav } from "./section-nav"

// Home page components
export * from "./home"

// Sections (re-export for convenience)
export { TokensSection } from "./sections/tokens-section"
export { DeFiSection } from "./sections/defi-section"
export { NFTsSection } from "./sections/nfts-section"
export { HypercoreSection } from "./sections/hypercore-section"
export { TransactionsSection } from "./sections/transactions-section"

