// Types for Yield Section components

import type {
  YieldOpportunity,
  YieldResponse,
  YieldPoolInfo,
  PoolTokenDetails,
} from '@/lib/types/api';

// Re-export API types for convenience
export type { YieldOpportunity, YieldResponse, YieldPoolInfo, PoolTokenDetails };

/**
 * Consolidated lending market combining supply and borrow opportunities
 * For lending category, we merge supply/borrow into a single display item
 */
export interface ConsolidatedLendingMarket {
  /** Unique identifier for the consolidated market */
  id: string;
  /** Protocol information */
  protocol: YieldOpportunity['protocol'];
  /** Category is always 'lending' for consolidated markets */
  category: 'lending';
  /** Type indicates this is a consolidated market */
  type: 'market';
  /** Pool information from the underlying opportunity */
  pool: YieldPoolInfo;
  /** Supply opportunity APY (if available) */
  supplyApy?: {
    baseApy?: number;
    totalApy?: number;
    rewardApy?: number;
  };
  /** Borrow opportunity APY (if available) */
  borrowApy?: {
    baseApy?: number;
    totalApy?: number;
    rewardApy?: number;
  };
  /** Risk level (taken from the highest risk of supply/borrow) */
  risk: YieldOpportunity['risk'];
  /** Metadata from the underlying opportunities */
  metadata: YieldOpportunity['metadata'];
  /** Last updated timestamp */
  lastUpdated: string;
  /** Data source */
  dataSource: 'on-chain' | 'api';
  /** Original supply opportunity (for reference) */
  supplyOpportunity?: YieldOpportunity;
  /** Original borrow opportunity (for reference) */
  borrowOpportunity?: YieldOpportunity;
}

/**
 * Display item that can be either a regular opportunity or a consolidated lending market
 */
export type YieldDisplayItem = YieldOpportunity | ConsolidatedLendingMarket;

/**
 * Type guard to check if item is a consolidated lending market
 */
export function isConsolidatedMarket(
  item: YieldDisplayItem
): item is ConsolidatedLendingMarket {
  return item.type === 'market';
}

/**
 * Props for the main YieldSection component
 */
export interface YieldSectionProps {
  isLoading?: boolean;
}

/** Category filter options */
export type YieldCategoryFilter =
  | 'all'
  | 'lending'
  | 'amm'
  | 'yield'
  | 'staking'
  | 'derivatives';

/**
 * Combined filter state for yield section
 */
export interface YieldFilters {
  /** Multi-select categories */
  selectedCategories: YieldCategoryFilter[];
  /** Multi-select protocol names */
  selectedProtocols: string[];
  /** Multi-select token symbols */
  selectedTokens: string[];
  /** Show only stablecoin opportunities */
  stablecoinOnly: boolean;
  /** Show only HYPE opportunities */
  hypeOnly: boolean;
  /** Search query text */
  searchQuery: string;
  /** Sort order for APY */
  sortOrder: 'asc' | 'desc';
}

/**
 * Filter option with optional count and logo URI
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  logoURI?: string;
}

/**
 * Props for the YieldFilterBar component
 */
export interface YieldFilterBarProps {
  /** Current filter state */
  filters: YieldFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<YieldFilters>) => void;
  /** Available protocol options */
  availableProtocols: FilterOption[];
  /** Available token options */
  availableTokens: FilterOption[];
  /** Whether the filter bar should be disabled */
  disabled?: boolean;
}

/**
 * Props for the YieldCard component
 */
export interface YieldCardProps {
  opportunity: YieldDisplayItem;
}

/**
 * Props for the YieldStats component
 */
export interface YieldStatsProps {
  /** Pre-calculated statistics from useYieldData hook */
  stats: {
    totalCount: number;
    highestApy: number;
    averageApy: number;
  };
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Whether we have any data loaded */
  hasData: boolean;
  /** Privacy mode from wallet store - masks values with "•••" */
  privacyMode?: boolean;
}

/**
 * Structured error information from the API
 */
export interface YieldError {
  /** Error message */
  message: string;
  /** Type of error for specific handling */
  errorType?:
    | 'AUTHENTICATION'
    | 'BACKEND_UNAVAILABLE'
    | 'NETWORK_ERROR'
    | 'INVALID_RESPONSE'
    | 'UNKNOWN';
  /** Additional error details */
  details?: string;
  /** HTTP status code if applicable */
  status?: number;
  /** Troubleshooting steps for developers */
  troubleshooting?: string[];
  /** Whether the data being displayed is mock data */
  isMockData?: boolean;
}

/**
 * Return type for useYieldData hook
 */
export interface UseYieldDataReturn {
  /** Filtered and sorted yield display items (includes consolidated lending markets) */
  opportunities: YieldDisplayItem[];
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether we have any data loaded */
  hasData: boolean;
  /** Statistics: total count, highest APY, average APY */
  stats: {
    totalCount: number;
    highestApy: number;
    averageApy: number;
  };
  /** Detailed error information for debugging */
  errorDetails?: YieldError;
  /** Whether the current data is mock data */
  isMockData?: boolean;
  /** Dynamic filter options extracted from data */
  filterOptions: {
    protocols: FilterOption[];
    tokens: FilterOption[];
  };
}
