import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
});

import type { StreamPortfolioStats } from '@/hooks/use-positions-stream';
import { useWalletStore } from '@/lib/store/wallet-store';

const portfolioStats: StreamPortfolioStats = {
  totalValueUSD: '300',
  weightedApyPercent: 5,
  totalValueWithApy: 300,
  positionsWithApy: 2,
  totalPositions: 2,
  estimatedYield: { daily: '1', weekly: '7', monthly: '30' },
  byWallet: {
    '0xaaa': {
      totalValueUSD: '100',
      weightedApyPercent: 4,
      totalValueWithApy: 100,
      positionsWithApy: 1,
      totalPositions: 1,
      estimatedYield: { daily: '0.1', weekly: '0.7', monthly: '3' },
    },
    '0xbbb': {
      totalValueUSD: '200',
      weightedApyPercent: 6,
      totalValueWithApy: 200,
      positionsWithApy: 1,
      totalPositions: 1,
      estimatedYield: { daily: '0.2', weekly: '1.4', monthly: '6' },
    },
  },
};

describe('wallet removal', () => {
  beforeEach(() => {
    useWalletStore.setState({
      wallets: [
        { id: 'a', name: 'A', address: '0xaaa', color: '#aaa' },
        { id: 'b', name: 'B', address: '0xbbb', color: '#bbb' },
      ],
      walletsChangedTrigger: 0,
      streaming: {
        ...useWalletStore.getState().streaming,
        isStreamComplete: true,
        streamPortfolioStats: portfolioStats,
      },
    });
  });

  it('invalidates backend portfolio statistics and triggers a restream', () => {
    useWalletStore.getState().removeWallet('b');

    const state = useWalletStore.getState();
    expect(state.wallets.map((wallet) => wallet.id)).toEqual(['a']);
    expect(state.streaming.streamPortfolioStats).toBeNull();
    expect(state.streaming.isStreamComplete).toBe(false);
    expect(state.walletsChangedTrigger).toBe(1);
  });
});
