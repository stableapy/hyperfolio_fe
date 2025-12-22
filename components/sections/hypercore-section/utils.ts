// Utility functions for Hypercore Section

/**
 * Format a numeric value with compact notation (K suffix for thousands)
 */
export function formatCompactValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(2)
}

/**
 * Format a value as USD with compact notation
 */
export function formatUsdCompact(value: number): string {
  return `$${formatCompactValue(value)}`
}

/**
 * Safely parse a string to float, returning 0 if invalid
 */
export function safeParseFloat(value: string | undefined | null): number {
  if (!value) return 0
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format an address to a shortened display format
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 14) return address || "Unknown"
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

/**
 * Check if a vault is currently locked
 */
export function isVaultLocked(lockedUntilTimestamp: number): boolean {
  return lockedUntilTimestamp > Date.now()
}

