"use client"

import { Coins, ImageIcon, TrendingUp, Clock, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SectionNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const SECTIONS = [
  { id: "tokens", label: "Tokens", icon: Coins, ariaLabel: "View token balances" },
  { id: "defi", label: "DeFi", icon: TrendingUp, ariaLabel: "View DeFi positions" },
  { id: "nfts", label: "NFTs", icon: ImageIcon, ariaLabel: "View NFT collections" },
  { id: "hypercore", label: "Hypercore", icon: Zap, ariaLabel: "View Hypercore assets" },
  { id: "transactions", label: "History", icon: Clock, ariaLabel: "View transaction history" },
]

export function SectionNav({ activeSection, onSectionChange }: SectionNavProps) {
  return (
    <TooltipProvider>
      <nav 
        className="w-full flex justify-between sm:justify-start gap-0 sm:gap-2 pb-px"
        aria-label="Portfolio sections"
        role="tablist"
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${section.id}-panel`}
                  aria-label={section.ariaLabel}
                  onClick={() => onSectionChange(section.id)}
                  className={`group flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-initial px-2 sm:px-4 py-3 font-mono text-sm border-b-2 -mb-px transition-all ${
                    isActive
                      ? "border-theme-accent text-theme-accent dark:text-glow-green"
                      : "border-transparent text-theme-text-secondary hover:text-theme-accent hover:border-theme-border"
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} aria-hidden="true" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              </TooltipTrigger>
              {/* Tooltip only shows on mobile - hidden on sm and up */}
              <TooltipContent 
                side="bottom" 
                className="sm:hidden bg-theme-bg-alt border-theme-border font-mono text-xs"
              >
                {section.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
