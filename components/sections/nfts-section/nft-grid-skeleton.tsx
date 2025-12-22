"use client"

import { TerminalCard } from "@/components/ui/terminal-card"

/**
 * Skeleton loading state for NFT grid view
 */
export function NFTGridSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <TerminalCard key={i}>
          <div className="animate-pulse">
            <div className="aspect-square bg-[#1a2225]" />
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              <div className="h-3 sm:h-4 w-3/4 bg-[#1a2225] rounded" />
              <div className="h-2.5 sm:h-3 w-1/2 bg-[#1a2225] rounded" />
              <div className="flex justify-between pt-1.5 sm:pt-2 border-t border-[#1a2225]">
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
              </div>
            </div>
          </div>
        </TerminalCard>
      ))}
    </>
  )
}

