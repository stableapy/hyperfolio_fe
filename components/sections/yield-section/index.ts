// Barrel export for yield-section module

// Main component
export { YieldSection } from './yield-section';

// Subcomponents
export { YieldStats } from './yield-stats';
export { YieldFilterBar } from './yield-filter-bar';
export { YieldCard } from './yield-card';
export { YieldListSkeleton } from './yield-list-skeleton';
export { ProtocolLogo } from './protocol-logo';
export { MultiSelectFilter } from './multi-select-filter';
export { ResetAllButton } from './reset-all-button';

// Hooks
export { useYieldData } from './hooks/use-yield-data';

// Types
export type { YieldSectionProps } from './types';
export type { YieldFilterBarProps } from './types';
export type { YieldCardProps } from './types';
export type { YieldStatsProps } from './types';
export type { UseYieldDataReturn } from './types';
export type { YieldCategoryFilter } from './types';

// Utils
export {
  formatApyPercentage,
  formatApyDisplay,
  getRiskColorClass,
  getRiskLabel,
  getProtocolLogoPath,
  getPrimaryApy,
} from './utils';

// Re-export API types for convenience
export type { YieldOpportunity, YieldResponse } from './types';

// Consolidated lending market types
export type { ConsolidatedLendingMarket, YieldDisplayItem } from './types';
export { isConsolidatedMarket } from './types';
