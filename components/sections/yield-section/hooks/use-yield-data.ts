import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  YieldOpportunity,
  PaginatedYieldResponse,
  YieldPaginationParams,
} from '@/lib/types/api';
import type {
  UseYieldDataReturn,
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

function getUnderlyingTokenSymbol(
  pool: YieldOpportunity['pool']
): string | undefined {
  const underlying = pool.underlyingToken;
  if (!underlying || typeof underlying === 'string') return undefined;
  return underlying.symbol;
}

function getUnderlyingTokenAddress(
  pool: YieldOpportunity['pool']
): string | undefined {
  const underlying = pool.underlyingToken;
  if (!underlying) return undefined;
  return typeof underlying === 'string' ? underlying : underlying.address;
}

function isTokenAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
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

    const minApy = Number.parseFloat(filters.minApy);
    const maxApy = Number.parseFloat(filters.maxApy);
    const minTvl = Number.parseFloat(filters.minTvl);
    const maxTvl = Number.parseFloat(filters.maxTvl);
    const selectedTokenAddresses =
      filters.selectedTokens.filter(isTokenAddress);

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
    if (selectedTokenAddresses.length > 0) {
      params.token_addresses = selectedTokenAddresses;
    }

    // Add sort order
    params.sort_by = 'apy';
    params.sort_order = filters.sortOrder;

    if (Number.isFinite(minApy)) params.min_apy = minApy;
    if (Number.isFinite(maxApy)) params.max_apy = maxApy;
    if (Number.isFinite(minTvl)) params.min_tvl = minTvl;
    if (Number.isFinite(maxTvl)) params.max_tvl = maxTvl;
    if (filters.stablecoinOnly) params.stablecoin_only = true;
    if (filters.hypeOnly) params.hype_only = true;

    return params;
  }, [
    filters.searchQuery,
    filters.selectedCategories,
    filters.selectedProtocols,
    filters.selectedTokens,
    filters.minApy,
    filters.maxApy,
    filters.minTvl,
    filters.maxTvl,
    filters.stablecoinOnly,
    filters.hypeOnly,
    filters.sortOrder,
    pagination.page,
    pagination.pageSize,
  ]);

  // Fetch paginated yield data from backend
  const { data, isLoading, error, errorDetails } = useFetchYieldData(apiParams);

  const displayItems = useMemo<YieldDisplayItem[]>(
    () => data?.data ?? [],
    [data]
  );

  // Build filter options from backend metadata
  const { protocols, tokens } = useMemo(() => {
    if (!data) {
      return { protocols: [], tokens: [] };
    }

    const meta = data.metadata as
      | undefined
      | {
          protocols?: string[];
          filters?: {
            protocols?: Array<{
              value: string;
              label?: string;
              count?: number;
            }>;
            tokenAddresses?: Array<{
              value: string;
              label?: string;
              count?: number;
            }>;
          };
        };

    const protocolNames = Array.isArray(meta?.protocols) ? meta.protocols : [];
    const protocolFilters = Array.isArray(meta?.filters?.protocols)
      ? meta?.filters?.protocols
      : [];
    const tokenAddressFilters = Array.isArray(meta?.filters?.tokenAddresses)
      ? meta?.filters?.tokenAddresses
      : [];

    const fallbackProtocols = new Set<string>();
    const protocolNameById = new Map<string, string>();
    const protocolIdByName = new Map<string, string>();
    const tokenOptionsByAddress = new Map<
      string,
      { value: string; label: string; count?: number }
    >();

    for (const opp of data.data || []) {
      const protocolId = opp?.protocol?.id;
      const protocolName = opp?.protocol?.name;

      if (protocolId) {
        fallbackProtocols.add(protocolId);
      }

      if (protocolName) {
        if (protocolId) {
          protocolNameById.set(protocolId, protocolName);
        }
        protocolIdByName.set(
          protocolName.toLowerCase(),
          protocolId || protocolName
        );
      }

      const pool = opp.pool;
      const tokenCandidates = [
        {
          address: opp.metadata?.underlyingToken,
          symbol: opp.metadata?.underlyingSymbol,
        },
        {
          address: pool ? getUnderlyingTokenAddress(pool) : undefined,
          symbol: pool ? getUnderlyingTokenSymbol(pool) : undefined,
        },
        {
          address: pool?.token0?.address,
          symbol: pool?.token0?.symbol,
        },
        {
          address: pool?.token1?.address,
          symbol: pool?.token1?.symbol,
        },
        {
          address: pool?.collateralToken?.address,
          symbol: pool?.collateralToken?.symbol,
        },
      ];

      for (const candidate of tokenCandidates) {
        if (typeof candidate.address === 'string' && candidate.address.trim()) {
          const normalized = candidate.address.trim().toLowerCase();
          const existing = tokenOptionsByAddress.get(normalized);
          const label =
            candidate.symbol || existing?.label || candidate.address.trim();
          tokenOptionsByAddress.set(normalized, {
            value: normalized,
            label,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    }

    const protocolsSource =
      protocolFilters.length > 0
        ? protocolFilters.map((entry) => ({
            value: entry.value,
            label: entry.label || entry.value,
            count: entry.count,
          }))
        : protocolNames.length > 0
          ? protocolNames.map((name) => ({
              value: name,
              label: name,
              count: undefined as number | undefined,
            }))
          : Array.from(fallbackProtocols).map((name) => ({
              value: name,
              label: name,
              count: undefined as number | undefined,
            }));
    const addressTokensSource =
      tokenAddressFilters.length > 0
        ? tokenAddressFilters.map((entry) => ({
            value: entry.value.toLowerCase(),
            label: entry.label || entry.value,
            count: entry.count,
          }))
        : Array.from(tokenOptionsByAddress.values());

    const protocols = protocolsSource.map((protocol) => {
      const normalized = protocol.value.toLowerCase();
      const mappedId = protocolIdByName.get(normalized);
      const value = mappedId || protocol.value;
      const label = protocolNameById.get(value) || protocol.label;

      return {
        value,
        label,
        count: protocol.count,
      };
    });

    const tokens = addressTokensSource.map((token) => ({
      value: token.value,
      label: token.label,
      count: token.count,
    }));

    return { protocols, tokens };
  }, [data]);

  const stats = useMemo(() => {
    const paginationMeta = data?.pagination;
    const totals = data?.metadata?.totals;
    const totalItems = Number(
      paginationMeta?.total_items ?? paginationMeta?.total ?? 0
    );

    return {
      totalCount: totalItems,
      highestApy: Number(totals?.highest_apy) || 0,
      averageApy: Number(totals?.total_apy) || 0,
    };
  }, [data]);

  const hasData = displayItems.length > 0;

  return {
    opportunities: displayItems,
    isLoading,
    error: error || null,
    hasData,
    stats,
    errorDetails: errorDetails || undefined,
    isMockData: data?._meta?.isMock === true,
    filterOptions: { protocols, tokens },
    pagination: {
      page:
        Number(data?.pagination?.page ?? pagination.page) || pagination.page,
      pageSize:
        Number(data?.pagination?.page_size ?? pagination.pageSize) ||
        pagination.pageSize,
      totalPages: Number(data?.pagination?.total_pages) || 1,
      totalItems: Number(
        data?.pagination?.total_items ?? data?.pagination?.total ?? 0
      ),
      hasNext: Boolean(data?.pagination?.has_next ?? data?.pagination?.next),
      hasPrev: Boolean(data?.pagination?.has_prev ?? data?.pagination?.prev),
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
    if (params.min_apy !== undefined)
      searchParams.append('min_apy', params.min_apy.toString());
    if (params.max_apy !== undefined)
      searchParams.append('max_apy', params.max_apy.toString());
    if (params.min_tvl !== undefined)
      searchParams.append('min_tvl', params.min_tvl.toString());
    if (params.max_tvl !== undefined)
      searchParams.append('max_tvl', params.max_tvl.toString());
    if (params.stablecoin_only) searchParams.append('stablecoin_only', 'true');
    if (params.hype_only) searchParams.append('hype_only', 'true');
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

        const url = `/api/yield${queryString ? `?${queryString}` : ''}`;
        console.log('[useYieldData] Fetching from URL:', url);

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
