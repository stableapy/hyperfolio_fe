"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TYPE_CONFIG, STATUS_CONFIG, ACTION_CONFIG, DIRECTION_CONFIG } from "./constants"
import { formatTimestamp, formatUsdValue, shortenAddress } from "./utils"
import type { Transaction } from "./types"

interface TransactionRowProps {
  transaction: Transaction
}

/**
 * Terminal-style transaction row with prompt indicator
 * Matches the styling from tokens-section/token-row.tsx
 */
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
    <TooltipProvider>
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group border-l-2 border-l-transparent hover:border-l-theme-accent">
        {/* Mobile Layout */}
        <div className="flex sm:hidden items-start gap-2.5">
          {/* Terminal Prompt + Icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-xs font-bold text-theme-accent select-none">&gt;</span>
            <div className="relative">
              <div
                className="p-2 rounded-sm"
                style={{ backgroundColor: `${actionConfig.color}15`, color: actionConfig.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              {tx.protocol?.logo && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-theme-bg border border-theme-border overflow-hidden">
                  <Image
                    src={tx.protocol.logo}
                    alt={tx.protocol.name || ''}
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="font-mono text-xs text-theme-accent font-bold">{displayLabel}</span>
              {tx.protocol?.name && tx.protocol.name !== 'Unknown' && tx.protocol.name !== 'Approve' && (
                <span className="font-mono text-[9px] text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-1 py-0.5 rounded">
                  {tx.protocol.name}
                </span>
              )}
              <span
                className="font-mono text-[9px] px-1 py-0.5 rounded"
                style={{
                  backgroundColor: `${statusConfig.color}15`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label.toLowerCase()}
              </span>
            </div>
            <div className="font-mono text-[10px] text-theme-text-muted truncate">
              {formatAmount(tx.amount)} <span className="text-theme-accent/70">{tx.token}</span>
            </div>
            <div className="font-mono text-[9px] text-theme-text-muted/60 mt-0.5">
              {formatTimestamp(tx.timestamp)}
            </div>
          </div>

          {/* Value */}
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-xs text-theme-accent font-bold tabular-nums">
              {tx.value > 0 ? formatUsdValue(tx.value) : '-'}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Terminal Prompt */}
          <span className="font-mono text-sm font-bold text-theme-accent select-none">&gt;</span>

          {/* Icon with protocol logo */}
          <div className="relative flex-shrink-0">
            <div
              className="p-2.5 rounded-sm"
              style={{ backgroundColor: `${actionConfig.color}15`, color: actionConfig.color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            {tx.protocol?.logo && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-theme-bg border border-theme-border overflow-hidden">
                <Image
                  src={tx.protocol.logo}
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
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-theme-accent font-bold tracking-wide">{displayLabel}</span>
              {tx.protocol?.name && tx.protocol.name !== 'Unknown' && tx.protocol.name !== 'Approve' && (
                <span className="font-mono text-[10px] text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-1.5 py-0.5 rounded">
                  {tx.protocol.name}
                </span>
              )}
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  backgroundColor: `${statusConfig.color}15`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label.toLowerCase()}
              </span>
              {tx.direction !== 'neutral' && (
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    backgroundColor: `${directionConfig.color}15`,
                    color: directionConfig.color,
                  }}
                >
                  {directionConfig.label.toLowerCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-theme-text-muted">
              <span className="text-[9px] text-theme-text-muted/60">from:</span>
              <span>{shortenAddress(tx.from)}</span>
              <span className="text-theme-accent/50">→</span>
              <span className="text-[9px] text-theme-text-muted/60">to:</span>
              <span>{shortenAddress(tx.to)}</span>
            </div>
          </div>

          {/* Amount and token - terminal style */}
          <div className="hidden md:flex items-center gap-1.5 min-w-[140px]">
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">amt:</span>
            <span className="font-mono text-xs text-theme-text-secondary tabular-nums truncate" title={tx.amount}>
              {formatAmount(tx.amount)}
            </span>
            <span className="font-mono text-[10px] text-theme-accent/70">{tx.token}</span>
          </div>

          {/* Value and timestamp - terminal style */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
              <span className="font-mono text-[10px] text-theme-text-muted">=</span>
              <span className="font-mono text-sm text-theme-accent font-bold tabular-nums">
                {tx.value > 0 ? formatUsdValue(tx.value) : '-'}
              </span>
            </div>

            <div className="font-mono text-[10px] text-theme-text-muted min-w-[60px] text-right">
              {formatTimestamp(tx.timestamp)}
            </div>

            {/* External link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://hyperevmscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-theme-accent/10 rounded"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-theme-text-muted hover:text-theme-accent" />
                </a>
              </TooltipTrigger>
              <TooltipContent className="bg-theme-bg border border-theme-border p-2">
                <div className="font-mono text-xs text-theme-text-secondary">
                  <span className="text-theme-accent">&gt;</span> open --explorer
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
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
