/**
 * Mock yield data generator for development and fallback scenarios
 *
 * Generates realistic yield opportunity data that matches the YieldResponse type
 */

import type { YieldResponse, YieldOpportunity } from '@/lib/types/api';

/**
 * Generate mock yield opportunities
 */
function generateMockOpportunities(): YieldOpportunity[] {
  const opportunities: YieldOpportunity[] = [
    // Lending opportunities
    {
      id: 'mock-lending-1',
      protocol: {
        id: 'aave-v3',
        name: 'Aave V3',
        category: 'Lending',
        website: 'https://aave.com',
        chainId: 42161,
      },
      category: 'lending',
      type: 'supply',
      pool: {
        address: '0x...',
        name: 'USDC Pool',
        symbol: 'aUSDC',
      },
      apy: {
        baseApy: 4.5,
        totalApy: 8.2,
      },
      risk: {
        riskLevel: 'low',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-lending-2',
      protocol: {
        id: 'compound-v3',
        name: 'Compound V3',
        category: 'Lending',
        website: 'https://compound.finance',
        chainId: 42161,
      },
      category: 'lending',
      type: 'supply',
      pool: {
        address: '0x...',
        name: 'USDC Pool',
        symbol: 'cUSDCv3',
      },
      apy: {
        baseApy: 3.8,
        totalApy: 7.5,
      },
      risk: {
        riskLevel: 'low',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-lending-3',
      protocol: {
        id: 'aave-v3',
        name: 'Aave V3',
        category: 'Lending',
        website: 'https://aave.com',
        chainId: 42161,
      },
      category: 'lending',
      type: 'supply',
      pool: {
        address: '0x...',
        name: 'ETH Pool',
        symbol: 'aWETH',
      },
      apy: {
        baseApy: 1.2,
        totalApy: 2.8,
      },
      risk: {
        riskLevel: 'low',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'WETH',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    // AMM/Pool opportunities
    {
      id: 'mock-amm-1',
      protocol: {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        category: 'AMM',
        website: 'https://uniswap.org',
        chainId: 42161,
      },
      category: 'amm',
      type: 'lp',
      pool: {
        address: '0x...',
        name: 'USDC-ETH 0.3%',
        symbol: 'USDC-ETH',
      },
      apy: {
        baseApy: 2.5,
        totalApy: 15.8,
      },
      risk: {
        riskLevel: 'medium',
        liquidationRisk: false,
        impermanentLossRisk: true,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-amm-2',
      protocol: {
        id: 'camelot',
        name: 'Camelot',
        category: 'AMM',
        website: 'https://camelot.exchange',
        chainId: 42161,
      },
      category: 'amm',
      type: 'lp',
      pool: {
        address: '0x...',
        name: 'GRAIL-WETH',
        symbol: 'GRAIL-WETH',
      },
      apy: {
        baseApy: 5.2,
        totalApy: 45.3,
      },
      risk: {
        riskLevel: 'high',
        liquidationRisk: false,
        impermanentLossRisk: true,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'GRAIL',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-amm-3',
      protocol: {
        id: 'sushiswap',
        name: 'SushiSwap',
        category: 'AMM',
        website: 'https://sushi.com',
        chainId: 42161,
      },
      category: 'amm',
      type: 'lp',
      pool: {
        address: '0x...',
        name: 'USDC-ARB',
        symbol: 'USDC-ARB',
      },
      apy: {
        baseApy: 1.8,
        totalApy: 12.4,
      },
      risk: {
        riskLevel: 'medium',
        liquidationRisk: false,
        impermanentLossRisk: true,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    // Yield opportunities
    {
      id: 'mock-yield-1',
      protocol: {
        id: 'pendle',
        name: 'Pendle',
        category: 'Yield',
        website: 'https://pendle.finance',
        chainId: 42161,
      },
      category: 'yield',
      type: 'pt',
      pool: {
        address: '0x...',
        name: 'USDC 2025-03 PT',
        symbol: 'PT-USDC-3-25',
      },
      apy: {
        baseApy: 8.5,
        totalApy: 18.2,
      },
      risk: {
        riskLevel: 'medium',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-yield-2',
      protocol: {
        id: 'timeswap',
        name: 'Timeswap',
        category: 'Yield',
        website: 'https://timeswap.io',
        chainId: 42161,
      },
      category: 'yield',
      type: 'supply',
      pool: {
        address: '0x...',
        name: 'USDC Pool',
        symbol: 'TS-USDC',
      },
      apy: {
        baseApy: 6.2,
        totalApy: 14.8,
      },
      risk: {
        riskLevel: 'medium',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'USDC',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    // Staking opportunities
    {
      id: 'mock-staking-1',
      protocol: {
        id: 'gm',
        name: 'GMX',
        category: 'Staking',
        website: 'https://gmx.io',
        chainId: 42161,
      },
      category: 'staking',
      type: 'stake',
      pool: {
        address: '0x...',
        name: 'GLP Staking',
        symbol: 'GLP',
      },
      apy: {
        baseApy: 12.5,
        totalApy: 25.3,
      },
      risk: {
        riskLevel: 'medium',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'GLP',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
    {
      id: 'mock-staking-2',
      protocol: {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        category: 'Staking',
        website: 'https://uniswap.org',
        chainId: 42161,
      },
      category: 'staking',
      type: 'stake',
      pool: {
        address: '0x...',
        name: 'UNI Staking',
        symbol: 'UNI',
      },
      apy: {
        baseApy: 8.0,
        totalApy: 8.0,
      },
      risk: {
        riskLevel: 'low',
        liquidationRisk: false,
        impermanentLossRisk: false,
      },
      metadata: {
        underlyingToken: '0x...',
        underlyingSymbol: 'UNI',
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'api',
    },
  ];

  return opportunities;
}

/**
 * Group opportunities by category
 */
function groupByCategory(opportunities: YieldOpportunity[]) {
  return {
    lending: opportunities.filter((o) => o.category === 'lending'),
    amm: opportunities.filter((o) => o.category === 'amm'),
    yield: opportunities.filter((o) => o.category === 'yield'),
    staking: opportunities.filter((o) => o.category === 'staking'),
  };
}

/**
 * Group opportunities by protocol
 */
function groupByProtocol(opportunities: YieldOpportunity[]) {
  const byProtocol: Record<string, YieldOpportunity[]> = {};

  for (const opp of opportunities) {
    const key = opp.protocol.name;
    if (!byProtocol[key]) {
      byProtocol[key] = [];
    }
    byProtocol[key].push(opp);
  }

  return byProtocol;
}

/**
 * Generate mock yield data matching the YieldResponse type
 *
 * This creates realistic yield opportunities for development and testing.
 * The data structure matches the backend API response exactly.
 *
 * @returns YieldResponse with mock data
 *
 * @example
 * ```ts
 * const mockData = generateMockYieldData();
 * // Returns YieldResponse with 10 sample opportunities
 * ```
 */
export function generateMockYieldData(): YieldResponse {
  const opportunities = generateMockOpportunities();

  return {
    opportunities,
    byCategory: groupByCategory(opportunities),
    byProtocol: groupByProtocol(opportunities),
    lastUpdated: new Date().toISOString(),
    totalCount: opportunities.length,
  };
}

/**
 * Check if mock mode is enabled via environment variable
 *
 * @returns true if USE_MOCK_YIELD_DATA is set to 'true'
 */
export function isMockModeEnabled(): boolean {
  return process.env.USE_MOCK_YIELD_DATA === 'true';
}
