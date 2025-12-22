// Utility functions for wallet module

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format address for display (shortened version)
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format address even shorter for mobile/compact displays
 */
export function formatAddressCompact(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-3)}`
}

