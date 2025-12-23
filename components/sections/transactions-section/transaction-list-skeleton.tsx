"use client"

interface TransactionListSkeletonProps {
  count?: number
}

/**
 * Terminal-style skeleton loading state for transaction list
 * Matches the styling from the updated transaction row layout
 */
export function TransactionListSkeleton({ count = 5 }: TransactionListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <div
          key={i}
          className="px-3 sm:px-4 py-2.5 sm:py-3 animate-pulse border-l-2 border-l-transparent"
        >
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-start gap-2.5">
            {/* Prompt + Icon skeleton */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-4 bg-secondary rounded-sm" />
              <div className="w-8 h-8 bg-secondary rounded-sm" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-16 bg-secondary rounded-sm" />
                <div className="h-4 w-12 bg-secondary rounded-sm" />
              </div>
              <div className="h-3 w-24 bg-secondary rounded-sm" />
              <div className="h-2.5 w-16 bg-secondary rounded-sm" />
            </div>

            {/* Value skeleton */}
            <div className="h-4 w-14 bg-secondary rounded-sm" />
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Prompt skeleton */}
            <div className="w-3 h-4 bg-secondary rounded-sm flex-shrink-0" />

            {/* Icon skeleton */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-secondary rounded-sm" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary border-2 border-theme-bg" />
            </div>

            {/* Details skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-4 w-16 bg-secondary rounded-sm" />
                <div className="h-4 w-20 bg-secondary rounded-sm" />
                <div className="h-4 w-14 bg-secondary rounded-sm" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-secondary rounded-sm" />
                <div className="h-3 w-20 bg-secondary rounded-sm" />
                <div className="h-3 w-4 bg-secondary rounded-sm" />
                <div className="h-3 w-8 bg-secondary rounded-sm" />
                <div className="h-3 w-20 bg-secondary rounded-sm" />
              </div>
            </div>

            {/* Amount skeleton */}
            <div className="hidden md:flex items-center gap-1.5 min-w-[140px]">
              <div className="h-3 w-8 bg-secondary rounded-sm" />
              <div className="h-3 w-16 bg-secondary rounded-sm" />
              <div className="h-3 w-10 bg-secondary rounded-sm" />
            </div>

            {/* Value + timestamp skeleton */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
                <div className="h-3 w-3 bg-secondary rounded-sm" />
                <div className="h-4 w-16 bg-secondary rounded-sm" />
              </div>
              <div className="h-3 w-12 bg-secondary rounded-sm" />
              <div className="w-6 h-6 bg-secondary rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
