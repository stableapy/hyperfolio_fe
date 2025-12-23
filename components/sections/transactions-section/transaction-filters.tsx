"use client"

import { TYPE_CONFIG } from "./constants"

interface TransactionFiltersProps {
  filterType: string | null
  onFilterChange: (type: string | null) => void
}

/**
 * Terminal-style filter bar for transactions
 * Matches the styling from tokens-section search bar
 */
export function TransactionFilters({ filterType, onFilterChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Terminal-style Filter Container */}
      <div className="relative flex-1 bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="flex items-center">
          {/* Terminal prompt */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-theme-bg/50 border-r border-theme-border/50">
            <span className="font-mono text-xs text-theme-accent font-bold">&gt;</span>
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider hidden sm:inline">filter</span>
          </div>
          
          {/* Filter buttons */}
          <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide">
            {/* All filter */}
            <button
              type="button"
              onClick={() => onFilterChange(null)}
              className={`px-2.5 py-1 rounded-sm font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                filterType === null
                  ? "bg-theme-accent/20 text-theme-accent border border-theme-accent/30"
                  : "text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/5 border border-transparent"
              }`}
            >
              all
            </button>

            {/* Type filters */}
            {Object.entries(TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => onFilterChange(type)}
                className={`px-2.5 py-1 rounded-sm font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-150 whitespace-nowrap border ${
                  filterType === type
                    ? "border-current"
                    : "text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/5 border-transparent"
                }`}
                style={{
                  backgroundColor: filterType === type ? `${config.color}20` : undefined,
                  color: filterType === type ? config.color : undefined,
                  borderColor: filterType === type ? `${config.color}50` : undefined,
                }}
              >
                {config.label.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {filterType && (
            <div className="px-3 py-2 border-l border-theme-border/50 hidden sm:block">
              <span className="font-mono text-[10px] text-theme-text-muted">
                --type={filterType}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
