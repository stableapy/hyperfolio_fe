"use client"

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Shield, FileCode2, PiggyBank, Send } from "lucide-react"
import type { TypeConfig, StatusConfig } from "./types"

// Note: Colors use CSS variables for theme-aware styling
export const TYPE_CONFIG: Record<string, TypeConfig> = {
  send: {
    icon: ArrowUpRight,
    label: "Send",
    color: "var(--theme-red)",
  },
  receive: {
    icon: ArrowDownLeft,
    label: "Receive",
    color: "var(--theme-accent)",
  },
  swap: {
    icon: ArrowLeftRight,
    label: "Swap",
    color: "var(--theme-cyan)",
  },
  contract: {
    icon: FileCode2,
    label: "Contract",
    color: "var(--theme-magenta)",
  },
  approve: {
    icon: Shield,
    label: "Approve",
    color: "var(--theme-orange)",
  },
}

// Action-specific configurations for better display
export const ACTION_CONFIG: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  supply: {
    label: "Supply",
    color: "var(--theme-accent)",
    icon: PiggyBank,
  },
  deposit: {
    label: "Deposit",
    color: "var(--theme-accent)",
    icon: ArrowDownLeft,
  },
  withdraw: {
    label: "Withdraw",
    color: "var(--theme-red)",
    icon: ArrowUpRight,
  },
  swap: {
    label: "Swap",
    color: "var(--theme-cyan)",
    icon: ArrowLeftRight,
  },
  approve: {
    label: "Approve",
    color: "var(--theme-orange)",
    icon: Shield,
  },
  transfer: {
    label: "Transfer",
    color: "var(--theme-cyan)",
    icon: Send,
  },
  unknown: {
    label: "Contract",
    color: "#708090",
    icon: FileCode2,
  },
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  success: { label: "Success", color: "var(--theme-accent)" },
  pending: { label: "Pending", color: "var(--theme-orange)" },
  failed: { label: "Failed", color: "var(--theme-red)" },
}

// Direction configurations
export const DIRECTION_CONFIG: Record<string, { label: string; color: string }> = {
  in: { label: "In", color: "var(--theme-accent)" },
  out: { label: "Out", color: "var(--theme-red)" },
  neutral: { label: "", color: "#708090" },
}
