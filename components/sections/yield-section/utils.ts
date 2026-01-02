// Utility functions for yield section

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
 */
export function formatApyDisplay(
  baseApy: number | null | undefined,
  totalApy: number | null | undefined
): string {
  const hasBase =
    baseApy !== null && baseApy !== undefined && !Number.isNaN(baseApy);
  const hasTotal =
    totalApy !== null && totalApy !== undefined && !Number.isNaN(totalApy);

  if (hasTotal && hasBase) {
    return `Base: ${baseApy.toFixed(2)}% | Total: ${totalApy.toFixed(2)}%`;
  } else if (hasTotal) {
    return formatApyPercentage(totalApy);
  } else if (hasBase) {
    return formatApyPercentage(baseApy);
  }
  return 'N/A';
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
