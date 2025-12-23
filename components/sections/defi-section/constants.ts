// Constants for DeFi Section

export const TYPE_LABELS = {
  lending: "Lending",
  liquidity: "Liquidity Pool",
  staking: "Staking",
  farming: "Yield Farming",
} as const

// Note: Colors use CSS variables for theme-aware styling
export const TYPE_COLORS = {
  lending: "var(--theme-accent)",
  liquidity: "var(--theme-cyan)",
  staking: "var(--theme-magenta)",
  farming: "var(--theme-orange)",
} as const

export type PositionType = keyof typeof TYPE_LABELS

