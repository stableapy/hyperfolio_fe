'use client';

import { TerminalCard } from '@/components/ui/terminal-card';

/**
 * Skeleton loading state for yield grid view
 * Displays placeholder cards while data is loading
 */
export function YieldGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <TerminalCard
          key={i}
          className="animate-pulse"
          showHeader={false}
        >
          <div className="p-4 space-y-4">
            {/* Logo + Token placeholder */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-theme-bg/50 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-theme-bg/50 rounded w-3/4" />
                <div className="h-3 bg-theme-bg/30 rounded w-1/2" />
              </div>
            </div>

            {/* Badge placeholder */}
            <div className="h-6 bg-theme-bg/30 rounded w-16" />

            {/* APY placeholder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-theme-bg/30 rounded" />
                <div className="h-3 bg-theme-bg/30 rounded w-12" />
              </div>
              <div className="h-5 bg-theme-bg/50 rounded w-16" />
            </div>

            {/* TVL placeholder */}
            <div className="pt-3 border-t border-theme-border/30">
              <div className="h-6 bg-theme-bg/30 rounded w-20" />
            </div>
          </div>
        </TerminalCard>
      ))}
    </div>
  );
}
