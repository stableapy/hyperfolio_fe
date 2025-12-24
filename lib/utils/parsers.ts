/**
 * Common parsing utilities for data transformation
 * Provides safe parsing functions with fallback values to handle undefined/null/invalid data
 */

/**
 * Safe parseFloat with fallback
 * @param value - The value to parse (string, number, or undefined)
 * @param fallback - The fallback value if parsing fails (default: 0)
 * @returns Parsed number or fallback
 */
export function safeFloat(value: string | number | undefined, fallback = 0): number {
  const parsed = parseFloat(String(value ?? ''))
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Safe big number parsing (wei to number conversion)
 * @param value - The wei value as string
 * @param decimals - Number of decimals (default: 18 for ETH)
 * @returns Parsed number
 */
export function parseWei(value: string | number | undefined, decimals = 18): number {
  return safeFloat(value) / Math.pow(10, decimals)
}

/**
 * Extract nested property safely from an object
 * @param obj - The object to extract from
 * @param path - Dot notation path (e.g., 'user.profile.name')
 * @param fallback - Fallback value if path doesn't exist
 * @returns The value at path or fallback
 */
export function getNestedProperty<T>(obj: any, path: string, fallback: T): T {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback
}
