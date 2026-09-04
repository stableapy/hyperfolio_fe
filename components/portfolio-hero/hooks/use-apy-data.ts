'use client';

import { useMemo } from 'react';
import type { ApyData } from '../types';
import { useWalletStore } from '@/lib/store/wallet-store';

interface Wallet {
  id: string;
  address: string;
  name: string;
  color: string;
}

interface UseApyDataOptions {
  selectedWalletId: string | null;
  wallets: Wallet[];
}

/**
 * Custom hook for calculating APY and estimated yields from DeFi positions
 * Uses streaming data from wallet store as single source of truth
 */
export function useApyData({
  selectedWalletId,
  wallets,
}: UseApyDataOptions): ApyData {
  // Get streaming DeFi positions from wallet store
  const { streaming } = useWalletStore();

  return useMemo(() => {
    const selectedAddress = selectedWalletId
      ? wallets.find((wallet) => wallet.id === selectedWalletId)?.address
      : undefined;
    const stats = selectedAddress
      ? Object.entries(streaming.streamPortfolioStats?.byWallet || {}).find(
          ([address]) => address.toLowerCase() === selectedAddress.toLowerCase()
        )?.[1]
      : streaming.streamPortfolioStats;

    return {
      weightedApy: stats?.weightedApyPercent ?? 0,
      estimatedYield: {
        daily: parseFloat(stats?.estimatedYield.daily || '0'),
        weekly: parseFloat(stats?.estimatedYield.weekly || '0'),
        monthly: parseFloat(stats?.estimatedYield.monthly || '0'),
      },
      hasPositions: (stats?.positionsWithApy ?? 0) > 0,
    };
  }, [selectedWalletId, wallets, streaming.streamPortfolioStats]);
}
