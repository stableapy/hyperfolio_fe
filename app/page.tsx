"use client"

import { useState, useEffect } from "react"
import { AddWalletDialog } from "@/components/add-wallet-dialog"
import { PortfolioHero } from "@/components/portfolio-hero"
import { SectionNav } from "@/components/section-nav"
import { TokensSection } from "@/components/sections/tokens-section"
import { NFTsSection } from "@/components/sections/nfts-section"
import { DeFiSection } from "@/components/sections/defi-section"
import { HypercoreSection } from "@/components/sections/hypercore-section"
import { TransactionsSection } from "@/components/sections/transactions-section"
import { useWalletStore } from "@/lib/store/wallet-store"

export default function Home() {
  const {
    wallets,
    isLoading,
    aggregateData,
    error,
    addWallet,
    syncAllWallets,
  } = useWalletStore()

  const [activeSection, setActiveSection] = useState("tokens")
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)

  // Sync wallets data on mount and when wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      syncAllWallets()
    }
  }, [wallets.length, syncAllWallets])

  const handleAddWallet = (wallet: { name: string; address: string; color: string }) => {
    addWallet(wallet)
  }

  const handleRefresh = () => {
    syncAllWallets()
  }

  // Calculate aggregate values from data
  const totalValue = aggregateData?.total_value || 0
  const totalChange24h = aggregateData?.total_change_24h || 0

  return (
    <main className="min-h-screen bg-[#0a0f0f]">
      {/* Hero Section - Full width, no padding */}
      <PortfolioHero 
        totalValue={totalValue} 
        change24h={totalChange24h} 
        isLoading={isLoading} 
        onRefresh={handleRefresh}
        onAddWallet={() => setIsAddWalletOpen(true)}
      />

      {/* Error display */}
      {error && (
        <div className="container mx-auto px-6">
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="font-mono text-sm text-red-400">ERROR: {error}</p>
          </div>
        </div>
      )}

      {/* Add Wallet Dialog */}
      <AddWalletDialog 
        isOpen={isAddWalletOpen} 
        onClose={() => setIsAddWalletOpen(false)} 
        onAdd={handleAddWallet} 
      />

      {/* Content Sections */}
      {wallets.length === 0 ? (
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="font-mono text-2xl text-[#00ff41] mb-4">&gt; NO_WALLETS_CONFIGURED</div>
          <div className="font-mono text-sm text-[#708090] mb-6">Add your first wallet to start tracking your portfolio</div>
          <button
            type="button"
            onClick={() => setIsAddWalletOpen(true)}
            className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00d9ff] transition-colors glow-green"
          >
            + ADD FIRST WALLET
          </button>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-8">
          <SectionNav activeSection={activeSection} onSectionChange={setActiveSection} />

          {activeSection === "tokens" && <TokensSection isLoading={isLoading} />}
          {activeSection === "nfts" && <NFTsSection isLoading={isLoading} />}
          {activeSection === "defi" && <DeFiSection isLoading={isLoading} />}
          {activeSection === "hypercore" && <HypercoreSection isLoading={isLoading} />}
          {activeSection === "transactions" && <TransactionsSection isLoading={isLoading} />}
        </div>
      )}
    </main>
  )
}
