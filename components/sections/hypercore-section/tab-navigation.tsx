"use client"

import type { TabNavigationProps } from "./types"

/**
 * Tab navigation component for switching between Hypercore sections
 */
export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 sm:gap-2 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-2 sm:px-4 py-2 rounded transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              isActive
                ? "bg-[#1a2225] text-white"
                : "text-[#708090] hover:text-white"
            }`}
            style={{
              color: isActive ? tab.color : undefined,
            }}
          >
            <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-mono text-sm">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

