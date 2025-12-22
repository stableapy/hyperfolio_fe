import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Shield, FileCode2, Coins, Wallet, PiggyBank, Send } from "lucide-react"
import type { TypeConfig, StatusConfig } from "./types"

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
    icon: FileCode2,
    label: "Contract",
    color: "#ff00ff",
  },
  approve: {
    icon: Shield,
    label: "Approve",
    color: "#ffaa00",
  },
}

// Action-specific configurations for better display
export const ACTION_CONFIG: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  supply: {
    label: "Supply",
    color: "#00ff41",
    icon: PiggyBank,
  },
  deposit: {
    label: "Deposit",
    color: "#00ff41",
    icon: ArrowDownLeft,
  },
  withdraw: {
    label: "Withdraw",
    color: "#ff4444",
    icon: ArrowUpRight,
  },
  swap: {
    label: "Swap",
    color: "#00d9ff",
    icon: ArrowLeftRight,
  },
  approve: {
    label: "Approve",
    color: "#ffaa00",
    icon: Shield,
  },
  transfer: {
    label: "Transfer",
    color: "#00d9ff",
    icon: Send,
  },
  unknown: {
    label: "Contract",
    color: "#708090",
    icon: FileCode2,
  },
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  success: { label: "Success", color: "#00ff41" },
  pending: { label: "Pending", color: "#ffaa00" },
  failed: { label: "Failed", color: "#ff4444" },
}

// Direction configurations
export const DIRECTION_CONFIG: Record<string, { label: string; color: string }> = {
  in: { label: "In", color: "#00ff41" },
  out: { label: "Out", color: "#ff4444" },
  neutral: { label: "", color: "#708090" },
}
