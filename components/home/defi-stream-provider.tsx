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
 * Responds to syncTrigger changes from the wallet store to restart streaming.
 */
export function DefiStreamProvider() {
  const {
    wallets,
    selectedWalletId,
    syncTrigger,
    streaming,
    updateStreamedProtocol,
    setStreamProgress,
    setStreamComplete,
    setStreamError,
    startStreaming,
  } = useWalletStore()

  // Track the last processed sync trigger to detect changes
  const lastSyncTriggerRef = useRef(syncTrigger)
  // Track previous selected wallet to detect wallet changes
  const prevSelectedWalletIdRef = useRef<string | null>(selectedWalletId)
  // Track if initial stream has started
  const hasInitializedRef = useRef(false)

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
  }

  const handleError = (error: string) => {
    setStreamError(error)
  }

  // Use the SSE stream - disabled by default, we manually start it
  // Pass streaming.skipCache directly - when syncTrigger changes, we start a new stream with this value
  const {
    progress,
    startStream,
    stopStream,
  } = usePositionsStream({
    addresses,
    skipCache: streaming.skipCache,
    enabled: false, // Disabled - we manually control start
    onProtocolReceived: handleProtocolReceived,
    onComplete: handleComplete,
    onError: handleError,
  })

  // Sync progress to store
  useEffect(() => {
    setStreamProgress(progress)
  }, [progress, setStreamProgress])

  // Handle sync trigger changes - restart stream when triggerSync is called
  useEffect(() => {
    if (syncTrigger > lastSyncTriggerRef.current && addresses.length > 0) {
      // Sync was triggered - restart stream
      stopStream()
      // Small delay to ensure cleanup before starting new stream
      const timer = setTimeout(() => {
        startStreaming() // Update store state
        startStream()
      }, 50)
      
      lastSyncTriggerRef.current = syncTrigger
      return () => clearTimeout(timer)
    }
  }, [syncTrigger, addresses.length, stopStream, startStream, startStreaming])

  // Handle wallet selection changes - restart stream for new wallet
  useEffect(() => {
    const walletChanged = selectedWalletId !== prevSelectedWalletIdRef.current

    if (walletChanged && addresses.length > 0 && hasInitializedRef.current) {
      // Wallet selection changed - restart stream
      stopStream()
      const timer = setTimeout(() => {
        startStreaming()
        startStream()
      }, 50)

      prevSelectedWalletIdRef.current = selectedWalletId
      return () => clearTimeout(timer)
    }

    prevSelectedWalletIdRef.current = selectedWalletId
  }, [selectedWalletId, addresses.length, stopStream, startStream, startStreaming])

  // Auto-start on initial mount
  useEffect(() => {
    if (addresses.length > 0 && !hasInitializedRef.current) {
      startStreaming()
      startStream()
      hasInitializedRef.current = true
    }

    return () => {
      stopStream()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This is a provider component - renders nothing
  return null
}
