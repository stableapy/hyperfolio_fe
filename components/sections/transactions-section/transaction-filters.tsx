"use client"

import { TYPE_CONFIG } from "./constants"

interface TransactionFiltersProps {
  filterType: string | null
  onFilterChange: (type: string | null) => void
}

export function TransactionFilters({ filterType, onFilterChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#111618] border border-[#1a2225] rounded-lg">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
          filterType === null 
            ? "bg-[#00ff41] text-[#0a0e0f]" 
            : "bg-[#1a2225] text-[#708090] hover:text-[#00ff41]"
        }`}
      >
        All
      </button>
      {Object.entries(TYPE_CONFIG).map(([type, config]) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
            filterType === type 
              ? "text-[#0a0e0f]" 
              : "bg-[#1a2225] text-[#708090] hover:text-[#00ff41]"
          }`}
          style={{
            backgroundColor: filterType === type ? config.color : undefined,
          }}
        >
          {config.label}
        </button>
      ))}
    </div>
  )
}

