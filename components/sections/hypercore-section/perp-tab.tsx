"use client"

import { safeParseFloat } from "./utils"
import type { PerpTabProps } from "./types"

/**
 * Perpetual positions tab content with terminal styling
 */
export function PerpTab({ marginBalance }: PerpTabProps) {
  const margin = safeParseFloat(marginBalance)
  
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
        NO PERP POSITIONS
      </div>
      <div className="font-mono text-xs sm:text-sm text-theme-text-muted mb-4">
        <span className="text-[#ffb000]">&gt;</span> hypercore --perp returns empty
      </div>
      
      {/* Margin Balance - Terminal style badge */}
      <div className="inline-flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="px-2 py-1.5 bg-[#ffb000]/10 border-r border-[#ffb000]/20">
          <span className="font-mono text-[10px] sm:text-xs font-bold text-[#ffb000]">$</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="font-mono text-[10px] text-theme-text-muted">--margin</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-[#ffb000] tabular-nums">
            ${margin.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
