'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TYPE_CONFIG,
  STATUS_CONFIG,
  ACTION_CONFIG,
  DIRECTION_CONFIG,
} from './constants';
import { formatTimestamp, formatUsdValue, shortenAddress } from './utils';
import type { Transaction } from './types';

interface TransactionRowProps {
  transaction: Transaction;
  privacyMode?: boolean;
}

/**
 * Terminal-style transaction row with prompt indicator
 * Matches the styling from tokens-section/token-row.tsx
 */
export function TransactionRow({
  transaction: tx,
  privacyMode = false,
}: TransactionRowProps) {
  // Get action config for better display, fallback to type config
  const actionConfig = ACTION_CONFIG[tx.action] || ACTION_CONFIG.unknown;
  const typeConfig = TYPE_CONFIG[tx.type];
  const statusConfig = STATUS_CONFIG[tx.status];
  const directionConfig = DIRECTION_CONFIG[tx.direction];

  // Use action icon if available, otherwise type icon
  const Icon = actionConfig.icon || typeConfig.icon;

  // Format display label - use action if meaningful, otherwise type
  const displayLabel =
    tx.action !== 'unknown' ? actionConfig.label : typeConfig.label;

  return (
    <TooltipProvider>
      <div className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3">
        {/* Mobile Layout */}
        <div className="flex items-start gap-2.5 sm:hidden">
          {/* Terminal Prompt + Icon */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="text-theme-accent font-mono text-xs font-bold select-none">
              &gt;
            </span>
            <div className="relative">
              <div
                className="rounded-sm p-2"
                style={{
                  backgroundColor: `${actionConfig.color}15`,
                  color: actionConfig.color,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              {tx.protocol?.logo && (
                <div className="bg-theme-bg border-theme-border absolute -right-1 -bottom-1 h-4 w-4 overflow-hidden rounded-full border">
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
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-theme-accent font-mono text-xs font-bold">
                {displayLabel}
              </span>
              {tx.protocol?.name &&
                tx.protocol.name !== 'Unknown' &&
                tx.protocol.name !== 'Approve' && (
                  <span className="text-theme-cyan bg-theme-cyan/10 border-theme-cyan/20 rounded border px-1 py-0.5 font-mono text-[9px]">
                    {tx.protocol.name}
                  </span>
                )}
              <span
                className="rounded px-1 py-0.5 font-mono text-[9px]"
                style={{
                  backgroundColor: `${statusConfig.color}15`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label.toLowerCase()}
              </span>
            </div>
            <div className="text-theme-text-muted truncate font-mono text-[10px]">
              {formatAmount(tx.amount)}{' '}
              <span className="text-theme-accent/70">{tx.token}</span>
            </div>
            <div className="text-theme-text-muted/60 mt-0.5 font-mono text-[9px]">
              {formatTimestamp(tx.timestamp)}
            </div>
          </div>

          {/* Value */}
          <div className="flex-shrink-0 text-right">
            <div className="text-theme-accent font-mono text-xs font-bold tabular-nums">
              {tx.value > 0
                ? privacyMode
                  ? '•••'
                  : formatUsdValue(tx.value)
                : '-'}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Terminal Prompt */}
          <span className="text-theme-accent font-mono text-sm font-bold select-none">
            &gt;
          </span>

          {/* Icon with protocol logo */}
          <div className="relative flex-shrink-0">
            <div
              className="rounded-sm p-2.5"
              style={{
                backgroundColor: `${actionConfig.color}15`,
                color: actionConfig.color,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            {tx.protocol?.logo && (
              <div className="bg-theme-bg border-theme-border absolute -right-1 -bottom-1 h-5 w-5 overflow-hidden rounded-full border">
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
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-theme-accent font-mono text-sm font-bold tracking-wide">
                {displayLabel}
              </span>
              {tx.protocol?.name &&
                tx.protocol.name !== 'Unknown' &&
                tx.protocol.name !== 'Approve' && (
                  <span className="text-theme-cyan bg-theme-cyan/10 border-theme-cyan/20 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                    {tx.protocol.name}
                  </span>
                )}
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                style={{
                  backgroundColor: `${statusConfig.color}15`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label.toLowerCase()}
              </span>
              {tx.direction !== 'neutral' && (
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                  style={{
                    backgroundColor: `${directionConfig.color}15`,
                    color: directionConfig.color,
                  }}
                >
                  {directionConfig.label.toLowerCase()}
                </span>
              )}
            </div>
            <div className="text-theme-text-muted flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-theme-text-muted/60 text-[9px]">from:</span>
              <span>{shortenAddress(tx.from)}</span>
              <span className="text-theme-accent/50">→</span>
              <span className="text-theme-text-muted/60 text-[9px]">to:</span>
              <span>{shortenAddress(tx.to)}</span>
            </div>
          </div>

          {/* Amount and token - terminal style */}
          <div className="hidden min-w-[140px] items-center gap-1.5 md:flex">
            <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
              amt:
            </span>
            <span
              className="text-theme-text-secondary truncate font-mono text-xs tabular-nums"
              title={tx.amount}
            >
              {formatAmount(tx.amount)}
            </span>
            <span className="text-theme-accent/70 font-mono text-[10px]">
              {tx.token}
            </span>
          </div>

          {/* Value and timestamp - terminal style */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <div className="flex min-w-[90px] items-center justify-end gap-1.5">
              <span className="text-theme-text-muted font-mono text-[10px]">
                =
              </span>
              <span className="text-theme-accent font-mono text-sm font-bold tabular-nums">
                {tx.value > 0
                  ? privacyMode
                    ? '•••'
                    : formatUsdValue(tx.value)
                  : '-'}
              </span>
            </div>

            <div className="text-theme-text-muted min-w-[60px] text-right font-mono text-[10px]">
              {formatTimestamp(tx.timestamp)}
            </div>

            {/* External link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://hyperevmscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-theme-accent/10 rounded p-1.5 opacity-0 transition-all duration-150 group-hover:opacity-100"
                >
                  <ExternalLink className="text-theme-text-muted hover:text-theme-accent h-3.5 w-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent className="bg-theme-bg border-theme-border border p-2">
                <div className="text-theme-text-secondary font-mono text-xs">
                  <span className="text-theme-accent">&gt;</span> open
                  --explorer
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Helper to format amount for display (truncate long numbers)
function formatAmount(amount: string): string {
  if (!amount) return '0';

  // If it's a swap format (contains →), return as is but truncate
  if (amount.includes('→')) {
    const parts = amount.split('→');
    if (parts.length === 2) {
      return `${truncateNumber(parts[0].trim())} → ${truncateNumber(parts[1].trim())}`;
    }
    return amount;
  }

  return truncateNumber(amount);
}

function truncateNumber(numStr: string): string {
  // Extract number and symbol
  const match = numStr.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return numStr;

  const num = parseFloat(match[1]);
  const symbol = match[2];

  if (Number.isNaN(num)) return numStr;

  // Format based on size
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`.trim();
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`.trim();
  } else if (num < 0.0001 && num > 0) {
    return `<0.0001 ${symbol}`.trim();
  } else {
    return `${num.toFixed(num < 1 ? 4 : 2)} ${symbol}`.trim();
  }
}
