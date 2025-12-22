"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { TYPE_CONFIG, STATUS_CONFIG, ACTION_CONFIG, DIRECTION_CONFIG } from "./constants"
import { formatTimestamp, formatUsdValue, shortenAddress } from "./utils"
import type { Transaction } from "./types"

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction: tx }: TransactionRowProps) {
  // Get action config for better display, fallback to type config
  const actionConfig = ACTION_CONFIG[tx.action] || ACTION_CONFIG.unknown
  const typeConfig = TYPE_CONFIG[tx.type]
  const statusConfig = STATUS_CONFIG[tx.status]
  const directionConfig = DIRECTION_CONFIG[tx.direction]
  
  // Use action icon if available, otherwise type icon
  const Icon = actionConfig.icon || typeConfig.icon

  // Format display label - use action if meaningful, otherwise type
  const displayLabel = tx.action !== 'unknown' 
    ? actionConfig.label 
    : typeConfig.label

  return (
    <div className="p-4 hover:bg-[#111618] transition-colors group">
      <div className="flex items-center gap-4">
        {/* Icon with protocol logo */}
        <div className="relative">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${actionConfig.color}20`, color: actionConfig.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          {tx.protocol?.logo && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0a0d0f] border border-[#1a2225] overflow-hidden">
              <Image
                src={tx.protocol.logo.startsWith('http') ? tx.protocol.logo : tx.protocol.logo}
                alt={tx.protocol.name || ''}
                width={20}
                height={20}
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Transaction details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-[#00ff41] font-semibold">{displayLabel}</span>
            {tx.protocol?.name && tx.protocol.name !== 'Unknown' && tx.protocol.name !== 'Approve' && (
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#1a2225] text-[#00d9ff]">
                {tx.protocol.name}
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </span>
            {tx.direction !== 'neutral' && (
              <span
                className="px-2 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: `${directionConfig.color}20`,
                  color: directionConfig.color,
                }}
              >
                {directionConfig.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#708090] truncate">
            <span>{shortenAddress(tx.from)}</span>
            <span>→</span>
            <span>{shortenAddress(tx.to)}</span>
          </div>
        </div>

        {/* Amount and token */}
        <div className="text-right min-w-[120px]">
          <div className="font-mono text-sm text-white font-semibold mb-1 truncate" title={tx.amount}>
            {formatAmount(tx.amount)}
          </div>
          <div className="font-mono text-xs text-[#708090]">{tx.token}</div>
        </div>

        {/* Value and timestamp */}
        <div className="text-right w-32">
          <div className="font-mono text-sm text-white font-semibold mb-1">
            {tx.value > 0 ? formatUsdValue(tx.value) : '-'}
          </div>
          <div className="font-mono text-xs text-[#708090]">{formatTimestamp(tx.timestamp)}</div>
        </div>

        {/* External link */}
        <a
          href={`https://hyperevmscan.io/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-4 h-4 text-[#708090] hover:text-[#00d9ff]" />
        </a>
      </div>
    </div>
  )
}

// Helper to format amount for display (truncate long numbers)
function formatAmount(amount: string): string {
  if (!amount) return '0'
  
  // If it's a swap format (contains →), return as is but truncate
  if (amount.includes('→')) {
    const parts = amount.split('→')
    if (parts.length === 2) {
      return `${truncateNumber(parts[0].trim())} → ${truncateNumber(parts[1].trim())}`
    }
    return amount
  }
  
  return truncateNumber(amount)
}

function truncateNumber(numStr: string): string {
  // Extract number and symbol
  const match = numStr.match(/^([\d.]+)\s*(.*)$/)
  if (!match) return numStr
  
  const num = parseFloat(match[1])
  const symbol = match[2]
  
  if (Number.isNaN(num)) return numStr
  
  // Format based on size
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`.trim()
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`.trim()
  } else if (num < 0.0001 && num > 0) {
    return `<0.0001 ${symbol}`.trim()
  } else {
    return `${num.toFixed(num < 1 ? 4 : 2)} ${symbol}`.trim()
  }
}
