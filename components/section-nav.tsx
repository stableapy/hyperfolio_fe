"use client"

import { Coins, ImageIcon, TrendingUp, Clock, Zap } from "lucide-react"

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
    <div className="flex gap-2 border-b border-[#1a2225] mb-6 overflow-x-auto">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-sm border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? "border-[#00ff41] text-[#00ff41] text-glow-green"
                : "border-transparent text-[#708090] hover:text-[#00ff41] hover:border-[#1a2225]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{section.label}</span>
          </button>
        )
      })}
    </div>
  )
}
