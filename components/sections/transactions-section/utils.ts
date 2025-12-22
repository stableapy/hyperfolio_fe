// Utility functions for transactions section

/**
 * Format timestamp into relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

