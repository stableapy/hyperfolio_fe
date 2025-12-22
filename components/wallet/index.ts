// Barrel export for wallet module

// Main components
export { AddWalletDialog } from "./add-wallet-dialog"
export { WalletTabs } from "./wallet-tabs"

// Types
export type {
  Wallet,
  AddWalletFormData,
  AddWalletDialogProps,
  WalletTabsProps,
} from "./types"

// Utils
export { isValidEthereumAddress, formatAddress, formatAddressCompact } from "./utils"

// Constants
export { PRESET_COLORS } from "./constants"
export type { PresetColor } from "./constants"

