// Utility functions for Home page components

/**
 * Format wallet address to abbreviated form
 * Example: 0x1234...5678
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}












