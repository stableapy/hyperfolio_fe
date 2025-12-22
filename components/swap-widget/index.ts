// Barrel export for swap-widget module

// Main components
export { SwapWidgetModal } from "./swap-widget-modal"
export { SwapWidgetInline } from "./swap-widget-inline"

// Hooks (exported for potential reuse)
export { useSwapConfig, useSwapWallet } from "./hooks"

// Types
export type {
  TokenInfo,
  SwapWidgetBaseProps,
  SwapWidgetModalProps,
  SwapWidgetInlineProps,
  KyberSwapTheme,
  FeeSetting,
} from "./types"

// Utils
export { getWalletIcon } from "./utils"

// Constants
export { HYPEREVM_CHAIN_ID, DEFAULT_TO_TOKEN } from "./constants"

