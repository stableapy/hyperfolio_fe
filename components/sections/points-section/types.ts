// Types for Points Section components

export interface Point {
  id: string;
  protocolName: string;
  protocolLogo?: string;
  points: number;
  rank?: number;
  walletAddress?: string;
  walletName?: string;
  walletColor?: string;
  totalPoints?: number; // For aggregated wallet view
  protocolCount?: number; // For aggregated wallet view
}

export interface PointsSectionProps {
  isLoading?: boolean;
}

export interface PointsRowProps {
  point: Point;
  selectedWalletId: string | null;
  privacyMode: boolean;
}

export interface PointsRowMobileProps {
  point: Point;
  selectedWalletId: string | null;
  privacyMode: boolean;
}

export interface PointsSummaryCardsProps {
  totalPoints: number;
  protocolCount: number;
  walletCount?: number;
  isAggregated: boolean;
  isLoading: boolean;
  privacyMode?: boolean;
}

export interface PointsListSkeletonProps {
  count?: number;
}

export interface PointsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isGrouped: boolean;
  onGroupedChange: (grouped: boolean) => void;
  showGroupToggle: boolean;
}

export type SortField = 'protocolName' | 'points' | 'rank';
export type SortOrder = 'asc' | 'desc';

export interface PointsTotals {
  totalPoints: number;
  protocolCount: number;
}
