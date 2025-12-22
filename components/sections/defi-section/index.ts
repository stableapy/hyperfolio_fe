// Barrel export for defi-section module

// Main component
export { DeFiSection } from "./defi-section"

// Sub-components (exported for potential reuse)
export { DefiStatsGrid } from "./defi-stats-grid"
export { ProtocolCard } from "./protocol-card"
export { PositionItem } from "./position-item"
export { ProtocolSkeleton } from "./protocol-skeleton"
export { DefiEmptyState } from "./defi-empty-state"

// Hooks
export { useDefiPositions, useDefiStats } from "./hooks"

// Types
export type {
  DefiSectionProps,
  DefiStatsGridProps,
  PortfolioYield,
  ProtocolGroup,
  ProtocolCardProps,
  PositionItemProps,
  DefiStats,
} from "./types"

// Constants
export { TYPE_LABELS, TYPE_COLORS, type PositionType } from "./constants"

