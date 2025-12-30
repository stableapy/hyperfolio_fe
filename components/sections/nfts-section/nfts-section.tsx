'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { NFTSummaryCards } from './nft-summary-cards';
import { NFTSearchControls } from './nft-search-controls';
import { NFTGridView } from './nft-grid-view';
import { NFTListView } from './nft-list-view';
import { NFTEmptyState } from './nft-empty-state';
import { useNfts, useFilteredNfts, useNftTotals } from './hooks';
import type { ViewMode, NFTsSectionProps } from './types';

/**
 * NFTs Section - Displays user's NFT collection with grid/list views
 * Supports wallet selection and search filtering
 */
export function NFTsSection({ isLoading = false }: NFTsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Subscribe to privacy mode from wallet store
  const privacyMode = useWalletStore((state) => state.privacyMode);

  // Fetch NFTs from selected wallet or all wallets
  const { nfts, hasData } = useNfts();

  // Filter NFTs based on search query
  const filteredNFTs = useFilteredNfts(nfts, searchQuery);

  // Calculate totals for filtered NFTs
  const totals = useNftTotals(filteredNFTs);

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Summary Cards */}
      <NFTSummaryCards
        totalValue={totals.totalValue}
        nftCount={totals.nftCount}
        showSkeleton={showSkeleton}
        privacyMode={privacyMode}
      />

      {/* Search & View Toggle */}
      <NFTSearchControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content View */}
      {viewMode === 'grid' ? (
        <NFTGridView nfts={filteredNFTs} showSkeleton={showSkeleton} />
      ) : (
        <NFTListView nfts={filteredNFTs} showSkeleton={showSkeleton} />
      )}

      {/* Empty State */}
      {filteredNFTs.length === 0 && !showSkeleton && (
        <NFTEmptyState hasSearchQuery={Boolean(searchQuery)} />
      )}
    </div>
  );
}
