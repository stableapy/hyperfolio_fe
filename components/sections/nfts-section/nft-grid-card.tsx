'use client';

import { ExternalLink } from 'lucide-react';
import { TerminalCard } from '@/components/ui/terminal-card';
import type { NFTGridCardProps } from './types';

/**
 * Individual NFT card for grid view display
 */
export function NFTGridCard({ nft, privacyMode = false }: NFTGridCardProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <TerminalCard className="group hover:border-theme-accent transition-all">
      <div className="bg-theme-bg relative aspect-square overflow-hidden">
        <img
          src={nft.image || '/placeholder.svg'}
          alt={nft.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="from-theme-bg absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <a
          href={`https://opensea.io/assets/hyperevm/${nft.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-theme-card-bg/80 absolute top-1.5 right-1.5 rounded-lg p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:top-2 sm:right-2 sm:p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="text-theme-cyan h-3 w-3 sm:h-4 sm:w-4" />
        </a>
      </div>
      <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-3">
        <div>
          <div className="text-theme-accent mb-0.5 truncate font-mono text-[11px] font-semibold sm:text-xs">
            {nft.name}
          </div>
          <div className="text-theme-text-secondary truncate font-mono text-[9px] sm:text-[10px]">
            {nft.collection}
          </div>
        </div>
        <div className="border-theme-border flex items-center justify-between border-t pt-1.5 sm:pt-2">
          <div>
            <div className="text-theme-text-secondary font-mono text-[9px] sm:text-[10px]">
              FLOOR
            </div>
            <div className="text-theme-text-primary font-mono text-[10px] sm:text-xs">
              {nft.floorPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-theme-text-secondary font-mono text-[9px] sm:text-[10px]">
              VALUE
            </div>
            <div className="text-theme-accent font-mono text-[10px] font-medium sm:text-xs">
              {privacyMode ? '•••' : formatPrice(nft.usdPrice)}
            </div>
          </div>
        </div>
      </div>
    </TerminalCard>
  );
}
