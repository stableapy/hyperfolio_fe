// Utility functions for yield section

import type { YieldOpportunity } from '@/lib/types/api';
import type { StreamedProtocol } from '@/hooks/use-positions-stream';
import type { YieldDisplayItem, ConsolidatedLendingMarket } from './types';

/**
 * Format APY value as percentage string
 * Handles null/undefined values gracefully
 */
export function formatApyPercentage(apy: number | null | undefined): string {
  if (apy === null || apy === undefined || Number.isNaN(apy)) {
    return 'N/A';
  }
  return `${apy.toFixed(2)}%`;
}

/**
 * Format APY display showing both base and total APY
 * If base and total are the same, only shows one value
 */
export function formatApyDisplay(
  baseApy: number | null | undefined,
  totalApy: number | null | undefined
): { base: string | null; total: string | null; isSame: boolean } {
  const hasBase =
    baseApy !== null && baseApy !== undefined && !Number.isNaN(baseApy);
  const hasTotal =
    totalApy !== null && totalApy !== undefined && !Number.isNaN(totalApy);

  // If both exist, check if they're the same (within 0.01% tolerance)
  if (hasTotal && hasBase) {
    const isSame = Math.abs(baseApy - totalApy) < 0.01;
    if (isSame) {
      return { base: formatApyPercentage(baseApy), total: null, isSame: true };
    }
    return {
      base: formatApyPercentage(baseApy),
      total: formatApyPercentage(totalApy),
      isSame: false,
    };
  } else if (hasTotal) {
    return { base: null, total: formatApyPercentage(totalApy), isSame: true };
  } else if (hasBase) {
    return { base: formatApyPercentage(baseApy), total: null, isSame: true };
  }
  return { base: null, total: null, isSame: true };
}

/**
 * Get the primary APY value for sorting/display
 */
export function getPrimaryApy(
  baseApy: number | null | undefined,
  totalApy: number | null | undefined
): number {
  if (totalApy !== null && totalApy !== undefined && !Number.isNaN(totalApy)) {
    return totalApy;
  }
  if (baseApy !== null && baseApy !== undefined && !Number.isNaN(baseApy)) {
    return baseApy;
  }
  return 0;
}

/**
 * Get protocol logo path from protocol name
 * Maps protocol names to their logo files in /public
 */
export function getProtocolLogoPath(protocolName: string): string {
  const normalizedName = protocolName.toLowerCase().replace(/\s+/g, '');
  
  // Map of protocol names to their logo files
  const logoMap: Record<string, string> = {
    'hyperlend': '/hyperlend.jpg',
    'hyperliquid': '/hype.png',
    'hyperswap': '/hyperswap.jpg',
    'hyperswapv2': '/hyperswap.jpg',
    'hyperswapv3': '/hyperswap.jpg',
    'pendle': '/pendle.jpg',
    'spectra': '/spectra.jpg',
    'timeswap': '/timeswap.jpg',
    'ramses': '/ramses.jpg',
    'kittenswap': '/kittenswap.jpg',
    'harmonix': '/harmonix.png',
    'hyperbeat': '/hyperbeat.png',
    'hypurrfi': '/hypurrfi.png',
    'kinetiq': '/kinetiq.jpg',
    'laminar': '/laminar.jpg',
    'felix': '/felix.jpg',
    'keiko': '/keiko.jpg',
    'kei': '/kei.jpg',
    'curve': '/curve.jpg',
    'behype': '/behype.png',
    'upshift': '/upshift.png',
    'valantis': '/valantis.jpg',
    'valantisprotocol': '/valantis.jpg',
    'silhouette': '/silhouette.jpg',
    'liminal': '/liminal.jpg',
    'hybra': '/hybra.jpg',
    'hybrav3': '/hybra.jpg',
    'rysk': '/rysk.jpg',
    'altura': '/altura.jpg',
    'equilibria': '/equilibria.png',
    'sentiment': '/sentiment.jpg',
    'hyperdrive': '/hyperdrive.jpg',
    'ultrasolid': '/ultrasolid.jpg',
    'upheaval': '/upheaval.jpg',
    'theo': '/theo.svg',
    'project-x': '/project-x.jpg',
    'projectx': '/project-x.jpg',
  };

  return logoMap[normalizedName] || '/placeholder.svg';
}

/**
 * Get color class for risk level
 * Uses theme-aware colors with fallback to standard colors
 */
export function getRiskColorClass(
  riskLevel: 'low' | 'medium' | 'high'
): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-500 dark:text-green-400';
    case 'medium':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'high':
      return 'text-red-500 dark:text-red-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

/**
 * Get label for risk level
 */
export function getRiskLabel(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    default:
      return 'Unknown';
  }
}

/**
 * Extract all token symbols from an opportunity
 * Checks multiple fields where tokens can be stored
 */
export function extractTokenSymbols(opp: YieldOpportunity): string[] {
  const symbols: string[] = [];

  // From metadata.underlyingSymbol
  if (opp.metadata.underlyingSymbol) {
    symbols.push(opp.metadata.underlyingSymbol);
  }

  // From pool.symbol
  if (opp.pool.symbol) {
    symbols.push(opp.pool.symbol);
  }

  // From AMM pool tokens
  if (opp.pool.token0?.symbol) {
    symbols.push(opp.pool.token0.symbol);
  }
  if (opp.pool.token1?.symbol) {
    symbols.push(opp.pool.token1.symbol);
  }

  // From single-asset positions
  const underlyingToken = opp.pool.underlyingToken;
  if (underlyingToken && typeof underlyingToken !== 'string' && underlyingToken.symbol) {
    symbols.push(underlyingToken.symbol);
  }

  // From derivatives
  if (opp.pool.collateralToken?.symbol) {
    symbols.push(opp.pool.collateralToken.symbol);
  }

  // Deduplicate and return
  return [...new Set(symbols)];
}

/**
 * Extract all token symbols from a display item
 * Handles both YieldOpportunity and ConsolidatedLendingMarket
 * Used for counting tokens in filter options AFTER consolidation
 */
export function extractTokenSymbolsFromDisplayItem(item: YieldDisplayItem): string[] {
  // Check if this is a consolidated lending market
  if (item.type === 'market') {
    // ConsolidatedLendingMarket - extract from pool fields
    const symbols: string[] = [];
    const market = item as ConsolidatedLendingMarket;

    // From pool.symbol
    if (market.pool.symbol) {
      symbols.push(market.pool.symbol);
    }

    // From AMM pool tokens
    if (market.pool.token0?.symbol) {
      symbols.push(market.pool.token0.symbol);
    }
    if (market.pool.token1?.symbol) {
      symbols.push(market.pool.token1.symbol);
    }

    // From single-asset positions
    const underlyingToken = market.pool.underlyingToken;
    if (underlyingToken && typeof underlyingToken !== 'string' && underlyingToken.symbol) {
      symbols.push(underlyingToken.symbol);
    }

    // From derivatives
    if (market.pool.collateralToken?.symbol) {
      symbols.push(market.pool.collateralToken.symbol);
    }

    // From metadata
    if (market.metadata.underlyingSymbol) {
      symbols.push(market.metadata.underlyingSymbol);
    }

    // Deduplicate and return
    return [...new Set(symbols)];
  }

  // Regular YieldOpportunity - use existing function
  return extractTokenSymbols(item);
}

/**
 * Check if opportunity is stablecoin-related
 * Matches tokens that contain stablecoin symbols
 */
export function isStablecoinOpportunity(opp: YieldOpportunity): boolean {
  const STABLECOINS = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FEI', 'sUSD', 'USD'];
  const symbols = extractTokenSymbols(opp);
  return symbols.some((s) => STABLECOINS.some((stable) => s.includes(stable)));
}

/**
 * Check if opportunity is HYPE-related
 * Matches HyperLiquid protocol or HYPE token
 */
export function isHypeOpportunity(opp: YieldOpportunity): boolean {
  // Check protocol ID
  if (opp.protocol.id === 'hyperliquid') {
    return true;
  }

  // Check token symbols
  const symbols = extractTokenSymbols(opp);
  return symbols.some((s) => s.includes('HYPE'));
}

/**
 * Check if opportunity matches selected tokens
 * Returns true if any token symbol matches the selection
 */
export function matchesTokenFilter(
  opp: YieldOpportunity,
  selectedTokens: string[]
): boolean {
  const symbols = extractTokenSymbols(opp);
  return selectedTokens.some((token) => symbols.includes(token));
}
