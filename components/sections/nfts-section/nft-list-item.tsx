"use client"

import { ExternalLink } from "lucide-react"
import type { NFTListItemProps } from "./types"

/**
 * Individual NFT row for list view display
 */
export function NFTListItem({ nft }: NFTListItemProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors cursor-pointer group">
      {/* Main Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <img
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">
              {nft.name}
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] truncate">
              {nft.collection}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Floor Price - hidden on mobile */}
          <div className="hidden sm:block text-right">
            <div className="font-mono text-[10px] text-[#556070]">FLOOR</div>
            <div className="font-mono text-xs text-[#708090]">
              {nft.floorPrice.toFixed(2)}
            </div>
          </div>

          {/* USD Value */}
          <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
            {formatPrice(nft.usdPrice)}
          </div>

          {/* External Link - hidden on mobile */}
          <a
            href={`https://opensea.io/assets/hyperevm/${nft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-[#708090] hover:text-[#00d9ff] transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

