// SSE Proxy Route for streaming DeFi positions
// This route proxies the SSE stream from the backend API to the client
import { NextRequest } from 'next/server'

import {
  createTimeoutController,
  clearTimeoutController,
  isTimeoutError,
  getTimeoutErrorMessage,
} from '@/lib/utils/timeout'
import { REQUEST_TIMEOUTS, STREAM_TIMEOUTS, CONNECTION_TIMEOUT } from '@/lib/config/api'

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

/**
 * GET /api/positions/stream?addresses=0x...&cache=false
 * 
 * Streams DeFi positions for one or more wallet addresses using SSE.
 * Supports multi-wallet by making parallel SSE connections and merging the streams.
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

  // Track aggregated state across all wallets
  const aggregatedState = {
    protocols: new Map<string, {
      protocol: unknown
      addresses: Set<string>
    }>(),
    progress: {
      completed: 0,
      total: 0,
    },
    portfolioStats: {
      totalValueUSD: 0,
      weightedApyPercent: 0,
      positionsWithApy: 0,
      totalPositions: 0,
      estimatedYield: { daily: 0, weekly: 0, monthly: 0 },
    },
    completedWallets: 0,
    totalWallets: addresses.length,
    errors: [] as { address: string; error: string }[],
  }

  // Overall stream timeout controller
  const overallStreamController = createTimeoutController(
    STREAM_TIMEOUTS.POSITIONS_STREAM,
    'positions stream'
  )

  // Helper to write SSE message
  const writeSSE = async (data: unknown) => {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`
      await writer.write(encoder.encode(message))
    } catch (error) {
      console.error('[SSE] Error writing message:', error)
    }
  }

  // Start streaming in the background
  const streamPromise = (async () => {
    // Handle overall stream timeout
    overallStreamController.signal.addEventListener('abort', async () => {
      await writeSSE({
        type: 'error',
        error: 'Stream timeout: Loading positions took too long. Please try again.'
      })
    })

    try {
      // For each address, create a fetch request to the SSE endpoint
      const abortControllers: AbortController[] = []

      const streamPromises = addresses.map(async (address) => {
        const abortController = new AbortController()
        abortControllers.push(abortController)

        // Create connection timeout for initial fetch
        const connectionController = createTimeoutController(
          CONNECTION_TIMEOUT,
          `positions stream connection for ${address.slice(0, 8)}...`
        )

        // Combined signal handling - abort if either timeout triggers
        const abortOnTimeout = () => {
          if (overallStreamController.signal.aborted || connectionController.signal.aborted) {
            abortController.abort()
          }
        }

        overallStreamController.signal.addEventListener('abort', abortOnTimeout)
        connectionController.signal.addEventListener('abort', abortOnTimeout)

        const cacheParam = skipCache ? '&cache=false' : ''
        const url = `${API_BASE_URL}/positions/stream?address=${address}${cacheParam}`

        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'text/event-stream',
              'x-api-key': API_KEY,
            },
            signal: abortController.signal,
          })

          if (!response.ok) {
            throw new Error(`API responded with ${response.status}`)
          }

          if (!response.body) {
            throw new Error('No response body')
          }

          // Clear connection timeout after successful connection
          clearTimeoutController(connectionController)

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              aggregatedState.completedWallets++
              break
            }

            buffer += decoder.decode(value, { stream: true })
            
            // Process complete SSE messages from buffer
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  
                  if (data.type === 'protocol') {
                    // Add wallet address to protocol data for multi-wallet tracking
                    const protocolData = {
                      ...data.data,
                      walletAddress: address,
                    }

                    // Merge with existing protocol if already received from another wallet
                    const existingProtocol = aggregatedState.protocols.get(data.data.id)
                    if (existingProtocol) {
                      // Merge positions
                      const existingData = existingProtocol.protocol as Record<string, unknown>
                      const existingPositions = (existingData.positions || []) as unknown[]
                      const newPositions = (protocolData.positions || []).map((pos: unknown) => ({
                        ...(pos as Record<string, unknown>),
                        walletAddress: address,
                      }))
                      
                      // Merge protocol stats
                      const existingStats = existingData.protocolStats as Record<string, unknown> | undefined
                      const newStats = protocolData.protocolStats
                      
                      const mergedProtocol = {
                        ...existingData,
                        totalValueUSD: String(
                          parseFloat(String(existingData.totalValueUSD || '0')) +
                          parseFloat(String(protocolData.totalValueUSD || '0'))
                        ),
                        positions: [...existingPositions, ...newPositions],
                        protocolStats: mergeProtocolStats(existingStats, newStats),
                      }

                      existingProtocol.protocol = mergedProtocol
                      existingProtocol.addresses.add(address)

                      // Send merged update
                      await writeSSE({
                        type: 'protocol',
                        data: mergedProtocol,
                        walletAddresses: Array.from(existingProtocol.addresses),
                        progress: {
                          completed: aggregatedState.progress.completed,
                          total: aggregatedState.progress.total,
                        },
                      })
                    } else {
                      // New protocol - add positions with wallet address
                      const positionsWithWallet = (protocolData.positions || []).map((pos: unknown) => ({
                        ...(pos as Record<string, unknown>),
                        walletAddress: address,
                      }))
                      
                      const protocolWithWallet = {
                        ...protocolData,
                        positions: positionsWithWallet,
                      }

                      aggregatedState.protocols.set(data.data.id, {
                        protocol: protocolWithWallet,
                        addresses: new Set([address]),
                      })

                      // Update progress
                      aggregatedState.progress.completed++
                      aggregatedState.progress.total = Math.max(
                        aggregatedState.progress.total,
                        data.progress?.total || 0
                      )

                      // Send new protocol
                      await writeSSE({
                        type: 'protocol',
                        data: protocolWithWallet,
                        walletAddresses: [address],
                        progress: {
                          completed: aggregatedState.progress.completed,
                          total: aggregatedState.progress.total * addresses.length,
                        },
                      })
                    }
                  } else if (data.type === 'complete') {
                    // Accumulate portfolio stats
                    const stats = data.portfolioStats
                    if (stats) {
                      aggregatedState.portfolioStats.totalValueUSD += parseFloat(stats.totalValueUSD || '0')
                      aggregatedState.portfolioStats.positionsWithApy += stats.positionsWithApy || 0
                      aggregatedState.portfolioStats.totalPositions += stats.totalPositions || 0
                      
                      const yield_ = stats.estimatedYield
                      if (yield_) {
                        aggregatedState.portfolioStats.estimatedYield.daily += parseFloat(yield_.daily || '0')
                        aggregatedState.portfolioStats.estimatedYield.weekly += parseFloat(yield_.weekly || '0')
                        aggregatedState.portfolioStats.estimatedYield.monthly += parseFloat(yield_.monthly || '0')
                      }
                    }
                  } else if (data.type === 'error') {
                    aggregatedState.errors.push({
                      address,
                      error: data.error,
                    })
                    await writeSSE({
                      type: 'wallet_error',
                      address,
                      error: data.error,
                    })
                  }
                } catch (parseError) {
                  console.error('[SSE] Error parsing message:', parseError)
                }
              }
            }
          }
        } catch (error) {
          clearTimeoutController(connectionController)

          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          // Check for timeout errors
          if (isTimeoutError(error) || errorMessage.includes('timeout')) {
            const timeoutMsg = getTimeoutErrorMessage(`positions for ${address.slice(0, 8)}...`)
            console.error(`[SSE] Timeout streaming for ${address}:`, timeoutMsg)
            aggregatedState.errors.push({ address, error: timeoutMsg })
            aggregatedState.completedWallets++

            await writeSSE({
              type: 'wallet_error',
              address,
              error: timeoutMsg,
            })
          } else {
            console.error(`[SSE] Error streaming for ${address}:`, errorMessage)
            aggregatedState.errors.push({ address, error: errorMessage })
            aggregatedState.completedWallets++

            await writeSSE({
              type: 'wallet_error',
              address,
              error: errorMessage,
            })
          }
        }
      })

      // Wait for all streams to complete
      await Promise.all(streamPromises)

      // Calculate weighted APY for aggregated stats
      if (aggregatedState.portfolioStats.totalValueUSD > 0) {
        let weightedApySum = 0
        aggregatedState.protocols.forEach(({ protocol }) => {
          const p = protocol as Record<string, unknown>
          const stats = p.protocolStats as Record<string, unknown> | undefined
          const value = parseFloat(String(p.totalValueUSD || '0'))
          const apy = stats?.weightedApyPercent as number | undefined
          if (apy && value > 0) {
            weightedApySum += apy * value
          }
        })
        aggregatedState.portfolioStats.weightedApyPercent = 
          weightedApySum / aggregatedState.portfolioStats.totalValueUSD
      }

      // Send complete message with aggregated stats
      await writeSSE({
        type: 'complete',
        progress: {
          completed: aggregatedState.protocols.size,
          total: aggregatedState.protocols.size,
        },
        portfolioStats: {
          totalValueUSD: aggregatedState.portfolioStats.totalValueUSD.toFixed(2),
          weightedApyPercent: aggregatedState.portfolioStats.weightedApyPercent,
          positionsWithApy: aggregatedState.portfolioStats.positionsWithApy,
          totalPositions: aggregatedState.portfolioStats.totalPositions,
          estimatedYield: {
            daily: aggregatedState.portfolioStats.estimatedYield.daily.toFixed(2),
            weekly: aggregatedState.portfolioStats.estimatedYield.weekly.toFixed(2),
            monthly: aggregatedState.portfolioStats.estimatedYield.monthly.toFixed(2),
          },
        },
        completedWallets: aggregatedState.completedWallets,
        totalWallets: addresses.length,
        errors: aggregatedState.errors,
      })

    } catch (error) {
      console.error('[SSE] Stream error:', error)
      await writeSSE({
        type: 'error',
        error: error instanceof Error ? error.message : 'Stream error',
      })
    } finally {
      clearTimeoutController(overallStreamController)
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

/**
 * Merge protocol stats from multiple wallets
 */
function mergeProtocolStats(
  existing: Record<string, unknown> | undefined,
  incoming: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!existing && !incoming) return {}
  if (!existing) return incoming || {}
  if (!incoming) return existing

  const existingYield = existing.estimatedYield as Record<string, string> | undefined
  const incomingYield = incoming.estimatedYield as Record<string, string> | undefined

  return {
    weightedApyPercent: null, // Will be recalculated
    positionsWithApy: 
      ((existing.positionsWithApy as number) || 0) + 
      ((incoming.positionsWithApy as number) || 0),
    totalPositions: 
      ((existing.totalPositions as number) || 0) + 
      ((incoming.totalPositions as number) || 0),
    estimatedYield: {
      daily: (
        parseFloat(existingYield?.daily || '0') + 
        parseFloat(incomingYield?.daily || '0')
      ).toFixed(2),
      weekly: (
        parseFloat(existingYield?.weekly || '0') + 
        parseFloat(incomingYield?.weekly || '0')
      ).toFixed(2),
      monthly: (
        parseFloat(existingYield?.monthly || '0') + 
        parseFloat(incomingYield?.monthly || '0')
      ).toFixed(2),
    },
  }
}

