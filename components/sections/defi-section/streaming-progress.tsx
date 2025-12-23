'use client'

import { Loader2, CheckCircle2 } from 'lucide-react'

interface StreamingProgressProps {
  completed: number
  total: number
  isComplete: boolean
  isInitializing?: boolean
}

/**
 * Progress indicator for streaming DeFi positions
 * Shows how many protocols have been loaded
 */
export function StreamingProgress({
  completed,
  total,
  isComplete,
  isInitializing = false,
}: StreamingProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const showProgress = total > 0

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-theme-bg/50 border border-theme-border/50 rounded-lg">
      {/* Icon */}
      <div className="flex-shrink-0">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-theme-accent" />
        ) : (
          <Loader2 className="w-4 h-4 text-theme-accent animate-spin" />
        )}
      </div>

      {/* Progress Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-theme-text-muted truncate">
            {isComplete ? (
              <>
                <span className="text-theme-accent">&gt;</span> scan complete
              </>
            ) : isInitializing ? (
              <>
                <span className="text-theme-accent">&gt;</span> initializing scan<span className="animate-pulse">_</span>
              </>
            ) : (
              <>
                <span className="text-theme-accent">&gt;</span> scanning protocols...
              </>
            )}
          </span>
          {showProgress && (
            <span className="font-mono text-xs text-theme-text-primary tabular-nums flex-shrink-0">
              {completed}/{total}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-1.5 h-1 bg-theme-border/30 rounded-full overflow-hidden">
          {showProgress ? (
            <div
              className="h-full bg-theme-accent transition-all duration-300 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          ) : (
            // Indeterminate progress bar when initializing
            <div className="h-full bg-theme-accent/60 rounded-full animate-pulse w-1/3" />
          )}
        </div>
      </div>
    </div>
  )
}

