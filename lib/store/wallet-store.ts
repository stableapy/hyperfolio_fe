// Wallet Store using Zustand for state management
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Wallet, AggregateData } from '@/lib/types/api'

interface WalletData {
  composition: any
  compositionRaw?: any
  transactions: any[]
  nfts: any
  positions: any
  userData: any
  history: any[]
}

interface WalletState {
  wallets: Wallet[]
  selectedWalletId: string | null
  isLoading: boolean
  error: string | null
  aggregateData: AggregateData | null
  walletData: Record<string, WalletData> // Store raw data per wallet address

  // Actions
  addWallet: (wallet: Omit<Wallet, 'id'>) => void
  removeWallet: (walletId: string) => void
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void
  selectWallet: (walletId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAggregateData: (data: AggregateData | null) => void
  setWalletData: (address: string, data: WalletData) => void
  syncWalletData: (walletId: string) => Promise<void>
  syncAllWallets: () => Promise<void>
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      selectedWalletId: null,
      isLoading: false,
      error: null,
      aggregateData: null,
      walletData: {},

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

      syncWalletData: async (walletId) => {
        const wallet = get().wallets.find((w) => w.id === walletId)
        if (!wallet) return

        set({ isLoading: true, error: null })

        try {
          // Fetch data from API
          const response = await fetch(`/api/wallet/${wallet.address}`)
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

      syncAllWallets: async () => {
        const { wallets } = get()
        if (wallets.length === 0) return

        set({ isLoading: true, error: null })

        try {
          const addresses = wallets.map((w) => w.address)
          const response = await fetch('/api/wallet/aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to fetch aggregate data')
          }

          const aggregateData = await response.json()

          set({
            aggregateData,
            isLoading: false,
          })

          // Update each wallet with raw data
          wallets.forEach(async (wallet) => {
            try {
              const walletResponse = await fetch(`/api/wallet/${wallet.address}`)
              if (walletResponse.ok) {
                const data = await walletResponse.json()
                get().setWalletData(wallet.address, data)
                
                if (data.composition) {
                  get().updateWallet(wallet.id, {
                    composition: data.composition,
                    lastUpdated: Date.now(),
                  })
                }
              }
            } catch (error) {
              console.error(`Error updating wallet ${wallet.id}:`, error)
            }
          })
        } catch (error) {
          console.error('Error syncing all wallets:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to sync wallets',
            isLoading: false,
          })
        }
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

