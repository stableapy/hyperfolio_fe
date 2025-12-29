'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { secureFetch } from '@/lib/api/fetch';
import type {
  HistorySnapshot,
  PortfolioHistory,
  ChartDataPoint,
  ModalChartDataPoint,
  ChartTimeRange,
} from '../types';

interface Wallet {
  id: string;
  address: string;
  name: string;
  color: string;
}

interface UsePortfolioHistoryOptions {
  selectedWalletId: string | null;
  wallets: Wallet[];
}

interface UsePortfolioHistoryReturn {
  portfolioHistory: HistorySnapshot[];
  isLoadingHistory: boolean;
  chartData: ChartDataPoint[];
  getModalChartData: (timeRange: ChartTimeRange) => ModalChartDataPoint[];
  error: Error | null;
}

/**
 * Custom hook for fetching and managing portfolio history data
 */
export function usePortfolioHistory({
  selectedWalletId,
  wallets,
}: UsePortfolioHistoryOptions): UsePortfolioHistoryReturn {
  // Fetch portfolio history using React Query
  const {
    data: portfolioHistory = [],
    isLoading: isLoadingHistory,
    error,
  } = useQuery({
    queryKey: [
      'portfolio-history',
      selectedWalletId,
      wallets.map((w) => w.id).join(','),
    ],
    queryFn: async () => {
      const addresses = selectedWalletId
        ? [wallets.find((w) => w.id === selectedWalletId)?.address].filter(
            Boolean
          )
        : wallets.map((w) => w.address);

      if (addresses.length === 0) {
        return [];
      }

      let data: PortfolioHistory;

      if (addresses.length === 1) {
        const response = await secureFetch(
          `/api/portfolio-history?address=${addresses[0]}`
        );
        if (!response.ok) throw new Error('Failed to fetch portfolio history');
        data = await response.json();
      } else {
        const response = await secureFetch('/api/portfolio-history-aggregate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses }),
        });
        if (!response.ok)
          throw new Error('Failed to fetch aggregated portfolio history');
        data = await response.json();
      }

      return data.snapshots.slice(-30);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: wallets.length > 0,
  });

  // Log errors for debugging
  if (error) {
    console.error('Error fetching portfolio history:', error);
  }

  // Prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    if (portfolioHistory.length === 0) return [];

    return portfolioHistory.map((snapshot) => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: snapshot.total_value_usd,
      timestamp: snapshot.snapshot_timestamp,
    }));
  }, [portfolioHistory]);

  // Get filtered chart data for modal based on time range
  const getModalChartData = useCallback(
    (timeRange: ChartTimeRange): ModalChartDataPoint[] => {
      if (portfolioHistory.length === 0) return [];

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      let filteredSnapshots = portfolioHistory;

      if (timeRange === '7d') {
        filteredSnapshots = portfolioHistory.filter(
          (s) => now - s.snapshot_timestamp * 1000 <= 7 * dayMs
        );
      } else if (timeRange === '30d') {
        filteredSnapshots = portfolioHistory.filter(
          (s) => now - s.snapshot_timestamp * 1000 <= 30 * dayMs
        );
      } else if (timeRange === '90d') {
        filteredSnapshots = portfolioHistory.filter(
          (s) => now - s.snapshot_timestamp * 1000 <= 90 * dayMs
        );
      }
      // 'all' uses all available data

      return filteredSnapshots.map((snapshot) => ({
        date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        value: snapshot.total_value_usd,
        timestamp: snapshot.snapshot_timestamp,
      }));
    },
    [portfolioHistory] // Only recreate when portfolioHistory changes
  );

  return {
    portfolioHistory,
    isLoadingHistory,
    chartData,
    getModalChartData,
    error: error instanceof Error ? error : null,
  };
}
