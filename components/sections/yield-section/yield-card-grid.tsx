'use client';

import { YieldGridCard } from './yield-grid-card';
import { YieldGridSkeleton } from './yield-grid-skeleton';
import type { YieldDisplayItem } from './types';

interface YieldCardGridProps {
  opportunities: YieldDisplayItem[];
  isLoading?: boolean;
}

/**
 * Grid layout view for displaying yield opportunities
 * Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop
 */
export function YieldCardGrid({ opportunities, isLoading = false }: YieldCardGridProps) {
  // Show skeletons when loading
  if (isLoading && (!opportunities || opportunities.length === 0)) {
    return <YieldGridSkeleton />;
  }

  // Empty state
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-theme-text-secondary font-mono text-sm">
          NO YIELD OPPORTUNITIES
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opp) => (
        <YieldGridCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
}
