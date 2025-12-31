'use client';

import { Layers, Grid3x3 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface PointsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isGrouped: boolean;
  onGroupedChange: (grouped: boolean) => void;
  showGroupToggle: boolean;
}

/**
 * Terminal-style search bar with optional grouping toggle
 */
export function PointsSearchBar({
  searchQuery,
  onSearchChange,
  isGrouped,
  onGroupedChange,
  showGroupToggle,
}: PointsSearchBarProps) {
  return (
    <div className="mb-3 flex flex-col items-stretch gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-3">
      {/* Terminal-style Search Input */}
      <div className="bg-theme-card-bg border-theme-border/70 relative flex-1 overflow-hidden rounded-sm border">
        <div className="flex items-center">
          {/* Terminal prompt */}
          <div className="bg-theme-bg/50 border-theme-border/50 flex items-center gap-1.5 border-r px-3 py-2">
            <span className="text-theme-accent font-mono text-xs font-bold">
              &gt;
            </span>
            <span className="text-theme-text-muted hidden font-mono text-[10px] tracking-wider uppercase sm:inline">
              grep
            </span>
          </div>
          <input
            type="text"
            placeholder="search protocols..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-theme-accent placeholder:text-theme-text-muted/50 flex-1 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
          />
          {/* Search indicator */}
          {searchQuery && (
            <div className="border-theme-border/50 border-l px-3 py-2">
              <span className="text-theme-text-muted font-mono text-[10px]">
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
                className={`bg-theme-card-bg flex items-center justify-center gap-2 rounded-sm border px-3 py-2 font-mono text-xs transition-all duration-150 ${
                  isGrouped
                    ? 'border-theme-accent/50 text-theme-accent hover:bg-theme-accent/10'
                    : 'border-theme-border/70 text-theme-text-muted hover:border-theme-text-secondary hover:text-theme-text-secondary'
                }`}
              >
                <span className="text-theme-accent font-bold">&gt;</span>
                {isGrouped ? (
                  <Layers className="h-3.5 w-3.5" />
                ) : (
                  <Grid3x3 className="h-3.5 w-3.5" />
                )}
                <span className="tracking-wider uppercase">
                  {isGrouped ? 'grouped' : 'split'}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-theme-bg border-theme-border border p-2">
              <div className="text-theme-text-secondary font-mono text-xs">
                <span className="text-theme-accent">&gt;</span>{' '}
                {isGrouped
                  ? 'points --split-by-wallet'
                  : 'points --group-by-protocol'}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
