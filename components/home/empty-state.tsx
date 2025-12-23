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
        className="font-mono text-2xl text-theme-accent mb-4 dark:text-glow-green"
      >
        &gt; Start Tracking Your HyperEVM Portfolio
      </h2>
      <p className="font-mono text-sm text-theme-text-secondary mb-6 max-w-md mx-auto">
        Add your first HyperEVM wallet address to monitor your tokens, NFTs, DeFi positions, 
        and transaction history in real-time.
      </p>
      <button
        type="button"
        onClick={onAddWallet}
        className="px-6 py-3 bg-theme-accent text-theme-bg rounded-lg font-mono text-sm font-bold hover:opacity-90 transition-all dark:glow-green"
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

