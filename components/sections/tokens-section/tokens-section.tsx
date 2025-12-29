'use client';

import { useState } from 'react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { SwapWidgetInline } from '@/components/swap-widget';
import { useWalletStore } from '@/lib/store/wallet-store';

import { TokenSummaryCards } from './token-summary-cards';
import { TokenSearchBar } from './token-search-bar';
import { TokenRow } from './token-row';
import { TokenRowMobile } from './token-row-mobile';
import { TokenListSkeleton } from './token-list-skeleton';
import { useTokensData } from './hooks';
import { getSwapTokenAddress, HYPEREVM_CHAIN_ID } from './utils';
import type { Token, SwapToken, TokensSectionProps } from './types';

/**
 * Main TokensSection component
 * Displays a list of tokens with search, grouping, and swap functionality
 */
export function TokensSection({ isLoading = false }: TokensSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGrouped, setIsGrouped] = useState(true);
  const [selectedSwapToken, setSelectedSwapToken] = useState<
    SwapToken | undefined
  >(undefined);

  // Subscribe to privacy mode from wallet store
  const privacyMode = useWalletStore((state) => state.privacyMode);

  const { filteredTokens, totals, hasData, wallets, selectedWalletId } =
    useTokensData({ searchQuery, isGrouped });

  const handleSwapClick = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation();

    const swapToken: SwapToken = {
      address: getSwapTokenAddress(token.address),
      symbol: token.symbol,
      chainId: HYPEREVM_CHAIN_ID,
    };

    setSelectedSwapToken(swapToken);
  };

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData;

  // Show group toggle only in multi-wallet view with multiple wallets
  const showGroupToggle = !selectedWalletId && wallets.length > 1;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Left: Token List */}
      <div className="min-w-0 flex-1 space-y-3 pb-20 sm:space-y-4 lg:pb-0">
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
          <div className="divide-theme-border/30 divide-y">
            {/* Show skeletons when loading and no data */}
            {showSkeleton && <TokenListSkeleton />}

            {/* Show real data */}
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3"
              >
                {/* Mobile Layout */}
                <TokenRowMobile
                  token={token}
                  selectedWalletId={selectedWalletId}
                  isGrouped={isGrouped}
                  privacyMode={privacyMode}
                  totalValue={totals.totalValue}
                />

                {/* Desktop Layout */}
                <TokenRow
                  token={token}
                  selectedWalletId={selectedWalletId}
                  isGrouped={isGrouped}
                  privacyMode={privacyMode}
                  totalValue={totals.totalValue}
                  onSwapClick={handleSwapClick}
                />
              </div>
            ))}
          </div>
        </TerminalCard>

        {/* Empty State */}
        {filteredTokens.length === 0 && !showSkeleton && (
          <div className="py-8 text-center sm:py-12">
            <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
              {searchQuery ? 'NO TOKENS FOUND' : 'NO TOKENS'}
            </div>
            <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Add a wallet to view tokens'}
            </div>
          </div>
        )}
      </div>

      {/* Right: Sticky Swap Widget - Hidden on mobile, shown on lg+ */}
      <div className="hidden w-[380px] flex-shrink-0 lg:block">
        <div className="sticky top-25">
          <SwapWidgetInline fromToken={selectedSwapToken} />
        </div>
      </div>
    </div>
  );
}
