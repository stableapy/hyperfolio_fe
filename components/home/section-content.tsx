"use client"

import { TokensSection } from "@/components/sections/tokens-section"
import { NFTsSection } from "@/components/sections/nfts-section"
import { DeFiSection } from "@/components/sections/defi-section"
import { HypercoreSection } from "@/components/sections/hypercore-section"
import { TransactionsSection } from "@/components/sections/transactions-section"
import type { SectionContentProps } from "./types"

/**
 * Section content component that renders the appropriate section
 * based on the active section selection
 */
export function SectionContent({ 
  activeSection, 
  isLoading, 
  isDataVisible 
}: SectionContentProps) {
  return (
    <div className={`transition-all duration-500 delay-200 ${
      isDataVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      {activeSection === "tokens" && <TokensSection isLoading={isLoading} />}
      {activeSection === "nfts" && <NFTsSection isLoading={isLoading} />}
      {activeSection === "defi" && <DeFiSection isLoading={isLoading} />}
      {activeSection === "hypercore" && <HypercoreSection isLoading={isLoading} />}
      {activeSection === "transactions" && <TransactionsSection isLoading={isLoading} />}
    </div>
  )
}

