'use client';

import { safeParseFloat } from './utils';
import type { PerpTabProps } from './types';

/**
 * Perpetual positions tab content with terminal styling
 */
export function PerpTab({ marginBalance, privacyMode }: PerpTabProps) {
  const margin = safeParseFloat(marginBalance);

  return (
    <div className="py-8 text-center sm:py-12">
      <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
        NO PERP POSITIONS
      </div>
      <div className="text-theme-text-muted mb-4 font-mono text-xs sm:text-sm">
        <span className="text-theme-cyan">&gt;</span> hypercore --perp returns
        empty
      </div>

      {/* Margin Balance - Terminal style badge */}
      <div className="bg-theme-card-bg border-theme-border/70 inline-flex items-center overflow-hidden rounded-sm border">
        <div className="bg-theme-cyan/10 border-theme-cyan/20 border-r px-2 py-1.5">
          <span className="text-theme-cyan font-mono text-[10px] font-bold sm:text-xs">
            $
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="text-theme-text-muted font-mono text-[10px]">
            --margin
          </span>
          <span className="text-theme-cyan font-mono text-xs font-bold tabular-nums sm:text-sm">
            {privacyMode ? '•••' : `$${margin.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
