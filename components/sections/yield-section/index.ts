// Barrel export for yield-section module

// Main component
export { YieldSection } from './yield-section';

// Subcomponents
export { YieldStats } from './yield-stats';
export { YieldFilterBar } from './yield-filter-bar';
export { YieldCard } from './yield-card';
export { YieldListSkeleton } from './yield-list-skeleton';

// Hooks
export { useYieldData } from './hooks/use-yield-data';

// Types
export type { YieldSectionProps } from './types';
export type { YieldFilterBarProps } from './types';
export type { YieldCardProps } from './types';
export type { YieldStatsProps } from './types';
export type { UseYieldDataReturn } from './types';

// Utils
export {
  formatApyPercentage,
  formatApyDisplay,
  getRiskColorClass,
  getRiskLabel,
} from './utils';

// Re-export API types for convenience
export type { YieldOpportunity, YieldResponse } from './types';
