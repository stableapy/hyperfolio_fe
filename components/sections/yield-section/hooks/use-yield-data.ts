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

function getUnderlyingTokenSymbol(pool: YieldOpportunity['pool']): string | undefined {
  const underlying = pool.underlyingToken;
  if (!underlying || typeof underlying === 'string') return undefined;
  return underlying.symbol;
}

function getUnderlyingTokenAddress(pool: YieldOpportunity['pool']): string | undefined {
  const underlying = pool.underlyingToken;
  if (!underlying) return undefined;
  return typeof underlying === 'string' ? underlying : underlying.address;
}

/**
 * Generates a unique key for a lending market (protocol + underlying token)
 */
function getLendingMarketKey(opp: YieldOpportunity): string {
  const protocolId = opp.protocol.id;
  const underlyingSymbol =
    opp.metadata.underlyingSymbol ||
    opp.pool.symbol ||
    getUnderlyingTokenSymbol(opp.pool) ||
    opp.pool.address ||
    opp.pool.name ||
    'unknown';
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
  const lendingNonMarketOpps = lendingOpps.filter(
    (opp) => opp.type !== 'supply' && opp.type !== 'borrow'
  );
  const lendingMarketOpps = lendingOpps.filter(
    (opp) => opp.type === 'supply' || opp.type === 'borrow'
  );

  // Group lending by market key
  const marketMap = new Map<
    string,
    { supply?: YieldOpportunity; borrow?: YieldOpportunity }
  >();

  for (const opp of lendingMarketOpps) {
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
  return [...consolidatedMarkets, ...lendingNonMarketOpps, ...otherOpps];
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

function isTokenAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function extractTokenSymbolsFromItem(item: YieldDisplayItem): string[] {
  const symbols = new Set<string>();
  const pool = item.pool;

  if (item.metadata?.underlyingSymbol) {
    symbols.add(item.metadata.underlyingSymbol);
  }
  if (pool.symbol) {
    symbols.add(pool.symbol);
  }
  const underlyingSymbol = getUnderlyingTokenSymbol(pool);
  if (underlyingSymbol) {
    symbols.add(underlyingSymbol);
  }
  if (pool.token0?.symbol) {
    symbols.add(pool.token0.symbol);
  }
  if (pool.token1?.symbol) {
    symbols.add(pool.token1.symbol);
  }
  if (pool.collateralToken?.symbol) {
    symbols.add(pool.collateralToken.symbol);
  }

  return Array.from(symbols);
}

function extractTokenAddressesFromItem(item: YieldDisplayItem): string[] {
  const addresses = new Set<string>();
  const pool = item.pool;

  if (item.metadata?.underlyingToken) {
    addresses.add(item.metadata.underlyingToken);
  }
  const underlyingAddress = getUnderlyingTokenAddress(pool);
  if (underlyingAddress) {
    addresses.add(underlyingAddress);
  }
  if (pool.token0?.address) {
    addresses.add(pool.token0.address);
  }
  if (pool.token1?.address) {
    addresses.add(pool.token1.address);
  }
  if (pool.collateralToken?.address) {
    addresses.add(pool.collateralToken.address);
  }

  return Array.from(addresses);
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
    const selectedTokenAddresses = filters.selectedTokens.filter(isTokenAddress);

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

    if (Number.isFinite(minApy)) params.min_value = minApy;
    if (Number.isFinite(maxApy)) params.max_value = maxApy;
    if (Number.isFinite(minTvl)) params.min_tvl = minTvl;
    if (Number.isFinite(maxTvl)) params.max_tvl = maxTvl;

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
    filters.sortOrder,
    pagination.page,
    pagination.pageSize,
  ]);

  // Fetch paginated yield data from backend
  const { data, isLoading, error, errorDetails } = useFetchYieldData(apiParams);

  // Consolidate lending opportunities for display and apply range filters/sort
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
    const consolidated = consolidateLendingOpportunities(withValidApy);

    const minApy = Number.parseFloat(filters.minApy);
    const maxApy = Number.parseFloat(filters.maxApy);
    const minTvl = Number.parseFloat(filters.minTvl);
    const maxTvl = Number.parseFloat(filters.maxTvl);

    const hasMinApy = Number.isFinite(minApy);
    const hasMaxApy = Number.isFinite(maxApy);
    const hasMinTvl = Number.isFinite(minTvl);
    const hasMaxTvl = Number.isFinite(maxTvl);

    const selectedTokenAddresses = filters.selectedTokens
      .filter(isTokenAddress)
      .map((address) => address.toLowerCase());
    const selectedTokenSymbols = filters.selectedTokens
      .filter((token) => !isTokenAddress(token))
      .map((symbol) => symbol.toUpperCase());

    const filtered = consolidated.filter((item) => {
      if (filters.selectedTokens.length > 0) {
        const itemAddresses = extractTokenAddressesFromItem(item).map(
          (address) => address.toLowerCase()
        );
        const itemSymbols = extractTokenSymbolsFromItem(item).map((symbol) =>
          symbol.toUpperCase()
        );
        const matchesAddress =
          selectedTokenAddresses.length > 0 &&
          selectedTokenAddresses.some((address) =>
            itemAddresses.includes(address)
          );
        const matchesSymbol =
          selectedTokenSymbols.length > 0 &&
          selectedTokenSymbols.some((symbol) => itemSymbols.includes(symbol));

        if (!matchesAddress && !matchesSymbol) return false;
      }

      const apy = getDisplayItemApy(item);
      const rawTvl = item.pool.tvlUsd ?? item.pool.liquidityUsd;
      const tvl =
        typeof rawTvl === 'number'
          ? rawTvl
          : rawTvl !== undefined
            ? Number.parseFloat(String(rawTvl))
            : Number.NaN;
      const hasTvl = Number.isFinite(tvl);

      if (hasMinApy && apy < minApy) return false;
      if (hasMaxApy && apy > maxApy) return false;
      if (hasMinTvl && hasTvl && tvl < minTvl) return false;
      if (hasMaxTvl && hasTvl && tvl > maxTvl) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      const aApy = getDisplayItemApy(a);
      const bApy = getDisplayItemApy(b);
      return filters.sortOrder === 'asc' ? aApy - bApy : bApy - aApy;
    });
  }, [
    data,
    filters.minApy,
    filters.maxApy,
    filters.minTvl,
    filters.maxTvl,
    filters.sortOrder,
    filters.selectedTokens,
  ]);

  // Build filter options from backend metadata
  const { protocols, tokens } = useMemo(() => {
    if (!data) {
      return { protocols: [], tokens: [] };
    }

    const meta = data.metadata as
      | undefined
      | {
          protocols?: string[];
          tokens?: string[];
          filters?: {
            protocols?: Array<{ value: string; label?: string; count?: number }>;
            tokenAddresses?: Array<{ value: string; label?: string; count?: number }>;
          };
        };

    const protocolNames = Array.isArray(meta?.protocols) ? meta.protocols : [];
    const tokenSymbols = Array.isArray(meta?.tokens) ? meta.tokens : [];
    const protocolFilters = Array.isArray(meta?.filters?.protocols)
      ? meta?.filters?.protocols
      : [];
    const tokenAddressFilters = Array.isArray(meta?.filters?.tokenAddresses)
      ? meta?.filters?.tokenAddresses
      : [];

    const fallbackProtocols = new Set<string>();
    const fallbackTokens = new Set<string>();
    const protocolNameById = new Map<string, string>();
    const protocolIdByName = new Map<string, string>();
    const tokenCounts = new Map<string, number>();
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
        protocolIdByName.set(protocolName.toLowerCase(), protocolId || protocolName);
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
          continue;
        }

        if (typeof candidate.symbol === 'string' && candidate.symbol.trim()) {
          const normalized = candidate.symbol.trim();
          fallbackTokens.add(normalized);
          tokenCounts.set(normalized, (tokenCounts.get(normalized) || 0) + 1);
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
            }))
          : Array.from(fallbackProtocols).map((name) => ({
              value: name,
              label: name,
            }));
    const addressTokensSource =
      tokenAddressFilters.length > 0
        ? tokenAddressFilters.map((entry) => ({
            value: entry.value.toLowerCase(),
            label: entry.label || entry.value,
            count: entry.count,
          }))
        : Array.from(tokenOptionsByAddress.values());

    const symbolTokensSource =
      tokenSymbols.length > 0
        ? tokenSymbols.map((symbol) => ({
            value: symbol,
            label: symbol,
          }))
        : Array.from(fallbackTokens).map((symbol) => ({
            value: symbol,
            label: symbol,
            count: tokenCounts.get(symbol) || 0,
          }));

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

    const addressLabels = new Set(
      addressTokensSource.map((token) => token.label.toUpperCase())
    );
    const mergedTokensSource = [
      ...addressTokensSource,
      ...symbolTokensSource.filter(
        (token) => !addressLabels.has(token.label.toUpperCase())
      ),
    ];

    const tokens = mergedTokensSource.map((token) => ({
      value: token.value,
      label: token.label,
      count: token.count,
    }));

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

    const paginationMeta = data?.pagination;
    const totalItems = Number(
      paginationMeta?.total_items ?? paginationMeta?.total ?? 0
    );

    return {
      totalCount: totalItems,
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
    if (params.min_value !== undefined)
      searchParams.append('min_value', params.min_value.toString());
    if (params.max_value !== undefined)
      searchParams.append('max_value', params.max_value.toString());
    if (params.min_tvl !== undefined)
      searchParams.append('min_tvl', params.min_tvl.toString());
    if (params.max_tvl !== undefined)
      searchParams.append('max_tvl', params.max_tvl.toString());
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
