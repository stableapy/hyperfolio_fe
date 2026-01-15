import { useState, useEffect, useMemo } from 'react';
import type { YieldResponse, YieldOpportunity } from '@/lib/types/api';
import type {
  UseYieldDataReturn,
  ConsolidatedLendingMarket,
  YieldDisplayItem,
  YieldFilters,
} from '../types';
import { secureFetch } from '@/lib/api/fetch';
import { extractTokenSymbolsFromDisplayItem } from '../utils';

const STABLECOIN_SYMBOLS = [
  'USDC',
  'USDT',
  'DAI',
  'BUSD',
  'TUSD',
  'FEI',
  'sUSD',
  'USD',
];

const COLLATOR = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

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

interface NormalizedDisplayItem {
  item: YieldDisplayItem;
  category: YieldDisplayItem['category'];
  protocolName: string;
  tokenSymbols: string[];
  searchText: string;
  isStablecoin: boolean;
  isHype: boolean;
  hasValidApy: boolean;
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
 * Checks if an APY value is valid
 */
function isValidApyValue(apy?: number | null): boolean {
  return apy !== null && apy !== undefined && !Number.isNaN(apy);
}

/**
 * Checks if an APY object contains any valid values
 */
function hasValidApyData(
  apy?: { baseApy?: number; totalApy?: number } | null
): boolean {
  if (!apy) return false;
  return isValidApyValue(apy.totalApy) || isValidApyValue(apy.baseApy);
}

/**
 * Checks if a display item has any valid APY data
 */
function hasValidDisplayItemApy(item: YieldDisplayItem): boolean {
  if (item.type === 'market') {
    return hasValidApyData(item.supplyApy) || hasValidApyData(item.borrowApy);
  }
  return hasValidApyData(item.apy);
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

  const deferredFilters = filters;

  const normalizedFilters = useMemo(() => {
    const selectedCategoriesSet =
      deferredFilters.selectedCategories.length > 0
        ? new Set(deferredFilters.selectedCategories)
        : new Set();
    const selectedProtocolsSet =
      deferredFilters.selectedProtocols.length > 0
        ? new Set(deferredFilters.selectedProtocols)
        : new Set();
    const selectedTokensSet =
      deferredFilters.selectedTokens.length > 0
        ? new Set(deferredFilters.selectedTokens)
        : new Set();

    return {
      searchQuery: deferredFilters.searchQuery.trim().toLowerCase(),
      selectedCategories: selectedCategoriesSet,
      selectedProtocols: selectedProtocolsSet,
      selectedTokens: selectedTokensSet,
      stablecoinOnly: deferredFilters.stablecoinOnly,
      hypeOnly: deferredFilters.hypeOnly,
    };
  }, [
    deferredFilters.searchQuery,
    deferredFilters.selectedCategories.length,
    deferredFilters.selectedProtocols.length,
    deferredFilters.selectedTokens.length,
    deferredFilters.stablecoinOnly,
    deferredFilters.hypeOnly,
  ]);

  const normalizedDisplayItems = useMemo<NormalizedDisplayItem[]>(() => {
    if (!data?.opportunities?.length) return [];

    const preFiltered = data.opportunities.filter((opp) => {
      return (
        (opp.apy?.totalApy !== null && opp.apy?.totalApy !== undefined) ||
        (opp.apy?.baseApy !== null && opp.apy?.baseApy !== undefined)
      );
    });

    const consolidated = consolidateLendingOpportunities(preFiltered);

    return consolidated.map((item) => {
      const tokenSymbols = extractTokenSymbolsFromDisplayItem(item);
      const searchText = tokenSymbols.join(' ').toLowerCase();
      const isStablecoin = tokenSymbols.some((symbol) =>
        STABLECOIN_SYMBOLS.some((stable) => symbol.includes(stable))
      );
      const isHype =
        item.protocol.id === 'hyperliquid' ||
        tokenSymbols.some((symbol) => symbol.includes('HYPE'));
      const hasValidApy = hasValidDisplayItemApy(item);

      return {
        item,
        category: item.category,
        protocolName: item.protocol.name,
        tokenSymbols,
        searchText,
        isStablecoin,
        isHype,
        hasValidApy,
      };
    });
  }, [data]);

  // Filter and sort opportunities with AND logic
  const filteredDisplayItems = useMemo(() => {
    if (normalizedDisplayItems.length === 0) return [];

    const hasSearchQuery = normalizedFilters.searchQuery.length > 0;
    const hasCategoryFilters = normalizedFilters.selectedCategories.size > 0;
    const hasProtocolFilters = normalizedFilters.selectedProtocols.size > 0;
    const hasTokenFilters = normalizedFilters.selectedTokens.size > 0;

    // Early return: If no filters active, only filter by valid APY
    if (
      !hasSearchQuery &&
      !hasCategoryFilters &&
      !hasProtocolFilters &&
      !hasTokenFilters &&
      !normalizedFilters.stablecoinOnly &&
      !normalizedFilters.hypeOnly
    ) {
      return normalizedDisplayItems.filter((item) => item.hasValidApy);
    }

    const results: NormalizedDisplayItem[] = [];

    for (const item of normalizedDisplayItems) {
      // 7. Filter out opportunities without valid APY data (check first - cheapest)
      if (!item.hasValidApy) {
        continue;
      }

      // 2. Categories filter (usually first to check)
      if (
        hasCategoryFilters &&
        !normalizedFilters.selectedCategories.has(item.category)
      ) {
        continue;
      }

      // 1. Search query filter (more expensive, check after category)
      if (
        hasSearchQuery &&
        !item.searchText.includes(normalizedFilters.searchQuery)
      ) {
        continue;
      }

      // 3. Protocols filter
      if (
        hasProtocolFilters &&
        !normalizedFilters.selectedProtocols.has(item.protocolName)
      ) {
        continue;
      }

      // 4. Tokens filter (loop check, do last)
      if (hasTokenFilters) {
        let matchesToken = false;
        for (const symbol of item.tokenSymbols) {
          if (normalizedFilters.selectedTokens.has(symbol)) {
            matchesToken = true;
            break;
          }
        }
        if (!matchesToken) {
          continue;
        }
      }

      // 5. Stablecoin filter
      if (normalizedFilters.stablecoinOnly && !item.isStablecoin) {
        continue;
      }

      // 6. HYPE filter
      if (normalizedFilters.hypeOnly && !item.isHype) {
        continue;
      }

      results.push(item);
    }

    return results;
  }, [normalizedDisplayItems, normalizedFilters]);

  // Sort filtered items
  const displayItems = useMemo(() => {
    const items = filteredDisplayItems.map((entry) => entry.item);
    const sortOrder = deferredFilters.sortOrder;
    items.sort((a, b) => {
      const apyA = getDisplayItemApy(a);
      const apyB = getDisplayItemApy(b);
      return sortOrder === 'desc' ? apyB - apyA : apyA - apyB;
    });
    return items;
  }, [filteredDisplayItems, deferredFilters.sortOrder]);

  const { protocols, tokens } = useMemo(() => {
    const protocolMap = new Map<string, number>();
    const tokenMap = new Map<string, number>();

    normalizedDisplayItems.forEach((item) => {
      protocolMap.set(
        item.protocolName,
        (protocolMap.get(item.protocolName) || 0) + 1
      );
      item.tokenSymbols.forEach((symbol) => {
        tokenMap.set(symbol, (tokenMap.get(symbol) || 0) + 1);
      });
    });

    const protocols = Array.from(protocolMap.entries())
      .map(([name, count]) => ({ value: name, label: name, count }))
      .sort((a, b) => b.count - a.count || COLLATOR.compare(a.label, b.label));

    const tokens = Array.from(tokenMap.entries())
      .map(([symbol, count]) => ({ value: symbol, label: symbol, count }))
      .sort((a, b) => COLLATOR.compare(a.label, b.label));

    return { protocols, tokens };
  }, [normalizedDisplayItems]);

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
        const hasErrorType =
          errorObj && typeof errorObj === 'object' && 'errorType' in errorObj;
        const hasMessage = errorObj && (errorObj.message || errorObj.error);

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
