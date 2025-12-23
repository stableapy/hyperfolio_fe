"use client"

/**
 * Skeleton loading state for NFT list view
 */
export function NFTListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-2.5 sm:p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-secondary" />
              <div className="flex flex-col gap-1">
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-secondary rounded" />
                <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-secondary rounded" />
              </div>
            </div>
            <div className="h-4 w-14 sm:w-16 bg-secondary rounded" />
          </div>
        </div>
      ))}
    </>
  )
}

