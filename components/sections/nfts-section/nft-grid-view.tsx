"use client"

import { NFTGridCard } from "./nft-grid-card"
import { NFTGridSkeleton } from "./nft-grid-skeleton"
import type { NFTGridViewProps } from "./types"

/**
 * Grid layout view for displaying NFTs
 */
export function NFTGridView({ nfts, showSkeleton }: NFTGridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {/* Show skeletons when loading and no data */}
      {showSkeleton && <NFTGridSkeleton />}
      
      {nfts.map((nft) => (
        <NFTGridCard key={nft.id} nft={nft} />
      ))}
    </div>
  )
}

