"use client"

interface TransactionListSkeletonProps {
  count?: number
}

/**
 * Skeleton loading state for transaction list
 * Shows animated placeholders matching the transaction row layout
 */
export function TransactionListSkeleton({ count = 5 }: TransactionListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="flex items-center gap-4">
            {/* Icon skeleton */}
            <div className="relative">
              <div className="w-11 h-11 rounded-lg bg-[#1a2225]" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1a2225] border-2 border-[#0a0d0f]" />
            </div>

            {/* Details skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-4 w-16 bg-[#1a2225] rounded" />
                <div className="h-5 w-20 bg-[#1a2225] rounded" />
                <div className="h-5 w-14 bg-[#1a2225] rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-24 bg-[#1a2225] rounded" />
                <div className="h-3 w-4 bg-[#1a2225] rounded" />
                <div className="h-3 w-24 bg-[#1a2225] rounded" />
              </div>
            </div>

            {/* Amount skeleton */}
            <div className="text-right min-w-[120px]">
              <div className="h-4 w-16 bg-[#1a2225] rounded mb-1 ml-auto" />
              <div className="h-3 w-12 bg-[#1a2225] rounded ml-auto" />
            </div>

            {/* Value skeleton */}
            <div className="text-right w-32">
              <div className="h-4 w-20 bg-[#1a2225] rounded mb-1 ml-auto" />
              <div className="h-3 w-14 bg-[#1a2225] rounded ml-auto" />
            </div>

            {/* Link skeleton */}
            <div className="w-8 h-8" />
          </div>
        </div>
      ))}
    </>
  )
}

