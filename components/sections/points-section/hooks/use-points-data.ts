'use client';

import { useMemo } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { Point, PointsTotals } from '../types';
import type { PointsData } from '@/lib/types/api';

/**
 * Group points by protocol name for multi-wallet aggregation
 */
export function groupPointsByProtocol(points: Point[]): Point[] {
  const protocolMap = new Map<
    string,
    {
      point: Point;
      wallets: Set<string>;
    }
  >();

  points.forEach((point) => {
    const key = point.protocolName;
    const existing = protocolMap.get(key);

    if (existing) {
      // Merge points with same protocol
      if (point.walletAddress) {
        existing.wallets.add(point.walletAddress);
      }

      existing.point = {
        ...existing.point,
        points: existing.point.points + point.points,
        // Keep first wallet info for display
        walletAddress: undefined,
        walletName: 'Multiple Wallets',
        walletColor: '#708090',
      };
    } else {
      const wallets = new Set<string>();
      if (point.walletAddress) {
        wallets.add(point.walletAddress);
      }

      protocolMap.set(key, {
        point: { ...point },
        wallets,
      });
    }
  });

  // Convert map to array and update metadata for grouped protocols
  return Array.from(protocolMap.values()).map(({ point, wallets }) => {
    const isGrouped = wallets.size > 1;

    return {
      ...point,
      // Create unique ID using protocol name as base
      id: isGrouped ? `grouped-${point.protocolName.toLowerCase()}` : point.id,
      // Update wallet info for grouped protocols
      walletAddress: isGrouped ? undefined : point.walletAddress,
      walletName: isGrouped ? 'Multiple Wallets' : point.walletName,
      walletColor: isGrouped ? '#708090' : point.walletColor,
    };
  });
}

/**
 * Hook to fetch and aggregate points from wallets
 * Reads points from wallet store - no API calls made here
 * Always returns Point[] entries - grouping is handled by consumer
 */
export function usePointsData() {
  const { wallets, walletData, selectedWalletId, loading } = useWalletStore();

  // Get points from selected wallet or all wallets, transforming PointsData to Point[]
  const points = useMemo(() => {
    if (wallets.length === 0) return [];

    // Transform PointsData[] to Point[] with wallet metadata
    const transformPoints = (
      pointsData: PointsData[],
      walletAddress: string,
      walletName: string,
      walletColor: string
    ): Point[] => {
      return pointsData.map((point) => ({
        id: `${walletAddress}-${point.protocolName}`,
        protocolName: point.protocolName,
        points: point.points,
        rank: point.rank,
        walletAddress,
        walletName,
        walletColor,
      }));
    };

    if (selectedWalletId) {
      // Single wallet mode: return individual protocol points for this wallet
      const wallet = wallets.find((w) => w.id === selectedWalletId);
      if (wallet) {
        const walletPointsData = walletData[wallet.address]?.points;
        if (walletPointsData && walletPointsData.length > 0) {
          return transformPoints(
            walletPointsData,
            wallet.address,
            wallet.name,
            wallet.color
          );
        }
      }
      return [];
    } else {
      // All wallets mode: return all points from all wallets
      const allPoints: Point[] = [];
      wallets.forEach((wallet) => {
        const walletPointsData = walletData[wallet.address]?.points;
        if (walletPointsData && walletPointsData.length > 0) {
          const walletPoints = transformPoints(
            walletPointsData,
            wallet.address,
            wallet.name,
            wallet.color
          );
          allPoints.push(...walletPoints);
        }
      });
      return allPoints;
    }
  }, [wallets, walletData, selectedWalletId]);

  // Check if we have any data loaded
  const hasData = points.length > 0;

  // Calculate totals
  const totals = useMemo<PointsTotals>(() => {
    if (points.length === 0) {
      return { totalPoints: 0, protocolCount: 0 };
    }

    // Sum all points
    const totalPoints = points.reduce((sum, point) => sum + point.points, 0);

    // Count unique protocols
    const uniqueProtocols = new Set(points.map((point) => point.protocolName));
    const protocolCount = uniqueProtocols.size;

    return { totalPoints, protocolCount };
  }, [points]);

  return {
    points,
    hasData,
    totals,
    isLoading: loading.isWalletDataLoading,
    error: null, // Error handling is managed by wallet store
  };
}

/**
 * Hook to filter points based on search query
 * Works with Point[] only
 * Only shows protocols with points > 0
 */
export function useFilteredPoints(points: Point[], searchQuery: string) {
  const filteredPoints = useMemo(() => {
    // First filter out protocols with 0 or negative points
    const nonZeroPoints = points.filter((point) => point.points > 0);

    if (!searchQuery) return nonZeroPoints;

    const query = searchQuery.toLowerCase();

    // Filter individual protocol points by search query
    return nonZeroPoints.filter(
      (point) =>
        point.protocolName.toLowerCase().includes(query) ||
        (point.walletName && point.walletName.toLowerCase().includes(query)) ||
        (point.walletAddress &&
          point.walletAddress.toLowerCase().includes(query))
    );
  }, [points, searchQuery]);

  return filteredPoints;
}

/**
 * Hook to calculate points totals for a specific wallet
 */
export function useWalletPoints(points: Point[], walletAddress: string) {
  const walletPoints = useMemo(() => {
    return points.filter((point) => point.walletAddress === walletAddress);
  }, [points, walletAddress]);

  const totals = useMemo<PointsTotals>(() => {
    if (walletPoints.length === 0) {
      return { totalPoints: 0, protocolCount: 0 };
    }

    // Sum all points
    const totalPoints = walletPoints.reduce(
      (sum, point) => sum + point.points,
      0
    );

    // Count unique protocols
    const uniqueProtocols = new Set(
      walletPoints.map((point) => point.protocolName)
    );
    const protocolCount = uniqueProtocols.size;

    return { totalPoints, protocolCount };
  }, [walletPoints]);

  return { points: walletPoints, totals };
}
