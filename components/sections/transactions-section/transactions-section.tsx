"use client"

import { useState, useEffect } from "react"
import { Filter, RefreshCw, ChevronDown } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { useTransactions } from "./hooks"
import { TransactionRow } from "./transaction-row"
import { TransactionFilters } from "./transaction-filters"
import { TransactionListSkeleton } from "./transaction-list-skeleton"
import type { TransactionsSectionProps } from "./types"

export function TransactionsSection({ isLoading: parentLoading = false }: TransactionsSectionProps) {
  const { 
    transactions, 
    isLoading, 
    error, 
    hasMore, 
    total,
    fetchTransactions, 
    loadMore,
    refresh 
  } = useTransactions()
  
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Fetch transactions on mount (lazy load when section is viewed)
  useEffect(() => {
    if (!hasFetched) {
      fetchTransactions(1, true)
      setHasFetched(true)
    }
  }, [fetchTransactions, hasFetched])

  const filteredTransactions = filterType 
    ? transactions.filter((tx) => tx.type === filterType) 
    : transactions

  // Show skeleton loading state on first load
  if (parentLoading || (isLoading && transactions.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-40 bg-[#1a2225] rounded animate-pulse" />
          <div className="h-9 w-24 bg-[#1a2225] rounded-lg animate-pulse" />
        </div>
        <TerminalCard>
          <div className="divide-y divide-[#1a2225]">
            <TransactionListSkeleton count={8} />
          </div>
        </TerminalCard>
      </div>
    )
  }

  // Show error state
  if (error && transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="font-mono text-[#ff4444] mb-2">ERROR LOADING TRANSACTIONS</div>
        <div className="font-mono text-sm text-[#708090] mb-4">{error}</div>
        <button
          type="button"
          onClick={() => fetchTransactions(1, true)}
          className="flex items-center gap-2 px-4 py-2 mx-auto bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with count and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-sm text-[#708090]">
          Showing {filteredTransactions.length}{total > 0 ? ` of ${total}` : ''} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#708090] hover:text-[#00ff41] hover:border-[#00ff41] transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TransactionFilters 
          filterType={filterType} 
          onFilterChange={setFilterType} 
        />
      )}

      {/* Transactions list */}
      {filteredTransactions.length > 0 ? (
        <>
          <TerminalCard>
            <div className="divide-y divide-[#1a2225]">
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </TerminalCard>

          {/* Load More button */}
          {hasMore && !filterType && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Load More Transactions
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="font-mono text-[#708090] mb-2">NO TRANSACTIONS FOUND</div>
          <div className="font-mono text-sm text-[#708090]">
            {filterType ? "Try adjusting your filters" : "Add a wallet to view transactions"}
          </div>
        </div>
      )}
    </div>
  )
}
