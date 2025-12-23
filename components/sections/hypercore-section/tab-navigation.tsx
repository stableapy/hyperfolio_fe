"use client"

import type { TabNavigationProps } from "./types"

/**
 * Terminal-style tab navigation for switching between Hypercore sections
 * Matches the styling pattern from tokens-section and defi-section
 */
export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 bg-theme-card-bg border border-theme-border/70 rounded-sm p-1 sm:p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-sm transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 border ${
              isActive
                ? "bg-theme-bg border-theme-accent/30"
                : "border-transparent hover:bg-theme-bg/50 hover:border-theme-border/50"
            }`}
          >
            {/* Terminal prompt indicator for active tab */}
            {isActive && (
              <span className="font-mono text-xs font-bold" style={{ color: tab.color }}>&gt;</span>
            )}
            <Icon 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
              style={{ color: isActive ? tab.color : undefined }}
            />
            <span 
              className={`hidden sm:inline font-mono text-xs sm:text-sm uppercase tracking-wider ${
                isActive ? 'font-bold' : 'text-theme-text-secondary'
              }`}
              style={{ color: isActive ? tab.color : undefined }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
