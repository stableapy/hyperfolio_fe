// Types for Yield Section components

import type { YieldOpportunity, YieldResponse } from '@/lib/types/api';

// Re-export API types for convenience
export type { YieldOpportunity, YieldResponse };

/**
 * Props for the main YieldSection component
 */
export interface YieldSectionProps {
  isLoading?: boolean;
}

/**
 * Props for the YieldFilterBar component
 */
export interface YieldFilterBarProps {
  /** Current search query text */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Currently selected category filter */
  selectedCategory: 'all' | 'lending' | 'amm' | 'yield' | 'staking';
  /** Callback when category changes */
  onCategoryChange: (
    category: 'all' | 'lending' | 'amm' | 'yield' | 'staking'
  ) => void;
  /** Current sort order for APY */
  sortOrder: 'desc' | 'asc';
  /** Callback when sort order changes */
  onSortChange: (order: 'desc' | 'asc') => void;
  /** Whether the filter bar should be disabled */
  disabled?: boolean;
}

/**
 * Props for the YieldCard component
 */
export interface YieldCardProps {
  opportunity: YieldOpportunity;
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
  /** Filtered and sorted yield opportunities */
  opportunities: YieldOpportunity[];
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
}
