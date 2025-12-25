// SSE Route for streaming wallet data progressively
// Streams each API response as it completes, without waiting for all wallets/endpoints
import { NextRequest } from 'next/server'

import type {
  WalletCompositionResponse,
  NFT,
  UserData,
  PortfolioHistoryPoint,
} from '@/lib/types/api'

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

/**
 * GET /api/wallet/aggregate/stream?addresses=0x1,0x2&cache=false
 *
 * Streams wallet data progressively using SSE.
 * Each API endpoint streams immediately when complete (no waiting for other endpoints or wallets).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const addressesParam = searchParams.get('addresses')
  const skipCache = searchParams.get('cache') === 'false'

  if (!addressesParam) {
    return new Response(
      JSON.stringify({ error: 'addresses parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Parse addresses (comma-separated)
  const addresses = addressesParam.split(',').map(a => a.trim()).filter(Boolean)

  if (addresses.length === 0) {
    return new Response(
      JSON.stringify({ error: 'At least one valid address is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  // Accumulate data for final aggregate computation
  const accumulator = {
    composition: new Map<string, WalletCompositionResponse>(),
    nfts: new Map<string, { data: { nfts: NFT[]; totalNftValue: number }; cache: unknown }>(),
    hypercore: new Map<string, UserData>(),
    history: new Map<string, PortfolioHistoryPoint[]>(),
  }

  // Helper to write SSE message
  const writeSSE = async (data: unknown) => {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`
      await writer.write(encoder.encode(message))
    } catch (error) {
      console.error('[Wallet Stream SSE] Error writing message:', error)
    }
  }

  // Helper to fetch from API
  async function fetchAPI<T>(endpoint: string, options: { skipCache?: boolean } = {}): Promise<T> {
    const { skipCache = false } = options
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    }

    const separator = endpoint.includes('?') ? '&' : '?'
    const url = skipCache
      ? `${API_BASE_URL}${endpoint}${separator}cache=false`
      : `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Helper to fetch portfolio history (has special handling)
  async function getPortfolioHistory(address: string, days = 30, options: { skipCache?: boolean } = {}): Promise<PortfolioHistoryPoint[]> {
    const response = await fetchAPI<{
      snapshots: Array<{ snapshot_timestamp: number; total_value_usd: number }>
    }>(`/portfolio-history?address=${address}&days=${days}`, options)

    // Transform snapshots to PortfolioHistoryPoint format
    return response.snapshots.map(snapshot => ({
      timestamp: snapshot.snapshot_timestamp * 1000,
      value: snapshot.total_value_usd
    }))
  }

  // Start streaming in the background
  const streamPromise = (async () => {
    try {
      // Fire ALL API requests immediately, stream each as it completes
      const allPromises: Promise<void>[] = []

      for (const address of addresses) {
        // For each wallet, fire all 4 APIs independently (no Promise.all barrier)
        // Note: Transactions are loaded separately via /api/wallet/transactions

        // 1. Composition
        allPromises.push(
          fetchAPI<WalletCompositionResponse>(`/wallet/composition?address=${address}`, { skipCache })
            .then(data => {
              accumulator.composition.set(address, data)
              return writeSSE({ type: 'composition', address, data })
            })
            .catch(err => writeSSE({
              type: 'error',
              address,
              endpoint: 'composition',
              error: err instanceof Error ? err.message : 'Unknown error'
            }))
        )

        // 2. NFTs (Note: Transactions loaded independently via /api/wallet/transactions)
        allPromises.push(
          fetchAPI<{ data: { nfts: NFT[]; totalNftValue: number }; cache: unknown }>(`/nfts?address=${address}`, { skipCache })
            .then(data => {
              accumulator.nfts.set(address, data)
              return writeSSE({ type: 'nfts', address, data })
            })
            .catch(err => writeSSE({
              type: 'error',
              address,
              endpoint: 'nfts',
              error: err instanceof Error ? err.message : 'Unknown error'
            }))
        )

        // 3. Hypercore user data
        allPromises.push(
          fetchAPI<UserData>(`/hypercore/user/${address}`, { skipCache })
            .then(data => {
              accumulator.hypercore.set(address, data)
              return writeSSE({ type: 'hypercore', address, data })
            })
            .catch(err => writeSSE({
              type: 'error',
              address,
              endpoint: 'hypercore',
              error: err instanceof Error ? err.message : 'Unknown error'
            }))
        )

        // 4. Portfolio history
        allPromises.push(
          getPortfolioHistory(address, 30, { skipCache })
            .then(data => {
              accumulator.history.set(address, data)
              return writeSSE({ type: 'history', address, data })
            })
            .catch(err => writeSSE({
              type: 'error',
              address,
              endpoint: 'history',
              error: err instanceof Error ? err.message : 'Unknown error'
            }))
        )
      }

      // Wait for all requests to complete
      await Promise.allSettled(allPromises)

      // Import computeAggregate (dynamic import to avoid circular dependency)
      const { computeAggregate } = await import('@/lib/api/client')

      // Compute and send final aggregate
      const aggregate = computeAggregate(accumulator)
      await writeSSE({ type: 'complete', aggregate })

    } catch (error) {
      console.error('[Wallet Stream SSE] Stream error:', error)
      await writeSSE({
        type: 'error',
        error: error instanceof Error ? error.message : 'Stream error'
      })
    } finally {
      try {
        await writer.close()
      } catch {
        // Writer might already be closed
      }
    }
  })()

  // Don't await the promise - let it run in background
  streamPromise.catch(console.error)

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
