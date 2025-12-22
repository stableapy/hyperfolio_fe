// Types for the transactions section module

export interface Transaction {
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

export type TransactionType = Transaction["type"]
export type TransactionStatus = Transaction["status"]

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

