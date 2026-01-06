"use client"

import { RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatPill, StatPillSkeleton } from "@/components/ui/stat-pill"

interface TransactionStatsGridProps {
  total: number
  filteredCount: number
  isLoading: boolean
  hasData: boolean
  onRefresh: () => void
}

/**
 * Terminal-style stats grid for transactions section
 * Displays total count and refresh action
 */
export function TransactionStatsGrid({
  total,
  filteredCount,
  isLoading,
  hasData,
  onRefresh,
}: TransactionStatsGridProps) {
  const showSkeleton = isLoading && !hasData

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* Transaction Count */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-32 sm:w-40" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon=">_"
                color="accent"
                label="--total"
                value={total}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-1">
                <div className="text-theme-accent font-mono text-xs font-bold">
                  <span className="text-theme-accent">&gt;</span> txs
                  --total
                </div>
                <div className="text-theme-text-muted font-mono text-[9px]">
                  Total number of transactions across all wallets
                </div>
                <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                  {total}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Showing Count */}
        {showSkeleton ? (
          <StatPillSkeleton width="w-28 sm:w-36" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatPill
                icon="#"
                color="cyan"
                label="showing:"
                value={filteredCount}
                interactive
                asButton
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-theme-bg border-theme-border max-w-xs border p-3"
            >
              <div className="space-y-1">
                <div className="text-theme-cyan font-mono text-xs font-bold">
                  <span className="text-theme-cyan">&gt;</span> txs
                  --filtered
                </div>
                <div className="text-theme-text-muted font-mono text-[9px]">
                  Number of transactions matching current filters
                </div>
                <div className="text-theme-text-primary border-theme-border/50 border-t pt-1 font-mono text-[10px] tabular-nums">
                  {filteredCount}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Refresh Button */}
        {!showSkeleton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-card-bg border border-theme-border/70 rounded-sm font-mono text-xs hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-150 disabled:opacity-50"
              >
                <span className="text-theme-accent font-bold">&gt;</span>
                <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-accent ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-theme-text-muted uppercase tracking-wider hidden sm:inline">sync</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-theme-bg border border-theme-border p-2">
              <div className="font-mono text-xs text-theme-text-secondary">
                <span className="text-theme-accent">&gt;</span> txs --refresh
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
