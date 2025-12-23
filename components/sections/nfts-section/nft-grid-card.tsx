"use client"

import { ExternalLink } from "lucide-react"
import { TerminalCard } from "@/components/ui/terminal-card"
import type { NFTGridCardProps } from "./types"

/**
 * Individual NFT card for grid view display
 */
export function NFTGridCard({ nft }: NFTGridCardProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <TerminalCard className="group hover:border-theme-accent transition-all">
      <div className="relative aspect-square overflow-hidden bg-theme-bg">
        <img
          src={nft.image || "/placeholder.svg"}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <a
          href={`https://opensea.io/assets/hyperevm/${nft.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-theme-card-bg/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffb000]" />
        </a>
      </div>
      <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        <div>
          <div className="font-mono text-[11px] sm:text-xs text-theme-accent font-semibold mb-0.5 truncate">
            {nft.name}
          </div>
          <div className="font-mono text-[9px] sm:text-[10px] text-theme-text-secondary truncate">
            {nft.collection}
          </div>
        </div>
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-theme-border">
          <div>
            <div className="font-mono text-[9px] sm:text-[10px] text-theme-text-secondary">FLOOR</div>
            <div className="font-mono text-[10px] sm:text-xs text-theme-text-primary">
              {nft.floorPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] sm:text-[10px] text-theme-text-secondary">VALUE</div>
            <div className="font-mono text-[10px] sm:text-xs text-theme-accent font-medium">
              {formatPrice(nft.usdPrice)}
            </div>
          </div>
        </div>
      </div>
    </TerminalCard>
  )
}

