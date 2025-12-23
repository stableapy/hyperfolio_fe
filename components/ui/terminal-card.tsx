import type { ReactNode } from "react"

interface TerminalCardProps {
  children: ReactNode
  className?: string
  withScanLine?: boolean
  title?: string
  showHeader?: boolean
  compact?: boolean
}

/**
 * Terminal-style card container with optional window header
 * Sharp corners and authentic terminal aesthetic
 */
export function TerminalCard({ 
  children, 
  className = "", 
  withScanLine = false,
  title,
  showHeader = false,
  compact = false
}: TerminalCardProps) {
  // Check if overflow-visible is requested via className
  const hasOverflowVisible = className.includes('overflow-visible')
  
  return (
    <div
      className={`relative bg-theme-card-bg border border-theme-border/70 rounded-sm ${
        hasOverflowVisible ? '' : 'overflow-hidden'
      } ${withScanLine ? "scan-line-effect" : ""} ${className}`}
    >
      {/* Optional terminal window header */}
      {showHeader && (
        <div className={`flex items-center bg-theme-bg/50 border-b border-theme-border/50 ${
          compact ? 'px-2 py-1' : 'px-3 py-2'
        }`}>
          {/* Title */}
          {title && (
            <span className={`font-mono text-theme-text-muted uppercase tracking-wider ${
              compact ? 'text-[9px]' : 'text-[10px]'
            }`}>
              {title}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * Terminal header with command-line style
 */
export function TerminalHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-3 py-2 border-b border-theme-border/50 font-mono text-xs bg-theme-bg/30 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-theme-accent font-bold">&gt;</span>
        {children}
      </div>
    </div>
  )
}

/**
 * Terminal content area
 */
export function TerminalContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-3 ${className}`}>{children}</div>
}

