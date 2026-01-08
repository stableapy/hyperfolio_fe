import { useState, useEffect, useMemo } from 'react';
import type { YieldResponse, YieldOpportunity } from '@/lib/types/api';
import type {
  UseYieldDataReturn,
  ConsolidatedLendingMarket,
  YieldDisplayItem,
  YieldCategoryFilter,
  YieldFilters,
  FilterOption,
} from '../types';
import { secureFetch } from '@/lib/api/fetch';
import {
  extractTokenSymbols,
  extractTokenSymbolsFromDisplayItem,
  isStablecoinOpportunity,
  isHypeOpportunity,
  matchesTokenFilter,
} from '../utils';

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
 * Extract unique protocols and tokens from display items
 * Used for dynamic filter options - counts AFTER consolidation
 */
export function useFilterOptions(displayItems: YieldDisplayItem[]): {
  protocols: FilterOption[];
  tokens: FilterOption[];
} {
  // Extract unique protocols with counts
  const protocols = useMemo(() => {
    const protocolMap = new Map<string, number>();
    displayItems.forEach((item) => {
      const name = item.protocol.name;
      protocolMap.set(name, (protocolMap.get(name) || 0) + 1);
    });
    return Array.from(protocolMap.entries())
      .map(([name, count]) => ({ value: name, label: name, count }))
      .sort((a, b) => b.count - a.count); // Sort by popularity
  }, [displayItems]);

  // Extract unique tokens with counts - FROM CONSOLIDATED ITEMS
  const tokens = useMemo(() => {
    const tokenMap = new Map<string, number>();
    displayItems.forEach((item) => {
      const symbols = extractTokenSymbolsFromDisplayItem(item);
      symbols.forEach((symbol) => {
        tokenMap.set(symbol, (tokenMap.get(symbol) || 0) + 1);
      });
    });
    return Array.from(tokenMap.entries())
      .map(([symbol, count]) => ({ value: symbol, label: symbol, count }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
  }, [displayItems]);

  return { protocols, tokens };
}

/**
 * Custom hook to fetch, filter, and sort yield opportunities
 *
 * @param filters - Combined filter state
 * @returns Filtered and sorted opportunities with loading state and statistics
 */
export function useYieldData(filters: YieldFilters): UseYieldDataReturn {

  // Fetch yield data
  const { data, isLoading, error, errorDetails } = useFetchYieldData();

  // Filter and sort opportunities with AND logic
  const filteredOpportunities = useMemo(() => {
    if (!data?.opportunities) return [];

    return data.opportunities.filter((opp) => {
      // 1. Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const symbol = opp.metadata.underlyingSymbol?.toLowerCase() || '';
        const poolSymbol = opp.pool.symbol?.toLowerCase() || '';
        const token0Symbol = opp.pool.token0?.symbol?.toLowerCase() || '';
        const token1Symbol = opp.pool.token1?.symbol?.toLowerCase() || '';
        const underlyingSymbol =
          opp.pool.underlyingToken?.symbol?.toLowerCase() || '';
        const collateralSymbol =
          opp.pool.collateralToken?.symbol?.toLowerCase() || '';

        const matchesSearch =
          symbol.includes(query) ||
          poolSymbol.includes(query) ||
          token0Symbol.includes(query) ||
          token1Symbol.includes(query) ||
          underlyingSymbol.includes(query) ||
          collateralSymbol.includes(query);

        if (!matchesSearch) return false;
      }

      // 2. Categories filter (must match at least one if any selected)
      if (
        filters.selectedCategories.length > 0 &&
        !filters.selectedCategories.includes(opp.category)
      ) {
        return false;
      }

      // 3. Protocols filter (must match if any selected)
      if (
        filters.selectedProtocols.length > 0 &&
        !filters.selectedProtocols.includes(opp.protocol.name)
      ) {
        return false;
      }

      // 4. Tokens filter (must match at least one if any selected)
      if (
        filters.selectedTokens.length > 0 &&
        !matchesTokenFilter(opp, filters.selectedTokens)
      ) {
        return false;
      }

      // 5. Stablecoin filter
      if (filters.stablecoinOnly && !isStablecoinOpportunity(opp)) {
        return false;
      }

      // 6. HYPE filter
      if (filters.hypeOnly && !isHypeOpportunity(opp)) {
        return false;
      }

      // All filters passed
      return true;
    });
  }, [data, filters]);

  // Consolidate lending opportunities and sort
  const displayItems = useMemo(() => {
    const consolidated = consolidateLendingOpportunities(filteredOpportunities);
    consolidated.sort((a, b) => {
      const apyA = getDisplayItemApy(a);
      const apyB = getDisplayItemApy(b);
      return filters.sortOrder === 'desc' ? apyB - apyA : apyA - apyB;
    });
    return consolidated;
  }, [filteredOpportunities, filters.sortOrder]);

  // Extract filter options from CONSOLIDATED display items
  // This ensures token counts match what users actually see
  const { protocols, tokens } = useFilterOptions(displayItems);

  // Calculate statistics
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
      totalCount: displayItems.length,
      highestApy,
      averageApy,
    };
  }, [displayItems]);

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
 * Internal hook to fetch yield data from API with retry logic
 */
function useFetchYieldData() {
  const [data, setData] = useState<YieldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<YieldError | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;

    async function fetchData(attempt: number): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setErrorDetails(null);

        const response = await secureFetch('/api/yield/all', {
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

        const result = (await response.json()) as YieldResponse;

        if (isMounted) {
          setData(result);
          setError(null);
          setErrorDetails(null);
        }
      } catch (err) {
        if (!isMounted) return;

        // Extract error information - handle both Error instances and plain objects
        let yieldError: YieldError;
        
        // First, try to extract properties from the error object
        const errorObj = err as any;
        const hasErrorType = errorObj && typeof errorObj === 'object' && 'errorType' in errorObj;
        const hasMessage = errorObj && (errorObj.message || errorObj.error);
        
        if (hasErrorType) {
          // Already a YieldError (from parseErrorResponse)
          yieldError = {
            message: errorObj.message || errorObj.error || 'Failed to fetch yield data',
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
          const errorJson = err && typeof err === 'object' 
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
          retryCount < RETRY_CONFIG.maxAttempts &&
          yieldError.errorType === 'NETWORK_ERROR' &&
          attempt < RETRY_CONFIG.maxAttempts;

        if (shouldRetry) {
          const delay = getRetryDelay(retryCount + 1);
          console.warn(
            `[useYieldData] Attempt ${attempt}/${RETRY_CONFIG.maxAttempts} failed. Retrying in ${delay}ms...`,
            {
              errorType: yieldError.errorType || 'UNKNOWN',
              message: yieldError.message || 'No error message',
              details: yieldError.details || 'No details',
            }
          );

          retryCount++;
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
        if (yieldError.troubleshooting) logData.troubleshooting = yieldError.troubleshooting;
        
        // Add original error info for debugging
        if (err instanceof Error) {
          logData.originalError = {
            name: err.name || 'Error',
            message: err.message || 'No message',
            stack: err.stack || 'No stack trace',
          };
        } else if (err) {
          try {
            logData.originalError = JSON.stringify(err, Object.getOwnPropertyNames(err));
          } catch {
            logData.originalError = String(err);
          }
        }

        console.error('[useYieldData] Failed to fetch yield data:', logData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Start fetching
    fetchData(1);

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error, errorDetails };
}
