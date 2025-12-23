"use client"

import { Layers, Grid3x3 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TokenSearchBarProps } from "./types"

/**
 * Terminal-style search bar with optional grouping toggle
 */
export function TokenSearchBar({ 
  searchQuery, 
  onSearchChange, 
  isGrouped, 
  onGroupedChange,
  showGroupToggle 
}: TokenSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Terminal-style Search Input */}
      <div className="relative flex-1 bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
        <div className="flex items-center">
          {/* Terminal prompt */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-theme-bg/50 border-r border-theme-border/50">
            <span className="font-mono text-xs text-theme-accent font-bold">&gt;</span>
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider hidden sm:inline">grep</span>
          </div>
          <input
            type="text"
            placeholder="search tokens..."
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

      {/* Group/Ungroup Toggle - Only show in multi-wallet view */}
      {showGroupToggle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onGroupedChange(!isGrouped)}
                className={`px-3 py-2 bg-theme-card-bg border rounded-sm font-mono text-xs transition-all duration-150 flex items-center justify-center gap-2 ${
                  isGrouped 
                    ? "border-theme-accent/50 text-theme-accent hover:bg-theme-accent/10" 
                    : "border-theme-border/70 text-theme-text-muted hover:border-theme-text-secondary hover:text-theme-text-secondary"
                }`}
              >
                <span className="text-theme-accent font-bold">&gt;</span>
                {isGrouped ? <Layers className="w-3.5 h-3.5" /> : <Grid3x3 className="w-3.5 h-3.5" />}
                <span className="uppercase tracking-wider">{isGrouped ? "grouped" : "split"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-theme-bg border border-theme-border p-2">
              <div className="font-mono text-xs text-theme-text-secondary">
                <span className="text-theme-accent">&gt;</span> {isGrouped ? "tokens --split-by-wallet" : "tokens --group-by-symbol"}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

