// Constants for DeFi Section

export const TYPE_LABELS = {
  lending: "Lending",
  liquidity: "Liquidity Pool",
  staking: "Staking",
  farming: "Yield Farming",
} as const

export const TYPE_COLORS = {
  lending: "#00ff41",
  liquidity: "#ffb000",
  staking: "#ff00ff",
  farming: "#ffaa00",
} as const

export type PositionType = keyof typeof TYPE_LABELS

