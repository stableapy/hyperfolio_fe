"use client"

import type { NFTEmptyStateProps } from "./types"

/**
 * Empty state display when no NFTs are found
 */
export function NFTEmptyState({ hasSearchQuery }: NFTEmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="font-mono text-xs sm:text-sm text-theme-text-secondary mb-1 sm:mb-2">
        {hasSearchQuery ? "NO NFTs FOUND" : "NO NFTs"}
      </div>
      <div className="font-mono text-[10px] sm:text-sm text-theme-text-muted">
        {hasSearchQuery ? "Try adjusting your search query" : "No NFTs in this wallet"}
      </div>
    </div>
  )
}

