'use client';

import { TerminalCard } from '@/components/ui/terminal-card';
import { NFTListItem } from './nft-list-item';
import { NFTListSkeleton } from './nft-list-skeleton';
import type { NFTListViewProps } from './types';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * Terminal-style list layout view for displaying NFTs
 */
export function NFTListView({ nfts, showSkeleton }: NFTListViewProps) {
  const privacyMode = useWalletStore((state) => state.privacyMode);

  return (
    <TerminalCard showHeader title="nfts --list">
      <div className="divide-theme-border/30 divide-y">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && <NFTListSkeleton />}

        {nfts.map((nft) => (
          <NFTListItem key={nft.id} nft={nft} privacyMode={privacyMode} />
        ))}
      </div>
    </TerminalCard>
  );
}
