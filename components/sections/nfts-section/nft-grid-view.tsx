'use client';

import { NFTGridCard } from './nft-grid-card';
import { NFTGridSkeleton } from './nft-grid-skeleton';
import type { NFTGridViewProps } from './types';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * Grid layout view for displaying NFTs
 */
export function NFTGridView({ nfts, showSkeleton }: NFTGridViewProps) {
  const privacyMode = useWalletStore((state) => state.privacyMode);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {/* Show skeletons when loading and no data */}
      {showSkeleton && <NFTGridSkeleton />}

      {nfts.map((nft) => (
        <NFTGridCard key={nft.id} nft={nft} privacyMode={privacyMode} />
      ))}
    </div>
  );
}
