"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { ArrowRightLeft } from "lucide-react"
import type { FloatingSwapButtonProps } from "./types"

/**
 * Floating Swap Button component using Portal
 * Terminal-style aesthetic matching the rest of the UI
 * Visible on mobile always (when in content section), on desktop only when NOT on tokens section
 */
export function FloatingSwapButton({ 
  onClick, 
  isVisible, 
  activeSection 
}: FloatingSwapButtonProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) return null

  // On desktop (lg+), hide when on tokens section (which has inline swap widget)
  // On mobile, always show when in content section
  const hideOnDesktop = activeSection === "tokens"

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label="Open token swap widget"
      className={`${hideOnDesktop ? 'lg:hidden' : ''} group flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden transition-all duration-200 hover:border-theme-accent/50 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-300`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 255, 65, 0.1)',
      }}
    >
      {/* Icon Section - Terminal style */}
      <div className="px-2 py-2 bg-theme-accent/10 border-r border-theme-accent/20 transition-colors group-hover:bg-theme-accent/15">
        <ArrowRightLeft 
          className="w-4 h-4 text-theme-accent" 
          aria-hidden="true" 
        />
      </div>
      
      {/* Label Section */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="font-mono text-[9px] text-theme-text-muted hidden min-[400px]:inline">
          &gt;
        </span>
        <span className="font-mono text-[10px] sm:text-xs font-bold text-theme-accent uppercase tracking-wider">
          --swap
        </span>
      </div>
    </button>,
    document.body
  )
}

