// Token transformation utilities
import type { Token } from '@/lib/types/api'
import { safeFloat } from '../parsers'

export interface TokenDisplay {
  id: string
  address: string // Token contract address
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  logo: string
  walletAddress?: string
  walletName?: string
  walletColor?: string
}

/**
 * Transform API tokens to display format
 */
export function transformTokens(
  tokens: Token[],
  walletInfo?: { address: string; name: string; color: string }
): TokenDisplay[] {
  return tokens.map((token, index) => ({
    // Create unique ID using token address, wallet address, and index to avoid collisions
    id: walletInfo
      ? `${token.address}-${walletInfo.address}-${index}`
      : `${token.address}-${index}`,
    address: token.address, // Store the actual token contract address
    symbol: token.symbol,
    name: token.name,
    balance: safeFloat(token.balance),
    value: safeFloat(token.usdValue),
    price: safeFloat(token.usdPrice),
    change24h: 0, // API doesn't provide this yet
    logo: token.image_url || '',
    walletAddress: walletInfo?.address,
    walletName: walletInfo?.name,
    walletColor: walletInfo?.color,
  }))
}

/**
 * Group tokens by symbol for multi-wallet aggregation
 */
export function groupTokensBySymbol(tokens: TokenDisplay[]): TokenDisplay[] {
  const tokenMap = new Map<string, {
    token: TokenDisplay
    wallets: Set<string>
  }>()

  tokens.forEach((token) => {
    const key = token.symbol
    const existing = tokenMap.get(key)

    if (existing) {
      // Merge tokens with same symbol
      if (token.walletAddress) {
        existing.wallets.add(token.walletAddress)
      }

      existing.token = {
        ...existing.token,
        balance: existing.token.balance + token.balance,
        value: existing.token.value + token.value,
        // Average the price (weighted by value)
        price: existing.token.value + token.value > 0
          ? (existing.token.price * existing.token.value + token.price * token.value) / (existing.token.value + token.value)
          : existing.token.price,
        // Keep the first token's address for grouped tokens (they should be the same)
        address: existing.token.address || token.address,
      }
    } else {
      const wallets = new Set<string>()
      if (token.walletAddress) {
        wallets.add(token.walletAddress)
      }

      tokenMap.set(key, {
        token: { ...token },
        wallets,
      })
    }
  })

  // Convert map to array and update metadata for grouped tokens
  return Array.from(tokenMap.values()).map(({ token, wallets }) => {
    const isGrouped = wallets.size > 1

    return {
      ...token,
      // Create unique ID using symbol as base
      id: `grouped-${token.symbol.toLowerCase()}`,
      // Update wallet info for grouped tokens
      walletAddress: isGrouped ? undefined : token.walletAddress,
      walletName: isGrouped ? 'Multiple Wallets' : token.walletName,
      walletColor: isGrouped ? '#708090' : token.walletColor,
    }
  })
}
