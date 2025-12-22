// Types for the transactions section module
import type { DecodedProtocol, DecodedToken } from "@/lib/types/api"

export interface Transaction {
  id: string
  type: "send" | "receive" | "swap" | "contract" | "approve"
  action: string // Original action from decoded (supply, withdraw, swap, approve, etc.)
  from: string
  to: string
  amount: string
  token: string
  tokens?: DecodedToken[] // All tokens involved in the transaction
  value: number
  timestamp: string
  hash: string
  status: "success" | "pending" | "failed"
  protocol?: DecodedProtocol
  direction: "in" | "out" | "neutral"
  functionName?: string
  gasUsed?: string
  gasPrice?: string
}

export type TransactionType = Transaction["type"]
export type TransactionStatus = Transaction["status"]
export type TransactionDirection = Transaction["direction"]

export interface TypeConfig {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}

export interface StatusConfig {
  label: string
  color: string
}

export interface TransactionsSectionProps {
  isLoading?: boolean
}
