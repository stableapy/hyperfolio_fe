"use client"

import { useState } from "react"
import { TerminalCard } from "@/components/ui/terminal-card"
import { SwapWidgetInline } from "@/components/swap-widget"

import { TokenSummaryCards } from "./token-summary-cards"
import { TokenSearchBar } from "./token-search-bar"
import { TokenRow } from "./token-row"
import { TokenRowMobile } from "./token-row-mobile"
import { TokenListSkeleton } from "./token-list-skeleton"
import { useTokensData } from "./hooks"
import { getSwapTokenAddress, HYPEREVM_CHAIN_ID } from "./utils"
import type { Token, SwapToken, TokensSectionProps } from "./types"

/**
 * Main TokensSection component
 * Displays a list of tokens with search, grouping, and swap functionality
 */
export function TokensSection({ isLoading = false }: TokensSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isGrouped, setIsGrouped] = useState(true)
  const [selectedSwapToken, setSelectedSwapToken] = useState<SwapToken | undefined>(undefined)

  const { 
    filteredTokens, 
    totals, 
    hasData, 
    wallets, 
    selectedWalletId 
  } = useTokensData({ searchQuery, isGrouped })

  const handleSwapClick = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const swapToken: SwapToken = {
      address: getSwapTokenAddress(token.address),
      symbol: token.symbol,
      chainId: HYPEREVM_CHAIN_ID,
    }
    
    setSelectedSwapToken(swapToken)
  }

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData

  // Show group toggle only in multi-wallet view with multiple wallets
  const showGroupToggle = !selectedWalletId && wallets.length > 1

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left: Token List */}
      <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 pb-20 lg:pb-0">
        
        {/* Summary Cards */}
        <TokenSummaryCards 
          totalValue={totals.totalValue}
          tokenCount={totals.tokenCount}
          isLoading={showSkeleton}
        />

        {/* Search Bar */}
        <TokenSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isGrouped={isGrouped}
          onGroupedChange={setIsGrouped}
          showGroupToggle={showGroupToggle}
        />

        {/* Token List - Terminal style */}
        <TerminalCard showHeader title="tokens --list">
          <div className="divide-y divide-theme-border/30">
            {/* Show skeletons when loading and no data */}
            {showSkeleton && <TokenListSkeleton />}
            
            {/* Show real data */}
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group border-l-2 border-l-transparent hover:border-l-theme-accent"
              >
                {/* Mobile Layout */}
                <TokenRowMobile 
                  token={token}
                  selectedWalletId={selectedWalletId}
                  isGrouped={isGrouped}
                />

                {/* Desktop Layout */}
                <TokenRow 
                  token={token}
                  selectedWalletId={selectedWalletId}
                  isGrouped={isGrouped}
                  onSwapClick={handleSwapClick}
                />
              </div>
            ))}
          </div>
        </TerminalCard>

        {/* Empty State */}
        {filteredTokens.length === 0 && !showSkeleton && (
          <div className="text-center py-8 sm:py-12">
            <div className="font-mono text-sm sm:text-base text-theme-text-secondary mb-2">
              {searchQuery ? "NO TOKENS FOUND" : "NO TOKENS"}
            </div>
            <div className="font-mono text-xs sm:text-sm text-theme-text-muted">
              {searchQuery ? "Try adjusting your search query" : "Add a wallet to view tokens"}
            </div>
          </div>
        )}
      </div>

      {/* Right: Sticky Swap Widget - Hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block w-[380px] flex-shrink-0">
        <div className="sticky top-24">
          <SwapWidgetInline fromToken={selectedSwapToken} />
        </div>
      </div>
    </div>
  )
}

