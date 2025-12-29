'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import {
  usePositionsStream,
  type StreamedProtocol,
  type StreamProtocolGroup,
} from '@/hooks/use-positions-stream';
import type { ProtocolGroup } from '../types';
import type { DeFiPositionDisplay } from '@/lib/utils/data-transformers';

interface UseStreamingPositionsOptions {
  skipCache?: boolean;
  enabled?: boolean;
}

interface UseStreamingPositionsResult {
  protocolGroups: ProtocolGroup[];
  positions: DeFiPositionDisplay[];
  isStreaming: boolean;
  isComplete: boolean;
  hasData: boolean;
  progress: { completed: number; total: number };
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook for streaming DeFi positions via SSE
 * Provides progressive loading of positions as they arrive from the backend
 */
export function useStreamingPositions({
  skipCache = false,
  enabled = true,
}: UseStreamingPositionsOptions = {}): UseStreamingPositionsResult {
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
  } = useWalletStore();

  // Track previous isLoading state to detect sync trigger
  const prevIsLoadingRef = useRef(isLoading);

  // Get addresses based on selection
  const addresses = useMemo(() => {
    if (selectedWalletId) {
      const wallet = wallets.find((w) => w.id === selectedWalletId);
      return wallet ? [wallet.address] : [];
    }
    return wallets.map((w) => w.address);
  }, [wallets, selectedWalletId]);

  // Get wallet info map for position enrichment
  const walletInfoMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    wallets.forEach((w) => {
      map.set(w.address, { name: w.name, color: w.color });
    });
    return map;
  }, [wallets]);

  // Callbacks for stream events
  const handleProtocolReceived = useCallback(
    (protocol: StreamedProtocol) => {
      updateStreamedProtocol(protocol);
    },
    [updateStreamedProtocol]
  );

  const handleComplete = useCallback(
    (
      stats: Parameters<
        NonNullable<Parameters<typeof usePositionsStream>[0]['onComplete']>
      >[0]
    ) => {
      setStreamComplete(stats);
    },
    [setStreamComplete]
  );

  const handleError = useCallback(
    (error: string) => {
      setStreamError(error);
    },
    [setStreamError]
  );

  // Use the SSE stream - skipCache when isLoading (sync triggered)
  const {
    protocolGroups: streamedProtocolGroups,
    isStreaming: streamHookIsStreaming,
    isComplete: streamHookIsComplete,
    progress,
    error,
    startStream,
    stopStream,
  } = usePositionsStream({
    addresses,
    skipCache: skipCache || isLoading,
    enabled: enabled && addresses.length > 0,
    onProtocolReceived: handleProtocolReceived,
    onComplete: handleComplete,
    onError: handleError,
  });

  // Sync streaming state with store
  useEffect(() => {
    if (streamHookIsStreaming && !streaming.isStreaming) {
      startStreaming();
    }
  }, [streamHookIsStreaming, streaming.isStreaming, startStreaming]);

  useEffect(() => {
    setStreamProgress(progress);
  }, [progress, setStreamProgress]);

  // Restart streaming when sync is triggered (isLoading becomes true)
  useEffect(() => {
    if (
      isLoading &&
      !prevIsLoadingRef.current &&
      enabled &&
      addresses.length > 0
    ) {
      // Sync was triggered, restart streaming with cache bypass
      clearStreamedData();
      stopStream();
      setTimeout(() => {
        startStream();
      }, 100);
    }
    prevIsLoadingRef.current = isLoading;
  }, [
    isLoading,
    enabled,
    addresses.length,
    clearStreamedData,
    stopStream,
    startStream,
  ]);

  // Enrich protocol groups with wallet info and convert to local ProtocolGroup type
  const enrichedProtocolGroups: ProtocolGroup[] = useMemo(() => {
    return streamedProtocolGroups.map((group) => ({
      id: group.id,
      name: group.name,
      logo: group.logo || null,
      url: group.url || '',
      totalValue: group.totalValue,
      positions: group.positions.map((pos) => {
        const walletInfo = pos.walletAddress
          ? walletInfoMap.get(pos.walletAddress)
          : undefined;
        return {
          ...pos,
          walletName: walletInfo?.name,
          walletColor: walletInfo?.color,
        };
      }),
      stats: group.stats
        ? {
            weightedApyPercent: group.stats.weightedApyPercent ?? undefined,
            estimatedYield: group.stats.estimatedYield,
          }
        : undefined,
    }));
  }, [streamedProtocolGroups, walletInfoMap]);

  // Flatten positions for stats calculation
  const positions: DeFiPositionDisplay[] = useMemo(() => {
    return enrichedProtocolGroups.flatMap((group) => group.positions);
  }, [enrichedProtocolGroups]);

  // Refresh function
  const refresh = useCallback(() => {
    clearStreamedData();
    stopStream();
    // Small delay to ensure cleanup
    setTimeout(() => {
      startStream();
    }, 100);
  }, [clearStreamedData, stopStream, startStream]);

  return {
    protocolGroups: enrichedProtocolGroups,
    positions,
    isStreaming: streamHookIsStreaming || streaming.isStreaming,
    isComplete: streamHookIsComplete || streaming.isStreamComplete,
    hasData: enrichedProtocolGroups.length > 0,
    progress,
    error: error || streaming.streamError,
    refresh,
  };
}
