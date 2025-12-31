// API Client for Hyperfolio API
import 'server-only';

import type {
  WalletComposition,
  WalletCompositionResponse,
  Transaction,
  TransactionsResponse,
  NFT,
  PositionsResponse,
  PortfolioHistoryPoint,
  PortfolioHistoryResponse,
  UserData,
  PointsData,
  SwapStats,
  VaultPosition,
  AggregateData,
  SpotPosition,
  Token,
} from '@/lib/types/api';

// Use internal Docker URL for server-side calls (faster), fallback to public URL
const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.hyperfolio.xyz';
const API_KEY = process.env.HYPEREVM_API_KEY || '';

// Debug: Log API URL on server startup
console.log(
  '[API Client] Using API_BASE_URL:',
  API_BASE_URL,
  '(internal:',
  !!process.env.API_INTERNAL_URL,
  ')'
);

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  cache?: RequestCache;
  next?: { revalidate?: number };
  skipCache?: boolean; // Add cache=false to the request URL
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    cache = 'no-store',
    next,
    skipCache = false,
  } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  const config: RequestInit = {
    method,
    headers,
    cache,
    ...(next && { next }),
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Add cache=false query param if skipCache is true
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = skipCache
    ? `${API_BASE_URL}${endpoint}${separator}cache=false`
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Wallet API Functions

export async function getWalletComposition(
  address: string
): Promise<WalletComposition> {
  const response = await fetchAPI<WalletCompositionResponse>(
    `/wallet/composition?address=${address}`
  );

  // Parse the response to create a standardized composition
  const tokens = response.data.tokens || [];
  const totalValue = parseFloat(response.data.totalWalletValue || '0');

  // Categorize tokens by type
  const spotTokens = tokens.filter((t) => t.type === 'spot');
  const perpTokens = tokens.filter((t) => t.type === 'perp');
  const stakingTokens = tokens.filter((t) => t.type === 'staking');
  const vaultTokens = tokens.filter((t) => t.type === 'vault');

  const spotValue = spotTokens.reduce(
    (sum, t) => sum + parseFloat(t.usdValue || '0'),
    0
  );
  const perpValue = perpTokens.reduce(
    (sum, t) => sum + parseFloat(t.usdValue || '0'),
    0
  );
  const stakingValue = stakingTokens.reduce(
    (sum, t) => sum + parseFloat(t.usdValue || '0'),
    0
  );
  const vaultValue = vaultTokens.reduce(
    (sum, t) => sum + parseFloat(t.usdValue || '0'),
    0
  );

  return {
    spot: spotValue,
    perp: perpValue,
    staking: stakingValue,
    vaults: vaultValue,
    total_value: totalValue,
  };
}

export async function getWalletTransactions(
  address: string,
  limit = 50,
  offset = 0
): Promise<Transaction[]> {
  const response = await fetchAPI<TransactionsResponse>(
    `/wallet/transactions?address=${address}&limit=${limit}&offset=${offset}`
  );
  return response.transactions || [];
}

export async function getWalletNFTs(
  address: string
): Promise<{ data: { nfts: NFT[]; totalNftValue: number }; cache: any }> {
  return fetchAPI<{ data: { nfts: NFT[]; totalNftValue: number }; cache: any }>(
    `/nfts?address=${address}`
  );
}

export async function getPortfolioHistory(
  address: string,
  days = 30
): Promise<PortfolioHistoryPoint[]> {
  const response = await fetchAPI<PortfolioHistoryResponse>(
    `/portfolio-history?address=${address}&days=${days}`
  );

  // Transform snapshots to PortfolioHistoryPoint format
  return response.snapshots.map((snapshot) => ({
    timestamp: snapshot.snapshot_timestamp * 1000, // Convert to milliseconds
    value: snapshot.total_value_usd,
  }));
}

export async function getPositions(
  address: string
): Promise<PositionsResponse> {
  return fetchAPI<PositionsResponse>(`/positions?address=${address}`);
}

// User Data API Functions

export async function getUserData(address: string): Promise<UserData> {
  return fetchAPI<UserData>(`/hypercore/user/${address}`);
}

export interface PointsDataResponse {
  data: PointsData[];
  cache: {
    lastUpdate: string;
    cacheAge: string;
    cacheAgeSeconds: number;
    source: string;
    isStale: boolean;
  };
}

export async function getDefiPoints(
  address: string,
  skipCache = false
): Promise<PointsDataResponse> {
  return fetchAPI<PointsDataResponse>(`/points?address=${address}`, {
    skipCache,
  });
}

export async function getVaultsYield(
  address: string
): Promise<{ vault_name: string; apy: number }[]> {
  return fetchAPI<{ vault_name: string; apy: number }[]>(
    `/vaults?address=${address}`
  );
}

export async function getHyperbeatPoints(
  address: string
): Promise<PointsData[]> {
  return fetchAPI<PointsData[]>(`/hyperbeat/points?address=${address}`);
}

export async function getVaultInfos(): Promise<VaultPosition[]> {
  return fetchAPI<VaultPosition[]>(`/vault-infos`);
}

export async function getSwapStats(address: string): Promise<SwapStats> {
  return fetchAPI<SwapStats>(`/masterswap/user/${address}`);
}

// Aggregated Data Functions

export async function getWalletData(address: string, skipCache = false) {
  try {
    // Note: positions are fetched separately via SSE streaming for progressive loading
    // Note: transactions are fetched independently via /api/wallet/transactions
    const [compositionRaw, nfts, userData, history, points] = await Promise.all(
      [
        fetchAPI<WalletCompositionResponse>(
          `/wallet/composition?address=${address}`,
          { skipCache }
        ).catch(() => null),
        fetchAPI<{
          data: { nfts: NFT[]; totalNftValue: number };
          cache: unknown;
        }>(`/nfts?address=${address}`, { skipCache }).catch(() => ({
          data: { nfts: [], totalNftValue: 0 },
          cache: {},
        })),
        fetchAPI<UserData>(`/hypercore/user/${address}`, { skipCache }).catch(
          () => null
        ),
        getPortfolioHistory(address, 30).catch(() => []),
        getDefiPoints(address, skipCache).catch(() => ({
          data: [],
          cache: {},
        })),
      ]
    );

    // Transform raw composition
    const composition = compositionRaw?.data?.tokens
      ? {
          spot: compositionRaw.data.tokens
            .filter((t) => t.type === 'spot')
            .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
          perp: compositionRaw.data.tokens
            .filter((t) => t.type === 'perp')
            .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
          staking: compositionRaw.data.tokens
            .filter((t) => t.type === 'staking')
            .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
          vaults: compositionRaw.data.tokens
            .filter((t) => t.type === 'vault')
            .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
          // Calculate total_value from all tokens (don't use totalWalletValue as it might miss some types)
          total_value: compositionRaw.data.tokens.reduce(
            (sum, t) => sum + parseFloat(t.usdValue || '0'),
            0
          ),
        }
      : null;

    return {
      compositionRaw, // Keep raw data for tokens extraction
      composition,
      nfts,
      userData,
      history,
      points: points?.data || [],
    };
  } catch (error) {
    console.error(`Error fetching wallet data for ${address}:`, error);
    throw error;
  }
}

// Multi-wallet aggregate functions

// Type for accumulated data during streaming (used by SSE endpoint)
interface StreamAccumulator {
  composition: Map<string, WalletCompositionResponse>;
  nfts: Map<
    string,
    { data: { nfts: NFT[]; totalNftValue: number }; cache: unknown }
  >;
  hypercore: Map<string, UserData>;
  history: Map<string, PortfolioHistoryPoint[]>;
  points: Map<string, { data: PointsData[]; cache: unknown }>;
}

// Helper to compute aggregate from accumulated data (used by streaming endpoint)
export function computeAggregate(
  accumulator: StreamAccumulator
): AggregateData {
  // Build data array in the same format as getMultiWalletData
  const data = Array.from(accumulator.composition.keys()).map((address) => ({
    address,
    data: {
      compositionRaw: accumulator.composition.get(address) || null,
      composition: accumulator.composition.get(address),
      // Note: transactions removed - loaded independently via /api/wallet/transactions
      nfts: accumulator.nfts.get(address) || {
        data: { nfts: [], totalNftValue: 0 },
        cache: {},
      },
      userData: accumulator.hypercore.get(address) || null,
      history: accumulator.history.get(address) || [],
      points: accumulator.points.get(address)?.data || [],
    },
    error: null,
  }));

  // Aggregate compositions
  const compositions = data
    .map((d) => {
      if (!d.data?.compositionRaw?.data?.tokens) return null;
      const tokens = d.data.compositionRaw.data.tokens;
      return {
        spot: tokens
          .filter((t) => t.type === 'spot')
          .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
        perp: tokens
          .filter((t) => t.type === 'perp')
          .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
        staking: tokens
          .filter((t) => t.type === 'staking')
          .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
        vaults: tokens
          .filter((t) => t.type === 'vault')
          .reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
        total_value: tokens.reduce(
          (sum, t) => sum + parseFloat(t.usdValue || '0'),
          0
        ),
      };
    })
    .filter((c): c is WalletComposition => c !== null && c !== undefined);

  const aggregateComposition = compositions.reduce(
    (acc, comp) => ({
      spot: acc.spot + comp.spot,
      perp: acc.perp + comp.perp,
      staking: acc.staking + comp.staking,
      vaults: acc.vaults + comp.vaults,
      total_value: acc.total_value + comp.total_value,
    }),
    { spot: 0, perp: 0, staking: 0, vaults: 0, total_value: 0 }
  );

  // Calculate NFT value
  const nftValue = data.reduce((sum, d) => {
    const nftsData = d.data?.nfts as any;
    if (!nftsData || !nftsData.data) return sum;

    if (Array.isArray(nftsData.data.nfts)) {
      return (
        sum +
        nftsData.data.nfts.reduce((nftSum: number, nft: any) => {
          const value = nft.usdValue || nft.fxValue || 0;
          const numValue =
            typeof value === 'number'
              ? value
              : parseFloat(value.toString()) || 0;
          return nftSum + (Math.abs(numValue) > 1e15 ? 0 : numValue);
        }, 0)
      );
    }

    return sum;
  }, 0);

  // Calculate Hypercore value from userData
  const hypercoreValue = data.reduce((sum, d) => {
    const userData = d.data?.userData as any;
    if (!userData?.data?.portfolioSummary) return sum;

    const value = userData.data.portfolioSummary.totalValue || 0;
    const numValue =
      typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
    return sum + (Math.abs(numValue) > 1e15 ? 0 : numValue);
  }, 0);

  const baseValue =
    aggregateComposition.spot +
    aggregateComposition.perp +
    aggregateComposition.staking +
    aggregateComposition.vaults;
  const totalValueWithAllAssets = baseValue + nftValue + hypercoreValue;

  // Aggregate NFTs
  const aggregatedNFTs = data.flatMap((d) => {
    const nftsData = d.data?.nfts as any;
    if (nftsData?.data?.nfts && Array.isArray(nftsData.data.nfts)) {
      return nftsData.data.nfts;
    }
    return [];
  });

  // Aggregate history by DATE
  const walletDateMap = new Map<
    number,
    Map<string, { timestamp: number; value: number }>
  >();

  data.forEach((d, walletIndex) => {
    const history = d.data?.history;
    if (!Array.isArray(history)) {
      return;
    }

    const dateMap = new Map<string, { timestamp: number; value: number }>();

    history.forEach((point) => {
      const date = new Date(point.timestamp);
      const dateKey = date.toISOString().split('T')[0];

      const existing = dateMap.get(dateKey);
      if (!existing || point.timestamp > existing.timestamp) {
        dateMap.set(dateKey, {
          timestamp: point.timestamp,
          value: point.value,
        });
      }
    });

    walletDateMap.set(walletIndex, dateMap);
  });

  const aggregatedMap = new Map<string, { timestamp: number; value: number }>();

  const allDates = new Set<string>();
  walletDateMap.forEach((dateMap) => {
    dateMap.forEach((_, date) => {
      allDates.add(date);
    });
  });

  allDates.forEach((date) => {
    let totalValue = 0;
    let earliestTimestamp = Infinity;

    walletDateMap.forEach((dateMap) => {
      const point = dateMap.get(date);
      if (point) {
        totalValue += point.value;
        earliestTimestamp = Math.min(earliestTimestamp, point.timestamp);
      }
    });

    if (totalValue > 0) {
      aggregatedMap.set(date, {
        timestamp: earliestTimestamp,
        value: totalValue,
      });
    }
  });

  const aggregatedHistory = Array.from(aggregatedMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // Aggregate points by protocolName across wallets
  const pointsMap = new Map<string, { protocolName: string; points: number }>();
  data.forEach((d) => {
    const pointsData = d.data?.points;
    if (!Array.isArray(pointsData)) {
      return;
    }

    pointsData.forEach((point: PointsData) => {
      const existing = pointsMap.get(point.protocolName);
      if (existing) {
        existing.points += point.points;
      } else {
        pointsMap.set(point.protocolName, {
          protocolName: point.protocolName,
          points: point.points,
        });
      }
    });
  });

  const aggregatedPoints = Array.from(pointsMap.values());

  // Calculate 24h change
  const currentValue = totalValueWithAllAssets || 0;
  const yesterdayValue =
    aggregatedHistory.length >= 2
      ? aggregatedHistory[aggregatedHistory.length - 2]?.value
      : aggregatedHistory[aggregatedHistory.length - 1]?.value;

  const pastValue = yesterdayValue || currentValue;
  const totalChange24h =
    pastValue > 0 && !Number.isNaN(currentValue) && !Number.isNaN(pastValue)
      ? ((currentValue - pastValue) / pastValue) * 100
      : 0;

  // Aggregate tokens from raw composition data
  const tokenMap = new Map<string, Token>();
  data.forEach((d) => {
    if (d.data?.compositionRaw?.data?.tokens) {
      d.data.compositionRaw.data.tokens.forEach((token) => {
        const existing = tokenMap.get(token.address);
        if (existing) {
          const newBalance =
            parseFloat(existing.balance) + parseFloat(token.balance);
          const newValue =
            parseFloat(existing.usdValue || '0') +
            parseFloat(token.usdValue || '0');
          tokenMap.set(token.address, {
            ...existing,
            balance: newBalance.toString(),
            usdValue: newValue.toString(),
          });
        } else {
          tokenMap.set(token.address, token);
        }
      });
    }
  });

  const aggregatedSpotPositions: SpotPosition[] = Array.from(
    tokenMap.values()
  ).map((token) => ({
    token: token.symbol || '',
    balance: token.balance || '0',
    value_usd: Number(parseFloat(token.usdValue || '0')) || 0,
    price: Number(parseFloat(token.usdPrice || '0')) || 0,
  }));

  return {
    total_value: Number(totalValueWithAllAssets) || 0,
    total_change_24h: Number(totalChange24h) || 0,
    total_spot: Number(aggregateComposition.spot) || 0,
    total_perp: Number(aggregateComposition.perp) || 0,
    total_staking: Number(aggregateComposition.staking) || 0,
    total_vaults: Number(aggregateComposition.vaults) || 0,
    total_hypercore: Number(hypercoreValue) || 0,
    tokens: aggregatedSpotPositions,
    nfts: aggregatedNFTs,
    // Note: transactions removed - loaded independently via /api/wallet/transactions
    history: aggregatedHistory,
    points: aggregatedPoints,
  };
}

export async function getMultiWalletData(
  addresses: string[],
  skipCache = false
): Promise<AggregateData> {
  try {
    const walletDataPromises = addresses.map((address) =>
      getWalletData(address, skipCache)
    );
    const results = await Promise.allSettled(walletDataPromises);

    const data = results.map((result, index) => ({
      address: addresses[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));

    // Aggregate compositions
    const compositions = data
      .map((d) => d.data?.composition)
      .filter((c): c is WalletComposition => c !== null && c !== undefined);

    const aggregateComposition = compositions.reduce(
      (acc, comp) => ({
        spot: acc.spot + comp.spot,
        perp: acc.perp + comp.perp,
        staking: acc.staking + comp.staking,
        vaults: acc.vaults + comp.vaults,
        total_value: acc.total_value + comp.total_value,
      }),
      { spot: 0, perp: 0, staking: 0, vaults: 0, total_value: 0 }
    );

    // Calculate total value including NFTs and DeFi positions
    // Note: NFTs and DeFi positions are NOT included in totalWalletValue from the API
    const nftValue = data.reduce((sum, d) => {
      // nfts now comes as an object with { data: { nfts: [...], totalNftValue: ... }, cache: {...} }
      const nftsData = d.data?.nfts as any;
      if (!nftsData || !nftsData.data) return sum;

      // Calculate from individual NFTs to match individual wallet calculation
      if (Array.isArray(nftsData.data.nfts)) {
        return (
          sum +
          nftsData.data.nfts.reduce((nftSum: number, nft: any) => {
            const value = nft.usdValue || nft.fxValue || 0;
            const numValue =
              typeof value === 'number'
                ? value
                : parseFloat(value.toString()) || 0;
            // Filter out absurd values
            return nftSum + (Math.abs(numValue) > 1e15 ? 0 : numValue);
          }, 0)
        );
      }

      return sum;
    }, 0);

    // Note: DeFi positions value is now calculated from SSE streaming data
    // This provides progressive loading and avoids blocking on slow /positions endpoint

    // Calculate Hypercore value from userData
    const hypercoreValue = data.reduce((sum, d) => {
      const userData = d.data?.userData as any;
      if (!userData?.data?.portfolioSummary) return sum;

      // Use totalValue from portfolioSummary if available
      const value = userData.data.portfolioSummary.totalValue || 0;
      const numValue =
        typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
      // Filter out absurd values
      return sum + (Math.abs(numValue) > 1e15 ? 0 : numValue);
    }, 0);

    // Total value = sum of all token categories + NFTs + Hypercore
    // Note: DeFi positions value is added on the client side from SSE streaming data
    // Don't use aggregateComposition.total_value as it might be incomplete
    const baseValue =
      aggregateComposition.spot +
      aggregateComposition.perp +
      aggregateComposition.staking +
      aggregateComposition.vaults;
    const totalValueWithAllAssets = baseValue + nftValue + hypercoreValue;

    // Aggregate NFTs
    const aggregatedNFTs = data.flatMap((d) => {
      const nftsData = d.data?.nfts as any;
      if (nftsData?.data?.nfts && Array.isArray(nftsData.data.nfts)) {
        return nftsData.data.nfts;
      }
      return [];
    });

    // Note: DeFi positions are now loaded progressively via SSE streaming
    // See: hooks/use-positions-stream.ts and components/sections/defi-section/

    // Aggregate history by DATE
    // Step 1: For each wallet, get only ONE value per day (latest snapshot)
    // Step 2: Sum values across all wallets for the same date

    // First, organize by wallet and date
    const walletDateMap = new Map<
      number,
      Map<string, { timestamp: number; value: number }>
    >();

    data.forEach((d, walletIndex) => {
      const history = d.data?.history;
      if (!Array.isArray(history)) {
        return;
      }

      const dateMap = new Map<string, { timestamp: number; value: number }>();

      history.forEach((point) => {
        const date = new Date(point.timestamp);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        const existing = dateMap.get(dateKey);
        // Keep only the LATEST snapshot for this wallet on this date
        if (!existing || point.timestamp > existing.timestamp) {
          dateMap.set(dateKey, {
            timestamp: point.timestamp,
            value: point.value,
          });
        }
      });

      walletDateMap.set(walletIndex, dateMap);
    });

    // Now aggregate across wallets: sum one value per wallet per date
    const aggregatedMap = new Map<
      string,
      { timestamp: number; value: number }
    >();

    // Get all unique dates
    const allDates = new Set<string>();
    walletDateMap.forEach((dateMap) => {
      dateMap.forEach((_, date) => {
        allDates.add(date);
      });
    });

    // For each date, sum values from all wallets (one value per wallet max)
    allDates.forEach((date) => {
      let totalValue = 0;
      let earliestTimestamp = Infinity;

      walletDateMap.forEach((dateMap) => {
        const point = dateMap.get(date);
        if (point) {
          totalValue += point.value;
          earliestTimestamp = Math.min(earliestTimestamp, point.timestamp);
        }
      });

      if (totalValue > 0) {
        aggregatedMap.set(date, {
          timestamp: earliestTimestamp,
          value: totalValue,
        });
      }
    });

    const aggregatedHistory = Array.from(aggregatedMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Aggregate points by protocolName across wallets
    const pointsMap = new Map<
      string,
      { protocolName: string; points: number }
    >();
    data.forEach((d) => {
      const pointsData = d.data?.points;
      if (!Array.isArray(pointsData)) {
        return;
      }

      pointsData.forEach((point: PointsData) => {
        const existing = pointsMap.get(point.protocolName);
        if (existing) {
          existing.points += point.points;
        } else {
          pointsMap.set(point.protocolName, {
            protocolName: point.protocolName,
            points: point.points,
          });
        }
      });
    });

    const aggregatedPoints = Array.from(pointsMap.values());

    // Calculate 24h change from history - this is naturally weighted since we're comparing
    // total portfolio values (sum of all wallets) at different times
    // Use the most recent historical snapshot (which should be ~24h ago for daily snapshots)
    const currentValue = totalValueWithAllAssets || 0;
    const yesterdayValue =
      aggregatedHistory.length >= 2
        ? aggregatedHistory[aggregatedHistory.length - 2]?.value // Second to last snapshot
        : aggregatedHistory[aggregatedHistory.length - 1]?.value; // Or last if only one exists

    const pastValue = yesterdayValue || currentValue;
    const totalChange24h =
      pastValue > 0 && !Number.isNaN(currentValue) && !Number.isNaN(pastValue)
        ? ((currentValue - pastValue) / pastValue) * 100
        : 0;

    // Aggregate tokens from raw composition data
    const tokenMap = new Map<string, Token>();
    data.forEach((d) => {
      if (d.data?.compositionRaw?.data?.tokens) {
        d.data.compositionRaw.data.tokens.forEach((token) => {
          const existing = tokenMap.get(token.address);
          if (existing) {
            // Merge tokens with same address
            const newBalance =
              parseFloat(existing.balance) + parseFloat(token.balance);
            const newValue =
              parseFloat(existing.usdValue || '0') +
              parseFloat(token.usdValue || '0');
            tokenMap.set(token.address, {
              ...existing,
              balance: newBalance.toString(),
              usdValue: newValue.toString(),
            });
          } else {
            tokenMap.set(token.address, token);
          }
        });
      }
    });

    const aggregatedSpotPositions: SpotPosition[] = Array.from(
      tokenMap.values()
    ).map((token) => ({
      token: token.symbol || '',
      balance: token.balance || '0',
      value_usd: Number(parseFloat(token.usdValue || '0')) || 0,
      price: Number(parseFloat(token.usdPrice || '0')) || 0,
    }));

    return {
      total_value: Number(totalValueWithAllAssets) || 0,
      total_change_24h: Number(totalChange24h) || 0,
      total_spot: Number(aggregateComposition.spot) || 0,
      total_perp: Number(aggregateComposition.perp) || 0,
      total_staking: Number(aggregateComposition.staking) || 0,
      total_vaults: Number(aggregateComposition.vaults) || 0,
      total_hypercore: Number(hypercoreValue) || 0,
      tokens: aggregatedSpotPositions,
      nfts: aggregatedNFTs,
      // Note: transactions removed - loaded independently via /api/wallet/transactions
      history: aggregatedHistory,
      points: aggregatedPoints,
    };
  } catch (error) {
    console.error('Error fetching multi-wallet data:', error);
    // Re-throw with more context
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      addressesCount: addresses.length,
      errorMessage,
    });
    throw new Error(`Failed to aggregate wallet data: ${errorMessage}`);
  }
}
