'use client';

import type { PointsListSkeletonProps } from './types';

/**
 * Skeleton loading state for points list
 * Shows animated placeholders for both mobile and desktop layouts
 * Terminal-style loading with pulse animation matching the actual PointsRow layout
 */
export function PointsListSkeleton({ count = 6 }: PointsListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <div key={i} className="animate-pulse p-3 sm:p-4">
          {/* Mobile skeleton */}
          <div className="flex items-center gap-2.5 sm:hidden">
            {/* Terminal Prompt */}
            <div className="h-4 w-4 rounded-sm bg-[#1a2225]" />

            {/* Protocol Icon */}
            <div className="h-9 w-9 rounded-full bg-[#1a2225]" />

            {/* Protocol Info */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-20 rounded bg-[#1a2225]" />
                {/* Rank Badge Skeleton */}
                <div className="h-4 w-8 rounded bg-[#1a2225]" />
              </div>
              {/* Wallet Info Skeleton */}
              <div className="h-3 w-24 rounded bg-[#1a2225]" />
            </div>

            {/* Points Value */}
            <div className="flex flex-shrink-0 items-center gap-1">
              <div className="h-3.5 w-6 rounded bg-[#1a2225]" />
              <div className="h-5 w-16 rounded bg-[#1a2225]" />
            </div>
          </div>

          {/* Desktop skeleton */}
          <div className="hidden items-center justify-between gap-3 sm:flex">
            {/* Terminal Prompt */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="h-4 w-4 rounded-sm bg-[#1a2225]" />
            </div>

            {/* Left: Protocol Info with icon */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#1a2225]" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 rounded bg-[#1a2225]" />
                  {/* Rank Badge Skeleton */}
                  <div className="h-5 w-10 rounded bg-[#1a2225]" />
                </div>
                {/* Wallet Info Skeleton */}
                <div className="h-3 w-28 rounded bg-[#1a2225]" />
              </div>
            </div>

            {/* Right: Points - Terminal style */}
            <div className="flex flex-shrink-0 items-center gap-3">
              {/* Points display - terminal style */}
              <div className="flex min-w-[100px] items-center justify-end gap-1.5">
                <div className="h-3.5 w-8 rounded bg-[#1a2225]" />
                <div className="h-5 w-20 rounded bg-[#1a2225]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
