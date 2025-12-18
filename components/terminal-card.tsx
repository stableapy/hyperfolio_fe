import type { ReactNode } from "react"

interface TerminalCardProps {
  children: ReactNode
  className?: string
  withScanLine?: boolean
}

export function TerminalCard({ children, className = "", withScanLine = false }: TerminalCardProps) {
  return (
    <div
      className={`relative bg-[#111618] border border-[#1a2225] rounded-lg overflow-hidden ${
        withScanLine ? "scan-line-effect" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function TerminalHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-3 border-b border-[#1a2225] font-mono text-sm ${className}`}>{children}</div>
}

export function TerminalContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
