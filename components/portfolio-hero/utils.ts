// Utility functions for Portfolio Hero components

/**
 * Safely parse a numeric value, handling edge cases
 */
export function safeParseFloat(value: unknown): number {
  if (typeof value === 'number') {
    if (Math.abs(value) > 1e15) return 0
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (Number.isNaN(parsed)) return 0
    if (Math.abs(parsed) > 1e15) return 0
    return parsed
  }
  return 0
}

/**
 * Format a value into integer and decimal parts
 */
export function formatValue(value: number, privacyMode = false): { intPart: string; decPart: string } {
  if (privacyMode) return { intPart: "••••••", decPart: "" }
  
  const intPart = Math.floor(value).toLocaleString("en-US")
  const decPart = (value % 1).toFixed(2).substring(1)
  
  return { intPart, decPart }
}

/**
 * Format a value in compact notation (K, M)
 */
export function formatCompactValue(value: number, privacyMode = false): string {
  if (privacyMode) return "••••"
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

/**
 * Format a wallet address with ellipsis
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Calculate total value from wallet data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateWalletTotalValue(data: any): number {
  if (!data) return 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokens = (data.compositionRaw || data.composition)?.data?.tokens || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nftsData = (data.nfts as any)?.data?.nfts || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const positionsData = (data.positions as any)?.data?.protocols || []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spotValue = tokens.filter((t: any) => t.type === 'spot').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perpValue = tokens.filter((t: any) => t.type === 'perp').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stakingValue = tokens.filter((t: any) => t.type === 'staking').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vaultsValue = tokens.filter((t: any) => t.type === 'vault').reduce((sum: number, t: any) => sum + safeParseFloat(t.usdValue), 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nftValue = nftsData.reduce((sum: number, nft: any) => {
    const value = safeParseFloat(nft.usdValue || nft.fxValue)
    return sum + value
  }, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defiValue = positionsData.reduce((sum: number, protocol: any) => {
    if (!Array.isArray(protocol.positions)) return sum
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sum + protocol.positions.reduce((posSum: number, pos: any) => {
      const value = safeParseFloat(pos.totalValueUSD)
      return posSum + value
    }, 0)
  }, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hypercoreValue = safeParseFloat((data.userData as any)?.data?.portfolioSummary?.totalValue)

  return spotValue + perpValue + stakingValue + vaultsValue + nftValue + defiValue + hypercoreValue
}

