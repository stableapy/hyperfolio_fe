import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react"
import type { TypeConfig, StatusConfig, Transaction } from "./types"

export const TYPE_CONFIG: Record<string, TypeConfig> = {
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

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  success: { label: "Success", color: "#00ff41" },
  pending: { label: "Pending", color: "#ffaa00" },
  failed: { label: "Failed", color: "#ff4444" },
}

// Mock transactions for demo/fallback
export const MOCK_TRANSACTIONS: Transaction[] = [
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

