// Utility functions and constants for Tokens Section

import type { Token, SortField, SortOrder } from './types';
import { formatPercentage } from '@/lib/utils/formatters';

// Default sort configuration
export const DEFAULT_SORT_FIELD: SortField = 'value';
export const DEFAULT_SORT_ORDER: SortOrder = 'desc';

// HyperEVM chain ID
export const HYPEREVM_CHAIN_ID = 999;

// KyberSwap native token address format
export const KYBERSWAP_NATIVE_TOKEN =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Convert native token address to KyberSwap format
 */
export function getSwapTokenAddress(tokenAddress: string): string {
  return tokenAddress === ZERO_ADDRESS ? KYBERSWAP_NATIVE_TOKEN : tokenAddress;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price < 0.01) return price.toFixed(4);
  return price.toFixed(2);
}

/**
 * Format price for desktop display with locale
 */
export function formatPriceDesktop(price: number): string {
  if (price < 0.01) return price.toFixed(4);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

/**
 * Format value for display
 */
export function formatValue(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format value in compact notation (K, M)
 */
export function formatCompactValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(2);
}

/**
 * Format balance for display
 */
export function formatBalance(balance: number): string {
  return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Re-export formatPercentage from shared utility
export { formatPercentage };

/**
 * Sort tokens by field and order
 */
export function sortTokens(
  tokens: Token[],
  field: SortField = DEFAULT_SORT_FIELD,
  order: SortOrder = DEFAULT_SORT_ORDER
): Token[] {
  const multiplier = order === 'asc' ? 1 : -1;

  return [...tokens].sort((a, b) => {
    let diff = 0;
    switch (field) {
      case 'symbol':
        diff = a.symbol.localeCompare(b.symbol);
        break;
      case 'balance':
        diff = a.balance - b.balance;
        break;
      case 'value':
        diff = a.value - b.value;
        break;
      case 'change24h':
        diff = a.change24h - b.change24h;
        break;
    }
    return diff * multiplier;
  });
}

/**
 * Filter tokens by search query
 */
export function filterTokens(tokens: Token[], query: string): Token[] {
  if (!query.trim()) return tokens;

  const lowerQuery = query.toLowerCase();
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Calculate totals from token list
 */
export function calculateTotals(tokens: Token[]): {
  totalValue: number;
  tokenCount: number;
} {
  const totalValue = tokens.reduce((sum, t) => sum + t.value, 0);
  const tokenCount = tokens.length;
  return { totalValue, tokenCount };
}
