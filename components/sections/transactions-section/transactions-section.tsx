"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { useTransactions } from "./hooks"
import { TransactionRow } from "./transaction-row"
import { TransactionFilters } from "./transaction-filters"
import type { TransactionsSectionProps } from "./types"

export function TransactionsSection({ isLoading = false }: TransactionsSectionProps) {
  const { transactions } = useTransactions()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredTransactions = filterType 
    ? transactions.filter((tx) => tx.type === filterType) 
    : transactions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-sm text-[#708090]">
          Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <TransactionFilters 
          filterType={filterType} 
          onFilterChange={setFilterType} 
        />
      )}

      <TerminalCard>
        <div className="divide-y divide-[#1a2225]">
          {filteredTransactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      </TerminalCard>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="font-mono text-[#708090] mb-2">NO TRANSACTIONS FOUND</div>
          <div className="font-mono text-sm text-[#708090]">Try adjusting your filters</div>
        </div>
      )}
    </div>
  )
}

