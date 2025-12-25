'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import type {
  WalletDataStreamMessage,
  WalletDataType,
  PartialWalletData,
  AggregateData,
} from '@/lib/types/api'

export interface UseWalletDataStreamOptions {
  addresses: string[]
  skipCache?: boolean
  enabled?: boolean
  onDataReceived?: (address: string, dataType: WalletDataType, data: unknown) => void
  onComplete?: (aggregate: AggregateData) => void
  onError?: (error: string) => void
}

export interface UseWalletDataStreamResult {
  isStreaming: boolean
  isComplete: boolean
  data: Map<string, PartialWalletData>
  aggregate: AggregateData | null
  error: string | null
  errors: Array<{ address?: string; endpoint?: string; error: string }>
  startStream: () => void
  stopStream: () => void
}

/**
 * Hook for streaming wallet data via SSE
 * Progressively loads data as each API endpoint completes
 */
export function useWalletDataStream({
  addresses,
  skipCache = false,
  enabled = true,
  onDataReceived,
  onComplete,
  onError,
}: UseWalletDataStreamOptions): UseWalletDataStreamResult {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [data, setData] = useState<Map<string, PartialWalletData>>(new Map())
  const [aggregate, setAggregate] = useState<AggregateData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Array<{ address?: string; endpoint?: string; error: string }>>([])

  const addressesKey = addresses.sort().join(',')

  const stopStream = useCallback(() => {
    setIsStreaming(false)
  }, [])

  const startStream = useCallback(() => {
    // Reset state
    setData(new Map())
    setIsStreaming(true)
    setIsComplete(false)
    setAggregate(null)
    setError(null)
    setErrors([])

    if (addresses.length === 0) {
      setIsStreaming(false)
      setIsComplete(true)
      return
    }

    // Build URL
    const params = new URLSearchParams()
    params.set('addresses', addresses.join(','))
    if (skipCache) {
      params.set('cache', 'false')
    }

    const url = `/api/wallet/aggregate/stream?${params.toString()}`

    const fetchStream = async () => {
      try {
        // Build headers required by middleware
        const headers: Record<string, string> = {
          'Accept': 'text/event-stream',
          'x-requested-with': 'hyperfolio-internal',
        }

        // Get API token from window if available
        const token = typeof window !== 'undefined' ? (window as any).__API_TOKEN : undefined
        if (token) {
          headers['x-api-token'] = token
        }

        const response = await fetch(url, { headers })

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
                const message: WalletDataStreamMessage = JSON.parse(line.slice(6))

                if (message.type === 'error') {
                  if (message.address && message.endpoint) {
                    // Individual endpoint error
                    setErrors(prev => [...prev, {
                      address: message.address,
                      endpoint: message.endpoint,
                      error: message.error || 'Unknown error'
                    }])
                  } else {
                    // General stream error
                    setError(message.error || 'Stream error')
                    onError?.(message.error || 'Stream error')
                  }
                } else if (message.type === 'complete' && message.aggregate) {
                  setAggregate(message.aggregate)
                  setIsComplete(true)
                  setIsStreaming(false)
                  onComplete?.(message.aggregate)
                } else if (message.address && message.data) {
                  // Individual data piece received
                  const dataType = message.type as WalletDataType
                  setData(prev => {
                    const next = new Map(prev)
                    const existing = next.get(message.address!) || {}
                    next.set(message.address!, {
                      ...existing,
                      [dataType === 'composition' ? 'compositionRaw' : dataType]: message.data
                    })
                    return next
                  })

                  onDataReceived?.(message.address, dataType, message.data)
                }
              } catch (parseError) {
                console.error('[Wallet Data Stream Hook] Error parsing message:', parseError)
              }
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Stream connection failed'
        console.error('[Wallet Data Stream Hook] Stream error:', errorMessage)
        setError(errorMessage)
        setIsStreaming(false)
        onError?.(errorMessage)
      }
    }

    fetchStream()
  }, [addresses, skipCache, onDataReceived, onComplete, onError])

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
    isStreaming,
    isComplete,
    data,
    aggregate,
    error,
    errors,
    startStream,
    stopStream,
  }
}
