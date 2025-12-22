"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { ArrowRightLeft } from "lucide-react"
import type { FloatingSwapButtonProps } from "./types"

/**
 * Floating Swap Button component using Portal
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
      className={`${hideOnDesktop ? 'lg:hidden' : ''} flex items-center gap-2 px-5 py-3.5 bg-[#00ff41] text-[#0a0e0f] font-mono text-sm font-bold rounded-full shadow-xl hover:bg-[#00ff41]/90 hover:scale-105 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        boxShadow: '0 4px 20px rgba(0, 255, 65, 0.4)',
      }}
    >
      <ArrowRightLeft className="w-5 h-5" />
      <span>Swap</span>
    </button>,
    document.body
  )
}

