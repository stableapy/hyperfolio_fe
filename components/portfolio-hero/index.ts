// Barrel export for portfolio-hero module
// Main component
export { PortfolioHero } from "./portfolio-hero"

// Sub-components (exported for potential reuse)
export { WalletSelector } from "./wallet-selector"
export { StatPills } from "./stat-pills"
export { PortfolioChart } from "./portfolio-chart"
export { ChartModal } from "./chart-modal"

// Hooks
export { usePortfolioHistory, usePortfolioBreakdown, useApyData } from "./hooks"

// Types
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
} from "./types"

// Utils
export {
  safeParseFloat,
  formatValue,
  formatCompactValue,
  formatAddress,
  calculateWalletTotalValue,
} from "./utils"

