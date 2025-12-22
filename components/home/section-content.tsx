"use client"

import { TokensSection } from "@/components/sections/tokens-section"
import { NFTsSection } from "@/components/sections/nfts-section"
import { DeFiSection } from "@/components/sections/defi-section"
import { HypercoreSection } from "@/components/sections/hypercore-section"
import { TransactionsSection } from "@/components/sections/transactions-section"
import type { SectionContentProps } from "./types"

// Section configuration with SEO-friendly headings
const SECTION_CONFIG = {
  tokens: {
    id: "tokens-panel",
    heading: "Token Holdings",
    description: "View your HyperEVM token balances with real-time USD valuations",
  },
  nfts: {
    id: "nfts-panel",
    heading: "NFT Collections",
    description: "Browse and manage your NFT collections on HyperEVM",
  },
  defi: {
    id: "defi-panel",
    heading: "DeFi Positions",
    description: "Track lending, staking and liquidity positions across Hyperliquid protocols",
  },
  hypercore: {
    id: "hypercore-panel",
    heading: "Hypercore Assets",
    description: "Monitor your Hypercore ecosystem assets and staking positions",
  },
  transactions: {
    id: "transactions-panel",
    heading: "Transaction History",
    description: "View complete transaction records on the HyperEVM blockchain",
  },
} as const

/**
 * Section content component that renders the appropriate section
 * based on the active section selection
 * Includes proper H2 headings for SEO
 */
export function SectionContent({ 
  activeSection, 
  isLoading, 
  isDataVisible 
}: SectionContentProps) {
  const config = SECTION_CONFIG[activeSection as keyof typeof SECTION_CONFIG]
  
  return (
    <section 
      id={config?.id}
      role="tabpanel"
      aria-labelledby={`${activeSection}-tab`}
      className={`transition-all duration-500 delay-200 ${
        isDataVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* SEO-friendly section heading - visually hidden but accessible */}
      <h2 className="sr-only">{config?.heading}</h2>
      <p className="sr-only">{config?.description}</p>
      
      {activeSection === "tokens" && <TokensSection isLoading={isLoading} />}
      {activeSection === "nfts" && <NFTsSection isLoading={isLoading} />}
      {activeSection === "defi" && <DeFiSection isLoading={isLoading} />}
      {activeSection === "hypercore" && <HypercoreSection isLoading={isLoading} />}
      {activeSection === "transactions" && <TransactionsSection isLoading={isLoading} />}
    </section>
  )
}

