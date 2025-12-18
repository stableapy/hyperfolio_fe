// Data transformation utilities to convert API responses to component-friendly formats
import type { Token, Transaction, NFT, DeFiPosition } from '@/lib/types/api'

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

export interface EstimatedYield {
  daily: string
  weekly: string
  monthly: string
}

export interface DeFiPositionDisplay {
  id: string
  protocol: string
  type: "lending" | "liquidity" | "staking" | "farming"
  assets: string[]
  deposited: number
  current: number
  apy: number
  rewards: number
  logo: string
  positionDetails?: any
  protocolUrl?: string
  estimatedYield?: EstimatedYield
  walletAddress?: string
  walletName?: string
  walletColor?: string
}

export interface ProtocolStats {
  weightedApyPercent: number | null
  positionsWithApy: number
  totalPositions: number
  estimatedYield: EstimatedYield
}

export interface ProtocolGroup {
  id: string
  name: string
  logo: string
  url: string
  totalValue: number
  positions: DeFiPositionDisplay[]
  stats?: ProtocolStats
}

export interface NFTDisplay {
  id: string
  name: string
  collection: string
  image: string
  floorPrice: number
  usdPrice: number
  tokenId: string
}

export interface TransactionDisplay {
  id: string
  type: "send" | "receive" | "swap" | "contract"
  from: string
  to: string
  amount: string
  token: string
  value: number
  timestamp: string
  hash: string
  status: "success" | "pending" | "failed"
}

// Transform API tokens to display format
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
    balance: parseFloat(token.balance),
    value: parseFloat(token.usdValue || '0'),
    price: parseFloat(token.usdPrice || '0'),
    change24h: 0, // API doesn't provide this yet
    logo: token.image_url || '/placeholder.svg',
    walletAddress: walletInfo?.address,
    walletName: walletInfo?.name,
    walletColor: walletInfo?.color,
  }))
}

// Group tokens by symbol for multi-wallet aggregation
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

// Transform DeFi positions from API response to display format
export function transformDeFiPositions(
  positionsData: any,
  walletInfo?: { address: string; name: string; color: string }
): DeFiPositionDisplay[] {
  if (!positionsData?.data?.protocols) return []
  
  const positions: DeFiPositionDisplay[] = []
  
  positionsData.data.protocols.forEach((protocol: any) => {
    if (protocol.positions && protocol.positions.length > 0) {
      protocol.positions.forEach((position: any) => {
        const typeMap: Record<string, "lending" | "liquidity" | "staking" | "farming"> = {
          lending: "lending",
          liquidity: "liquidity",
          staking: "staking",
          farming: "farming",
        }
        
        const positionType = typeMap[position.type] || "lending"
        const tokens = []
        
        if (position.details?.token) {
          tokens.push(position.details.token.symbol)
        } else if (position.details?.token0 && position.details?.token1) {
          tokens.push(position.details.token0.symbol, position.details.token1.symbol)
        }
        
        // Calculate rewards (uncollected fees) with validation
        const positionValue = parseFloat(position.totalValueUSD || '0')
        
        // Skip positions with zero value
        if (positionValue <= 0) {
          return
        }
        
        const rawRewards = parseFloat(position.details?.uncollectedFees?.usdValue || '0')
        
        // Filter out absurd fees (e.g., when position is out of range and API returns bad data)
        // If fees are more than 10x the position value, it's clearly corrupted data
        const rewards = rawRewards > positionValue * 10 ? 0 : rawRewards
        
        // Extract APY from position if available (vault positions may have this)
        // Ensure APY is converted to a number
        const rawApy = position.apy || position.details?.apy || 0
        const apy = typeof rawApy === 'string' ? parseFloat(rawApy) : rawApy
        
        // Extract estimated yield if available
        const estimatedYield = position.details?.estimatedYield || position.estimatedYield
        
        positions.push({
          id: position.id,
          protocol: protocol.name,
          type: positionType,
          assets: tokens,
          deposited: positionValue,
          current: positionValue,
          apy,
          rewards,
          logo: protocol.logo || '/placeholder.svg',
          positionDetails: position.details, // Keep full details for display
          protocolUrl: protocol.url,
          estimatedYield,
          walletAddress: walletInfo?.address,
          walletName: walletInfo?.name,
          walletColor: walletInfo?.color,
        })
      })
    }
  })
  
  // Sort positions by current value (highest first)
  return positions.sort((a, b) => b.current - a.current)
}

// Group positions by protocol (with raw API data for stats)
export function groupPositionsByProtocol(positions: DeFiPositionDisplay[], protocolsData?: any[]): ProtocolGroup[] {
  const protocolMap = new Map<string, ProtocolGroup>()
  
  positions.forEach((position) => {
    const existing = protocolMap.get(position.protocol)
    
    if (existing) {
      existing.positions.push(position)
      existing.totalValue += position.current
    } else {
      // Find protocol stats from raw API data
      const protocolData = protocolsData?.find((p: any) => p.name === position.protocol)
      const stats = protocolData?.protocolStats
      
      protocolMap.set(position.protocol, {
        id: position.protocol.toLowerCase().replace(/\s+/g, '-'),
        name: position.protocol,
        logo: position.logo,
        url: position.protocolUrl || '',
        totalValue: position.current,
        positions: [position],
        stats,
      })
    }
  })
  
  // Recalculate stats for each protocol based on aggregated positions
  const protocolGroups = Array.from(protocolMap.values()).map((protocol) => {
    // Sort positions within protocol by value (highest first)
    protocol.positions.sort((a, b) => b.current - a.current)
    
    const positionsWithApy = protocol.positions.filter(pos => pos.apy > 0)
    
    if (positionsWithApy.length > 0) {
      // Calculate weighted APY
      const weightedApy = positionsWithApy.reduce((sum, pos) => sum + (pos.apy * pos.current), 0) / protocol.totalValue
      
      // Calculate total estimated yield
      const totalYield = {
        daily: positionsWithApy.reduce((sum, pos) => {
          const daily = pos.estimatedYield ? parseFloat(pos.estimatedYield.daily) : 0
          return sum + daily
        }, 0).toFixed(2),
        weekly: positionsWithApy.reduce((sum, pos) => {
          const weekly = pos.estimatedYield ? parseFloat(pos.estimatedYield.weekly) : 0
          return sum + weekly
        }, 0).toFixed(2),
        monthly: positionsWithApy.reduce((sum, pos) => {
          const monthly = pos.estimatedYield ? parseFloat(pos.estimatedYield.monthly) : 0
          return sum + monthly
        }, 0).toFixed(2),
      }
      
      return {
        ...protocol,
        stats: {
          weightedApyPercent: weightedApy,
          positionsWithApy: positionsWithApy.length,
          totalPositions: protocol.positions.length,
          estimatedYield: totalYield,
        },
      }
    }
    
    return protocol
  })
  
  return protocolGroups.sort((a, b) => b.totalValue - a.totalValue)
}

// Transform NFTs from API response to display format
export function transformNFTs(nftsData: any): NFTDisplay[] {
  if (!nftsData?.data?.nfts) return []
  
  return nftsData.data.nfts.map((nft: any) => ({
    id: `${nft.address}-${nft.token_id}`,
    name: nft.name,
    collection: nft.collection_name,
    image: nft.image_url || '/placeholder.svg',
    floorPrice: nft.floor_price || 0,
    usdPrice: parseFloat(nft.usdPrice || nft.usdValue || '0'),
    tokenId: nft.token_id,
  }))
}

// Transform transactions from API response to display format
export function transformTransactions(transactions: Transaction[]): TransactionDisplay[] {
  return transactions.map((tx) => {
    const typeMap: Record<string, "send" | "receive" | "swap" | "contract"> = {
      'deposit': 'contract',
      'withdraw': 'contract',
      'swap': 'swap',
      'transfer': 'send',
      'approve': 'contract',
    }
    
    const txType = typeMap[tx.decoded?.action] || 'contract'
    const status = tx.txreceipt_status === '1' ? 'success' : 'failed'
    
    return {
      id: tx.hash,
      type: txType,
      from: tx.from,
      to: tx.to,
      amount: tx.value,
      token: 'ETH',
      value: parseFloat(tx.value) / 1e18 * 48, // Rough ETH price estimate
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      hash: tx.hash,
      status,
    }
  })
}

