import { useMemo } from "react"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTransactions } from "@/lib/utils/data-transformers"
import { MOCK_TRANSACTIONS } from "../constants"
import type { Transaction } from "../types"

/**
 * Hook to get transactions from selected wallet or all wallets
 */
export function useTransactions() {
  const { wallets, walletData, selectedWalletId } = useWalletStore()

  const transactions = useMemo<Transaction[]>(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.transactions) {
        return transformTransactions(walletData[wallet.address].transactions)
      }
    } else {
      // Aggregate transactions from all wallets
      const allTransactions: Transaction[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.transactions) {
          allTransactions.push(...transformTransactions(walletData[wallet.address].transactions))
        }
      })
      
      if (allTransactions.length > 0) {
        return allTransactions
      }
    }
    
    // Fallback to mock transactions
    return MOCK_TRANSACTIONS
  }, [wallets, walletData, selectedWalletId])

  return { transactions }
}

