import { useState, useCallback, useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTransactions } from "@/lib/utils/data-transformers"
import type { Transaction } from "../types"

const TRANSACTIONS_PER_PAGE = 15

interface TransactionsState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  page: number
  hasMore: boolean
  total: number
}

/**
 * Hook to lazily fetch and paginate transactions
 * Only fetches when fetchTransactions() is called (lazy loading)
 */
export function useTransactions() {
  const { wallets, selectedWalletId } = useWalletStore()
  
  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    isLoading: false,
    error: null,
    page: 1,
    hasMore: false,
    total: 0,
  })

  // Get the current wallet address
  const currentAddress = useMemo(() => {
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      return wallet?.address || null
    }
    // For multiple wallets, use the first one (or could aggregate)
    return wallets.length > 0 ? wallets[0].address : null
  }, [wallets, selectedWalletId])

  // Fetch transactions from API (lazy - only called when needed)
  const fetchTransactions = useCallback(async (page = 1, reset = false) => {
    if (!currentAddress) {
      setState(prev => ({ ...prev, transactions: [], total: 0, hasMore: false }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Call our API route which will forward to the external API
      const response = await fetch(
        `/api/wallet/transactions?address=${currentAddress}&page=${page}&offset=${TRANSACTIONS_PER_PAGE}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      const transformedTransactions = transformTransactions(data.transactions || [])

      setState(prev => ({
        ...prev,
        transactions: reset 
          ? transformedTransactions 
          : [...prev.transactions, ...transformedTransactions],
        isLoading: false,
        page,
        hasMore: data.hasMore || false,
        total: data.total || transformedTransactions.length,
      }))
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      }))
    }
  }, [currentAddress])

  // Load more transactions (next page)
  const loadMore = useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      fetchTransactions(state.page + 1, false)
    }
  }, [fetchTransactions, state.isLoading, state.hasMore, state.page])

  // Refresh transactions (reset to page 1)
  const refresh = useCallback(() => {
    fetchTransactions(1, true)
  }, [fetchTransactions])

  return {
    transactions: state.transactions,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    total: state.total,
    page: state.page,
    fetchTransactions,
    loadMore,
    refresh,
  }
}
