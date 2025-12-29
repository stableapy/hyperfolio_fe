"use client"

import { useEffect, useRef, useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { useWalletDataStream, type WalletDataType } from "@/hooks/use-wallet-data-stream"

/**
 * Provider component that initiates wallet data streaming at the page level.
 * Streams wallet data (composition, transactions, NFTs, hypercore, history) progressively
 * as each API endpoint completes, without waiting for all wallets/endpoints.
 *
 * Responds to syncTrigger changes from the wallet store to restart streaming.
 */
export function WalletDataStreamProvider() {
  const {
    wallets,
    syncTrigger,
    walletsChangedTrigger,
    streaming,
    updatePartialWalletData,
    setAggregateData,
    setWalletDataStreaming,
    setWalletDataStreamingComplete,
    setWalletDataStreamingError,
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


  // Callback when data is received - update wallet store incrementally
  const handleDataReceived = (address: string, dataType: WalletDataType, data: unknown) => {
    updatePartialWalletData(address, dataType, data)
  }

  // Callback when stream completes with final aggregate
  const handleComplete = (aggregate: Parameters<NonNullable<Parameters<typeof useWalletDataStream>[0]['onComplete']>>[0]) => {
    setAggregateData(aggregate)
    setWalletDataStreamingComplete()
  }

  // Callback on error
  const handleError = (error: { address?: string; endpoint?: string; error: string }) => {
    setWalletDataStreamingError(error)
  }

  // Use the SSE stream - disabled by default, we manually start it
  // Pass streaming.skipCache directly - when syncTrigger changes, we start a new stream with this value
  const {
    errors,
    startStream,
    stopStream,
  } = useWalletDataStream({
    addresses,
    skipCache: streaming.skipCache,
    enabled: false, // Disabled - we manually control start
    onDataReceived: handleDataReceived,
    onComplete: handleComplete,
    onError: (error) => handleError({ error }),
  })

  // Keep stable refs to avoid effect cleanup race conditions
  const startStreamRef = useRef(startStream)
  const stopStreamRef = useRef(stopStream)
  
  // Update refs when functions change
  useEffect(() => {
    startStreamRef.current = startStream
    stopStreamRef.current = stopStream
  }, [startStream, stopStream])

  // Sync individual errors to store
  useEffect(() => {
    errors.forEach(err => {
      setWalletDataStreamingError(err)
    })
  }, [errors, setWalletDataStreamingError])

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
          setWalletDataStreaming(true)
        }
        startStreamRef.current()
      }, 50)

      // Update refs
      if (isFullSync) lastSyncTriggerRef.current = syncTrigger
      if (isWalletsChanged) lastWalletsChangedTriggerRef.current = walletsChangedTrigger

      return () => clearTimeout(timer)
    }
  }, [syncTrigger, walletsChangedTrigger, addresses.length, setWalletDataStreaming])

  // Auto-start on initial mount
  // Use refs to get latest function references in cleanup
  useEffect(() => {
    if (addresses.length > 0 && !hasInitializedRef.current) {
      setWalletDataStreaming(true)
      startStreamRef.current()
      hasInitializedRef.current = true
    }

    return () => {
      stopStreamRef.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run on mount, sync trigger handles restarts

  // This is a provider component - renders nothing
  return null
}
