"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"
import { SectionNav } from "@/components/section-nav"
import { WalletSelector } from "@/components/portfolio-hero/wallet-selector"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { StickyNavHeaderProps } from "./types"

/**
 * Sticky navigation header with section tabs and wallet selector
 * Terminal-style aesthetic with sharp corners and mono fonts
 */
export function StickyNavHeader({
  activeSection,
  onSectionChange,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onRemoveWallet,
  onAddWallet,
}: StickyNavHeaderProps) {
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false)

  return (
    <div className="relative sticky top-0 z-40 ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] w-screen px-4 sm:px-6 pt-3 mb-6 bg-theme-bg/98 backdrop-blur-md border-b border-theme-border/70">
      {/* Terminal prompt indicator */}
      <div className="flex items-center gap-2 mb-2">
        <Terminal className="w-3.5 h-3.5 text-theme-accent" />
        <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">
          hyperfolio<span className="text-theme-accent">_</span>portfolio
        </span>
        <span className="font-mono text-theme-accent animate-pulse">_</span>
      </div>

      {/* Theme Toggle & Wallet Selector - Positioned absolutely on the right */}
      <div className="absolute right-4 sm:right-6 top-3 flex items-center gap-2 z-10">
        <ThemeToggle />
        <WalletSelector
          wallets={wallets}
          selectedWalletId={selectedWalletId}
          isOpen={isWalletSelectorOpen}
          onToggle={() => setIsWalletSelectorOpen(!isWalletSelectorOpen)}
          onClose={() => setIsWalletSelectorOpen(false)}
          onSelectWallet={onSelectWallet}
          onRemoveWallet={onRemoveWallet}
          onAddWallet={onAddWallet}
        />
      </div>
      
      {/* Section nav with terminal styling */}
      <div className="overflow-x-auto pr-28 sm:pr-36">
        <SectionNav activeSection={activeSection} onSectionChange={onSectionChange} />
      </div>
    </div>
  )
}

