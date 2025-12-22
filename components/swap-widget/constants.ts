// Constants for the swap widget module

// HyperEVM chain ID
export const HYPEREVM_CHAIN_ID = 999

// Default source token: Generic placeholder address
export const DEFAULT_FROM_TOKEN = {
  address: "0x5555555555555555555555555555555555555555",
  symbol: "TOKEN",
  chainId: 999,
} as const

// Default destination token: USDC on HyperEVM
export const DEFAULT_TO_TOKEN = {
  address: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
  symbol: "USDC",
  chainId: 999,
} as const

