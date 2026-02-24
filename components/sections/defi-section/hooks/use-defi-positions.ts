'use client';

import { useMemo } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { DeFiPositionDisplay } from '@/lib/utils/data-transformers';
import type { ProtocolGroup } from '../types';

interface Wallet {
  id: string;
  address: string;
  name: string;
  color: string;
}

interface UseDefiPositionsOptions {
  selectedWalletId: string | null;
  wallets: Wallet[];
}

interface UseDefiPositionsResult {
  positions: DeFiPositionDisplay[];
  protocolGroups: ProtocolGroup[];
  hasData: boolean;
}

/**
 * Custom hook for fetching and transforming DeFi positions
 * Uses streaming data from wallet store as single source of truth
 * Handles both single wallet and aggregate views
 */
export function useDefiPositions({
  selectedWalletId,
  wallets,
}: UseDefiPositionsOptions): UseDefiPositionsResult {
  // Get streaming DeFi positions from wallet store
  const { streaming } = useWalletStore();

  // Get wallet info map for position enrichment
  const walletInfoMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    wallets.forEach((w) => {
      map.set(w.address, { name: w.name, color: w.color });
    });
    return map;
  }, [wallets]);

  // Get addresses to filter by
  const filterAddresses = useMemo(() => {
    if (!selectedWalletId) return undefined;
    const wallet = wallets.find((w) => w.id === selectedWalletId);
    return wallet ? [wallet.address] : undefined;
  }, [selectedWalletId, wallets]);

  // Convert streamed protocols to protocol groups and positions
  const { positions, protocolGroups } = useMemo(() => {
    const streamedProtocols = Array.from(streaming.streamedProtocols.values());

    const allPositions: DeFiPositionDisplay[] = [];
    const groups: ProtocolGroup[] = [];

    streamedProtocols
      .filter((p) => p.positions && p.positions.length > 0)
      .forEach((protocol) => {
        const filteredPositions = protocol.positions.filter((pos) => {
          if (!filterAddresses) return true;
          return (
            pos.walletAddress && filterAddresses.includes(pos.walletAddress)
          );
        });

        if (filteredPositions.length === 0) return;

        const positionsForGroup: DeFiPositionDisplay[] = filteredPositions.map(
          (pos) => {
            const walletInfo = pos.walletAddress
              ? walletInfoMap.get(pos.walletAddress)
              : undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const details = pos.details as any;
            // Check for healthRatio in details (StreamedPosition doesn't have healthRatio at top level)
            const healthRatioValue = details?.healthRatio ?? details?.health_ratio;
            const positionDetails =
              healthRatioValue !== undefined
                ? { ...details, healthRatio: healthRatioValue }
                : details;

            return {
              id: pos.id,
              protocol: protocol.name,
              type: mapPositionType(pos.type),
              positionSubType:
                mapPositionType(pos.type) === "lending"
                  ? pos.positionType === "borrowed"
                    ? "borrowed"
                    : "supplied"
                  : null,
              assets: extractAssets(details),
              deposited: parseFloat(pos.totalValueUSD || '0'),
              current: parseFloat(pos.totalValueUSD || '0'),
              apy: details?.apy
                ? typeof details.apy === 'string'
                  ? parseFloat(details.apy)
                  : details.apy
                : 0,
              rewards: extractRewards(details),
              logo: protocol.logo,
              positionDetails,
              protocolUrl: protocol.url,
              estimatedYield: details?.estimatedYield
                ? {
                    daily: String(details.estimatedYield.daily || '0.00'),
                    weekly: String(details.estimatedYield.weekly || '0.00'),
                    monthly: String(details.estimatedYield.monthly || '0.00'),
                  }
                : undefined,
              walletAddress: pos.walletAddress,
              walletName: walletInfo?.name,
              walletColor: walletInfo?.color,
            };
          }
        );

        allPositions.push(...positionsForGroup);

        const computedHealthRatio = extractProtocolHealthRatio(positionsForGroup);
        const stats = protocol.protocolStats
          ? {
              weightedApyPercent:
                protocol.protocolStats.weightedApyPercent ?? undefined,
              healthRatio:
                computedHealthRatio ??
                extractHealthRatio(
                  protocol.protocolStats as Record<string, unknown>
                ),
              estimatedYield: protocol.protocolStats.estimatedYield,
            }
          : computedHealthRatio !== undefined
            ? {
                healthRatio: computedHealthRatio,
              }
            : undefined;

        groups.push({
          id: protocol.id,
          name: protocol.name,
          logo: protocol.logo || null,
          url: protocol.url || '',
          totalValue: positionsForGroup.reduce((sum, p) => sum + p.current, 0),
          positions: positionsForGroup,
          stats,
        });
      });

    // Sort groups by total value
    groups.sort((a, b) => b.totalValue - a.totalValue);

    return { positions: allPositions, protocolGroups: groups };
  }, [streaming.streamedProtocols, filterAddresses, walletInfoMap]);

  return {
    positions,
    protocolGroups,
    hasData: positions.length > 0,
  };
}

// Helper functions
function mapPositionType(
  type: string
): 'lending' | 'liquidity' | 'staking' | 'farming' {
  const typeMap: Record<
    string,
    'lending' | 'liquidity' | 'staking' | 'farming'
  > = {
    lending: 'lending',
    liquidity: 'liquidity',
    staking: 'staking',
    farming: 'farming',
    options: 'lending',
    spot: 'staking',
  };
  return typeMap[type] || 'lending';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAssets(details: any): string[] {
  if (!details) return [];
  const assets: string[] = [];

  if (details.token?.symbol) assets.push(String(details.token.symbol));
  if (details.token0?.symbol) assets.push(String(details.token0.symbol));
  if (details.token1?.symbol) assets.push(String(details.token1.symbol));
  if (details.pair)
    return String(details.pair)
      .split('/')
      .map((s) => s.trim());

  return assets;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRewards(details: any): number {
  if (!details?.uncollectedFees?.usdValue) return 0;
  const value =
    typeof details.uncollectedFees.usdValue === 'string'
      ? parseFloat(details.uncollectedFees.usdValue)
      : Number(details.uncollectedFees.usdValue);
  return Number.isNaN(value) ? 0 : value;
}

function extractHealthRatio(
  details?: Record<string, unknown>
): number | undefined {
  const raw = details?.healthRatio ?? details?.health_ratio;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function extractProtocolHealthRatio(
  positions: DeFiPositionDisplay[]
): number | undefined {
  let minHealthRatio: number | undefined;
  positions.forEach((position) => {
    const ratio = extractHealthRatio(
      position.positionDetails as Record<string, unknown> | undefined
    );
    if (ratio === undefined) return;
    minHealthRatio = minHealthRatio === undefined
      ? ratio
      : Math.min(minHealthRatio, ratio);
  });
  return minHealthRatio;
}
