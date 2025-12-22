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
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`
  } else if (value < 0.01 && value > 0) {
    return '<$0.01'
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Shorten an Ethereum address for display (e.g., "0x742d...5e3a")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format gas used to a readable format
 */
export function formatGas(gasUsed: string, gasPrice: string): string {
  const gas = parseFloat(gasUsed)
  const price = parseFloat(gasPrice) / 1e9 // Convert to Gwei
  const cost = (gas * price) / 1e9 // Convert to ETH
  
  if (cost >= 0.01) {
    return `${cost.toFixed(4)} HYPE`
  }
  return `${(cost * 1000).toFixed(4)} mHYPE`
}
