// Wallet Store using Zustand for state management
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Wallet,
  AggregateData,
  WalletCompositionResponse,
  WalletDataType,
  PointsData,
} from '@/lib/types/api';
import { secureFetch } from '@/lib/api/fetch';
import type {
  StreamedProtocol,
  StreamProgress,
  StreamPortfolioStats,
} from '@/hooks/use-positions-stream';
// Note: clearPointsCache removed - no longer needed with wallet store as single source of truth

interface WalletData {
  composition: WalletCompositionResponse | null; // Raw API response with { data: { tokens: [...] } }
  compositionRaw?: WalletCompositionResponse | null; // Alias for composition
  // Note: transactions removed - loaded independently via /api/wallet/transactions
  nfts: unknown;
  positions: unknown;
  userData: unknown;
  history: unknown[];
  points: PointsData[];
}

// Streaming positions state
interface StreamingState {
  isStreaming: boolean;
  isStreamComplete: boolean;
  streamProgress: StreamProgress;
  streamedProtocols: Map<string, StreamedProtocol>;
  streamPortfolioStats: StreamPortfolioStats | null;
  streamError: string | null;
  skipCache: boolean; // Whether the current/next stream should skip cache

  // Wallet data streaming state (for progressive wallet data loading)
  walletDataStreaming: {
    isStreaming: boolean;
    isComplete: boolean;
    errors: Array<{ address?: string; endpoint?: string; error: string }>;
  };
}

// Granular loading states for each data source
interface LoadingStates {
  isWalletDataLoading: boolean; // For aggregate + individual wallet data (composition, history, tokens, NFTs, etc.)
  isPositionsLoading: boolean; // For SSE positions streaming (DeFi positions)
}

interface WalletState {
  wallets: Wallet[];
  selectedWalletId: string | null;
  // Legacy: kept for backwards compatibility
  isLoading: boolean;
  // Granular loading states
  loading: LoadingStates;
  error: string | null;
  aggregateData: AggregateData | null;
  walletData: Record<string, WalletData>; // Store raw data per wallet address

  // Privacy mode state
  privacyMode: boolean;

  // Yield section view mode
  yieldViewMode: 'list' | 'card';
  setYieldViewMode: (mode: 'list' | 'card') => void;

  // Streaming state
  streaming: StreamingState;

  // Sync trigger counter - incremented to signal full stream restart (clears data)
  syncTrigger: number;
  // Wallets changed trigger - incremented when wallets are added/removed (preserves data)
  walletsChangedTrigger: number;

  // Actions
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  removeWallet: (walletId: string) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  selectWallet: (walletId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setWalletDataLoading: (loading: boolean) => void;
  setPositionsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAggregateData: (data: AggregateData | null) => void;
  setWalletData: (address: string, data: WalletData) => void;
  syncWalletData: (walletId: string, skipCache?: boolean) => Promise<void>;
  syncAllWallets: (skipCache?: boolean) => Promise<void>;
  // Trigger a full sync (clears streamed data and restarts stream)
  triggerSync: (skipCache?: boolean) => void;

  // Privacy mode actions
  setPrivacyMode: (enabled: boolean) => void;
  togglePrivacyMode: () => void;

  // Streaming actions
  startStreaming: () => void;
  stopStreaming: () => void;
  updateStreamedProtocol: (protocol: StreamedProtocol) => void;
  setStreamProgress: (progress: StreamProgress) => void;
  setStreamComplete: (stats: StreamPortfolioStats) => void;
  setStreamError: (error: string | null) => void;
  clearStreamedData: () => void;

  // Wallet data streaming actions
  setWalletDataStreaming: (isStreaming: boolean) => void;
  setWalletDataStreamingComplete: () => void;
  setWalletDataStreamingError: (error: {
    address?: string;
    endpoint?: string;
    error: string;
  }) => void;
  updatePartialWalletData: (
    address: string,
    dataType: WalletDataType,
    data: unknown
  ) => void;
}

// Initial streaming state
const initialStreamingState: StreamingState = {
  isStreaming: false,
  isStreamComplete: false,
  streamProgress: { completed: 0, total: 0 },
  streamedProtocols: new Map(),
  streamPortfolioStats: null,
  streamError: null,
  skipCache: false,
  walletDataStreaming: {
    isStreaming: false,
    isComplete: false,
    errors: [],
  },
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      selectedWalletId: null,
      isLoading: false,
      loading: {
        isWalletDataLoading: false,
        isPositionsLoading: false,
      },
      error: null,
      aggregateData: null,
      walletData: {},
      streaming: { ...initialStreamingState },
      syncTrigger: 0,
      walletsChangedTrigger: 0,
      privacyMode: false,
      yieldViewMode: 'list',
      setYieldViewMode: (mode: 'list' | 'card') => {
        set({ yieldViewMode: mode });
      },

      addWallet: (wallet) => {
        const newWallet: Wallet = {
          id: Date.now().toString(),
          ...wallet,
        };
        set((state) => ({
          wallets: [...state.wallets, newWallet],
          // Increment walletsChangedTrigger to trigger streaming providers to fetch data for new wallet
          // This does NOT clear existing data, unlike syncTrigger
          walletsChangedTrigger: state.walletsChangedTrigger + 1,
        }));
      },

      removeWallet: (walletId) => {
        set((state) => {
          const walletToRemove = state.wallets.find((w) => w.id === walletId);
          const walletAddress = walletToRemove?.address;

          // Clean up streamed protocols: remove positions belonging to the removed wallet
          const cleanedProtocols = new Map<string, StreamedProtocol>();
          state.streaming.streamedProtocols.forEach((protocol, protocolId) => {
            const filteredPositions = protocol.positions.filter(
              (pos) => pos.walletAddress !== walletAddress
            );
            // Only keep protocols that still have positions after filtering
            if (filteredPositions.length > 0) {
              // Recalculate totalValueUSD from remaining positions to avoid stale values
              const recalculatedTotalValue = filteredPositions.reduce(
                (sum, pos) => sum + parseFloat(pos.totalValueUSD || '0'),
                0
              );
              cleanedProtocols.set(protocolId, {
                ...protocol,
                positions: filteredPositions,
                totalValueUSD: recalculatedTotalValue.toString(),
                // Also update protocolStats.totalPositions to reflect actual count
                protocolStats: {
                  ...protocol.protocolStats,
                  totalPositions: filteredPositions.length,
                },
              });
            }
          });

          // Clean up wallet data for the removed wallet address
          const cleanedWalletData = { ...state.walletData };
          if (walletAddress && cleanedWalletData[walletAddress]) {
            delete cleanedWalletData[walletAddress];
          }

          return {
            wallets: state.wallets.filter((w) => w.id !== walletId),
            selectedWalletId:
              state.selectedWalletId === walletId
                ? null
                : state.selectedWalletId,
            walletData: cleanedWalletData,
            streaming: {
              ...state.streaming,
              streamedProtocols: cleanedProtocols,
            },
          };
        });
      },

      updateWallet: (walletId, updates) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === walletId ? { ...w, ...updates } : w
          ),
        }));
      },

      selectWallet: (walletId) => {
        set({ selectedWalletId: walletId });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setWalletDataLoading: (loading) => {
        set((state) => ({
          loading: { ...state.loading, isWalletDataLoading: loading },
          // Also update legacy isLoading for backwards compatibility
          isLoading: loading,
        }));
      },

      setPositionsLoading: (loading) => {
        set((state) => ({
          loading: { ...state.loading, isPositionsLoading: loading },
        }));
      },

      setError: (error) => {
        set({ error });
      },

      setAggregateData: (data) => {
        set({ aggregateData: data });
      },

      setWalletData: (address, data) => {
        set((state) => ({
          walletData: {
            ...state.walletData,
            [address]: data,
          },
        }));
      },

      syncWalletData: async (walletId, skipCache = false) => {
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!wallet) return;

        set({ isLoading: true, error: null });

        try {
          // Fetch data from API with optional cache bypass
          const cacheParam = skipCache ? '?cache=false' : '';
          const response = await secureFetch(
            `/api/wallet/${wallet.address}${cacheParam}`
          );
          if (!response.ok) throw new Error('Failed to fetch wallet data');

          const data = await response.json();

          // Update wallet with composition data
          get().updateWallet(walletId, {
            composition: data.composition,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error(`Error syncing wallet ${walletId}:`, error);
          set({
            error:
              error instanceof Error ? error.message : 'Failed to sync wallet',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      syncAllWallets: async (skipCache = false) => {
        const { wallets } = get();
        if (wallets.length === 0) return;

        // Set wallet data loading state (not positions loading - that's separate)
        get().setWalletDataLoading(true);
        set({ error: null });

        try {
          const addresses = wallets.map((w) => w.address);
          // Add cache=false to body when skipping cache
          const response = await secureFetch('/api/wallet/aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              addresses,
              cache: skipCache ? false : undefined,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || 'Failed to fetch aggregate data'
            );
          }

          const aggregateData = await response.json();

          set({ aggregateData });

          // Update each wallet with raw data in parallel using Promise.allSettled
          // This ensures all requests run concurrently and we track completion properly
          const cacheParam = skipCache ? '?cache=false' : '';
          const walletUpdatePromises = wallets.map(async (wallet) => {
            const walletResponse = await secureFetch(
              `/api/wallet/${wallet.address}${cacheParam}`
            );
            if (!walletResponse.ok) {
              throw new Error(`Failed to fetch wallet ${wallet.address}`);
            }
            const data = await walletResponse.json();
            get().setWalletData(wallet.address, data);

            if (data.composition) {
              get().updateWallet(wallet.id, {
                composition: data.composition,
                lastUpdated: Date.now(),
              });
            }
            return { address: wallet.address, success: true };
          });

          const results = await Promise.allSettled(walletUpdatePromises);

          // Log any failures but don't throw - we still have aggregate data
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(
                `Error updating wallet ${wallets[index].id}:`,
                result.reason
              );
            }
          });

          get().setWalletDataLoading(false);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to sync wallets',
          });
          get().setWalletDataLoading(false);
        }
      },

      // Trigger a full sync - clears streamed data and wallet data to show skeletons, then restarts stream
      triggerSync: (skipCache = false) => {
        // Clear ALL data first so UI shows loading skeletons immediately
        set((state) => ({
          // Clear wallet and aggregate data - forces sections to show skeletons
          walletData: {},
          aggregateData: null,
          // Clear streaming data and set skipCache flag
          streaming: {
            ...initialStreamingState,
            isStreaming: true, // Mark as streaming immediately for UI feedback
            skipCache, // Store skipCache flag for the stream to use
          },
          loading: {
            ...state.loading,
            isWalletDataLoading: true,
            isPositionsLoading: true,
          },
          // Increment trigger to signal stream restart
          syncTrigger: state.syncTrigger + 1,
        }));

        // Note: syncAllWallets is NOT called here - the streaming providers (DefiStreamProvider and WalletDataStreamProvider)
        // will detect the syncTrigger change and restart their streams automatically
      },

      // Privacy mode actions
      setPrivacyMode: (enabled: boolean) => {
        set({ privacyMode: enabled });
      },

      togglePrivacyMode: () => {
        set((state) => ({ privacyMode: !state.privacyMode }));
      },

      // Streaming actions
      startStreaming: () => {
        set((state) => ({
          streaming: {
            ...initialStreamingState,
            isStreaming: true,
            streamedProtocols: new Map(),
          },
          loading: {
            ...state.loading, // Preserve wallet data loading state - they're independent
            isPositionsLoading: true,
          },
        }));
      },

      stopStreaming: () => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            isStreaming: false,
          },
          loading: {
            ...state.loading,
            isPositionsLoading: false,
          },
        }));
      },

      updateStreamedProtocol: (protocol: StreamedProtocol) => {
        set((state) => {
          const newProtocols = new Map(state.streaming.streamedProtocols);
          newProtocols.set(protocol.id, protocol);
          return {
            streaming: {
              ...state.streaming,
              streamedProtocols: newProtocols,
            },
          };
        });
      },

      setStreamProgress: (progress: StreamProgress) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            streamProgress: progress,
          },
        }));
      },

      setStreamComplete: (stats: StreamPortfolioStats) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            isStreaming: false,
            isStreamComplete: true,
            streamPortfolioStats: stats,
          },
          loading: {
            ...state.loading,
            isPositionsLoading: false,
          },
        }));
      },

      setStreamError: (error: string | null) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            streamError: error,
            isStreaming: false,
          },
          loading: {
            ...state.loading,
            isPositionsLoading: false,
          },
        }));
      },

      clearStreamedData: () => {
        set((state) => ({
          streaming: { ...initialStreamingState },
          loading: {
            ...state.loading,
            isPositionsLoading: false,
          },
        }));
      },

      // Wallet data streaming actions
      setWalletDataStreaming: (isStreaming: boolean) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            walletDataStreaming: {
              ...state.streaming.walletDataStreaming,
              isStreaming,
            },
          },
          loading: {
            ...state.loading,
            isWalletDataLoading: isStreaming,
          },
        }));
      },

      setWalletDataStreamingComplete: () => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            walletDataStreaming: {
              ...state.streaming.walletDataStreaming,
              isStreaming: false,
              isComplete: true,
            },
          },
          loading: {
            ...state.loading,
            isWalletDataLoading: false,
          },
        }));
      },

      setWalletDataStreamingError: (error: {
        address?: string;
        endpoint?: string;
        error: string;
      }) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            walletDataStreaming: {
              ...state.streaming.walletDataStreaming,
              errors: [...state.streaming.walletDataStreaming.errors, error],
            },
          },
        }));
      },

      updatePartialWalletData: (
        address: string,
        dataType: WalletDataType,
        data: unknown
      ) => {
        set((state) => {
          const existing = state.walletData[address] || {
            composition: null,
            compositionRaw: null,
            // Note: transactions removed - loaded independently via /api/wallet/transactions
            nfts: { data: { nfts: [], totalNftValue: 0 }, cache: {} },
            userData: null,
            history: [],
            positions: null,
            points: [],
          };

          // Map dataType to the correct field in walletData
          const updatedWalletData = { ...existing };
          if (dataType === 'composition') {
            updatedWalletData.compositionRaw =
              data as WalletCompositionResponse;
            updatedWalletData.composition = data as WalletCompositionResponse;
          } else if (dataType === 'nfts') {
            updatedWalletData.nfts = data;
          } else if (dataType === 'hypercore') {
            updatedWalletData.userData = data;
          } else if (dataType === 'history') {
            updatedWalletData.history = data as never[];
          } else if (dataType === 'points') {
            // Points data comes as { data: PointsData[], cache: {...} }
            const pointsResponse = data as {
              data: PointsData[];
              cache: unknown;
            };
            updatedWalletData.points = pointsResponse.data;
          }

          return {
            walletData: {
              ...state.walletData,
              [address]: updatedWalletData,
            },
          };
        });
      },
    }),
    {
      name: 'hyperfolio-wallets',
      partialize: (state) => ({
        wallets: state.wallets,
        selectedWalletId: state.selectedWalletId,
        privacyMode: state.privacyMode,
        yieldViewMode: state.yieldViewMode,
      }),
    }
  )
);
