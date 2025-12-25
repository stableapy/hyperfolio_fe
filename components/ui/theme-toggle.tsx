"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  className?: string
}

/**
 * Stylish theme toggle with smooth animations
 * Features a sun/moon icon transition with scale and rotation effects
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsAnimating(true)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    // Reset animation state after transition completes
    setTimeout(() => setIsAnimating(false), 300)
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className={`relative px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-sm border border-theme-border/70 bg-theme-card-bg ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-4 h-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-sm
        border border-theme-border/70 hover:border-theme-accent/50
        bg-theme-card-bg hover:bg-theme-accent/10
        transition-all duration-200 ease-out
        group
        ${isAnimating ? "scale-95" : "scale-100"}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Subtle glow effect on hover */}
      <div 
        className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-theme-accent/5"
      />
      
      {/* Icon container with rotation animation */}
      <div 
        className={`
          relative w-4 h-4
          transition-transform duration-200 ease-out
          ${isAnimating ? (isDark ? "rotate-180" : "-rotate-180") : "rotate-0"}
        `}
      >
        {/* Sun icon */}
        <Sun 
          className={`
            absolute inset-0 w-full h-full
            transition-all duration-300 ease-out
            ${isDark 
              ? "opacity-0 scale-50 rotate-90 text-theme-accent" 
              : "opacity-100 scale-100 rotate-0 text-theme-accent"
            }
          `}
          strokeWidth={2}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`
            absolute inset-0 w-full h-full
            transition-all duration-300 ease-out
            ${isDark 
              ? "opacity-100 scale-100 rotate-0 text-theme-accent" 
              : "opacity-0 scale-50 -rotate-90 text-theme-accent"
            }
          `}
          strokeWidth={2}
        />
      </div>
      
      {/* Subtle pulse ring on click */}
      <div 
        className={`
          absolute inset-0 rounded-sm border border-theme-accent
          transition-all duration-200
          ${isAnimating 
            ? "opacity-50 scale-110" 
            : "opacity-0 scale-100"
          }
        `}
      />
    </button>
  )
}

