import { TerminalCard } from "@/components/ui/terminal-card"

/**
 * Skeleton loading component for protocol cards
 */
export function ProtocolSkeleton() {
  return (
    <TerminalCard>
      <div className="p-2.5 sm:p-3 animate-pulse">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-theme-border" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-theme-border rounded" />
              <div className="h-2.5 w-12 bg-theme-border rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-4 w-16 sm:w-20 bg-theme-border rounded" />
            <div className="w-4 h-4 bg-theme-border rounded" />
          </div>
        </div>
      </div>
    </TerminalCard>
  )
}

