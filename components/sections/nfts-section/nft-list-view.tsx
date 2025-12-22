"use client"

import { TerminalCard } from "@/components/ui/terminal-card"
import { NFTListItem } from "./nft-list-item"
import { NFTListSkeleton } from "./nft-list-skeleton"
import type { NFTListViewProps } from "./types"

/**
 * List layout view for displaying NFTs
 */
export function NFTListView({ nfts, showSkeleton }: NFTListViewProps) {
  return (
    <TerminalCard>
      <div className="divide-y divide-[#1a2225]">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && <NFTListSkeleton />}
        
        {nfts.map((nft) => (
          <NFTListItem key={nft.id} nft={nft} />
        ))}
      </div>
    </TerminalCard>
  )
}

