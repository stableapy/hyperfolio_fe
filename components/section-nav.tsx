"use client"

import { Coins, ImageIcon, TrendingUp, Clock, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SectionNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const SECTIONS = [
  { id: "tokens", label: "Tokens", icon: Coins },
  { id: "defi", label: "DeFi", icon: TrendingUp },
  { id: "nfts", label: "NFTs", icon: ImageIcon },
  { id: "hypercore", label: "Hypercore", icon: Zap },
  { id: "transactions", label: "History", icon: Clock },
]

export function SectionNav({ activeSection, onSectionChange }: SectionNavProps) {
  return (
    <TooltipProvider>
      <nav className="flex justify-between sm:justify-start gap-0 sm:gap-2 border-b border-[#1a2225] pb-px">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={`group flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-initial px-2 sm:px-4 py-3 font-mono text-sm border-b-2 -mb-px transition-all ${
                    isActive
                      ? "border-[#00ff41] text-[#00ff41] text-glow-green"
                      : "border-transparent text-[#708090] hover:text-[#00ff41] hover:border-[#1a2225]"
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              </TooltipTrigger>
              {/* Tooltip only shows on mobile - hidden on sm and up */}
              <TooltipContent 
                side="bottom" 
                className="sm:hidden bg-[#0d1214] border-[#1a2225] font-mono text-xs"
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
