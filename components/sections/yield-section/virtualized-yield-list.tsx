'use client';

import { List, type RowComponentProps } from 'react-window';
import { YieldCard } from './yield-card';
import type { YieldDisplayItem } from './types';

const ITEM_HEIGHT = 90;

interface VirtualizedYieldListProps {
  opportunities: YieldDisplayItem[];
}

export function VirtualizedYieldList({
  opportunities,
}: VirtualizedYieldListProps) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-theme-text-secondary font-mono text-sm">
          NO YIELD OPPORTUNITIES
        </div>
      </div>
    );
  }

  const Row = ({
    index,
    style,
    opportunities: rowOpportunities,
  }: RowComponentProps<{ opportunities: YieldDisplayItem[] }>) => {
    const opportunity = rowOpportunities[index];
    if (!opportunity) return null;

    return (
      <div style={style}>
        <YieldCard opportunity={opportunity} />
      </div>
    );
  };

  return (
    <List
      rowComponent={Row}
      rowCount={opportunities.length}
      rowHeight={ITEM_HEIGHT}
      rowProps={{ opportunities }}
      overscanCount={3}
      style={{ height: 600, width: '100%' }}
    />
  );
}
