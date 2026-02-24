'use client';

import { useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWalletStore } from '@/lib/store/wallet-store';

import { useTransactions } from './hooks';
import { TransactionRow } from './transaction-row';
import { TransactionFilters } from './transaction-filters';
import { TransactionListSkeleton } from './transaction-list-skeleton';
import { TransactionStatsGrid } from './transaction-stats-grid';
import type { TransactionsSectionProps } from './types';

export function TransactionsSection({
  isLoading: parentLoading = false,
}: TransactionsSectionProps) {
  const { privacyMode } = useWalletStore();

  const {
    transactions,
    isLoading,
    error,
    hasMore,
    total,
    fetchTransactions,
    loadMore,
    refresh,
  } = useTransactions();

  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredTransactions = filterType
    ? transactions.filter((tx) => tx.type === filterType)
    : transactions;

  // Show skeleton loading state on first load
  const showSkeleton =
    parentLoading || (isLoading && transactions.length === 0);
  const hasData = transactions.length > 0;

  if (showSkeleton) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Stats skeleton */}
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
          <div className="bg-secondary h-7 w-32 animate-pulse rounded-sm sm:h-8 sm:w-40" />
          <div className="bg-secondary h-7 w-24 animate-pulse rounded-sm sm:h-8 sm:w-32" />
        </div>

        {/* Filters skeleton */}
        <div className="bg-secondary h-10 w-full animate-pulse rounded-sm" />

        {/* List skeleton */}
        <TerminalCard showHeader title="txs --list">
          <div className="divide-theme-border/30 divide-y">
            <TransactionListSkeleton count={8} />
          </div>
        </TerminalCard>
      </div>
    );
  }

  // Show error state
  if (error && transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-destructive mb-2 font-mono text-sm">
          <span className="text-theme-accent">&gt;</span> ERROR:
          LOADING_TRANSACTIONS_FAILED
        </div>
        <div className="text-theme-text-muted mb-4 font-mono text-xs">
          # {error instanceof Error ? error.message : String(error)}
        </div>
        <button
          type="button"
          onClick={() => fetchTransactions(1, true)}
          className="bg-theme-card-bg border-theme-border/70 text-theme-accent hover:border-theme-accent/50 hover:bg-theme-accent/5 mx-auto flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-150"
        >
          <span className="text-theme-accent font-bold">&gt;</span>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="tracking-wider uppercase">retry</span>
        </button>
      </div>
    );
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
            <div className="divide-theme-border/30 divide-y">
              {filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  privacyMode={privacyMode}
                />
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
                className="bg-theme-card-bg border-theme-border/70 hover:border-theme-accent/50 hover:bg-theme-accent/5 flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-150 disabled:opacity-50 sm:px-5 sm:py-2.5"
              >
                <span className="text-theme-accent font-bold">&gt;</span>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="text-theme-text-muted tracking-wider uppercase">
                      loading...
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="text-theme-accent h-3.5 w-3.5" />
                    <span className="text-theme-accent tracking-wider uppercase">
                      load --more
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center sm:py-12">
          <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
            <span className="text-theme-accent">&gt;</span>{' '}
            NO_TRANSACTIONS_FOUND
          </div>
          <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
            #{' '}
            {filterType
              ? 'try adjusting your filters'
              : 'add a wallet to view transactions'}
          </div>
        </div>
      )}
    </div>
  );
}
