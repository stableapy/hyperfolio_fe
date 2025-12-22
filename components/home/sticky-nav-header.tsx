"use client"

import { useState } from "react"
import { SectionNav } from "@/components/section-nav"
import { WalletDropdown } from "./wallet-dropdown"
import type { StickyNavHeaderProps } from "./types"

/**
 * Sticky navigation header with section tabs and wallet selector
 * Sticks to top of viewport when scrolling through content sections
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
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 -mx-6 px-6 pt-4 mb-6 bg-gradient-to-b from-[#0a0f0f] via-[#0a0f0f]/98 to-[#0a0f0f]/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 overflow-x-auto">
          <SectionNav activeSection={activeSection} onSectionChange={onSectionChange} />
        </div>
        
        {/* Wallet Selector in sticky header */}
        <WalletDropdown
          wallets={wallets}
          selectedWalletId={selectedWalletId}
          isOpen={isWalletDropdownOpen}
          onToggle={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
          onClose={() => setIsWalletDropdownOpen(false)}
          onSelectWallet={onSelectWallet}
          onRemoveWallet={onRemoveWallet}
          onAddWallet={onAddWallet}
        />
      </div>
    </div>
  )
}

