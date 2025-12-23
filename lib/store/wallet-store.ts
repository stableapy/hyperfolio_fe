// Wallet Store using Zustand for state management
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Wallet, AggregateData } from '@/lib/types/api'
import { secureFetch } from '@/lib/api/fetch'
import type { StreamedProtocol, StreamProgress, StreamPortfolioStats } from '@/hooks/use-positions-stream'

interface WalletData {
  composition: unknown
  compositionRaw?: unknown
  transactions: unknown[]
  nfts: unknown
  positions: unknown
  userData: unknown
  history: unknown[]
}

// Streaming positions state
interface StreamingState {
  isStreaming: boolean
  isStreamComplete: boolean
  streamProgress: StreamProgress
  streamedProtocols: Map<string, StreamedProtocol>
  streamPortfolioStats: StreamPortfolioStats | null
  streamError: string | null
  skipCache: boolean  // Whether the current/next stream should skip cache
}

// Granular loading states for each data source
interface LoadingStates {
  isWalletDataLoading: boolean  // For aggregate + individual wallet data (composition, history, tokens, NFTs, etc.)
  isPositionsLoading: boolean    // For SSE positions streaming (DeFi positions)
}

interface WalletState {
  wallets: Wallet[]
  selectedWalletId: string | null
  // Legacy: kept for backwards compatibility
  isLoading: boolean
  // Granular loading states
  loading: LoadingStates
  error: string | null
  aggregateData: AggregateData | null
  walletData: Record<string, WalletData> // Store raw data per wallet address

  // Streaming state
  streaming: StreamingState

  // Sync trigger counter - incremented to signal stream restart needed
  syncTrigger: number

  // Actions
  addWallet: (wallet: Omit<Wallet, 'id'>) => void
  removeWallet: (walletId: string) => void
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void
  selectWallet: (walletId: string | null) => void
  setLoading: (loading: boolean) => void
  setWalletDataLoading: (loading: boolean) => void
  setPositionsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAggregateData: (data: AggregateData | null) => void
  setWalletData: (address: string, data: WalletData) => void
  syncWalletData: (walletId: string, skipCache?: boolean) => Promise<void>
  syncAllWallets: (skipCache?: boolean) => Promise<void>
  // Trigger a full sync (clears streamed data and restarts stream)
  triggerSync: (skipCache?: boolean) => void
  
  // Streaming actions
  startStreaming: () => void
  stopStreaming: () => void
  updateStreamedProtocol: (protocol: StreamedProtocol) => void
  setStreamProgress: (progress: StreamProgress) => void
  setStreamComplete: (stats: StreamPortfolioStats) => void
  setStreamError: (error: string | null) => void
  clearStreamedData: () => void
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
}

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

      addWallet: (wallet) => {
        const newWallet: Wallet = {
          id: Date.now().toString(),
          ...wallet,
        }
        set((state) => ({
          wallets: [...state.wallets, newWallet],
        }))
      },

      removeWallet: (walletId) => {
        set((state) => ({
          wallets: state.wallets.filter((w) => w.id !== walletId),
          selectedWalletId: state.selectedWalletId === walletId ? null : state.selectedWalletId,
        }))
      },

      updateWallet: (walletId, updates) => {
        set((state) => ({
          wallets: state.wallets.map((w) => (w.id === walletId ? { ...w, ...updates } : w)),
        }))
      },

      selectWallet: (walletId) => {
        set({ selectedWalletId: walletId })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setWalletDataLoading: (loading) => {
        set((state) => ({
          loading: { ...state.loading, isWalletDataLoading: loading },
          // Also update legacy isLoading for backwards compatibility
          isLoading: loading,
        }))
      },

      setPositionsLoading: (loading) => {
        set((state) => ({
          loading: { ...state.loading, isPositionsLoading: loading },
        }))
      },

      setError: (error) => {
        set({ error })
      },

      setAggregateData: (data) => {
        set({ aggregateData: data })
      },

      setWalletData: (address, data) => {
        set((state) => ({
          walletData: {
            ...state.walletData,
            [address]: data,
          },
        }))
      },

      syncWalletData: async (walletId, skipCache = false) => {
        const wallet = get().wallets.find((w) => w.id === walletId)
        if (!wallet) return

        set({ isLoading: true, error: null })

        try {
          // Fetch data from API with optional cache bypass
          const cacheParam = skipCache ? '?cache=false' : ''
          const response = await secureFetch(`/api/wallet/${wallet.address}${cacheParam}`)
          if (!response.ok) throw new Error('Failed to fetch wallet data')

          const data = await response.json()

          // Update wallet with composition data
          get().updateWallet(walletId, {
            composition: data.composition,
            lastUpdated: Date.now(),
          })
        } catch (error) {
          console.error(`Error syncing wallet ${walletId}:`, error)
          set({ error: error instanceof Error ? error.message : 'Failed to sync wallet' })
        } finally {
          set({ isLoading: false })
        }
      },

      syncAllWallets: async (skipCache = false) => {
        const { wallets } = get()
        if (wallets.length === 0) return

        // Set wallet data loading state (not positions loading - that's separate)
        get().setWalletDataLoading(true)
        set({ error: null })

        try {
          const addresses = wallets.map((w) => w.address)
          // Add cache=false to body when skipping cache
          const response = await secureFetch('/api/wallet/aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses, cache: skipCache ? false : undefined }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to fetch aggregate data')
          }

          const aggregateData = await response.json()

          set({ aggregateData })

          // Update each wallet with raw data in parallel using Promise.allSettled
          // This ensures all requests run concurrently and we track completion properly
          const cacheParam = skipCache ? '?cache=false' : ''
          const walletUpdatePromises = wallets.map(async (wallet) => {
            const walletResponse = await secureFetch(`/api/wallet/${wallet.address}${cacheParam}`)
            if (!walletResponse.ok) {
              throw new Error(`Failed to fetch wallet ${wallet.address}`)
            }
            const data = await walletResponse.json()
            get().setWalletData(wallet.address, data)

            if (data.composition) {
              get().updateWallet(wallet.id, {
                composition: data.composition,
                lastUpdated: Date.now(),
              })
            }
            return { address: wallet.address, success: true }
          })

          const results = await Promise.allSettled(walletUpdatePromises)

          // Log any failures but don't throw - we still have aggregate data
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Error updating wallet ${wallets[index].id}:`, result.reason)
            }
          })

          get().setWalletDataLoading(false)

        } catch (error) {
          console.error('Error syncing all wallets:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to sync wallets',
          })
          get().setWalletDataLoading(false)
        }
      },

      // Trigger a full sync - clears streamed data and increments trigger to restart stream
      triggerSync: (skipCache = false) => {
        // Clear streamed data first so UI shows loading state immediately
        set((state) => ({
          streaming: {
            ...initialStreamingState,
            isStreaming: true, // Mark as streaming immediately for UI feedback
            skipCache, // Store skipCache flag for the stream to use
          },
          loading: {
            ...state.loading,
            isPositionsLoading: true,
          },
          // Increment trigger to signal stream restart
          syncTrigger: state.syncTrigger + 1,
        }))

        // Then trigger wallet data sync
        get().syncAllWallets(skipCache)
      },

      // Streaming actions
      startStreaming: () => {
        set({
          streaming: {
            ...initialStreamingState,
            isStreaming: true,
            streamedProtocols: new Map(),
          },
          loading: {
            isWalletDataLoading: false,
            isPositionsLoading: true,
          },
        })
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
        }))
      },

      updateStreamedProtocol: (protocol: StreamedProtocol) => {
        set((state) => {
          const newProtocols = new Map(state.streaming.streamedProtocols)
          newProtocols.set(protocol.id, protocol)
          return {
            streaming: {
              ...state.streaming,
              streamedProtocols: newProtocols,
            },
          }
        })
      },

      setStreamProgress: (progress: StreamProgress) => {
        set((state) => ({
          streaming: {
            ...state.streaming,
            streamProgress: progress,
          },
        }))
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
        }))
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
        }))
      },

      clearStreamedData: () => {
        set((state) => ({
          streaming: { ...initialStreamingState },
          loading: {
            ...state.loading,
            isPositionsLoading: false,
          },
        }))
      },
    }),
    {
      name: 'hyperfolio-wallets',
      partialize: (state) => ({
        wallets: state.wallets,
        selectedWalletId: state.selectedWalletId,
      }),
    }
  )
)

