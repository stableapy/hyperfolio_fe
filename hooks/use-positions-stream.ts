'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Local ProtocolGroup type for this hook (used internally, converted by consuming components)
export interface StreamProtocolGroup {
  id: string
  name: string
  logo: string
  url: string
  totalValue: number
  positions: StreamPositionDisplay[]
  stats?: {
    weightedApyPercent: number | null
    positionsWithApy: number
    totalPositions: number
    estimatedYield: {
      daily: string
      weekly: string
      monthly: string
    }
  }
}

export interface StreamPositionDisplay {
  id: string
  protocol: string
  type: 'lending' | 'liquidity' | 'staking' | 'farming'
  assets: string[]
  deposited: number
  current: number
  apy: number
  rewards: number
  logo: string
  positionDetails?: Record<string, unknown>
  protocolUrl?: string
  estimatedYield?: {
    daily: string
    weekly: string
    monthly: string
  }
  walletAddress?: string
}

// Types for SSE stream events
export interface StreamedProtocol {
  id: string
  name: string
  logo: string
  url: string
  totalValueUSD: string
  positions: StreamedPosition[]
  protocolStats: {
    weightedApyPercent: number | null
    positionsWithApy: number
    totalPositions: number
    estimatedYield: {
      daily: string
      weekly: string
      monthly: string
    }
  }
  walletAddress?: string
}

export interface StreamedPosition {
  id: string
  protocolId: string
  protocolName: string
  type: string
  positionType: string
  totalValueUSD: string
  details: Record<string, unknown>
  walletAddress?: string
}

export interface StreamProgress {
  completed: number
  total: number
}

export interface StreamPortfolioStats {
  totalValueUSD: string
  weightedApyPercent: number
  positionsWithApy: number
  totalPositions: number
  estimatedYield: {
    daily: string
    weekly: string
    monthly: string
  }
}

export interface StreamMessage {
  type: 'protocol' | 'complete' | 'error' | 'wallet_error'
  data?: StreamedProtocol
  walletAddresses?: string[]
  progress?: StreamProgress
  portfolioStats?: StreamPortfolioStats
  error?: string
  address?: string
  completedWallets?: number
  totalWallets?: number
  errors?: { address: string; error: string }[]
}

export interface UsePositionsStreamOptions {
  addresses: string[]
  skipCache?: boolean
  enabled?: boolean
  onProtocolReceived?: (protocol: StreamedProtocol) => void
  onComplete?: (stats: StreamPortfolioStats) => void
  onError?: (error: string) => void
}

export interface UsePositionsStreamResult {
  protocols: Map<string, StreamedProtocol>
  protocolGroups: StreamProtocolGroup[]
  isStreaming: boolean
  isComplete: boolean
  progress: StreamProgress
  portfolioStats: StreamPortfolioStats | null
  error: string | null
  startStream: () => void
  stopStream: () => void
}

/**
 * Hook for streaming DeFi positions via SSE
 * Progressively loads positions as each protocol completes on the backend
 */
export function usePositionsStream({
  addresses,
  skipCache = false,
  enabled = true,
  onProtocolReceived,
  onComplete,
  onError,
}: UsePositionsStreamOptions): UsePositionsStreamResult {
  const [protocols, setProtocols] = useState<Map<string, StreamedProtocol>>(new Map())
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState<StreamProgress>({ completed: 0, total: 0 })
  const [portfolioStats, setPortfolioStats] = useState<StreamPortfolioStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const addressesKey = addresses.sort().join(',')

  // Convert streamed protocols to StreamProtocolGroup format for component compatibility
  const protocolGroups: StreamProtocolGroup[] = Array.from(protocols.values())
    .filter(p => p.positions && p.positions.length > 0)
    .map(protocol => ({
      id: protocol.id,
      name: protocol.name,
      logo: protocol.logo,
      url: protocol.url,
      totalValue: parseFloat(protocol.totalValueUSD || '0'),
      positions: protocol.positions.map(pos => ({
        id: pos.id,
        protocol: protocol.name,
        type: mapPositionType(pos.type),
        assets: extractAssets(pos.details),
        deposited: parseFloat(pos.totalValueUSD || '0'),
        current: parseFloat(pos.totalValueUSD || '0'),
        apy: extractApy(pos.details),
        rewards: extractRewards(pos.details),
        logo: protocol.logo,
        positionDetails: pos.details,
        protocolUrl: protocol.url,
        estimatedYield: extractEstimatedYield(pos.details),
        walletAddress: pos.walletAddress,
      })),
      stats: protocol.protocolStats ? {
        weightedApyPercent: protocol.protocolStats.weightedApyPercent,
        positionsWithApy: protocol.protocolStats.positionsWithApy,
        totalPositions: protocol.protocolStats.totalPositions,
        estimatedYield: protocol.protocolStats.estimatedYield,
      } : undefined,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const startStream = useCallback(() => {
    // Reset state
    setProtocols(new Map())
    setIsStreaming(true)
    setIsComplete(false)
    setProgress({ completed: 0, total: 0 })
    setPortfolioStats(null)
    setError(null)

    if (addresses.length === 0) {
      setIsStreaming(false)
      setIsComplete(true)
      return
    }

    // Close any existing connection
    stopStream()

    // Build URL with security headers
    const params = new URLSearchParams()
    params.set('addresses', addresses.join(','))
    if (skipCache) {
      params.set('cache', 'false')
    }

    // Get the API token from window if available
    const token = typeof window !== 'undefined' ? window.__API_TOKEN : undefined

    // Build headers for EventSource (we need to use fetch + ReadableStream instead)
    // EventSource doesn't support custom headers, so we use fetch with streaming
    const url = `/api/positions/stream?${params.toString()}`

    const fetchStream = async () => {
      try {
        const headers: Record<string, string> = {
          'Accept': 'text/event-stream',
          'x-requested-with': 'hyperfolio-internal',
        }
        
        if (token) {
          headers['x-api-token'] = token
        }

        const response = await fetch(url, {
          headers,
        })

        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        setIsStreaming(true)

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            setIsStreaming(false)
            setIsComplete(true)
            break
          }

          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE messages
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const message: StreamMessage = JSON.parse(line.slice(6))

                if (message.type === 'protocol' && message.data) {
                  setProtocols(prev => {
                    const next = new Map(prev)
                    next.set(message.data!.id, message.data!)
                    return next
                  })

                  if (message.progress) {
                    setProgress(message.progress)
                  }

                  onProtocolReceived?.(message.data)
                } else if (message.type === 'complete' && message.portfolioStats) {
                  setPortfolioStats(message.portfolioStats)
                  setIsComplete(true)
                  setIsStreaming(false)
                  onComplete?.(message.portfolioStats)
                } else if (message.type === 'error') {
                  setError(message.error || 'Stream error')
                  onError?.(message.error || 'Stream error')
                } else if (message.type === 'wallet_error') {
                  // Individual wallet error - log but don't stop stream
                  console.warn(`Wallet error for ${message.address}:`, message.error)
                }
              } catch (parseError) {
                console.error('[SSE Hook] Error parsing message:', parseError)
              }
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Stream connection failed'
        console.error('[SSE Hook] Stream error:', errorMessage)
        setError(errorMessage)
        setIsStreaming(false)
        onError?.(errorMessage)
      }
    }

    fetchStream()
  }, [addresses, skipCache, stopStream, onProtocolReceived, onComplete, onError])

  // Track if we've already started streaming to prevent duplicates
  const hasStartedRef = useRef(false)

  // Auto-start stream when enabled and addresses change
  useEffect(() => {
    // Only auto-start on initial mount when enabled
    // Don't restart when enabled changes (use startStream() manually for restarts)
    if (enabled && addresses.length > 0 && !hasStartedRef.current) {
      startStream()
      hasStartedRef.current = true
    }

    return () => {
      stopStream()
      hasStartedRef.current = false
    }
    // Only depend on addressesKey to trigger on address changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesKey])

  return {
    protocols,
    protocolGroups,
    isStreaming,
    isComplete,
    progress,
    portfolioStats,
    error,
    startStream,
    stopStream,
  }
}

// Helper functions to extract data from position details
function mapPositionType(type: string): 'lending' | 'liquidity' | 'staking' | 'farming' {
  const typeMap: Record<string, 'lending' | 'liquidity' | 'staking' | 'farming'> = {
    lending: 'lending',
    liquidity: 'liquidity',
    staking: 'staking',
    farming: 'farming',
    options: 'lending',
    spot: 'staking',
  }
  return typeMap[type] || 'lending'
}

function extractAssets(details: Record<string, unknown>): string[] {
  const assets: string[] = []
  
  if (details?.token) {
    const token = details.token as Record<string, unknown>
    if (token.symbol) assets.push(String(token.symbol))
  }
  
  if (details?.token0) {
    const token0 = details.token0 as Record<string, unknown>
    if (token0.symbol) assets.push(String(token0.symbol))
  }
  
  if (details?.token1) {
    const token1 = details.token1 as Record<string, unknown>
    if (token1.symbol) assets.push(String(token1.symbol))
  }
  
  if (details?.pair) {
    return String(details.pair).split('/').map(s => s.trim())
  }
  
  return assets
}

function extractApy(details: Record<string, unknown>): number {
  const apy = details?.apy
  if (typeof apy === 'number') return apy
  if (typeof apy === 'string') return parseFloat(apy) || 0
  return 0
}

function extractRewards(details: Record<string, unknown>): number {
  const fees = details?.uncollectedFees as Record<string, unknown> | undefined
  if (fees?.usdValue) {
    const value = typeof fees.usdValue === 'string' 
      ? parseFloat(fees.usdValue) 
      : Number(fees.usdValue)
    return isNaN(value) ? 0 : value
  }
  return 0
}

function extractEstimatedYield(details: Record<string, unknown>): { daily: string; weekly: string; monthly: string } | undefined {
  const yield_ = details?.estimatedYield as Record<string, unknown> | undefined
  if (yield_) {
    return {
      daily: String(yield_.daily || '0.00'),
      weekly: String(yield_.weekly || '0.00'),
      monthly: String(yield_.monthly || '0.00'),
    }
  }
  return undefined
}

