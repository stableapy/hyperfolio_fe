"use client"

import { useEffect, useRef } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { usePositionsStream, type StreamedProtocol } from "@/hooks/use-positions-stream"

/**
 * Provider component that initiates DeFi position streaming at the page level.
 * This ensures streaming only happens once on page load or when sync is triggered,
 * not on every tab navigation.
 *
 * Uses granular loading state - positions stream independently from wallet data.
 */
export function DefiStreamProvider() {
  const {
    wallets,
    selectedWalletId,
    streaming,
    startStreaming,
    updateStreamedProtocol,
    setStreamProgress,
    setStreamComplete,
    setStreamError,
    clearStreamedData,
  } = useWalletStore()

  // Track if we've already started streaming to prevent duplicate streams
  const isStreamingRef = useRef(false)
  // Track previous selected wallet to detect wallet changes
  const prevSelectedWalletIdRef = useRef<string | null>(selectedWalletId)
  // Track if we've processed the current sync
  const syncProcessedRef = useRef(false)

  // Get addresses based on selection
  const addresses = selectedWalletId
    ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
    : wallets.map(w => w.address)

  // Callbacks for stream events - update the wallet store
  const handleProtocolReceived = (protocol: StreamedProtocol) => {
    updateStreamedProtocol(protocol)
  }

  const handleComplete = (stats: Parameters<NonNullable<Parameters<typeof usePositionsStream>[0]['onComplete']>>[0]) => {
    setStreamComplete(stats)
    isStreamingRef.current = false
    syncProcessedRef.current = false // Allow restart on next sync
  }

  const handleError = (error: string) => {
    setStreamError(error)
    isStreamingRef.current = false
    syncProcessedRef.current = false
  }

  // Use the SSE stream - disabled by default, we manually start it
  const {
    isStreaming: streamHookIsStreaming,
    progress,
    startStream,
    stopStream,
  } = usePositionsStream({
    addresses,
    skipCache: false,
    enabled: false, // Disabled - we manually control start
    onProtocolReceived: handleProtocolReceived,
    onComplete: handleComplete,
    onError: handleError,
  })

  // Sync streaming state with store
  useEffect(() => {
    if (streamHookIsStreaming && !streaming.isStreaming) {
      startStreaming()
      isStreamingRef.current = true
    }
  }, [streamHookIsStreaming, streaming.isStreaming, startStreaming])

  useEffect(() => {
    setStreamProgress(progress)
  }, [progress, setStreamProgress])

  // Handle wallet changes - restart stream
  useEffect(() => {
    const walletChanged = selectedWalletId !== prevSelectedWalletIdRef.current

    if (walletChanged && addresses.length > 0 && !isStreamingRef.current) {
      // Clear and restart stream
      clearStreamedData()
      stopStream()
      isStreamingRef.current = false

      setTimeout(() => {
        startStream()
        isStreamingRef.current = true
      }, 100)
    }

    prevSelectedWalletIdRef.current = selectedWalletId
  }, [selectedWalletId, addresses.length, clearStreamedData, stopStream, startStream])

  // Listen for sync completion events to restart stream with fresh data
  useEffect(() => {
    const handleSyncComplete = () => {
      if (addresses.length === 0 || isStreamingRef.current || syncProcessedRef.current) {
        return
      }

      // Clear and restart stream with cache bypass
      clearStreamedData()
      stopStream()

      setTimeout(() => {
        startStream()
        isStreamingRef.current = true
        syncProcessedRef.current = true
      }, 100)
    }

    // Listen for custom sync complete event
    window.addEventListener('wallet-sync-complete', handleSyncComplete)

    return () => {
      window.removeEventListener('wallet-sync-complete', handleSyncComplete)
    }
  }, [addresses.length, clearStreamedData, stopStream, startStream])

  // Auto-start on initial mount
  useEffect(() => {
    if (addresses.length > 0 && !isStreamingRef.current) {
      startStream()
      isStreamingRef.current = true
    }
    // Only run on mount - eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This is a provider component - renders nothing
  return null
}





