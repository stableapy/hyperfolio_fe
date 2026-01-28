// Utility functions for wallet module

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if a string is a naming service domain (.hl or .hype)
 *
 * .hl and .hype domains resolve to Ethereum addresses via the backend.
 *
 * @param input - The string to check
 * @returns true if the input ends with ".hl" or ".hype" (case-insensitive)
 *
 * @example
 * ```ts
 * isNamingServiceDomain("user.hl") // true
 * isNamingServiceDomain("user.hype") // true
 * isNamingServiceDomain("USER.HL") // true
 * isNamingServiceDomain("0x1234...") // false
 * ```
 */
export function isNamingServiceDomain(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const normalized = input.trim().toLowerCase();
  return normalized.endsWith('.hl') || normalized.endsWith('.hype');
}

/**
 * @deprecated Use isNamingServiceDomain instead
 */
export function isHLDomain(input: string): boolean {
  return isNamingServiceDomain(input);
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
 * Accepts either a valid Ethereum address (0x...) or a naming service domain (.hl or .hype).
 * The backend handles domain resolution.
 *
 * @param input - The address or domain to validate
 * @returns true if valid Ethereum address or naming service domain
 *
 * @example
 * ```ts
 * isValidWalletInput("0x1234...5678") // true
 * isValidWalletInput("user.hl") // true
 * isValidWalletInput("user.hype") // true
 * isValidWalletInput("invalid") // false
 * ```
 */
export function isValidWalletInput(input: string): boolean {
  return isValidEthereumAddress(input) || isNamingServiceDomain(input);
}
