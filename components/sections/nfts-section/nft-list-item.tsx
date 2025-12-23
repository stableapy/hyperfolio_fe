"use client"

import { ExternalLink } from "lucide-react"
import type { NFTListItemProps } from "./types"

/**
 * Terminal-style NFT row for list view display
 */
export function NFTListItem({ nft }: NFTListItemProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 group hover:bg-theme-accent/5 border-l-2 border-l-transparent hover:border-l-theme-purple">
      {/* Main Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Terminal Prompt */}
        <span className="font-mono text-sm font-bold text-theme-purple select-none flex-shrink-0">&gt;</span>
        
        {/* Left: Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <img
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm object-cover flex-shrink-0 ring-1 ring-theme-border"
          />
          <div className="flex flex-col min-w-0">
            <div className="font-mono text-xs sm:text-sm text-theme-accent font-bold truncate tracking-wide">
              {nft.name}
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-theme-text-muted truncate opacity-70">
              {nft.collection}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Floor Price - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="font-mono text-[9px] text-theme-text-muted uppercase">floor:</span>
            <span className="font-mono text-[11px] text-theme-text-secondary tabular-nums">
              {nft.floorPrice.toFixed(2)}
            </span>
          </div>

          {/* USD Value - terminal style */}
          <div className="flex items-center gap-1 min-w-[60px] justify-end">
            <span className="font-mono text-[10px] text-theme-text-muted">=</span>
            <span className="font-mono text-xs sm:text-sm text-theme-purple font-bold tabular-nums">
              {formatPrice(nft.usdPrice)}
            </span>
          </div>

          {/* External Link - hidden on mobile */}
          <a
            href={`https://opensea.io/assets/hyperevm/${nft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-theme-text-muted hover:text-theme-cyan transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

