"use client"

import { cn } from "@/lib/utils"

interface EscCloseButtonProps {
  onClick: () => void
  className?: string
  "aria-label"?: string
}

/**
 * Terminal-style ESC close button for modals
 * Displays [ESC] text with hover effects
 */
export function EscCloseButton({ 
  onClick, 
  className,
  "aria-label": ariaLabel = "Close modal"
}: EscCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-sm",
        "hover:bg-theme-accent/10 transition-colors",
        "text-theme-text-muted hover:text-theme-accent",
        "font-mono text-xs",
        className
      )}
      aria-label={ariaLabel}
    >
      <span>[ESC]</span>
    </button>
  )
}

