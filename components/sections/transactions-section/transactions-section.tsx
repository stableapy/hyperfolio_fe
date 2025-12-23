"use client"

import { useState, useEffect } from "react"
import { RefreshCw, ChevronDown } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { useTransactions } from "./hooks"
import { TransactionRow } from "./transaction-row"
import { TransactionFilters } from "./transaction-filters"
import { TransactionListSkeleton } from "./transaction-list-skeleton"
import { TransactionStatsGrid } from "./transaction-stats-grid"
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
  const showSkeleton = parentLoading || (isLoading && transactions.length === 0)
  const hasData = transactions.length > 0

  if (showSkeleton) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Stats skeleton */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="h-7 sm:h-8 w-32 sm:w-40 bg-secondary rounded-sm animate-pulse" />
          <div className="h-7 sm:h-8 w-24 sm:w-32 bg-secondary rounded-sm animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="h-10 w-full bg-secondary rounded-sm animate-pulse" />

        {/* List skeleton */}
        <TerminalCard showHeader title="txs --list">
          <div className="divide-y divide-theme-border/30">
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
        <div className="font-mono text-sm text-destructive mb-2">
          <span className="text-theme-accent">&gt;</span> ERROR: LOADING_TRANSACTIONS_FAILED
        </div>
        <div className="font-mono text-xs text-theme-text-muted mb-4"># {error}</div>
        <button
          type="button"
          onClick={() => fetchTransactions(1, true)}
          className="flex items-center gap-2 px-4 py-2 mx-auto bg-theme-card-bg border border-theme-border/70 rounded-sm font-mono text-xs text-theme-accent hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-150"
        >
          <span className="text-theme-accent font-bold">&gt;</span>
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">retry</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Grid */}
      <TransactionStatsGrid
        total={total}
        filteredCount={filteredTransactions.length}
        isLoading={isLoading}
        hasData={hasData}
        onRefresh={refresh}
      />

      {/* Terminal-style Filters */}
      <TransactionFilters 
        filterType={filterType} 
        onFilterChange={setFilterType} 
      />

      {/* Transactions list - Terminal style */}
      {filteredTransactions.length > 0 ? (
        <>
          <TerminalCard showHeader title="txs --list">
            <div className="divide-y divide-theme-border/30">
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </TerminalCard>

          {/* Load More button - Terminal style */}
          {hasMore && !filterType && (
            <div className="flex justify-center pt-2 sm:pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-theme-card-bg border border-theme-border/70 rounded-sm font-mono text-xs hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-150 disabled:opacity-50"
              >
                <span className="text-theme-accent font-bold">&gt;</span>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="text-theme-text-muted uppercase tracking-wider">loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-theme-accent" />
                    <span className="text-theme-accent uppercase tracking-wider">load --more</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
            <span className="text-theme-accent">&gt;</span> NO_TRANSACTIONS_FOUND
          </div>
          <div className="font-mono text-xs sm:text-sm text-theme-text-muted">
            # {filterType ? "try adjusting your filters" : "add a wallet to view transactions"}
          </div>
        </div>
      )}
    </div>
  )
}
