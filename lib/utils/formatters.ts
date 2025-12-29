/**
 * Shared formatting utilities for consistent display across the application
 */

/**
 * Format percentage for display (1-2 decimal places)
 *
 * Edge cases handled:
 * - NaN values: returns "0%"
 * - Infinity values: returns "0%"
 * - Negative values: returns "0%"
 * - Very small percentages (< 0.01%): returns "<0.01%"
 *
 * Decimal precision rules:
 * - Values < 10%: formatted with 1 decimal place (e.g., "5.3%")
 * - Values ≥ 10%: formatted with 2 decimal places (e.g., "12.34%")
 *
 * @param percentage - The percentage value to format
 * @returns Formatted percentage string with percent sign
 *
 * @example
 * formatPercentage(5.123) // "5.1%"
 * formatPercentage(12.345) // "12.35%"
 * formatPercentage(0.001) // "<0.01%"
 * formatPercentage(NaN) // "0%"
 * formatPercentage(-5) // "0%"
 */
export function formatPercentage(percentage: number): string {
  // Handle NaN or infinite values
  if (!Number.isFinite(percentage)) return '0%';

  // Handle very small percentages (< 0.01%)
  if (percentage < 0.01 && percentage > 0) return '<0.01%';

  // Handle negative values (shouldn't happen, but just in case)
  if (percentage < 0) return '0%';

  // Format to 1 decimal place for values < 10, 2 decimal places otherwise
  if (percentage < 10) {
    return percentage.toFixed(1) + '%';
  }
  return percentage.toFixed(2) + '%';
}
