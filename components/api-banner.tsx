'use client';

import { ExternalLink } from 'lucide-react';

/**
 * API Banner component - Terminal-style promotional banner for the API
 * Uses consistent terminal aesthetic matching the rest of the UI
 */
export function ApiBanner() {
  return (
    <div className="bg-theme-bg border-theme-border/50 animate-slide-down relative z-50 border-b">
      {/* Content */}
      <div className="relative px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3">
          {/* Terminal-style API label */}
          <div className="flex items-center gap-1.5">
            <span className="text-theme-cyan font-mono text-[10px] font-bold">
              &gt;
            </span>
            <span className="text-theme-cyan font-mono text-[10px] font-bold tracking-wider sm:text-xs">
              hyperfolio_API
            </span>
          </div>

          {/* Separator */}
          <span className="text-theme-border hidden font-mono text-[10px] sm:inline">
            —
          </span>

          {/* Description */}
          <span className="text-theme-text-muted hidden font-mono text-[9px] tracking-wider uppercase sm:inline sm:text-[10px]">
            Build on HyperEVM data
          </span>

          {/* Separator */}
          <span className="text-theme-border font-mono text-[10px]">|</span>

          {/* CTA Link - Terminal button style */}
          <a
            href="https://api.hyperfolio.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-theme-card-bg border-theme-border/70 hover:border-theme-accent/50 flex items-center overflow-hidden rounded-sm border transition-all duration-150"
          >
            {/* Icon section */}
            <div className="bg-theme-accent/10 border-theme-accent/20 group-hover:bg-theme-accent/15 border-r px-1.5 py-1 transition-colors">
              <span className="text-theme-accent font-mono text-[9px] font-bold">
                &gt;
              </span>
            </div>
            {/* Label section */}
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="text-theme-accent font-mono text-[10px] font-bold">
                View Docs
              </span>
              <ExternalLink className="text-theme-accent h-2.5 w-2.5 opacity-60 transition-opacity group-hover:opacity-100" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
