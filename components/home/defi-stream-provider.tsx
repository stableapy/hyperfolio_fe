"use client"

import { useEffect, useRef, useMemo } from "react"
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
    syncTrigger,
    walletsChangedTrigger,
    streaming,
    updateStreamedProtocol,
    setStreamProgress,
    setStreamComplete,
    setStreamError,
    startStreaming,
  } = useWalletStore()

  // Track the last processed triggers to detect changes
  const lastSyncTriggerRef = useRef(syncTrigger)
  const lastWalletsChangedTriggerRef = useRef(walletsChangedTrigger)
  // Track if initial stream has started
  const hasInitializedRef = useRef(false)

  // Memoize addresses to prevent unnecessary recreations that cause startStream to change
  // Always fetch ALL wallets - components will filter locally by selectedWalletId
  const addresses = useMemo(() => {
    return wallets.map(w => w.address)
  }, [wallets])

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

  // Keep stable refs to avoid effect cleanup race conditions
  const startStreamRef = useRef(startStream)
  const stopStreamRef = useRef(stopStream)
  
  // Update refs when functions change
  useEffect(() => {
    startStreamRef.current = startStream
    stopStreamRef.current = stopStream
  }, [startStream, stopStream])

  // Sync progress to store
  useEffect(() => {
    setStreamProgress(progress)
  }, [progress, setStreamProgress])

  // Handle sync trigger changes - restart stream when triggerSync is called (clears data)
  // Handle wallets changed trigger - restart stream when wallets are added/removed (preserves data)
  // Use refs to avoid cleanup race condition when startStream function reference changes
  useEffect(() => {
    const isFullSync = syncTrigger > lastSyncTriggerRef.current
    const isWalletsChanged = walletsChangedTrigger > lastWalletsChangedTriggerRef.current

    if ((isFullSync || isWalletsChanged) && addresses.length > 0) {
      // Stop current stream
      stopStreamRef.current()

      // Small delay to ensure cleanup before starting new stream
      const timer = setTimeout(() => {
        // Only clear data and update store state for full sync, not for wallet changes
        if (isFullSync) {
          startStreaming() // This clears streamedProtocols
        }
        startStreamRef.current()
      }, 50)

      // Update refs
      if (isFullSync) lastSyncTriggerRef.current = syncTrigger
      if (isWalletsChanged) lastWalletsChangedTriggerRef.current = walletsChangedTrigger

      return () => clearTimeout(timer)
    }
  }, [syncTrigger, walletsChangedTrigger, addresses.length, startStreaming])

  // Auto-start on initial mount
  // Use refs to get latest function references in cleanup
  useEffect(() => {
    if (addresses.length > 0 && !hasInitializedRef.current) {
      startStreaming()
      startStreamRef.current()
      hasInitializedRef.current = true
    }

    return () => {
      stopStreamRef.current()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This is a provider component - renders nothing
  return null
}
