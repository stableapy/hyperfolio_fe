"use client"

import { useState, useMemo } from "react"
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ExternalLink, Filter } from "lucide-react"
import { TerminalCard } from "../terminal-card"
import { LoadingSpinner } from "../loading-spinner"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTransactions } from "@/lib/utils/data-transformers"

interface Transaction {
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

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "receive",
    from: "0x742d...5e3a",
    to: "0x8f3c...2d1b",
    amount: "125.5",
    token: "HYPE",
    value: 1568.75,
    timestamp: "2025-10-29T10:30:00Z",
    hash: "0xabc123...def456",
    status: "success",
  },
  {
    id: "2",
    type: "swap",
    from: "0x8f3c...2d1b",
    to: "0x8f3c...2d1b",
    amount: "2.5 ETH → 8100 USDC",
    token: "ETH/USDC",
    value: 8100.0,
    timestamp: "2025-10-29T09:15:00Z",
    hash: "0x789xyz...abc123",
    status: "success",
  },
  {
    id: "3",
    type: "send",
    from: "0x8f3c...2d1b",
    to: "0x1a2b...9c8d",
    amount: "1000",
    token: "USDC",
    value: 1000.0,
    timestamp: "2025-10-28T18:45:00Z",
    hash: "0xdef456...ghi789",
    status: "success",
  },
  {
    id: "4",
    type: "contract",
    from: "0x8f3c...2d1b",
    to: "HyperSwap",
    amount: "5000",
    token: "USDC",
    value: 5000.0,
    timestamp: "2025-10-28T14:20:00Z",
    hash: "0xghi789...jkl012",
    status: "success",
  },
  {
    id: "5",
    type: "receive",
    from: "0x1a2b...9c8d",
    to: "0x8f3c...2d1b",
    amount: "0.5",
    token: "ETH",
    value: 1620.0,
    timestamp: "2025-10-27T22:10:00Z",
    hash: "0xjkl012...mno345",
    status: "success",
  },
  {
    id: "6",
    type: "send",
    from: "0x8f3c...2d1b",
    to: "0x742d...5e3a",
    amount: "250",
    token: "LINK",
    value: 3750.0,
    timestamp: "2025-10-27T16:30:00Z",
    hash: "0xmno345...pqr678",
    status: "pending",
  },
]

const TYPE_CONFIG = {
  send: {
    icon: ArrowUpRight,
    label: "Send",
    color: "#ff4444",
  },
  receive: {
    icon: ArrowDownLeft,
    label: "Receive",
    color: "#00ff41",
  },
  swap: {
    icon: ArrowLeftRight,
    label: "Swap",
    color: "#00d9ff",
  },
  contract: {
    icon: ArrowLeftRight,
    label: "Contract",
    color: "#ff00ff",
  },
}

const STATUS_CONFIG = {
  success: { label: "Success", color: "#00ff41" },
  pending: { label: "Pending", color: "#ffaa00" },
  failed: { label: "Failed", color: "#ff4444" },
}

export function TransactionsSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Get transactions from selected wallet or all wallets
  const transactions = useMemo(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.transactions) {
        return transformTransactions(walletData[wallet.address].transactions)
      }
    } else {
      // Aggregate transactions from all wallets
      const allTransactions: Transaction[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.transactions) {
          allTransactions.push(...transformTransactions(walletData[wallet.address].transactions))
        }
      })
      return allTransactions
    }
    
    return MOCK_TRANSACTIONS
  }, [wallets, walletData, selectedWalletId])

  const filteredTransactions = filterType ? transactions.filter((tx) => tx.type === filterType) : transactions

  const formatTimestamp = (timestamp: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-sm text-[#708090]">
          Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#111618] border border-[#1a2225] rounded-lg">
          <button
            onClick={() => setFilterType(null)}
            className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
              filterType === null ? "bg-[#00ff41] text-[#0a0e0f]" : "bg-[#1a2225] text-[#708090] hover:text-[#00ff41]"
            }`}
          >
            All
          </button>
          {Object.entries(TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                filterType === type ? "text-[#0a0e0f]" : "bg-[#1a2225] text-[#708090] hover:text-[#00ff41]"
              }`}
              style={{
                backgroundColor: filterType === type ? config.color : undefined,
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      )}

      <TerminalCard>
        <div className="divide-y divide-[#1a2225]">
          {filteredTransactions.map((tx) => {
            const typeConfig = TYPE_CONFIG[tx.type]
            const statusConfig = STATUS_CONFIG[tx.status]
            const Icon = typeConfig.icon

            return (
              <div key={tx.id} className="p-4 hover:bg-[#111618] transition-colors group">
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
                      ${tx.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          })}
        </div>
      </TerminalCard>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="font-mono text-[#708090] mb-2">NO TRANSACTIONS FOUND</div>
          <div className="font-mono text-sm text-[#708090]">Try adjusting your filters</div>
        </div>
      )}
    </div>
  )
}
