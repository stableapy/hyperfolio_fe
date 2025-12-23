"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Predefined color themes for consistency across the app
const STAT_PILL_COLORS = {
  accent: {
    bg: "bg-theme-accent/10",
    border: "border-theme-accent/20",
    text: "text-theme-accent",
  },
  amber: {
    bg: "bg-[#ffb000]/10",
    border: "border-[#ffb000]/20",
    text: "text-[#ffb000]",
  },
  lime: {
    bg: "bg-[#b4ff00]/10",
    border: "border-[#b4ff00]/20",
    text: "text-[#b4ff00]",
  },
  red: {
    bg: "bg-[#ff4444]/10",
    border: "border-[#ff4444]/20",
    text: "text-[#ff4444]",
  },
  orange: {
    bg: "bg-[#ffaa00]/10",
    border: "border-[#ffaa00]/20",
    text: "text-[#ffaa00]",
  },
  magenta: {
    bg: "bg-[#ff00ff]/10",
    border: "border-[#ff00ff]/20",
    text: "text-[#ff00ff]",
  },
  muted: {
    bg: "bg-theme-text-muted/10",
    border: "border-theme-border/50",
    text: "text-theme-text-muted",
  },
} as const

export type StatPillColor = keyof typeof STAT_PILL_COLORS

const statPillVariants = cva(
  "flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden shrink-0 transition-all duration-150",
  {
    variants: {
      interactive: {
        true: "hover:border-theme-accent/50 cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
)

export interface StatPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statPillVariants> {
  /** The icon or symbol to display in the left section */
  icon?: React.ReactNode
  /** Pre-defined color theme for the pill */
  color?: StatPillColor
  /** Custom color (hex) - overrides color prop */
  customColor?: string
  /** The label (e.g., "--total", "--apy") */
  label?: string
  /** The main value to display */
  value: React.ReactNode
  /** Optional secondary value (e.g., percentage) */
  secondaryValue?: React.ReactNode
  /** Whether to show privacy mode (•••) */
  privacyMode?: boolean
  /** Render as a button element */
  asButton?: boolean
  /** Whether the pill is in a loading state (shows skeleton) */
  isLoading?: boolean
  /** Width of the skeleton in loading state */
  skeletonWidth?: string
}

/**
 * StatPillSkeleton - Loading state for StatPill
 */
export function StatPillSkeleton({ 
  className, 
  width = "w-20 sm:w-28" 
}: { 
  className?: string
  width?: string 
}) {
  return (
    <div className={cn("h-5 sm:h-6 bg-secondary rounded-sm animate-pulse shrink-0", width, className)} />
  )
}

/**
 * StatPill - Reusable terminal-style stat badge component
 * Used across portfolio-hero, tokens, defi, nfts, hypercore, and transactions sections
 */
export function StatPill({
  className,
  icon,
  color = "accent",
  customColor,
  label,
  value,
  secondaryValue,
  privacyMode = false,
  interactive = false,
  asButton = false,
  isLoading = false,
  skeletonWidth = "w-32 sm:w-40",
  onClick,
  ...props
}: StatPillProps) {
  // If loading, show skeleton
  if (isLoading) {
    return <StatPillSkeleton width={skeletonWidth} className={className} />
  }

  // Get color classes - support both predefined and custom colors
  const colorClasses = customColor
    ? {
        bg: "",
        border: "",
        text: "",
      }
    : STAT_PILL_COLORS[color]

  // Custom color styles
  const customColorStyles = customColor
    ? {
        iconBg: { backgroundColor: `${customColor}15` },
        iconBorder: { borderColor: `${customColor}33` },
        iconText: { color: customColor },
        valueText: { color: customColor },
      }
    : undefined

  const Comp = asButton ? "button" : "div"

  // Determine hover class for interactive elements
  const hoverClass = interactive
    ? customColor
      ? "hover:border-opacity-50"
      : `hover:${colorClasses.border.replace("/20", "/50")}`
    : ""

  return (
    <Comp
      type={asButton ? "button" : undefined}
      className={cn(
        statPillVariants({ interactive }),
        interactive && !customColor && `hover:border-${color === "accent" ? "theme-accent" : color}/50`,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Icon Section */}
      <div
        className={cn(
          "px-1 sm:px-1.5 py-0.5 sm:py-1 border-r",
          !customColor && colorClasses.bg,
          !customColor && colorClasses.border
        )}
        style={
          customColor
            ? {
                backgroundColor: `${customColor}15`,
                borderColor: `${customColor}33`,
              }
            : undefined
        }
      >
        {typeof icon === "string" ? (
          <span
            className={cn(
              "font-mono text-[9px] sm:text-[10px] font-bold",
              !customColor && colorClasses.text
            )}
            style={customColor ? { color: customColor } : undefined}
          >
            {icon}
          </span>
        ) : (
          <span
            className={cn(!customColor && colorClasses.text, "[&>svg]:w-2.5 [&>svg]:h-2.5 sm:[&>svg]:w-3 sm:[&>svg]:h-3")}
            style={customColor ? { color: customColor } : undefined}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1">
        {label && (
          <span className="font-mono text-[8px] sm:text-[9px] text-theme-text-muted hidden min-[480px]:inline">
            {label}
          </span>
        )}
        <span
          className={cn(
            "font-mono text-[9px] sm:text-[10px] font-bold tabular-nums",
            !customColor && colorClasses.text
          )}
          style={customColor ? { color: customColor } : undefined}
        >
          {privacyMode ? "•••" : value}
        </span>
        {secondaryValue && (
          <span className="font-mono text-[8px] sm:text-[9px] text-theme-text-muted hidden min-[520px]:inline tabular-nums">
            {privacyMode ? "•" : secondaryValue}
          </span>
        )}
      </div>
    </Comp>
  )
}

/**
 * StatPillColorDot - Icon variant showing a colored dot
 * Used in breakdown pills where the color represents a category
 */
export function StatPillColorDot({ color }: { color: string }) {
  return (
    <div
      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm"
      style={{ backgroundColor: color }}
    />
  )
}

export { STAT_PILL_COLORS, statPillVariants }

