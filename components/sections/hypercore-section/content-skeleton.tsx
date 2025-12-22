"use client"

import type { ContentSkeletonProps } from "./types"

/**
 * Loading skeleton for tab content
 */
export function ContentSkeleton({ count = 3 }: ContentSkeletonProps) {
  return (
    <div className="divide-y divide-[#1a2225]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-2.5 sm:p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1a2225]" />
              <div className="flex items-center gap-1.5">
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
                <div className="h-4 sm:h-5 w-10 sm:w-14 bg-[#1a2225] rounded" />
              </div>
            </div>
            <div className="h-4 w-14 sm:w-16 bg-[#1a2225] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

