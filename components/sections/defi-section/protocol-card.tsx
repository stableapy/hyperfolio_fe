"use client"

import { TrendingUp, ChevronDown } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PositionItem } from "./position-item"
import { TYPE_LABELS, TYPE_COLORS, type PositionType } from "./constants"
import type { ProtocolCardProps } from "./types"

/**
 * Expandable protocol card component showing grouped positions
 * Terminal-style layout with prompt indicators
 */
export function ProtocolCard({
  protocol,
  isExpanded,
  onToggle,
  selectedWalletId,
}: ProtocolCardProps) {
  return (
    <TerminalCard className="hover:border-theme-accent/30 transition-all duration-150">
      {/* Protocol Header */}
      <button 
        type="button"
        className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-150 text-left border-l-2 border-l-transparent hover:border-l-theme-accent" 
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Terminal prompt + Protocol info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Terminal Prompt */}
            <span className="font-mono text-sm font-bold text-theme-accent select-none flex-shrink-0">&gt;</span>
            
            <img
              src={protocol.logo || "/placeholder.svg"}
              alt={protocol.name}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded flex-shrink-0 ring-1 ring-theme-border"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
              <span className="font-mono text-xs sm:text-sm text-theme-accent font-bold truncate tracking-wide">{protocol.name}</span>
              <span className="font-mono text-[9px] sm:text-[10px] text-theme-text-muted bg-theme-bg/50 border border-theme-border/50 px-1 sm:px-1.5 py-0.5 rounded">
                [{protocol.positions.length}]
              </span>
            </div>
          </div>

          {/* Right: Value + APY + Chevron */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Protocol-level APY Badge */}
            {protocol.stats?.weightedApyPercent && protocol.stats.weightedApyPercent > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-theme-accent/10 border border-theme-accent/20 rounded flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-theme-accent" />
                      <span className="font-mono text-[10px] sm:text-xs text-theme-accent tabular-nums">
                        {Number(protocol.stats.weightedApyPercent).toFixed(1)}%
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme-bg border border-theme-border p-3">
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-theme-accent font-bold mb-2">
                        <span className="text-theme-accent">&gt;</span> yield --estimate
                      </div>
                      {protocol.stats.estimatedYield && (
                        <>
                          <div className="flex justify-between gap-4">
                            <span className="text-theme-text-muted">daily:</span>
                            <span className="text-theme-text-primary tabular-nums">${protocol.stats.estimatedYield.daily}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-theme-text-muted">weekly:</span>
                            <span className="text-theme-text-primary tabular-nums">${protocol.stats.estimatedYield.weekly}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-theme-text-muted">monthly:</span>
                            <span className="text-theme-text-primary tabular-nums">${protocol.stats.estimatedYield.monthly}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Value - terminal style */}
            <div className="flex items-center gap-1 min-w-[60px] justify-end">
              <span className="font-mono text-[10px] text-theme-text-muted">=</span>
              <span className="font-mono text-xs sm:text-sm text-theme-accent font-bold tabular-nums">
                ${protocol.totalValue >= 1000 ? `${(protocol.totalValue / 1000).toFixed(1)}K` : protocol.totalValue.toFixed(2)}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-text-muted transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Positions List - Grouped by Type */}
      {isExpanded && (
        <div className="px-2 sm:px-3 pb-2 sm:pb-3 border-t border-theme-border/50 pt-2">
          {/* Group positions by type */}
          {(() => {
            const positionsByType = protocol.positions.reduce((acc, pos) => {
              if (!acc[pos.type]) acc[pos.type] = []
              acc[pos.type].push(pos)
              return acc
            }, {} as Record<string, typeof protocol.positions>)

            return Object.entries(positionsByType).map(([type, typePositions]) => (
              <div key={type} className="mb-2 last:mb-0">
                {/* Type Header - shown once per type, terminal style */}
                <div className="flex items-center gap-1.5 mb-1 py-1 ml-4 sm:ml-5">
                  <span className="font-mono text-[9px] text-theme-text-muted">#</span>
                  <span
                    className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider"
                    style={{ color: TYPE_COLORS[type as PositionType] }}
                  >
                    {TYPE_LABELS[type as PositionType]}
                  </span>
                  {typePositions.length > 1 && (
                    <span className="font-mono text-[9px] sm:text-[10px] text-theme-text-muted">
                      [{typePositions.length}]
                    </span>
                  )}
                </div>

                {/* Positions under this type */}
                {typePositions.map((position) => (
                  <PositionItem
                    key={position.id}
                    position={position}
                    showWalletIndicator={!selectedWalletId}
                  />
                ))}
              </div>
            ))
          })()}
        </div>
      )}
    </TerminalCard>
  )
}

