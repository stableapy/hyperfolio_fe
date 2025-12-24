// Transaction transformation utilities
import type { Transaction } from '@/lib/types/api'
import { safeFloat, parseWei } from '../parsers'

export interface TransactionDisplay {
  id: string
  type: "send" | "receive" | "swap" | "contract" | "approve"
  action: string
  from: string
  to: string
  amount: string
  token: string
  tokens?: import('@/lib/types/api').DecodedToken[]
  value: number
  timestamp: string
  hash: string
  status: "success" | "pending" | "failed"
  protocol?: import('@/lib/types/api').DecodedProtocol
  direction: "in" | "out" | "neutral"
  functionName?: string
  gasUsed?: string
  gasPrice?: string
}

/**
 * Transform transactions from API response to display format
 */
export function transformTransactions(transactions: Transaction[]): TransactionDisplay[] {
  return transactions.map((tx) => {
    const decoded = tx.decoded
    const action = decoded?.action || 'unknown'

    // Map action to transaction type
    const typeMap: Record<string, "send" | "receive" | "swap" | "contract" | "approve"> = {
      'deposit': 'contract',
      'supply': 'contract',
      'withdraw': 'receive',
      'swap': 'swap',
      'transfer': 'send',
      'approve': 'approve',
      'unknown': 'contract',
    }

    // Determine type based on action and direction
    let txType = typeMap[action] || 'contract'
    if (decoded?.direction === 'in' && txType !== 'swap') {
      txType = 'receive'
    } else if (decoded?.direction === 'out' && txType !== 'swap' && txType !== 'approve') {
      txType = 'send'
    }

    const status = tx.txreceipt_status === '1' ? 'success' : (tx.isError === '1' ? 'failed' : 'pending')
    const tokens = decoded?.tokens

    // Calculate amount string and value from tokens
    let amount = ''
    let token = ''
    let value = 0

    // MAX_UINT256 threshold - values above this are likely "max" values (withdraw all, infinite approve)
    const MAX_UINT256_THRESHOLD = 1e50

    if (tokens && tokens.length > 0) {
      const firstToken = tokens[0]
      const tokenAmount = safeFloat(firstToken.amount)
      const tokenValue = firstToken.valueUSD || 0

      // Check for MAX_UINT256 values (used for "withdraw all" or "infinite approve")
      const isMaxValue = tokenAmount > MAX_UINT256_THRESHOLD || tokenValue > MAX_UINT256_THRESHOLD

      if (tokens.length === 1) {
        // Single token transaction
        if (isMaxValue) {
          // For max values, show "MAX" or "All" depending on action
          amount = action === 'withdraw' ? 'All' : 'MAX'
          token = firstToken.symbol
          value = 0 // Don't show USD value for max
        } else {
          amount = firstToken.amount
          token = firstToken.symbol
          value = tokenValue
        }
      } else if (tokens.length >= 2 && action === 'swap') {
        // Swap with multiple tokens
        const token0Amount = safeFloat(tokens[0].amount)
        const token1Amount = safeFloat(tokens[1].amount)

        // Handle max values in swaps
        const amt0 = token0Amount > MAX_UINT256_THRESHOLD ? 'MAX' : tokens[0].amount
        const amt1 = token1Amount > MAX_UINT256_THRESHOLD ? 'MAX' : tokens[1].amount

        amount = `${amt0} ${tokens[0].symbol} → ${amt1} ${tokens[1].symbol}`
        token = `${tokens[0].symbol}/${tokens[1].symbol}`
        value = tokens[0].valueUSD && tokens[0].valueUSD < MAX_UINT256_THRESHOLD
          ? tokens[0].valueUSD
          : (tokens[1].valueUSD && tokens[1].valueUSD < MAX_UINT256_THRESHOLD ? tokens[1].valueUSD : 0)
      } else {
        // Multiple tokens - show first one
        if (isMaxValue) {
          amount = action === 'withdraw' ? 'All' : 'MAX'
          token = firstToken.symbol
          value = 0
        } else {
          amount = firstToken.amount
          token = firstToken.symbol
          value = tokens.reduce((sum, t) => {
            const v = t.valueUSD || 0
            return sum + (v < MAX_UINT256_THRESHOLD ? v : 0)
          }, 0)
        }
      }
    } else {
      // Fallback to raw value (in wei)
      const rawValue = parseWei(tx.value)
      if (rawValue > 0 && rawValue < MAX_UINT256_THRESHOLD) {
        amount = rawValue.toFixed(6)
        token = 'HYPE'
        value = rawValue * 25 // Rough HYPE price estimate
      } else {
        amount = '0'
        token = ''
        value = 0
      }
    }

    // Get protocol info
    const protocol = decoded?.protocol
    const direction = decoded?.direction || 'out'

    return {
      id: tx.hash,
      type: txType,
      action: action,
      from: tx.from,
      to: tx.to,
      amount,
      token,
      tokens,
      value,
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      hash: tx.hash,
      status,
      protocol,
      direction,
      functionName: tx.functionName,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
    }
  })
}
