import { useState, useEffect, useMemo } from 'react';
import type { YieldResponse } from '@/lib/types/api';
import type { YieldOpportunity } from '@/lib/types/api';
import type { UseYieldDataReturn } from '../types';

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
 * Custom hook to fetch, filter, and sort yield opportunities
 *
 * @param options - Configuration for filtering and sorting
 * @returns Filtered and sorted opportunities with loading state and statistics
 */
export function useYieldData(options: {
  searchQuery: string;
  selectedCategory: 'all' | 'lending' | 'amm' | 'yield' | 'staking';
  sortOrder: 'desc' | 'asc';
}): UseYieldDataReturn {
  const { searchQuery, selectedCategory, sortOrder } = options;

  // Fetch yield data
  const { data, isLoading, error, errorDetails } = useFetchYieldData();

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    if (!data?.opportunities) return [];

    let opportunities = [...data.opportunities];

    // Filter by search query (underlyingSymbol)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      opportunities = opportunities.filter((opp) => {
        const symbol = opp.metadata.underlyingSymbol?.toLowerCase() || '';
        const poolSymbol = opp.pool.symbol?.toLowerCase() || '';
        return symbol.includes(query) || poolSymbol.includes(query);
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      opportunities = opportunities.filter(
        (opp) => opp.category === selectedCategory
      );
    }

    // Sort by APY (descending or ascending)
    opportunities.sort((a, b) => {
      const apyA = a.apy.totalApy ?? a.apy.baseApy ?? 0;
      const apyB = b.apy.totalApy ?? b.apy.baseApy ?? 0;
      return sortOrder === 'desc' ? apyB - apyA : apyA - apyB;
    });

    return opportunities;
  }, [data, searchQuery, selectedCategory, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const apyValues = filteredOpportunities
      .map((opp) => opp.apy.totalApy ?? opp.apy.baseApy ?? 0)
      .filter((apy) => apy > 0);

    const highestApy = apyValues.length > 0 ? Math.max(...apyValues) : 0;
    const averageApy =
      apyValues.length > 0
        ? apyValues.reduce((sum, apy) => sum + apy, 0) / apyValues.length
        : 0;

    return {
      totalCount: filteredOpportunities.length,
      highestApy,
      averageApy,
    };
  }, [filteredOpportunities]);

  const hasData = filteredOpportunities.length > 0;

  return {
    opportunities: filteredOpportunities,
    isLoading,
    error: error || null,
    hasData,
    stats,
    errorDetails: errorDetails || undefined,
    isMockData: (data as any)?._meta?.isMock === true,
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

        const response = await fetch('/api/yield/all', {
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

        // Check if error is a YieldError (structured error from API)
        const yieldError =
          err instanceof Error && 'errorType' in err
            ? (err as YieldError)
            : {
                message: err instanceof Error ? err.message : 'Unknown error',
              };

        // Determine if we should retry
        const shouldRetry =
          retryCount < RETRY_CONFIG.maxAttempts &&
          yieldError.errorType === 'NETWORK_ERROR' &&
          attempt > 1;

        if (shouldRetry) {
          const delay = getRetryDelay(retryCount + 1);
          console.warn(
            `[useYieldData] Attempt ${retryCount + 1}/${RETRY_CONFIG.maxAttempts} failed. Retrying in ${delay}ms...`,
            yieldError
          );

          retryCount++;
          await sleep(delay);
          return fetchData(retryCount + 1);
        }

        // Final attempt failed, set error
        const userMessage = getUserFriendlyError(yieldError);
        setError(userMessage);
        setErrorDetails(yieldError);

        console.error('[useYieldData] Failed to fetch yield data:', {
          attempt,
          maxAttempts: RETRY_CONFIG.maxAttempts,
          error: yieldError,
        });
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
