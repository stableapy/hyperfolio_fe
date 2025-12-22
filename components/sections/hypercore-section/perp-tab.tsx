"use client"

import { safeParseFloat } from "./utils"
import type { PerpTabProps } from "./types"

/**
 * Perpetual positions tab content
 */
export function PerpTab({ marginBalance }: PerpTabProps) {
  const margin = safeParseFloat(marginBalance)
  
  return (
    <div className="text-center py-6 sm:py-8">
      <div className="font-mono text-xs sm:text-sm text-[#708090]">NO PERP POSITIONS</div>
      <div className="font-mono text-[10px] sm:text-xs text-[#556070] mt-1 sm:mt-2">
        Margin: ${margin.toFixed(2)}
      </div>
    </div>
  )
}

