"use client"

import { Grid3x3, List } from "lucide-react"
import type { NFTSearchControlsProps } from "./types"

/**
 * Terminal-style search input and view mode toggle controls
 */
export function NFTSearchControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: NFTSearchControlsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Terminal-style Search Input */}
      <div className="relative flex-1 bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="flex items-center">
          {/* Terminal prompt */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-theme-bg/50 border-r border-theme-border/50">
            <span className="font-mono text-xs text-[#b4ff00] font-bold">&gt;</span>
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider hidden sm:inline">find</span>
          </div>
          <input
            type="text"
            placeholder="search nfts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-transparent font-mono text-sm text-theme-accent placeholder:text-theme-text-muted/50 focus:outline-none"
          />
          {/* Search indicator */}
          {searchQuery && (
            <div className="px-3 py-2 border-l border-theme-border/50">
              <span className="font-mono text-[10px] text-theme-text-muted">
                /{searchQuery}/i
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* View Mode Toggle - Terminal style */}
      <div className="flex bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`px-2.5 py-2 transition-all duration-150 border-r border-theme-border/50 ${
            viewMode === "grid" 
              ? "bg-[#b4ff00]/10 text-[#b4ff00]" 
              : "text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50"
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`px-2.5 py-2 transition-all duration-150 ${
            viewMode === "list" 
              ? "bg-[#b4ff00]/10 text-[#b4ff00]" 
              : "text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

