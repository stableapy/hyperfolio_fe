"use client"

import type { EmptyStateProps } from "./types"

/**
 * Empty state component shown when no wallets are configured
 * Prompts user to add their first wallet
 */
export function EmptyState({ onAddWallet }: EmptyStateProps) {
  return (
    <div className="container mx-auto px-6 py-20 text-center">
      <div className="font-mono text-2xl text-[#00ff41] mb-4">
        &gt; NO_WALLETS_CONFIGURED
      </div>
      <div className="font-mono text-sm text-[#708090] mb-6">
        Add your first wallet to start tracking your portfolio
      </div>
      <button
        type="button"
        onClick={onAddWallet}
        className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00d9ff] transition-colors glow-green"
      >
        + ADD FIRST WALLET
      </button>
    </div>
  )
}

