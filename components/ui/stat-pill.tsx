'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

// Predefined color themes for consistency across the app
// Uses CSS custom properties for theme-aware colors (light/dark mode)
const STAT_PILL_COLORS = {
  accent: {
    bg: 'bg-theme-accent/10',
    border: 'border-theme-accent/20',
    text: 'text-theme-accent',
  },
  cyan: {
    bg: 'bg-theme-cyan/10',
    border: 'border-theme-cyan/20',
    text: 'text-theme-cyan',
  },
  purple: {
    bg: 'bg-theme-purple/10',
    border: 'border-theme-purple/20',
    text: 'text-theme-purple',
  },
  red: {
    bg: 'bg-theme-red/10',
    border: 'border-theme-red/20',
    text: 'text-theme-red',
  },
  orange: {
    bg: 'bg-theme-orange/10',
    border: 'border-theme-orange/20',
    text: 'text-theme-orange',
  },
  magenta: {
    bg: 'bg-theme-magenta/10',
    border: 'border-theme-magenta/20',
    text: 'text-theme-magenta',
  },
  muted: {
    bg: 'bg-theme-text-muted/10',
    border: 'border-theme-border/50',
    text: 'text-theme-text-muted',
  },
} as const;

export type StatPillColor = keyof typeof STAT_PILL_COLORS;

const statPillVariants = cva(
  'flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden shrink-0 transition-all duration-150',
  {
    variants: {
      interactive: {
        true: 'hover:border-theme-accent/50 cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
);

export interface StatPillProps
  extends
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onClick' | 'type' | 'disabled' | 'form'
    >,
    VariantProps<typeof statPillVariants> {
  /** The icon or symbol to display in the left section */
  icon?: React.ReactNode;
  /** Pre-defined color theme for the pill */
  color?: StatPillColor;
  /** Custom color (hex) - overrides color prop */
  customColor?: string;
  /** The label (e.g., "--total", "--apy") */
  label?: string;
  /** The main value to display */
  value: React.ReactNode;
  /** Optional secondary value (e.g., percentage) */
  secondaryValue?: React.ReactNode;
  /** Whether to show privacy mode (•••) */
  privacyMode?: boolean;
  /** Render as a button element */
  asButton?: boolean;
  /** Whether the pill is in a loading state (shows skeleton) */
  isLoading?: boolean;
  /** Width of the skeleton in loading state */
  skeletonWidth?: string;
  /**
   * Optional tooltip value to show on hover (e.g., full amount).
   * Only displays when privacyMode is false.
   * Use this to show complete values when display value is abbreviated.
   */
  tooltipValue?: React.ReactNode;
  /** Optional onClick handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
}

/**
 * StatPillSkeleton - Loading state for StatPill
 */
export function StatPillSkeleton({
  className,
  width = 'w-20 sm:w-28',
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={cn(
        'bg-secondary h-5 shrink-0 animate-pulse rounded-sm sm:h-6',
        width,
        className
      )}
    />
  );
}

/**
 * StatPill - Reusable terminal-style stat badge component
 * Used across portfolio-hero, tokens, defi, nfts, hypercore, and transactions sections
 */
export function StatPill({
  className,
  icon,
  color = 'accent',
  customColor,
  label,
  value,
  secondaryValue,
  privacyMode = false,
  interactive = false,
  asButton = false,
  isLoading = false,
  skeletonWidth = 'w-32 sm:w-40',
  tooltipValue,
  onClick,
  ...props
}: StatPillProps) {
  // If loading, show skeleton
  if (isLoading) {
    return <StatPillSkeleton width={skeletonWidth} className={className} />;
  }

  // Get color classes - support both predefined and custom colors
  // Fallback to accent if color not found in predefined colors
  const colorClasses = customColor
    ? {
        bg: '',
        border: '',
        text: '',
      }
    : STAT_PILL_COLORS[color] || STAT_PILL_COLORS.accent;

  // Custom color styles
  const customColorStyles = customColor
    ? {
        iconBg: { backgroundColor: `${customColor}15` },
        iconBorder: { borderColor: `${customColor}33` },
        iconText: { color: customColor },
        valueText: { color: customColor },
      }
    : undefined;

  const Comp = asButton ? 'button' : 'div';

  // Determine hover class for interactive elements
  const hoverClass = interactive
    ? customColor
      ? 'hover:border-opacity-50'
      : `hover:${colorClasses.border.replace('/20', '/50')}`
    : '';

  /**
   * Extracted value display component to eliminate DRY violation.
   * Handles both tooltip and non-tooltip cases with consistent styling.
   */
  const ValueDisplay = ({
    hasTooltip,
    tooltipValue,
    value,
    privacyMode,
  }: {
    hasTooltip: boolean;
    tooltipValue: React.ReactNode;
    value: React.ReactNode;
    privacyMode: boolean;
  }) => {
    const displayValue = privacyMode ? '•••' : value;
    const baseClasses = cn(
      'font-mono text-[9px] font-bold tabular-nums sm:text-[10px]',
      !customColor && colorClasses.text
    );
    const baseStyle = customColor ? { color: customColor } : undefined;

    if (hasTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                baseClasses,
                'focus:ring-theme-accent focus:ring-2 focus:ring-offset-2 focus:outline-none'
              )}
              style={baseStyle}
              aria-describedby="tooltip-content"
            >
              {displayValue}
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={4} role="tooltip" id="tooltip-content">
            {tooltipValue}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <span className={baseClasses} style={baseStyle}>
        {displayValue}
      </span>
    );
  };

  // Check if tooltip should be displayed (non-empty value and not in privacy mode)
  const hasTooltip =
    tooltipValue != null && tooltipValue !== '' && !privacyMode;

  // Filter out props that are specific to div or button to avoid type errors
  const { onCopy, onCut, onPaste, ...safeProps } = props as any;

  return (
    <Comp
      type={asButton ? 'button' : undefined}
      className={cn(
        statPillVariants({ interactive }),
        interactive &&
          !customColor &&
          `hover:border-${color === 'accent' ? 'theme-accent' : color}/50`,
        className
      )}
      onClick={onClick}
      {...safeProps}
    >
      {/* Icon Section */}
      <div
        className={cn(
          'border-r px-1 py-0.5 sm:px-1.5 sm:py-1',
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
        {typeof icon === 'string' ? (
          <span
            className={cn(
              'font-mono text-[9px] font-bold sm:text-[10px]',
              !customColor && colorClasses.text
            )}
            style={customColor ? { color: customColor } : undefined}
          >
            {icon}
          </span>
        ) : (
          <span
            className={cn(
              !customColor && colorClasses.text,
              '[&>svg]:h-2.5 [&>svg]:w-2.5 sm:[&>svg]:h-3 sm:[&>svg]:w-3'
            )}
            style={customColor ? { color: customColor } : undefined}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex items-center gap-0.5 px-1.5 py-0.5 sm:gap-1 sm:px-2 sm:py-1">
        {label && (
          <span className="text-theme-text-muted hidden font-mono text-[8px] min-[480px]:inline sm:text-[9px]">
            {label}
          </span>
        )}
        <ValueDisplay
          hasTooltip={hasTooltip}
          tooltipValue={tooltipValue}
          value={value}
          privacyMode={privacyMode}
        />
        {secondaryValue && (
          <span className="text-theme-text-muted hidden font-mono text-[8px] tabular-nums min-[520px]:inline sm:text-[9px]">
            {privacyMode ? '•' : secondaryValue}
          </span>
        )}
      </div>
    </Comp>
  );
}

/**
 * StatPillColorDot - Icon variant showing a colored dot
 * Used in breakdown pills where the color represents a category
 */
export function StatPillColorDot({ color }: { color: string }) {
  return (
    <div
      className="h-2 w-2 rounded-sm sm:h-2.5 sm:w-2.5"
      style={{ backgroundColor: color }}
    />
  );
}

export { STAT_PILL_COLORS, statPillVariants };
