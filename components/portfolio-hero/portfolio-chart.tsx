'use client';

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { ChartDataPoint } from './types';

interface PortfolioChartProps {
  chartData: ChartDataPoint[];
  isPositive: boolean;
  showChart: boolean;
  privacyMode: boolean;
}

/**
 * Custom tooltip component for the portfolio chart - Terminal style
 */
function ChartTooltip({
  active,
  payload,
  privacyMode,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: string }; value: number }>;
  privacyMode: boolean;
}) {
  if (active && payload && payload.length) {
    const displayValue = privacyMode
      ? '••••••'
      : `$${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
      <div className="bg-theme-bg border-theme-accent/30 rounded-sm border px-2 py-1.5 shadow-2xl backdrop-blur-md sm:px-4 sm:py-3">
        <p className="text-theme-text-muted mb-0.5 font-mono text-[10px] sm:mb-1 sm:text-xs">
          {payload[0].payload.date}
        </p>
        <p className="text-theme-accent font-mono text-sm font-bold tabular-nums sm:text-lg">
          {displayValue}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Background portfolio chart component for the hero section
 */
export function PortfolioChart({
  chartData,
  isPositive,
  showChart,
  privacyMode,
}: PortfolioChartProps) {
  if (!showChart || chartData.length === 0) {
    return null;
  }

  const strokeColor = isPositive ? '#00ff41' : '#ff4444';

  return (
    <div className="absolute right-0 bottom-0 left-0 z-20 h-[28%] opacity-100 transition-opacity duration-1000 ease-out sm:h-[32%] md:h-[36%] lg:h-[38%]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="heroChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="40%" stopColor={strokeColor} stopOpacity={0.08} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill="url(#heroChartGradient)"
            animationDuration={1500}
            activeDot={{
              r: 4,
              fill: strokeColor,
              stroke: '#0a0f0f',
              strokeWidth: 2,
            }}
          />
          <RechartsTooltip
            content={<ChartTooltip privacyMode={privacyMode} />}
            cursor={{
              stroke: strokeColor,
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
