"use client"

import { ExternalLink } from "lucide-react"
import { TYPE_CONFIG, STATUS_CONFIG } from "./constants"
import { formatTimestamp, formatUsdValue } from "./utils"
import type { Transaction } from "./types"

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction: tx }: TransactionRowProps) {
  const typeConfig = TYPE_CONFIG[tx.type]
  const statusConfig = STATUS_CONFIG[tx.status]
  const Icon = typeConfig.icon

  return (
    <div className="p-4 hover:bg-[#111618] transition-colors group">
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-[#00ff41] font-semibold">{typeConfig.label}</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#708090]">
            <span>{tx.from}</span>
            <span>→</span>
            <span>{tx.to}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-sm text-white font-semibold mb-1">{tx.amount}</div>
          <div className="font-mono text-xs text-[#708090]">{tx.token}</div>
        </div>

        <div className="text-right w-32">
          <div className="font-mono text-sm text-white font-semibold mb-1">
            {formatUsdValue(tx.value)}
          </div>
          <div className="font-mono text-xs text-[#708090]">{formatTimestamp(tx.timestamp)}</div>
        </div>

        <a
          href={`https://explorer.hyperevm.com/tx/${tx.hash}`}
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

