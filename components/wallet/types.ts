// Types for the wallet module

export interface Wallet {
  id: string
  name: string
  address: string
  color: string
}

export interface AddWalletFormData {
  name: string
  address: string
  color: string
}

export interface AddWalletDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (wallet: AddWalletFormData) => void
}

export interface WalletTabsProps {
  wallets: Wallet[]
  onWalletChange?: (walletId: string | null) => void
  onAddWallet?: () => void
  onRemoveWallet?: (walletId: string) => void
}

