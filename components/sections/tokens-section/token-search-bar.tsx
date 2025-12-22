"use client"

import { Search, Layers, Grid3x3 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TokenSearchBarProps } from "./types"

/**
 * Search bar with optional grouping toggle for multi-wallet view
 */
export function TokenSearchBar({ 
  searchQuery, 
  onSearchChange, 
  isGrouped, 
  onGroupedChange,
  showGroupToggle 
}: TokenSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
        />
      </div>

      {/* Group/Ungroup Toggle - Only show in multi-wallet view */}
      {showGroupToggle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onGroupedChange(!isGrouped)}
                className={`px-3 sm:px-4 py-2.5 sm:py-2 bg-[#111618] border rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-2 ${
                  isGrouped 
                    ? "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10" 
                    : "border-[#1a2225] text-[#708090] hover:border-[#708090]"
                }`}
              >
                {isGrouped ? <Layers className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                <span className="sm:inline">{isGrouped ? "Grouped" : "Ungrouped"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
              <div className="font-mono text-xs text-[#708090]">
                {isGrouped ? "Click to show tokens by wallet" : "Click to group same tokens together"}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

