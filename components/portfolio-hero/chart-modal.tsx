"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ChartTimeRange, ModalChartDataPoint } from "./types"

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  getModalChartData: (timeRange: ChartTimeRange) => ModalChartDataPoint[]
  isPositive: boolean
}

/**
 * Custom tooltip component for the modal chart
 */
function ModalChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullDate: string }; value: number }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0f0f]/95 border border-[#00ff41]/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-2xl backdrop-blur-md">
        <p className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1">{payload[0].payload.fullDate}</p>
        <p className="font-mono text-base sm:text-xl text-[#00ff41] font-bold">
          ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

/**
 * Modal component for expanded portfolio chart view
 */
export function ChartModal({ isOpen, onClose, getModalChartData, isPositive }: ChartModalProps) {
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>('30d')
  
  const modalChartData = getModalChartData(chartTimeRange)
  const strokeColor = isPositive ? "#00ff41" : "#ff4444"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl max-h-[90vh] bg-[#0d1214] border-[#1a2225] p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-mono text-lg sm:text-xl text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff41]" />
                  Portfolio History
                </DialogTitle>
                <p className="font-mono text-[10px] sm:text-xs text-[#708090] mt-1">
                  Track your portfolio value over time
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#708090] hover:text-white"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </DialogHeader>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setChartTimeRange(range)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-[10px] sm:text-xs transition-all ${
                  chartTimeRange === range
                    ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/40'
                    : 'bg-[#1a2225]/60 text-[#708090] border border-[#1a2225] hover:border-[#2a3235] hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Chart Stats Summary */}
          {modalChartData.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-[#1a2225]/40 rounded-lg p-3 sm:p-4 border border-[#1a2225]">
                <div className="font-mono text-[9px] sm:text-[10px] text-[#708090] uppercase tracking-wider mb-1">Start Value</div>
                <div className="font-mono text-sm sm:text-lg text-white font-semibold">
                  ${modalChartData[0]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-[#1a2225]/40 rounded-lg p-3 sm:p-4 border border-[#1a2225]">
                <div className="font-mono text-[9px] sm:text-[10px] text-[#708090] uppercase tracking-wider mb-1">Current Value</div>
                <div className="font-mono text-sm sm:text-lg text-[#00ff41] font-semibold">
                  ${modalChartData[modalChartData.length - 1]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-[#1a2225]/40 rounded-lg p-3 sm:p-4 border border-[#1a2225]">
                <div className="font-mono text-[9px] sm:text-[10px] text-[#708090] uppercase tracking-wider mb-1">Change</div>
                {(() => {
                  const startVal = modalChartData[0]?.value || 0
                  const endVal = modalChartData[modalChartData.length - 1]?.value || 0
                  const changePercent = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0
                  const isPositiveChange = changePercent >= 0
                  return (
                    <div className={`font-mono text-sm sm:text-lg font-semibold flex items-center gap-1 ${isPositiveChange ? 'text-[#00ff41]' : 'text-[#ff4444]'}`}>
                      {isPositiveChange ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {isPositiveChange ? '+' : ''}{changePercent.toFixed(2)}%
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Expanded Chart */}
          <div className="h-[280px] sm:h-[350px] md:h-[400px] w-full">
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
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-[#708090] mx-auto mb-3" />
                  <p className="font-mono text-sm text-[#708090]">No history data available</p>
                  <p className="font-mono text-xs text-[#708090]/60 mt-1">Portfolio history will appear here over time</p>
                </div>
              </div>
            )}
          </div>

          {/* Data points info */}
          {modalChartData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#1a2225] flex items-center justify-between">
              <span className="font-mono text-[10px] sm:text-xs text-[#708090]">
                {modalChartData.length} data points
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#708090]">
                {modalChartData[0]?.fullDate} — {modalChartData[modalChartData.length - 1]?.fullDate}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

