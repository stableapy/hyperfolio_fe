"use client"

import { Grid3x3, List, Search } from "lucide-react"
import type { NFTSearchControlsProps } from "./types"

/**
 * Search input and view mode toggle controls
 */
export function NFTSearchControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: NFTSearchControlsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
        <input
          type="text"
          placeholder="Search NFTs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
        />
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex gap-1 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`p-2 rounded transition-colors ${
            viewMode === "grid" ? "bg-[#1a2225] text-[#00ff41]" : "text-[#708090] hover:text-[#00ff41]"
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`p-2 rounded transition-colors ${
            viewMode === "list" ? "bg-[#1a2225] text-[#00ff41]" : "text-[#708090] hover:text-[#00ff41]"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

