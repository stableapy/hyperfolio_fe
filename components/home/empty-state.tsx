"use client"

import type { EmptyStateProps } from "./types"

/**
 * Empty state component shown when no wallets are configured
 * Prompts user to add their first wallet
 * Uses semantic H2 heading for SEO
 */
export function EmptyState({ onAddWallet }: EmptyStateProps) {
  return (
    <section className="container mx-auto px-6 py-20 text-center" aria-labelledby="empty-state-heading">
      <h2 
        id="empty-state-heading"
        className="font-mono text-2xl text-[#00ff41] mb-4 text-glow-green"
      >
        &gt; Start Tracking Your HyperEVM Portfolio
      </h2>
      <p className="font-mono text-sm text-[#708090] mb-6 max-w-md mx-auto">
        Add your first HyperEVM wallet address to monitor your tokens, NFTs, DeFi positions, 
        and transaction history in real-time.
      </p>
      <button
        type="button"
        onClick={onAddWallet}
        className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00d9ff] transition-colors glow-green"
      >
        + ADD FIRST WALLET
      </button>
      
      {/* Hidden SEO content - visible to crawlers */}
      <div className="sr-only">
        <h3>How to Track Your HyperEVM Portfolio</h3>
        <p>
          Hyperfolio allows you to track cryptocurrency portfolios on the HyperEVM blockchain. 
          Simply enter your public wallet address to view token balances, NFT collections, 
          DeFi positions from protocols like Hyperlend and Hyperswap, and complete transaction history.
          No wallet connection required - just paste any HyperEVM address to get started.
        </p>
      </div>
    </section>
  )
}

