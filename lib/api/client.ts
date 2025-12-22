// API Client for Hyperfolio API
import 'server-only'

import type {
  WalletComposition,
  WalletCompositionResponse,
  Transaction,
  TransactionsResponse,
  NFT,
  DeFiPosition,
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
} from '@/lib/types/api'

// Use internal Docker URL for server-side calls (faster), fallback to public URL
const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

// Debug: Log API URL on server startup
console.log('[API Client] Using API_BASE_URL:', API_BASE_URL, '(internal:', !!process.env.API_INTERNAL_URL, ')')

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  cache?: RequestCache
  next?: { revalidate?: number }
  skipCache?: boolean // Add cache=false to the request URL
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, cache = 'no-store', next, skipCache = false } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  }

  const config: RequestInit = {
    method,
    headers,
    cache,
    ...(next && { next }),
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  // Add cache=false query param if skipCache is true
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = skipCache 
    ? `${API_BASE_URL}${endpoint}${separator}cache=false`
    : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, config)

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Wallet API Functions

export async function getWalletComposition(address: string): Promise<WalletComposition> {
  const response = await fetchAPI<WalletCompositionResponse>(`/wallet/composition?address=${address}`)
  
  // Parse the response to create a standardized composition
  const tokens = response.data.tokens || []
  const totalValue = parseFloat(response.data.totalWalletValue || '0')
  
  // Categorize tokens by type
  const spotTokens = tokens.filter(t => t.type === 'spot')
  const perpTokens = tokens.filter(t => t.type === 'perp')
  const stakingTokens = tokens.filter(t => t.type === 'staking')
  const vaultTokens = tokens.filter(t => t.type === 'vault')
  
  const spotValue = spotTokens.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0)
  const perpValue = perpTokens.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0)
  const stakingValue = stakingTokens.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0)
  const vaultValue = vaultTokens.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0)
  
  return {
    spot: spotValue,
    perp: perpValue,
    staking: stakingValue,
    vaults: vaultValue,
    total_value: totalValue,
  }
}

export async function getWalletTransactions(
  address: string,
  page = 1,
  offset = 25
): Promise<Transaction[]> {
  const response = await fetchAPI<TransactionsResponse>(`/wallet/transactions?address=${address}&page=${page}&offset=${offset}`)
  return response.transactions || []
}

export async function getWalletNFTs(address: string): Promise<{ data: { nfts: NFT[]; totalNftValue: number }; cache: any }> {
  return fetchAPI<{ data: { nfts: NFT[]; totalNftValue: number }; cache: any }>(`/nfts?address=${address}`)
}

export async function getPortfolioHistory(address: string, days = 30): Promise<PortfolioHistoryPoint[]> {
  const response = await fetchAPI<PortfolioHistoryResponse>(`/portfolio-history?address=${address}&days=${days}`)
  
  // Transform snapshots to PortfolioHistoryPoint format
  return response.snapshots.map(snapshot => ({
    timestamp: snapshot.snapshot_timestamp * 1000, // Convert to milliseconds
    value: snapshot.total_value_usd
  }))
}

export async function getPositions(address: string): Promise<PositionsResponse> {
  return fetchAPI<PositionsResponse>(`/positions?address=${address}`)
}

// User Data API Functions

export async function getUserData(address: string): Promise<UserData> {
  return fetchAPI<UserData>(`/hypercore/user/${address}`)
}

export async function getDefiPoints(address: string): Promise<PointsData[]> {
  return fetchAPI<PointsData[]>(`/points?address=${address}`)
}

export async function getVaultsYield(address: string): Promise<{ vault_name: string; apy: number }[]> {
  return fetchAPI<{ vault_name: string; apy: number }[]>(`/vaults?address=${address}`)
}

export async function getHyperbeatPoints(address: string): Promise<PointsData[]> {
  return fetchAPI<PointsData[]>(`/hyperbeat/points?address=${address}`)
}

export async function getVaultInfos(): Promise<VaultPosition[]> {
  return fetchAPI<VaultPosition[]>(`/vault-infos`)
}

export async function getSwapStats(address: string): Promise<SwapStats> {
  return fetchAPI<SwapStats>(`/masterswap/user/${address}`)
}

// Aggregated Data Functions

export async function getWalletData(address: string, skipCache = false) {
  try {
    // NOTE: Transactions are NOT fetched here to preserve Etherscan API rate limits
    // Transactions are lazy-loaded via /api/wallet/transactions when the History section is viewed
    const [compositionRaw, nfts, positions, userData, history] = await Promise.all([
      fetchAPI<WalletCompositionResponse>(`/wallet/composition?address=${address}`, { skipCache }).catch(() => null),
      fetchAPI<{ data: { nfts: NFT[]; totalNftValue: number }; cache: unknown }>(`/nfts?address=${address}`, { skipCache }).catch(() => ({ data: { nfts: [], totalNftValue: 0 }, cache: {} })),
      fetchAPI<PositionsResponse>(`/positions?address=${address}`, { skipCache }).catch(() => ({ data: { protocols: [] } })),
      fetchAPI<UserData>(`/hypercore/user/${address}`, { skipCache }).catch(() => null),
      getPortfolioHistory(address, 30).catch(() => []),
    ])

    // Transform raw composition
    const composition = compositionRaw?.data?.tokens ? {
      spot: compositionRaw.data.tokens.filter(t => t.type === 'spot').reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
      perp: compositionRaw.data.tokens.filter(t => t.type === 'perp').reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
      staking: compositionRaw.data.tokens.filter(t => t.type === 'staking').reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
      vaults: compositionRaw.data.tokens.filter(t => t.type === 'vault').reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
      // Calculate total_value from all tokens (don't use totalWalletValue as it might miss some types)
      total_value: compositionRaw.data.tokens.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0),
    } : null

    return {
      compositionRaw, // Keep raw data for tokens extraction
      composition,
      transactions: [], // Empty - lazy loaded via dedicated endpoint
      nfts,
      positions,
      userData,
      history,
    }
  } catch (error) {
    console.error(`Error fetching wallet data for ${address}:`, error)
    throw error
  }
}

// Multi-wallet aggregate functions

export async function getMultiWalletData(addresses: string[], skipCache = false): Promise<AggregateData> {
  try {
    const walletDataPromises = addresses.map((address) => getWalletData(address, skipCache))
    const results = await Promise.allSettled(walletDataPromises)

    const data = results.map((result, index) => ({
      address: addresses[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }))

    // Aggregate compositions
    const compositions = data
      .map((d) => d.data?.composition)
      .filter((c): c is WalletComposition => c !== null && c !== undefined)

    const aggregateComposition = compositions.reduce(
      (acc, comp) => ({
        spot: acc.spot + comp.spot,
        perp: acc.perp + comp.perp,
        staking: acc.staking + comp.staking,
        vaults: acc.vaults + comp.vaults,
        total_value: acc.total_value + comp.total_value,
      }),
      { spot: 0, perp: 0, staking: 0, vaults: 0, total_value: 0 }
    )

    // Calculate total value including NFTs and DeFi positions
    // Note: NFTs and DeFi positions are NOT included in totalWalletValue from the API
    const nftValue = data.reduce((sum, d) => {
      // nfts now comes as an object with { data: { nfts: [...], totalNftValue: ... }, cache: {...} }
      const nftsData = d.data?.nfts as any
      if (!nftsData || !nftsData.data) return sum
      
      // Calculate from individual NFTs to match individual wallet calculation
      if (Array.isArray(nftsData.data.nfts)) {
        return sum + nftsData.data.nfts.reduce((nftSum: number, nft: any) => {
          const value = nft.usdValue || nft.fxValue || 0
          const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
          // Filter out absurd values
          return nftSum + (Math.abs(numValue) > 1e15 ? 0 : numValue)
        }, 0)
      }
      
      return sum
    }, 0)

    const defiValue = data.reduce((sum, d) => {
      // Check if positions exists and has data structure
      const positionsData = d.data?.positions as PositionsResponse | undefined
      if (!positionsData?.data?.protocols) return sum
      
      // Sum all positions from all protocols
      const positionSum = positionsData.data.protocols.reduce((protocolAcc: number, protocol) => {
        if (!Array.isArray(protocol.positions)) return protocolAcc
        return protocolAcc + protocol.positions.reduce((posAcc: number, pos: any) => {
          const value = pos.totalValueUSD || 0
          const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
          // Filter out absurd values
          return posAcc + (Math.abs(numValue) > 1e15 ? 0 : numValue)
        }, 0)
      }, 0)
      
      return sum + positionSum
    }, 0)

    // Calculate Hypercore value from userData
    const hypercoreValue = data.reduce((sum, d) => {
      const userData = d.data?.userData as any
      if (!userData?.data?.portfolioSummary) return sum
      
      // Use totalValue from portfolioSummary if available
      const value = userData.data.portfolioSummary.totalValue || 0
      const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
      // Filter out absurd values
      return sum + (Math.abs(numValue) > 1e15 ? 0 : numValue)
    }, 0)

    // Total value = sum of all token categories + NFTs + DeFi positions + Hypercore
    // Don't use aggregateComposition.total_value as it might be incomplete
    const baseValue = aggregateComposition.spot + aggregateComposition.perp + aggregateComposition.staking + aggregateComposition.vaults
    const totalValueWithAllAssets = baseValue + nftValue + defiValue + hypercoreValue

    // NOTE: Transactions are NOT aggregated here to preserve Etherscan API rate limits
    // Transactions are lazy-loaded via /api/wallet/transactions when the History section is viewed

    // Aggregate NFTs
    const aggregatedNFTs = data.flatMap((d) => {
      const nftsData = d.data?.nfts as any
      if (nftsData?.data?.nfts && Array.isArray(nftsData.data.nfts)) {
        return nftsData.data.nfts
      }
      return []
    })

    // Aggregate positions from all protocols
    const aggregatedPositions = data.flatMap((d) => {
      const positionsData = d.data?.positions as PositionsResponse | undefined
      if (positionsData?.data?.protocols && Array.isArray(positionsData.data.protocols)) {
        return positionsData.data.protocols.flatMap((protocol) => {
          if (Array.isArray(protocol.positions)) {
            return protocol.positions
          }
          return []
        })
      }
      return []
    })

    // Aggregate history by DATE
    // Step 1: For each wallet, get only ONE value per day (latest snapshot)
    // Step 2: Sum values across all wallets for the same date
    
    // First, organize by wallet and date
    const walletDateMap = new Map<number, Map<string, { timestamp: number; value: number }>>()
    
    data.forEach((d, walletIndex) => {
      const history = d.data?.history
      if (!Array.isArray(history)) {
        return
      }
      
      const dateMap = new Map<string, { timestamp: number; value: number }>()
      
      history.forEach((point) => {
        const date = new Date(point.timestamp)
        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
        
        const existing = dateMap.get(dateKey)
        // Keep only the LATEST snapshot for this wallet on this date
        if (!existing || point.timestamp > existing.timestamp) {
          dateMap.set(dateKey, {
            timestamp: point.timestamp,
            value: point.value
          })
        }
      })
      
      walletDateMap.set(walletIndex, dateMap)
    })

    // Now aggregate across wallets: sum one value per wallet per date
    const aggregatedMap = new Map<string, { timestamp: number; value: number }>()
    
    // Get all unique dates
    const allDates = new Set<string>()
    walletDateMap.forEach(dateMap => {
      dateMap.forEach((_, date) => {
        allDates.add(date)
      })
    })
    
    // For each date, sum values from all wallets (one value per wallet max)
    allDates.forEach(date => {
      let totalValue = 0
      let earliestTimestamp = Infinity
      
      walletDateMap.forEach(dateMap => {
        const point = dateMap.get(date)
        if (point) {
          totalValue += point.value
          earliestTimestamp = Math.min(earliestTimestamp, point.timestamp)
        }
      })
      
      if (totalValue > 0) {
        aggregatedMap.set(date, {
          timestamp: earliestTimestamp,
          value: totalValue
        })
      }
    })
    
    const aggregatedHistory = Array.from(aggregatedMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)

    // Calculate 24h change from history - this is naturally weighted since we're comparing
    // total portfolio values (sum of all wallets) at different times
    // Use the most recent historical snapshot (which should be ~24h ago for daily snapshots)
    const currentValue = totalValueWithAllAssets || 0
    const yesterdayValue = aggregatedHistory.length >= 2 
      ? aggregatedHistory[aggregatedHistory.length - 2]?.value  // Second to last snapshot
      : aggregatedHistory[aggregatedHistory.length - 1]?.value  // Or last if only one exists
    
    const pastValue = yesterdayValue || currentValue
    const totalChange24h = pastValue > 0 && !Number.isNaN(currentValue) && !Number.isNaN(pastValue) 
      ? ((currentValue - pastValue) / pastValue) * 100 
      : 0

    // Aggregate tokens from raw composition data
    const tokenMap = new Map<string, Token>()
    data.forEach((d) => {
      if (d.data?.compositionRaw?.data?.tokens) {
        d.data.compositionRaw.data.tokens.forEach((token) => {
          const existing = tokenMap.get(token.address)
          if (existing) {
            // Merge tokens with same address
            const newBalance = parseFloat(existing.balance) + parseFloat(token.balance)
            const newValue = parseFloat(existing.usdValue || '0') + parseFloat(token.usdValue || '0')
            tokenMap.set(token.address, {
              ...existing,
              balance: newBalance.toString(),
              usdValue: newValue.toString(),
            })
          } else {
            tokenMap.set(token.address, token)
          }
        })
      }
    })
    
    const aggregatedSpotPositions: SpotPosition[] = Array.from(tokenMap.values()).map(token => ({
      token: token.symbol || '',
      balance: token.balance || '0',
      value_usd: Number(parseFloat(token.usdValue || '0')) || 0,
      price: Number(parseFloat(token.usdPrice || '0')) || 0,
    }))

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
      positions: aggregatedPositions,
      transactions: [], // Empty - lazy loaded via dedicated endpoint
      history: aggregatedHistory,
    }
  } catch (error) {
    console.error('Error fetching multi-wallet data:', error)
    // Re-throw with more context
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', {
      addressesCount: addresses.length,
      errorMessage,
    })
    throw new Error(`Failed to aggregate wallet data: ${errorMessage}`)
  }
}

