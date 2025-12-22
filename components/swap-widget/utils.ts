// Utility functions for swap widget module

/**
 * Get wallet icon emoji based on connector name
 */
export function getWalletIcon(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("rabby")) return "🐰"
  if (lowerName.includes("metamask")) return "🦊"
  if (lowerName.includes("coinbase")) return "🔵"
  if (lowerName.includes("walletconnect")) return "🔗"
  if (lowerName.includes("trust")) return "🛡️"
  if (lowerName.includes("rainbow")) return "🌈"
  return "💼"
}

