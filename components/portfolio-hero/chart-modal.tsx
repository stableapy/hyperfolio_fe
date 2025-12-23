"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EscCloseButton } from "@/components/ui/esc-close-button"
import type { ChartTimeRange, ModalChartDataPoint } from "./types"

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  getModalChartData: (timeRange: ChartTimeRange) => ModalChartDataPoint[]
  isPositive: boolean
}

/**
 * Custom tooltip component for the modal chart - Terminal style
 */
function ModalChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullDate: string }; value: number }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-bg border border-theme-accent/30 rounded-sm px-3 sm:px-4 py-2 sm:py-3 shadow-2xl backdrop-blur-md">
        <p className="font-mono text-[10px] sm:text-xs text-theme-text-muted mb-1">{payload[0].payload.fullDate}</p>
        <p className="font-mono text-base sm:text-xl text-theme-accent font-bold tabular-nums">
          ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

/**
 * Modal component for expanded portfolio chart view - Terminal style
 */
export function ChartModal({ isOpen, onClose, getModalChartData, isPositive }: ChartModalProps) {
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>('30d')
  
  const modalChartData = getModalChartData(chartTimeRange)
  const strokeColor = isPositive ? "#00ff41" : "#ff4444"

  // Calculate change values
  const startVal = modalChartData[0]?.value || 0
  const endVal = modalChartData[modalChartData.length - 1]?.value || 0
  const changePercent = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0
  const isPositiveChange = changePercent >= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl max-h-[90vh] bg-theme-bg border-theme-border p-0 overflow-hidden rounded-sm"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6">
          {/* Simple header with close button */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="font-mono text-xs sm:text-sm text-theme-text-muted uppercase tracking-wider">
              portfolio --history
            </span>
            <EscCloseButton onClick={onClose} />
          </div>

            {/* Time Range Selector - Terminal style */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              <span className="font-mono text-[10px] text-theme-text-muted mr-1">--range:</span>
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartTimeRange(range)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm font-mono text-[10px] sm:text-xs transition-all border ${
                    chartTimeRange === range
                      ? 'bg-theme-accent/20 text-theme-accent border-theme-accent/40'
                      : 'bg-theme-card-bg text-theme-text-muted border-theme-border hover:border-theme-accent/30 hover:text-theme-text-primary'
                  }`}
                >
                  {range === 'all' ? 'ALL' : range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Chart Stats Summary - Terminal style boxes */}
            {modalChartData.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {/* Start Value */}
                <div className="flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
                  <div className="px-2 py-1.5 bg-theme-text-muted/10 border-r border-theme-border/50">
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-text-muted">[0]</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                    <span className="font-mono text-[10px] text-theme-text-muted">--start</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-theme-text-primary tabular-nums">
                      ${modalChartData[0]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Current Value */}
                <div className="flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
                  <div className="px-2 py-1.5 bg-theme-accent/10 border-r border-theme-accent/20">
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-accent">&gt;_</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                    <span className="font-mono text-[10px] text-theme-text-muted">--current</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-theme-accent tabular-nums">
                      ${modalChartData[modalChartData.length - 1]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Change Percent */}
                <div className={`flex items-center bg-theme-card-bg border rounded-sm overflow-hidden ${
                  isPositiveChange ? 'border-theme-accent/30' : 'border-[#ff4444]/30'
                }`}>
                  <div className={`px-2 py-1.5 border-r ${
                    isPositiveChange 
                      ? 'bg-theme-accent/10 border-theme-accent/20' 
                      : 'bg-[#ff4444]/10 border-[#ff4444]/20'
                  }`}>
                    {isPositiveChange 
                      ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-accent" />
                      : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff4444]" />
                    }
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                    <span className="font-mono text-[10px] text-theme-text-muted">--change</span>
                    <span className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
                      isPositiveChange ? 'text-theme-accent' : 'text-[#ff4444]'
                    }`}>
                      {isPositiveChange ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded Chart */}
            <div className="bg-theme-card-bg border border-theme-border/70 rounded-sm">
              <div className="h-[280px] sm:h-[350px] md:h-[400px] w-full p-2 sm:p-3">
                {modalChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={modalChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="modalChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                          <stop offset="50%" stopColor={strokeColor} stopOpacity={0.1} />
                          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill="url(#modalChartGradient)"
                        animationDuration={800}
                        activeDot={{ r: 6, fill: strokeColor, stroke: "#0a0f0f", strokeWidth: 2 }}
                      />
                      <RechartsTooltip 
                        content={<ModalChartTooltip />}
                        cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: "4 4" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-mono text-theme-accent text-sm mb-2">
                        <span className="text-theme-accent">&gt;</span> history --fetch
                      </div>
                      <p className="font-mono text-xs text-theme-text-muted"># No history data available</p>
                      <p className="font-mono text-[10px] text-theme-text-muted/60 mt-1"># Portfolio history will appear here over time</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data points info - Terminal footer */}
            {modalChartData.length > 0 && (
              <div className="mt-4 pt-3 border-t border-theme-border/50 flex items-center justify-between">
                <span className="font-mono text-[10px] sm:text-xs text-theme-text-muted">
                  # data_points: <span className="text-theme-accent">{modalChartData.length}</span>
                </span>
                <span className="font-mono text-[10px] sm:text-xs text-theme-text-muted">
                  # range: <span className="text-theme-text-primary">{modalChartData[0]?.fullDate}</span> → <span className="text-theme-accent">{modalChartData[modalChartData.length - 1]?.fullDate}</span>
                </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
