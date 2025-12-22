"use client"

import { TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetBreakdown, ApyData } from "./types"
import { formatCompactValue } from "./utils"

interface StatPillsProps {
  isLoading: boolean
  hasData: boolean
  isPositive: boolean
  change24h: number
  privacyMode: boolean
  breakdown: AssetBreakdown[]
  apyData: ApyData
}

/**
 * Component displaying portfolio statistics as pills
 */
export function StatPills({
  isLoading,
  hasData,
  isPositive,
  change24h,
  privacyMode,
  breakdown,
  apyData,
}: StatPillsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {/* 24h Change - Inline skeleton */}
        {isLoading && !hasData ? (
          <div className="h-7 sm:h-8 w-24 sm:w-28 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
        ) : (
          <div 
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all duration-300 shrink-0 ${
              isPositive 
                ? "bg-[#00ff41]/10 border-[#00ff41]/20" 
                : "bg-[#ff4444]/10 border-[#ff4444]/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00ff41]" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff4444]" />
            )}
            <span className={`font-mono text-[10px] sm:text-xs font-semibold ${isPositive ? "text-[#00ff41]" : "text-[#ff4444]"}`}>
              {privacyMode ? "•••" : `${isPositive ? "+" : ""}${change24h.toFixed(2)}%`}
            </span>
            <span className="font-mono text-[8px] sm:text-[10px] text-[#708090]">24h</span>
          </div>
        )}
        
        {/* APY Pill with Tooltip - Only show when data is available */}
        {apyData.hasPositions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border cursor-help transition-all duration-300 shrink-0 bg-[#a855f7]/10 border-[#a855f7]/20 hover:border-[#a855f7]/40"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#a855f7]" />
                <span className="font-mono text-[10px] sm:text-xs font-semibold text-[#a855f7]">
                  {privacyMode ? "•••" : `${apyData.weightedApy.toFixed(1)}%`}
                </span>
                <span className="font-mono text-[8px] sm:text-[10px] text-[#708090]">APY</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#0d1214] border-[#1a2225] p-2 sm:p-3 max-w-[280px] sm:max-w-xs">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="font-mono text-[9px] sm:text-[10px] text-[#708090] uppercase tracking-wider">Estimated Yield</div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#708090]">Daily</div>
                    <div className="font-mono text-[10px] sm:text-xs text-[#00ff41] font-semibold">
                      {privacyMode ? "•••" : `$${apyData.estimatedYield.daily.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#708090]">Weekly</div>
                    <div className="font-mono text-[10px] sm:text-xs text-[#00ff41] font-semibold">
                      {privacyMode ? "•••" : `$${apyData.estimatedYield.weekly.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#708090]">Monthly</div>
                    <div className="font-mono text-[10px] sm:text-xs text-[#00ff41] font-semibold">
                      {privacyMode ? "•••" : `$${apyData.estimatedYield.monthly.toFixed(2)}`}
                    </div>
                  </div>
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#708090] pt-1.5 sm:pt-2 border-t border-[#1a2225]">
                  Based on current DeFi positions APY
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Breakdown Pills - Skeleton placeholders when loading, real data when available */}
        {isLoading && breakdown.length === 0 ? (
          // Show skeleton placeholders for breakdown
          <>
            <div className="h-7 sm:h-8 w-20 sm:w-24 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
            <div className="h-7 sm:h-8 w-24 sm:w-28 bg-[#1a2225] rounded-full animate-pulse shrink-0" />
            <div className="h-7 sm:h-8 w-20 sm:w-24 bg-[#1a2225] rounded-full animate-pulse shrink-0 hidden sm:block" />
          </>
        ) : (
          breakdown.map((item) => (
            <div
              key={item.category}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#1a2225]/60 border border-[#1a2225] hover:border-[#2a3235] transition-all duration-300 shrink-0"
            >
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-mono text-[8px] sm:text-[10px] text-[#708090]">{item.category}</span>
              <span className="font-mono text-[10px] sm:text-xs text-white font-medium">
                {formatCompactValue(item.value)}
              </span>
              <span className="font-mono text-[8px] sm:text-[10px] text-[#708090] hidden min-[400px]:inline">
                {privacyMode ? "•" : `${item.percentage.toFixed(0)}%`}
              </span>
            </div>
          ))
        )}
      </div>
    </TooltipProvider>
  )
}

