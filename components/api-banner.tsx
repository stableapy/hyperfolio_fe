"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"

/**
 * API Banner component - Terminal-style promotional banner for the API
 * Uses consistent terminal aesthetic matching the rest of the UI
 */
export function ApiBanner() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Small delay for entrance animation
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`relative z-50 bg-theme-bg border-b border-theme-border/50 transition-all duration-300 ease-out ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      }`}
    >
      {/* Content */}
      <div className="relative px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3">
          {/* Terminal-style API label */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-theme-cyan">&gt;</span>
            <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-cyan tracking-wider">
              hyperfolio_API
            </span>
          </div>

          {/* Separator */}
          <span className="font-mono text-[10px] text-theme-border hidden sm:inline">—</span>

          {/* Description */}
          <span className="font-mono text-[9px] sm:text-[10px] text-theme-text-muted uppercase tracking-wider hidden sm:inline">
            Build on HyperEVM data
          </span>

          {/* Separator */}
          <span className="font-mono text-[10px] text-theme-border">|</span>

          {/* CTA Link - Terminal button style */}
          <a
            href="https://api.hyperfolio.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden transition-all duration-150 hover:border-theme-accent/50"
          >
            {/* Icon section */}
            <div className="px-1.5 py-1 bg-theme-accent/10 border-r border-theme-accent/20 transition-colors group-hover:bg-theme-accent/15">
              <span className="font-mono text-[9px] font-bold text-theme-accent">&gt;</span>
            </div>
            {/* Label section */}
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="font-mono text-[10px] font-bold text-theme-accent">
                View Docs
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-theme-accent opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
