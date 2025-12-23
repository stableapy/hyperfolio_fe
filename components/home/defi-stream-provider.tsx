"use client"

import { useEffect, useRef } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { usePositionsStream, type StreamedProtocol } from "@/hooks/use-positions-stream"

/**
 * Provider component that initiates DeFi position streaming at the page level.
 * This ensures streaming only happens once on page load or when sync is triggered,
 * not on every tab navigation.
 */
export function DefiStreamProvider() {
  const {
    wallets,
    selectedWalletId,
    isLoading,
    streaming,
    startStreaming,
    updateStreamedProtocol,
    setStreamProgress,
    setStreamComplete,
    setStreamError,
    clearStreamedData,
  } = useWalletStore()

  // Track previous isLoading state to detect sync trigger
  const prevIsLoadingRef = useRef(isLoading)
  // Track if we've already started streaming to prevent duplicate streams
  const hasStartedRef = useRef(false)

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
    hasStartedRef.current = false // Allow restart on next sync
  }

  const handleError = (error: string) => {
    setStreamError(error)
    hasStartedRef.current = false // Allow restart on error
  }

  // Use the SSE stream - skipCache when isLoading (sync triggered)
  const {
    isStreaming: streamHookIsStreaming,
    progress,
    startStream,
    stopStream,
  } = usePositionsStream({
    addresses,
    skipCache: isLoading,
    // Only enable on initial mount if not already streaming and we have addresses
    enabled: addresses.length > 0 && !hasStartedRef.current && !streaming.isStreamComplete,
    onProtocolReceived: handleProtocolReceived,
    onComplete: handleComplete,
    onError: handleError,
  })

  // Sync streaming state with store
  useEffect(() => {
    if (streamHookIsStreaming && !streaming.isStreaming) {
      startStreaming()
      hasStartedRef.current = true
    }
  }, [streamHookIsStreaming, streaming.isStreaming, startStreaming])

  useEffect(() => {
    setStreamProgress(progress)
  }, [progress, setStreamProgress])

  // Restart streaming when sync is triggered (isLoading becomes true)
  useEffect(() => {
    if (isLoading && !prevIsLoadingRef.current && addresses.length > 0) {
      // Sync was triggered, restart streaming with cache bypass
      clearStreamedData()
      stopStream()
      hasStartedRef.current = false
      setTimeout(() => {
        startStream()
        hasStartedRef.current = true
      }, 100)
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading, addresses.length, clearStreamedData, stopStream, startStream])

  // Restart streaming when selected wallet changes
  useEffect(() => {
    if (addresses.length > 0 && streaming.isStreamComplete) {
      // Wallet selection changed after completion, restart stream
      clearStreamedData()
      stopStream()
      hasStartedRef.current = false
      setTimeout(() => {
        startStream()
        hasStartedRef.current = true
      }, 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWalletId])

  // This is a provider component - renders nothing
  return null
}

