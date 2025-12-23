"use client"

import type { ContentSkeletonProps } from "./types"

/**
 * Terminal-style loading skeleton for tab content
 * Matches the styling pattern from tokens-section and defi-section
 */
export function ContentSkeleton({ count = 3 }: ContentSkeletonProps) {
  return (
    <div className="divide-y divide-theme-border/30">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="px-3 sm:px-4 py-2.5 sm:py-3 animate-pulse border-l-2 border-l-transparent"
        >
          <div className="flex items-center justify-between gap-2">
            {/* Terminal Prompt Skeleton */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-4 bg-theme-accent/20 rounded-sm" />
            </div>

            {/* Left: Token/Item Info Skeleton */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-theme-accent/10 ring-1 ring-theme-border/30" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 sm:h-4 w-12 sm:w-16 bg-theme-accent/20 rounded-sm" />
                  <div className="h-4 sm:h-5 w-10 sm:w-14 bg-theme-border/30 rounded-sm" />
                </div>
                <div className="h-2.5 w-20 sm:w-24 bg-theme-border/20 rounded-sm" />
              </div>
            </div>

            {/* Right: Value Skeleton */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 bg-theme-text-muted/20 rounded-sm" />
              <div className="h-4 w-14 sm:w-16 bg-theme-accent/20 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
