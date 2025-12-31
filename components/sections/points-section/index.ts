// Barrel export for points-section module

// Main component
export { PointsSection } from './points-section';

// Sub-components (exported for potential reuse)
export { PointsRow } from './points-row';
export { PointsRowMobile } from './points-row';
export { PointImage } from './point-image';
export { PointsSummaryCards } from './points-summary-cards';
export { PointsListSkeleton } from './points-list-skeleton';
export { PointsSearchBar } from './points-search-bar';

// Hooks
export {
  usePointsData,
  useFilteredPoints,
  useWalletPoints,
  groupPointsByProtocol,
} from './hooks';

// Types
export type {
  Point,
  PointsSectionProps,
  PointsRowProps,
  PointsRowMobileProps,
  PointsSummaryCardsProps,
  PointsListSkeletonProps,
  SortField,
  SortOrder,
  PointsTotals,
} from './types';
