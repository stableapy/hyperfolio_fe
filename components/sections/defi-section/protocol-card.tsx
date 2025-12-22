"use client"

import { TrendingUp, ChevronDown } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PositionItem } from "./position-item"
import { TYPE_LABELS, TYPE_COLORS, type PositionType } from "./constants"
import type { ProtocolCardProps } from "./types"

/**
 * Expandable protocol card component showing grouped positions
 */
export function ProtocolCard({
  protocol,
  isExpanded,
  onToggle,
  selectedWalletId,
}: ProtocolCardProps) {
  return (
    <TerminalCard className="hover:border-[#1a2225] transition-colors">
      {/* Protocol Header */}
      <button 
        type="button"
        className="w-full p-2.5 sm:p-3  hover:bg-[#111618] transition-colors text-left" 
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Protocol info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <img
              src={protocol.logo || "/placeholder.svg"}
              alt={protocol.name}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded flex-shrink-0"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
              <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">{protocol.name}</span>
              <span className="font-mono text-[10px] sm:text-xs text-[#708090]">
                {protocol.positions.length} position{protocol.positions.length > 1 ? 's' : ''}
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
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00ff41]" />
                      <span className="font-mono text-[10px] sm:text-xs text-[#00ff41]">
                        {Number(protocol.stats.weightedApyPercent).toFixed(1)}%
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                    <div className="font-mono text-xs space-y-1">
                      {protocol.stats.estimatedYield && (
                        <>
                          <div className="text-[#00ff41] font-bold mt-2 mb-1">Estimated Yield</div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#708090]">Daily:</span>
                            <span className="text-white">${protocol.stats.estimatedYield.daily}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#708090]">Weekly:</span>
                            <span className="text-white">${protocol.stats.estimatedYield.weekly}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#708090]">Monthly:</span>
                            <span className="text-white">${protocol.stats.estimatedYield.monthly}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Value */}
            <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
              ${protocol.totalValue >= 1000 ? `${(protocol.totalValue / 1000).toFixed(1)}K` : protocol.totalValue.toFixed(2)}
            </div>

            <ChevronDown className={`w-4 h-4 text-[#708090] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Positions List - Grouped by Type */}
      {isExpanded && (
        <div className="px-2 sm:px-4 pb-2 sm:pb-3 border-t border-[#1a2225] pt-2">
          {/* Group positions by type */}
          {(() => {
            const positionsByType = protocol.positions.reduce((acc, pos) => {
              if (!acc[pos.type]) acc[pos.type] = []
              acc[pos.type].push(pos)
              return acc
            }, {} as Record<string, typeof protocol.positions>)

            return Object.entries(positionsByType).map(([type, typePositions]) => (
              <div key={type} className="mb-2 last:mb-0">
                {/* Type Header - shown once per type */}
                <div className="flex items-center gap-2 mb-1 py-1">
                  <span
                    className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider"
                    style={{ color: TYPE_COLORS[type as PositionType] }}
                  >
                    {TYPE_LABELS[type as PositionType]}
                  </span>
                  {typePositions.length > 1 && (
                    <span className="font-mono text-[9px] sm:text-[10px] text-[#708090]">
                      ({typePositions.length})
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

