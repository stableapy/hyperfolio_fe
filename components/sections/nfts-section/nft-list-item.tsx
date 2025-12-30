'use client';

import { ExternalLink } from 'lucide-react';
import type { NFTListItemProps } from './types';

/**
 * Terminal-style NFT row for list view display
 */
export function NFTListItem({ nft, privacyMode = false }: NFTListItemProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="group hover:bg-theme-accent/5 hover:border-l-theme-purple border-l-2 border-l-transparent px-3 py-2.5 transition-all duration-150 sm:px-4 sm:py-3">
      {/* Main Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Terminal Prompt */}
        <span className="text-theme-purple flex-shrink-0 font-mono text-sm font-bold select-none">
          &gt;
        </span>

        {/* Left: Info */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <img
            src={nft.image || '/placeholder.svg'}
            alt={nft.name}
            className="ring-theme-border h-8 w-8 flex-shrink-0 rounded-sm object-cover ring-1 sm:h-9 sm:w-9"
          />
          <div className="flex min-w-0 flex-col">
            <div className="text-theme-accent truncate font-mono text-xs font-bold tracking-wide sm:text-sm">
              {nft.name}
            </div>
            <div className="text-theme-text-muted truncate font-mono text-[10px] opacity-70 sm:text-[11px]">
              {nft.collection}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Floor Price - hidden on mobile */}
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-theme-text-muted font-mono text-[9px] uppercase">
              floor:
            </span>
            <span className="text-theme-text-secondary font-mono text-[11px] tabular-nums">
              {nft.floorPrice.toFixed(2)}
            </span>
          </div>

          {/* USD Value - terminal style */}
          <div className="flex min-w-[60px] items-center justify-end gap-1">
            <span className="text-theme-text-muted font-mono text-[10px]">
              =
            </span>
            <span className="text-theme-purple font-mono text-xs font-bold tabular-nums sm:text-sm">
              {privacyMode ? '•••' : formatPrice(nft.usdPrice)}
            </span>
          </div>

          {/* External Link - hidden on mobile */}
          <a
            href={`https://opensea.io/assets/hyperevm/${nft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-text-muted hover:text-theme-cyan hidden opacity-0 transition-colors group-hover:opacity-100 sm:block"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
