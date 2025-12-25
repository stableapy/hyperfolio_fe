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
    selectedWalletId,
    syncTrigger,
    streaming,
    updatePartialWalletData,
    setAggregateData,
    setWalletDataStreaming,
    setWalletDataStreamingComplete,
    setWalletDataStreamingError,
  } = useWalletStore()

  // Track the last processed sync trigger to detect changes
  const lastSyncTriggerRef = useRef(syncTrigger)
  // Track previous selected wallet to detect wallet changes
  const prevSelectedWalletIdRef = useRef<string | null>(selectedWalletId)
  // Track if initial stream has started
  const hasInitializedRef = useRef(false)

  // Memoize addresses to prevent unnecessary recreations that cause startStream to change
  const addresses = useMemo(() => {
    return selectedWalletId
      ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
      : wallets.map(w => w.address)
  }, [selectedWalletId, wallets])

  // Debug: log render
  console.log('[WalletDataStreamProvider] Render:', {
    walletsCount: wallets.length,
    selectedWalletId,
    addressesLength: addresses.length,
    addresses,
    syncTrigger,
    skipCache: streaming.skipCache
  })

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

  // Handle sync trigger changes - restart stream when triggerSync is called
  // Use refs to avoid cleanup race condition when startStream function reference changes
  useEffect(() => {
    if (syncTrigger > lastSyncTriggerRef.current && addresses.length > 0) {
      console.log('[WalletDataStreamProvider] Sync triggered, restarting stream...')
      // Sync was triggered - restart stream
      stopStreamRef.current()
      // Small delay to ensure cleanup before starting new stream
      const timer = setTimeout(() => {
        setWalletDataStreaming(true)
        startStreamRef.current()
      }, 50)

      lastSyncTriggerRef.current = syncTrigger
      return () => clearTimeout(timer)
    }
  }, [syncTrigger, addresses.length, setWalletDataStreaming])

  // Handle wallet selection changes - restart stream for new wallet
  // Use refs to avoid cleanup race condition
  useEffect(() => {
    const walletChanged = selectedWalletId !== prevSelectedWalletIdRef.current

    if (walletChanged && addresses.length > 0 && hasInitializedRef.current) {
      // Wallet selection changed - restart stream
      stopStreamRef.current()
      const timer = setTimeout(() => {
        setWalletDataStreaming(true)
        startStreamRef.current()
      }, 50)

      prevSelectedWalletIdRef.current = selectedWalletId
      return () => clearTimeout(timer)
    }

    prevSelectedWalletIdRef.current = selectedWalletId
  }, [selectedWalletId, addresses.length, setWalletDataStreaming])

  // Auto-start on initial mount
  // Use refs to get latest function references in cleanup
  useEffect(() => {
    console.log('[WalletDataStreamProvider] Auto-start effect:', {
      addressesLength: addresses.length,
      addresses,
      hasInitialized: hasInitializedRef.current
    })

    if (addresses.length > 0 && !hasInitializedRef.current) {
      console.log('[WalletDataStreamProvider] Starting stream...')
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
