// Types for Home page components

export interface WalletInfo {
  id: string
  name: string
  address: string
  color: string
}

export interface FloatingSwapButtonProps {
  onClick: () => void
  isVisible: boolean
  activeSection: string
}

export interface WalletDropdownProps {
  wallets: WalletInfo[]
  selectedWalletId: string | null
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onSelectWallet: (walletId: string | null) => void
  onRemoveWallet: (walletId: string) => void
  onAddWallet: () => void
}

export interface EmptyStateProps {
  onAddWallet: () => void
}

export interface StickyNavHeaderProps {
  activeSection: string
  onSectionChange: (section: string) => void
  wallets: WalletInfo[]
  selectedWalletId: string | null
  onSelectWallet: (walletId: string | null) => void
  onRemoveWallet: (walletId: string) => void
  onAddWallet: () => void
}

export interface SectionContentProps {
  activeSection: string
  isLoading: boolean
  isDataVisible: boolean
}

