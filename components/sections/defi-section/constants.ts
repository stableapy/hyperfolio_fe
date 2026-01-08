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

// Sub-type labels for lending positions
export const SUBTYPE_LABELS = {
  supplied: "SUPPLIED",
  borrowed: "BORROWED",
} as const

// Sub-type colors for lending positions (green for supply, red for borrow)
export const SUBTYPE_COLORS = {
  supplied: "var(--theme-success, #10b981)",
  borrowed: "var(--theme-error, #f43f5e)",
} as const

export type PositionType = keyof typeof TYPE_LABELS
export type PositionSubType = keyof typeof SUBTYPE_LABELS

