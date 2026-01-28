// Utility functions for wallet module

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if a string is a .hl domain name
 *
 * .hl domains are Hyperliquid's naming service that resolve to Ethereum addresses.
 *
 * @param input - The string to check
 * @returns true if the input ends with ".hl" (case-insensitive)
 *
 * @example
 * ```ts
 * isHLDomain("user.hl") // true
 * isHLDomain("USER.HL") // true
 * isHLDomain("0x1234...") // false
 * ```
 */
export function isHLDomain(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return input.trim().toLowerCase().endsWith('.hl');
}

/**
 * Format address for display (shortened version)
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format address even shorter for mobile/compact displays
 */
export function formatAddressCompact(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

/**
 * Validate wallet address format
 *
 * Accepts either a valid Ethereum address (0x...) or a .hl domain.
 * The backend handles .hl domain resolution.
 *
 * @param input - The address or domain to validate
 * @returns true if valid Ethereum address or .hl domain
 *
 * @example
 * ```ts
 * isValidWalletInput("0x1234...5678") // true
 * isValidWalletInput("user.hl") // true
 * isValidWalletInput("invalid") // false
 * ```
 */
export function isValidWalletInput(input: string): boolean {
  return isValidEthereumAddress(input) || isHLDomain(input);
}
