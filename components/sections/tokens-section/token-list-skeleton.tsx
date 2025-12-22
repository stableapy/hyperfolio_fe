"use client"

import type { TokenListSkeletonProps } from "./types"

/**
 * Skeleton loading state for token list
 * Shows animated placeholders for both mobile and desktop layouts
 */
export function TokenListSkeleton({ count = 5 }: TokenListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <div key={i} className="p-3 sm:p-4 animate-pulse">
          {/* Mobile skeleton */}
          <div className="flex sm:hidden items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a2225]" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-14 bg-[#1a2225] rounded" />
                <div className="h-4 w-10 bg-[#1a2225] rounded" />
              </div>
              <div className="h-3 w-24 bg-[#1a2225] rounded" />
              <div className="h-2.5 w-20 bg-[#1a2225] rounded" />
            </div>
            <div className="h-5 w-16 bg-[#1a2225] rounded" />
          </div>
          
          {/* Desktop skeleton */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-[#1a2225]" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-14 bg-[#1a2225] rounded" />
                  <div className="h-5 w-16 bg-[#1a2225] rounded" />
                </div>
                <div className="h-3 w-24 bg-[#1a2225] rounded" />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="h-3 w-28 bg-[#1a2225] rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 w-20 bg-[#1a2225] rounded" />
              <div className="hidden lg:block h-8 w-20 bg-[#1a2225] rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

