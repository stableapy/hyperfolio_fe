'use client';

import { useState, useMemo } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';

// Sub-components
import { DefiStatsGrid } from './defi-stats-grid';
import { ProtocolCard } from './protocol-card';
import { ProtocolSkeleton } from './protocol-skeleton';
import { DefiEmptyState } from './defi-empty-state';
import { StreamingProgress } from './streaming-progress';

// Hooks
import { useDefiStats } from './hooks';

// Types
import type { DefiSectionProps, ProtocolGroup } from './types';
import type { DeFiPositionDisplay } from '@/lib/utils/data-transformers';

/**
 * Main DeFi Section component displaying portfolio positions grouped by protocol
 * Uses streamed positions from wallet store as single source of truth.
 * Streaming is initiated by DefiStreamProvider at page level.
 */
export function DeFiSection({ isLoading = false }: DefiSectionProps) {
  const { wallets, selectedWalletId, streaming, loading, privacyMode } =
    useWalletStore();
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(
    new Set()
  );

  // Get wallet info map for position enrichment
  const walletInfoMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    wallets.forEach((w) => {
      map.set(w.address, { name: w.name, color: w.color });
    });
    return map;
  }, [wallets]);

  // Get the selected wallet's address for filtering (or undefined for all wallets)
  const selectedWalletAddress = useMemo(() => {
    if (selectedWalletId) {
      const wallet = wallets.find((w) => w.id === selectedWalletId);
      return wallet?.address;
    }
    return undefined;
  }, [selectedWalletId, wallets]);

  // Get streamed protocol groups from the store and enrich with wallet info
  const protocolGroups: ProtocolGroup[] = useMemo(() => {
    const protocols = Array.from(streaming.streamedProtocols.values());
    return protocols
      .filter((p) => p.positions && p.positions.length > 0)
      .map((protocol) => {
        // Filter positions by selected wallet (if any wallet is selected)
        const filteredPositions = selectedWalletAddress
          ? protocol.positions.filter(
              (pos) => pos.walletAddress === selectedWalletAddress
            )
          : protocol.positions;

        // Recalculate total value from filtered positions
        const totalValue = filteredPositions.reduce(
          (sum, pos) => sum + parseFloat(pos.totalValueUSD || '0'),
          0
        );

        // Recalculate stats from filtered positions
        let stats:
          | {
              weightedApyPercent?: number;
              estimatedYield?: {
                daily: string;
                weekly: string;
                monthly: string;
              };
            }
          | undefined;
        if (filteredPositions.length > 0) {
          // Calculate weighted APY
          let totalWeightedApy = 0;
          let totalValueForApy = 0;
          let dailyYield = 0;
          let weeklyYield = 0;
          let monthlyYield = 0;

          filteredPositions.forEach((pos) => {
            const posValue = parseFloat(pos.totalValueUSD || '0');
            const posApy = extractApy(pos.details);
            const posYield = extractEstimatedYield(pos.details);

            if (posApy > 0 && posValue > 0) {
              totalWeightedApy += posApy * posValue;
              totalValueForApy += posValue;
            }

            if (posYield) {
              dailyYield += parseFloat(posYield.daily) || 0;
              weeklyYield += parseFloat(posYield.weekly) || 0;
              monthlyYield += parseFloat(posYield.monthly) || 0;
            }
          });

          const weightedApyPercent =
            totalValueForApy > 0
              ? totalWeightedApy / totalValueForApy
              : undefined;

          // Only include stats if we have meaningful data
          if (weightedApyPercent !== undefined && weightedApyPercent > 0) {
            stats = {
              weightedApyPercent,
              estimatedYield:
                dailyYield > 0 || weeklyYield > 0 || monthlyYield > 0
                  ? {
                      daily: dailyYield.toFixed(2),
                      weekly: weeklyYield.toFixed(2),
                      monthly: monthlyYield.toFixed(2),
                    }
                  : undefined,
            };
          }
        }

        return {
          id: protocol.id,
          name: protocol.name,
          logo: protocol.logo || null,
          url: protocol.url || '',
          totalValue,
          positions: filteredPositions.map((pos) => {
            const walletInfo = pos.walletAddress
              ? walletInfoMap.get(pos.walletAddress)
              : undefined;
            return {
              id: pos.id,
              protocol: protocol.name,
              type: mapPositionType(pos.type),
              assets: extractAssets(pos.details),
              deposited: parseFloat(pos.totalValueUSD || '0'),
              current: parseFloat(pos.totalValueUSD || '0'),
              apy: extractApy(pos.details),
              rewards: extractRewards(pos.details),
              logo: protocol.logo,
              positionDetails: pos.details,
              protocolUrl: protocol.url,
              estimatedYield: extractEstimatedYield(pos.details),
              walletAddress: pos.walletAddress,
              walletName: walletInfo?.name,
              walletColor: walletInfo?.color,
            } as DeFiPositionDisplay;
          }),
          stats,
        };
      })
      .filter((p) => p.positions.length > 0) // Filter out protocols with no positions after wallet filtering
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [streaming.streamedProtocols, walletInfoMap, selectedWalletAddress]);

  // Flatten positions from streamed data
  const positions: DeFiPositionDisplay[] = useMemo(() => {
    return protocolGroups.flatMap((group) => group.positions);
  }, [protocolGroups]);

  const hasData = protocolGroups.length > 0;

  // Calculate stats from positions
  const stats = useDefiStats({ positions });

  // Calculate total portfolio value from positions (for percentage display in privacy mode)
  const totalPortfolioUSD = stats.totalCurrent || 0;

  // Toggle protocol expansion
  const toggleProtocol = (protocolId: string) => {
    const newExpanded = new Set(expandedProtocols);
    if (newExpanded.has(protocolId)) {
      newExpanded.delete(protocolId);
    } else {
      newExpanded.add(protocolId);
    }
    setExpandedProtocols(newExpanded);
  };

  // Show skeleton when streaming is active but no data yet
  const isStreamingActive = streaming.isStreaming || loading.isPositionsLoading;
  const showSkeleton = (isLoading || isStreamingActive) && !hasData;

  // Show streaming indicator while streaming is in progress (even before we have total)
  const showStreamingIndicator =
    isStreamingActive && !streaming.isStreamComplete;
  const isInitializingStream =
    isStreamingActive && streaming.streamProgress.total === 0;

  return (
    <div className="space-y-4">
      {/* Stats Grid - shows loading state or actual stats */}
      <DefiStatsGrid
        isLoading={isStreamingActive && !hasData}
        hasData={hasData}
        totalDeposited={stats.totalDeposited}
        totalRewards={stats.totalRewards}
        weightedApy={stats.weightedApy}
        portfolioYield={stats.portfolioYield}
        positionsWithApy={stats.positionsWithApy}
        totalPositions={stats.totalPositions}
      />

      {/* Streaming Progress - shows protocol scan progress */}
      {showStreamingIndicator && (
        <StreamingProgress
          completed={streaming.streamProgress.completed}
          total={streaming.streamProgress.total}
          isComplete={streaming.isStreamComplete}
          isInitializing={isInitializingStream}
        />
      )}

      <div className="space-y-3">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && (
          <>
            {[1, 2, 3].map((i) => (
              <ProtocolSkeleton key={i} />
            ))}
          </>
        )}

        {/* Protocol Cards - Render progressively as they arrive from stream */}
        {protocolGroups.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            isExpanded={expandedProtocols.has(protocol.id)}
            onToggle={() => toggleProtocol(protocol.id)}
            selectedWalletId={selectedWalletId}
            privacyMode={privacyMode}
            totalPortfolioUSD={totalPortfolioUSD}
          />
        ))}
      </div>

      {/* Empty State - Only show when stream is complete and no positions found */}
      {protocolGroups.length === 0 &&
        !showSkeleton &&
        streaming.isStreamComplete && <DefiEmptyState />}
    </div>
  );
}

// Helper functions to extract data from position details
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

function extractAssets(details: Record<string, unknown>): string[] {
  const assets: string[] = [];

  if (details?.token) {
    const token = details.token as Record<string, unknown>;
    if (token.symbol) assets.push(String(token.symbol));
  }

  if (details?.token0) {
    const token0 = details.token0 as Record<string, unknown>;
    if (token0.symbol) assets.push(String(token0.symbol));
  }

  if (details?.token1) {
    const token1 = details.token1 as Record<string, unknown>;
    if (token1.symbol) assets.push(String(token1.symbol));
  }

  if (details?.pair) {
    return String(details.pair)
      .split('/')
      .map((s) => s.trim());
  }

  return assets;
}

function extractApy(details: Record<string, unknown>): number {
  const apy = details?.apy;
  if (typeof apy === 'number') return apy;
  if (typeof apy === 'string') return parseFloat(apy) || 0;
  return 0;
}

function extractRewards(details: Record<string, unknown>): number {
  const fees = details?.uncollectedFees as Record<string, unknown> | undefined;
  if (fees?.usdValue) {
    const value =
      typeof fees.usdValue === 'string'
        ? parseFloat(fees.usdValue)
        : Number(fees.usdValue);
    return Number.isNaN(value) ? 0 : value;
  }
  return 0;
}

function extractEstimatedYield(
  details: Record<string, unknown>
): { daily: string; weekly: string; monthly: string } | undefined {
  const yield_ = details?.estimatedYield as Record<string, unknown> | undefined;
  if (yield_) {
    return {
      daily: String(yield_.daily || '0.00'),
      weekly: String(yield_.weekly || '0.00'),
      monthly: String(yield_.monthly || '0.00'),
    };
  }
  return undefined;
}
