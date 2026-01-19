import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  YieldOpportunity,
  PaginatedYieldResponse,
  YieldPaginationParams,
} from '@/lib/types/api';
import type {
  UseYieldDataReturn,
  ConsolidatedLendingMarket,
  YieldDisplayItem,
  YieldFilters,
} from '../types';
import { secureFetch } from '@/lib/api/fetch';

/**
 * Structured error information from the API
 */
interface YieldError {
  message: string;
  errorType?:
    | 'AUTHENTICATION'
    | 'BACKEND_UNAVAILABLE'
    | 'NETWORK_ERROR'
    | 'INVALID_RESPONSE'
    | 'UNKNOWN';
  details?: string;
  status?: number;
  troubleshooting?: string[];
  isMockData?: boolean;
}

/**
 * Generates a unique key for a lending market (protocol + underlying token)
 */
function getLendingMarketKey(opp: YieldOpportunity): string {
  const protocolId = opp.protocol.id;
  const underlyingSymbol =
    opp.metadata.underlyingSymbol || opp.pool.symbol || 'unknown';
  return `${protocolId}:${underlyingSymbol.toLowerCase()}`;
}

/**
 * Gets the higher risk level between two
 */
function getHigherRisk(
  a: 'low' | 'medium' | 'high',
  b: 'low' | 'medium' | 'high'
): 'low' | 'medium' | 'high' {
  const riskOrder = { low: 0, medium: 1, high: 2 };
  return riskOrder[a] >= riskOrder[b] ? a : b;
}

/**
 * Consolidates lending opportunities by protocol + token
 * Merges supply and borrow into single market entries
 */
function consolidateLendingOpportunities(
  opportunities: YieldOpportunity[]
): YieldDisplayItem[] {
  const lendingOpps = opportunities.filter((opp) => opp.category === 'lending');
  const otherOpps = opportunities.filter((opp) => opp.category !== 'lending');

  // Group lending by market key
  const marketMap = new Map<
    string,
    { supply?: YieldOpportunity; borrow?: YieldOpportunity }
  >();

  for (const opp of lendingOpps) {
    const key = getLendingMarketKey(opp);
    const existing = marketMap.get(key) || {};

    if (opp.type === 'supply') {
      existing.supply = opp;
    } else if (opp.type === 'borrow') {
      existing.borrow = opp;
    }

    marketMap.set(key, existing);
  }

  // Create consolidated markets
  const consolidatedMarkets: ConsolidatedLendingMarket[] = [];

  for (const [key, { supply, borrow }] of marketMap.entries()) {
    // Use supply as primary, or borrow if no supply
    const primary = supply || borrow;
    if (!primary) continue;

    const consolidated: ConsolidatedLendingMarket = {
      id: `market:${key}`,
      protocol: primary.protocol,
      category: 'lending',
      type: 'market',
      pool: primary.pool,
      supplyApy: supply?.apy,
      borrowApy: borrow?.apy,
      risk: {
        riskLevel:
          supply && borrow
            ? getHigherRisk(supply.risk.riskLevel, borrow.risk.riskLevel)
            : primary.risk.riskLevel,
        liquidationRisk:
          supply?.risk.liquidationRisk || borrow?.risk.liquidationRisk,
        impermanentLossRisk:
          supply?.risk.impermanentLossRisk || borrow?.risk.impermanentLossRisk,
      },
      metadata: primary.metadata,
      lastUpdated: primary.lastUpdated,
      dataSource: primary.dataSource,
      supplyOpportunity: supply,
      borrowOpportunity: borrow,
    };

    consolidatedMarkets.push(consolidated);
  }

  // Combine consolidated lending markets with other opportunities
  return [...consolidatedMarkets, ...otherOpps];
}

/**
 * Gets the primary APY for sorting (uses supply APY for lending markets)
 */
function getDisplayItemApy(item: YieldDisplayItem): number {
  if (item.type === 'market') {
    // For lending markets, sort by supply APY (earning yield)
    return item.supplyApy?.totalApy ?? item.supplyApy?.baseApy ?? 0;
  }
  return item.apy.totalApy ?? item.apy.baseApy ?? 0;
}

/**
 * Custom hook to fetch paginated yield opportunities with server-side filtering
 *
 * @param filters - Combined filter state
 * @param pagination - Pagination state (page, pageSize)
 * @returns Filtered and sorted opportunities with loading state and statistics
 */
export function useYieldData(
  filters: YieldFilters,
  pagination: { page: number; pageSize: number }
): UseYieldDataReturn {
  // Build API params from filters and pagination
  const apiParams = useMemo<YieldPaginationParams>(() => {
    const params: YieldPaginationParams = {
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    // Add search query if present
    if (filters.searchQuery.trim()) {
      params.search = filters.searchQuery.trim();
    }

    // Add categories filter if present
    if (filters.selectedCategories.length > 0) {
      params.categories = filters.selectedCategories;
    }

    // Add protocols filter if present
    if (filters.selectedProtocols.length > 0) {
      params.protocols = filters.selectedProtocols;
    }

    // Add tokens filter if present
    if (filters.selectedTokens.length > 0) {
      params.token_addresses = filters.selectedTokens;
    }

    // Add sort order
    params.sort_by = 'apy';
    params.sort_order = filters.sortOrder;

    return params;
  }, [
    filters.searchQuery,
    filters.selectedCategories,
    filters.selectedProtocols,
    filters.selectedTokens,
    filters.sortOrder,
    pagination.page,
    pagination.pageSize,
  ]);

  // Fetch paginated yield data from backend
  const { data, isLoading, error, errorDetails } = useFetchYieldData(apiParams);

  // Consolidate lending opportunities for display
  const displayItems = useMemo<YieldDisplayItem[]>(() => {
    if (!data?.data?.length) return [];

    // Filter to only items with valid APY
    const withValidApy = data.data.filter((opp) => {
      return (
        (opp.apy?.totalApy !== null && opp.apy?.totalApy !== undefined) ||
        (opp.apy?.baseApy !== null && opp.apy?.baseApy !== undefined)
      );
    });

    // Consolidate lending markets
    return consolidateLendingOpportunities(withValidApy);
  }, [data]);

  // Build filter options from backend metadata
  const { protocols, tokens } = useMemo(() => {
    if (!data?.metadata) {
      return { protocols: [], tokens: [] };
    }

    const protocols =
      data.metadata.protocols.map((name) => ({
        value: name,
        label: name,
      })) || [];

    const tokens =
      data.metadata.tokens.map((symbol) => ({
        value: symbol,
        label: symbol,
      })) || [];

    return { protocols, tokens };
  }, [data]);

  // Calculate statistics from current page data
  const stats = useMemo(() => {
    const apyValues = displayItems
      .map((item) => getDisplayItemApy(item))
      .filter((apy) => apy > 0);

    const highestApy = apyValues.length > 0 ? Math.max(...apyValues) : 0;
    const averageApy =
      apyValues.length > 0
        ? apyValues.reduce((sum, apy) => sum + apy, 0) / apyValues.length
        : 0;

    return {
      totalCount: data?.pagination?.total_items || 0,
      highestApy,
      averageApy,
    };
  }, [displayItems, data]);

  const hasData = displayItems.length > 0;

  return {
    opportunities: displayItems,
    isLoading,
    error: error || null,
    hasData,
    stats,
    errorDetails: errorDetails || undefined,
    isMockData: (data as any)?._meta?.isMock === true,
    filterOptions: { protocols, tokens },
    pagination: {
      page: data?.pagination?.page || pagination.page,
      pageSize: data?.pagination?.page_size || pagination.pageSize,
      totalPages: data?.pagination?.total_pages || 1,
      totalItems: data?.pagination?.total_items || 0,
      hasNext: data?.pagination?.has_next || false,
      hasPrev: data?.pagination?.has_prev || false,
    },
  };
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Calculates exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay *
      Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
    RETRY_CONFIG.maxDelay
  );
  return delay;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses error response from API
 */
function parseErrorResponse(body: unknown): YieldError {
  if (typeof body === 'object' && body !== null) {
    const errorBody = body as {
      error?: string;
      errorType?: YieldError['errorType'];
      message?: string;
      troubleshooting?: string[];
      debug?: { status?: number; details?: string };
    };

    return {
      message:
        errorBody.message || errorBody.error || 'Failed to fetch yield data',
      errorType: errorBody.errorType,
      details: errorBody.debug?.details,
      status: errorBody.debug?.status,
      troubleshooting: errorBody.troubleshooting,
    };
  }

  return {
    message: 'Failed to fetch yield data',
  };
}

/**
 * Gets user-friendly error message based on error type
 */
function getUserFriendlyError(error: YieldError): string {
  const isDev = process.env.NODE_ENV === 'development';

  switch (error.errorType) {
    case 'AUTHENTICATION':
      return isDev
        ? 'API Authentication Failed (403): Check HYPERFOLIO_API_KEY and ensure backend is running'
        : 'Unable to fetch yield data. Please try again later.';

    case 'BACKEND_UNAVAILABLE':
      return isDev
        ? 'Backend Unavailable: Check if backend service is running and HYPERFOLIO_API_URL is correct'
        : 'Service temporarily unavailable. Please try again later.';

    case 'NETWORK_ERROR':
      return isDev
        ? 'Network Error: Check your connection and backend URL'
        : 'Connection issue. Please check your internet and try again.';

    case 'INVALID_RESPONSE':
      return isDev
        ? 'Invalid API Response: Backend returned unexpected data'
        : 'Data format error. Please try again later.';

    default:
      return isDev
        ? `Error: ${error.message}${error.details ? ` - ${error.details}` : ''}`
        : 'Unable to load yield data. Please try again later.';
  }
}

/**
 * Internal hook to fetch paginated yield data from API with retry logic
 */
function useFetchYieldData(params: YieldPaginationParams) {
  const [data, setData] = useState<PaginatedYieldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<YieldError | null>(null);

  // Build query string from params
  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.page_size)
      searchParams.append('page_size', params.page_size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.categories?.length)
      params.categories.forEach((c) => searchParams.append('categories', c));
    if (params.protocols?.length)
      params.protocols.forEach((p) => searchParams.append('protocols', p));
    if (params.token_addresses?.length)
      params.token_addresses.forEach((t) =>
        searchParams.append('token_addresses', t)
      );
    if (params.min_value !== undefined)
      searchParams.append('min_value', params.min_value.toString());
    if (params.max_value !== undefined)
      searchParams.append('max_value', params.max_value.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);

    return searchParams.toString();
  }, [params]);

  // Use ref to track fetch state and prevent race conditions
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    retryCountRef.current = 0;

    async function fetchData(attempt: number): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setErrorDetails(null);

        const url = `/api/yield/${queryString ? `?${queryString}` : ''}`;
        const response = await secureFetch(url, {
          headers: {
            accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const parsedError = parseErrorResponse(errorBody);
          parsedError.status = response.status;

          throw parsedError;
        }

        const result = (await response.json()) as PaginatedYieldResponse;

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          setErrorDetails(null);
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        // Extract error information - handle both Error instances and plain objects
        let yieldError: YieldError;

        // First, try to extract properties from the error object
        const errorObj = err as any;
        const hasErrorType =
          errorObj && typeof errorObj === 'object' && 'errorType' in errorObj;

        if (hasErrorType) {
          // Already a YieldError (from parseErrorResponse)
          yieldError = {
            message:
              errorObj.message ||
              errorObj.error ||
              'Failed to fetch yield data',
            errorType: errorObj.errorType,
            details: errorObj.details || errorObj.debug?.details,
            status: errorObj.status || errorObj.debug?.status,
            troubleshooting: errorObj.troubleshooting,
          };
        } else if (err instanceof Error) {
          // Standard Error instance - check if it's a network error
          const isNetworkError =
            err.message.includes('fetch') ||
            err.message.includes('network') ||
            err.message.includes('Failed to fetch') ||
            err.name === 'TypeError' ||
            err.name === 'NetworkError';

          yieldError = {
            message: err.message || 'Unknown error',
            errorType: isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN',
            details: err.stack || err.toString(),
          };
        } else {
          // Unknown error type - try to extract any useful information
          const errorString = err ? String(err) : 'Unknown error';
          const errorJson =
            err && typeof err === 'object'
              ? JSON.stringify(err, Object.getOwnPropertyNames(err))
              : null;

          yieldError = {
            message: errorString,
            errorType: 'UNKNOWN',
            details: errorJson || errorString,
          };
        }

        // Ensure we have at least a message
        if (!yieldError.message) {
          yieldError.message = 'Failed to fetch yield data';
        }

        // Determine if we should retry
        const shouldRetry =
          retryCountRef.current < RETRY_CONFIG.maxAttempts &&
          yieldError.errorType === 'NETWORK_ERROR' &&
          attempt < RETRY_CONFIG.maxAttempts;

        if (shouldRetry) {
          const delay = getRetryDelay(retryCountRef.current + 1);
          console.warn(
            `[useYieldData] Attempt ${attempt}/${RETRY_CONFIG.maxAttempts} failed. Retrying in ${delay}ms...`,
            {
              errorType: yieldError.errorType || 'UNKNOWN',
              message: yieldError.message || 'No error message',
              details: yieldError.details || 'No details',
            }
          );

          retryCountRef.current++;
          await sleep(delay);
          return fetchData(attempt + 1);
        }

        // Final attempt failed, set error
        const userMessage = getUserFriendlyError(yieldError);
        setError(userMessage);
        setErrorDetails(yieldError);

        // Log error with serializable properties - ensure all values are defined
        const logData: Record<string, unknown> = {
          attempt: attempt || 'unknown',
          maxAttempts: RETRY_CONFIG.maxAttempts,
          errorType: yieldError.errorType || 'UNKNOWN',
          message: yieldError.message || 'No error message',
        };

        // Add optional fields only if they exist
        if (yieldError.details) logData.details = yieldError.details;
        if (yieldError.status) logData.status = yieldError.status;
        if (yieldError.troubleshooting)
          logData.troubleshooting = yieldError.troubleshooting;

        // Add original error info for debugging
        if (err instanceof Error) {
          logData.originalError = {
            name: err.name || 'Error',
            message: err.message || 'No message',
            stack: err.stack || 'No stack trace',
          };
        } else if (err) {
          try {
            logData.originalError = JSON.stringify(
              err,
              Object.getOwnPropertyNames(err)
            );
          } catch {
            logData.originalError = String(err);
          }
        }

        console.error('[useYieldData] Failed to fetch yield data:', logData);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    // Start fetching
    fetchData(1);

    return () => {
      isMountedRef.current = false;
    };
  }, [queryString]);

  return { data, isLoading, error, errorDetails };
}
