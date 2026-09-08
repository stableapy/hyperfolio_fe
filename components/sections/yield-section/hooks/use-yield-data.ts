import { useState, useEffect, useMemo } from 'react';
import type {
  YieldOpportunity,
  PaginatedYieldResponse,
  YieldPaginationParams,
} from '@/lib/types/api';
import type {
  UseYieldDataReturn,
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

    const symbols = filters.selectedTokens.filter((token) => !isTokenAddress(token));
    if (symbols.length) params.token_symbols = symbols;

    // Add sort order
    params.sort_by = 'apy';
    params.sort_order = filters.sortOrder;

    if (Number.isFinite(minApy)) params.min_apy = minApy;
    if (Number.isFinite(maxApy)) params.max_apy = maxApy;
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

  // The API filters and sorts the complete dataset before pagination.
  const displayItems = data?.data ?? [];

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

    const symbolTokensSource =
      tokenSymbols.length > 0
        ? tokenSymbols.map((symbol) => ({
            value: symbol,
            label: symbol,
            count: undefined as number | undefined,
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
      .filter((item) => item.apy.available !== false)
      .map((item) => item.apy.totalApy ?? item.apy.baseApy)
      .filter((apy): apy is number => apy !== undefined && Number.isFinite(apy));

    const highestApy = apyValues.length > 0 ? Math.max(...apyValues) : null;
    const averageApy =
      apyValues.length > 0
        ? apyValues.reduce((sum, apy) => sum + apy, 0) / apyValues.length
        : null;

    const paginationMeta = data?.pagination;
    const totalItems = Number(
      paginationMeta?.total ?? paginationMeta?.total_items ?? 0
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
        data?.pagination?.total ?? data?.pagination?.total_items ?? 0
      ),
      hasNext: Boolean(data?.pagination?.has_next ?? data?.pagination?.next),
      hasPrev: Boolean(data?.pagination?.has_prev ?? data?.pagination?.prev),
    },
  };
}

function useFetchYieldData(params: YieldPaginationParams) {
  const [data, setData] = useState<PaginatedYieldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<YieldError | null>(null);
  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      for (const entry of Array.isArray(value) ? value : [value]) {
        query.append(key, String(entry));
      }
    }
    return query.toString();
  }, [params]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    setData(null);
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    async function fetchData(attempt: number): Promise<void> {
      try {
        const response = await secureFetch('/api/yield?' + queryString, {
          headers: { accept: 'application/json' },
          signal: controller.signal,
        });
        if (!active) return;
        if (!response.ok) {
          setError('Unable to fetch yield data. Please try again later.');
          setErrorDetails({ message: 'Yield API request failed', status: response.status });
          setIsLoading(false);
          return;
        }
        const result: PaginatedYieldResponse = await response.json();
        if (!active) return;
        setData(result);
        setIsLoading(false);
      } catch (err) {
        if (!active) return;
        if (attempt < 3) {
          retryTimer = setTimeout(() => void fetchData(attempt + 1), 1000 * 2 ** (attempt - 1));
          return;
        }
        setError('Connection issue. Please check your internet and try again.');
        setErrorDetails({ message: err instanceof Error ? err.message : 'Yield request failed', errorType: 'NETWORK_ERROR' });
        setIsLoading(false);
      }
    }
    void fetchData(1);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, [queryString]);
  return { data, isLoading, error, errorDetails };
}
