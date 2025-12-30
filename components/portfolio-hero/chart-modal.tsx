'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EscCloseButton } from '@/components/ui/esc-close-button';
import type { ChartTimeRange, ModalChartDataPoint } from './types';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  getModalChartData: (timeRange: ChartTimeRange) => ModalChartDataPoint[];
  isPositive: boolean;
  privacyMode?: boolean;
}

/**
 * Custom tooltip component for the modal chart - Terminal style
 */
function ModalChartTooltip({
  active,
  payload,
  privacyMode,
}: {
  active?: boolean;
  payload?: Array<{ payload: { fullDate: string }; value: number }>;
  privacyMode?: boolean;
}) {
  if (active && payload && payload.length) {
    const displayValue = privacyMode
      ? '••••••'
      : `$${payload[0].value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

    return (
      <div className="bg-theme-bg border-theme-accent/30 rounded-sm border px-3 py-2 shadow-2xl backdrop-blur-md sm:px-4 sm:py-3">
        <p className="text-theme-text-muted mb-1 font-mono text-[10px] sm:text-xs">
          {payload[0].payload.fullDate}
        </p>
        <p className="text-theme-accent font-mono text-base font-bold tabular-nums sm:text-xl">
          {displayValue}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Modal component for expanded portfolio chart view - Terminal style
 */
export function ChartModal({
  isOpen,
  onClose,
  getModalChartData,
  isPositive,
  privacyMode,
}: ChartModalProps) {
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>('30d');

  const modalChartData = getModalChartData(chartTimeRange);
  const strokeColor = isPositive ? '#00ff41' : '#ff4444';

  // Calculate change values
  const startVal = modalChartData[0]?.value || 0;
  const endVal = modalChartData[modalChartData.length - 1]?.value || 0;
  const changePercent =
    startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
  const isPositiveChange = changePercent >= 0;

  // Format values with privacy mode support
  const formatValue = (value: number) => {
    if (privacyMode) return '••••••';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (percent: number, positive?: boolean) => {
    if (privacyMode) return '•••';
    const sign = positive === false ? '' : percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-theme-bg border-theme-border max-h-[90vh] overflow-hidden rounded-sm p-0 sm:max-w-4xl"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6">
          {/* Simple header with close button */}
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <span className="text-theme-text-muted font-mono text-xs tracking-wider uppercase sm:text-sm">
              portfolio --history
            </span>
            <EscCloseButton onClick={onClose} />
          </div>

          {/* Time Range Selector - Terminal style */}
          <div className="mb-4 flex items-center gap-1.5 sm:mb-6 sm:gap-2">
            <span className="text-theme-text-muted mr-1 font-mono text-[10px]">
              --range:
            </span>
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setChartTimeRange(range)}
                className={`rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-all sm:px-3 sm:py-1.5 sm:text-xs ${
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
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
              {/* Start Value */}
              <div className="bg-theme-card-bg border-theme-border/70 flex items-center overflow-hidden rounded-sm border">
                <div className="bg-theme-text-muted/10 border-theme-border/50 border-r px-2 py-1.5">
                  <span className="text-theme-text-muted font-mono text-[10px] font-bold sm:text-xs">
                    [0]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                  <span className="text-theme-text-muted font-mono text-[10px]">
                    --start
                  </span>
                  <span className="text-theme-text-primary font-mono text-xs font-bold tabular-nums sm:text-sm">
                    ${formatValue(modalChartData[0]?.value || 0)}
                  </span>
                </div>
              </div>

              {/* Current Value */}
              <div className="bg-theme-card-bg border-theme-border/70 flex items-center overflow-hidden rounded-sm border">
                <div className="bg-theme-accent/10 border-theme-accent/20 border-r px-2 py-1.5">
                  <span className="text-theme-accent font-mono text-[10px] font-bold sm:text-xs">
                    &gt;_
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                  <span className="text-theme-text-muted font-mono text-[10px]">
                    --current
                  </span>
                  <span className="text-theme-accent font-mono text-xs font-bold tabular-nums sm:text-sm">
                    $
                    {formatValue(
                      modalChartData[modalChartData.length - 1]?.value || 0
                    )}
                  </span>
                </div>
              </div>

              {/* Change Percent */}
              <div
                className={`bg-theme-card-bg flex items-center overflow-hidden rounded-sm border ${
                  isPositiveChange
                    ? 'border-theme-accent/30'
                    : 'border-[#ff4444]/30'
                }`}
              >
                <div
                  className={`border-r px-2 py-1.5 ${
                    isPositiveChange
                      ? 'bg-theme-accent/10 border-theme-accent/20'
                      : 'border-[#ff4444]/20 bg-[#ff4444]/10'
                  }`}
                >
                  {isPositiveChange ? (
                    <TrendingUp className="text-theme-accent h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-[#ff4444] sm:h-3.5 sm:w-3.5" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                  <span className="text-theme-text-muted font-mono text-[10px]">
                    --change
                  </span>
                  <span
                    className={`font-mono text-xs font-bold tabular-nums sm:text-sm ${
                      isPositiveChange ? 'text-theme-accent' : 'text-[#ff4444]'
                    }`}
                  >
                    {formatPercent(changePercent, isPositiveChange)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Chart */}
          <div className="bg-theme-card-bg border-theme-border/70 rounded-sm border">
            <div className="h-[280px] w-full p-2 sm:h-[350px] sm:p-3 md:h-[400px]">
              {modalChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={modalChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="modalChartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={strokeColor}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="50%"
                          stopColor={strokeColor}
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="100%"
                          stopColor={strokeColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2}
                      fill="url(#modalChartGradient)"
                      animationDuration={800}
                      activeDot={{
                        r: 6,
                        fill: strokeColor,
                        stroke: '#0a0f0f',
                        strokeWidth: 2,
                      }}
                    />
                    <RechartsTooltip
                      content={<ModalChartTooltip privacyMode={privacyMode} />}
                      cursor={{
                        stroke: strokeColor,
                        strokeWidth: 1,
                        strokeDasharray: '4 4',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="text-theme-accent mb-2 font-mono text-sm">
                      <span className="text-theme-accent">&gt;</span> history
                      --fetch
                    </div>
                    <p className="text-theme-text-muted font-mono text-xs">
                      # No history data available
                    </p>
                    <p className="text-theme-text-muted/60 mt-1 font-mono text-[10px]">
                      # Portfolio history will appear here over time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data points info - Terminal footer */}
          {modalChartData.length > 0 && (
            <div className="border-theme-border/50 mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-theme-text-muted font-mono text-[10px] sm:text-xs">
                # data_points:{' '}
                <span className="text-theme-accent">
                  {modalChartData.length}
                </span>
              </span>
              <span className="text-theme-text-muted font-mono text-[10px] sm:text-xs">
                # range:{' '}
                <span className="text-theme-text-primary">
                  {modalChartData[0]?.fullDate}
                </span>{' '}
                →{' '}
                <span className="text-theme-accent">
                  {modalChartData[modalChartData.length - 1]?.fullDate}
                </span>
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
