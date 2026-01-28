"use client"

import { Wallet, ChevronDown, Check, Trash2, Plus } from "lucide-react"
import { formatAddress } from "./utils"

interface WalletInfo {
  id: string
  address: string
  name: string
  color: string
}

interface WalletSelectorProps {
  wallets: WalletInfo[]
  selectedWalletId: string | null
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onSelectWallet: (walletId: string | null) => void
  onRemoveWallet: (walletId: string) => void
  onAddWallet: () => void
}

/**
 * Dropdown component for selecting wallets
 */
export function WalletSelector({
  wallets,
  selectedWalletId,
  isOpen,
  onToggle,
  onClose,
  onSelectWallet,
  onRemoveWallet,
  onAddWallet,
}: WalletSelectorProps) {
  const selectedWallet = selectedWalletId 
    ? wallets.find(w => w.id === selectedWalletId) 
    : null
  const getWalletDisplayName = (wallet: WalletInfo) => {
    const name = wallet.name?.trim()
    if (!name) return formatAddress(wallet.address)
    if (wallet.address && name.toLowerCase() === wallet.address.toLowerCase()) {
      return formatAddress(wallet.address)
    }
    return name
  }

  const handleButtonClick = () => {
    // If no wallets, open add dialog directly
    if (wallets.length === 0) {
      onAddWallet()
    } else {
      onToggle()
    }
  }

  const handleSelectWallet = (walletId: string | null) => {
    onSelectWallet(walletId)
    onClose()
  }

  const handleDeleteWallet = (e: React.MouseEvent, walletId: string) => {
    e.stopPropagation()
    // If deleting the selected wallet, switch to All Wallets
    if (selectedWalletId === walletId) {
      onSelectWallet(null)
    }
    onRemoveWallet(walletId)
  }

  const handleAddWallet = () => {
    onClose()
    onAddWallet()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleButtonClick}
        className="flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden hover:border-theme-accent/50 transition-all duration-150"
      >
        <div className="px-1.5 sm:px-2 py-1.5 sm:py-2 bg-theme-accent/10 border-r border-theme-accent/20">
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-accent shrink-0" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2">
          <span className="font-mono text-[10px] sm:text-xs text-theme-text-primary truncate max-w-[70px] sm:max-w-[100px] md:max-w-none">
            {wallets.length === 0 
              ? '--add' 
              : selectedWallet 
                ? getWalletDisplayName(selectedWallet) 
                : '--all'}
          </span>
          {wallets.length > 0 && (
            <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-text-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>
      
      {/* Arrow indicator when no wallets - centered below button */}
      {wallets.length === 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex flex-col items-center text-theme-text-secondary animate-bounce">
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="font-mono text-[10px] mt-1 whitespace-nowrap">Add your wallet</span>
        </div>
      )}
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default" 
            onClick={onClose}
            aria-label="Close dropdown"
          />
          
          {/* Menu - Terminal style dropdown */}
          <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-auto mt-2 sm:w-72 bg-theme-card-bg border border-theme-border/70 rounded-sm shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-theme-bg/50 border-b border-theme-border/50">
              <span className="font-mono text-xs text-theme-accent font-bold">&gt;</span>
              <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">wallet --select</span>
            </div>
            
            {/* All Wallets Option */}
            <button
              type="button"
              onClick={() => handleSelectWallet(null)}
              className="w-full flex items-center justify-between px-3 py-3 hover:bg-theme-accent-muted active:bg-theme-accent-muted transition-colors min-h-[44px] border-l-2 border-l-transparent hover:border-l-theme-accent"
            >
              <span className="font-mono text-xs text-theme-text-primary">--all-wallets</span>
              {selectedWalletId === null && (
                <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />
              )}
            </button>
            
            <div className="h-px bg-theme-border/50 mx-3" />
            
            {/* Individual Wallets */}
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center group hover:bg-theme-accent-muted active:bg-theme-accent-muted transition-colors border-l-2 border-l-transparent hover:border-l-theme-accent"
              >
                <button
                  type="button"
                  onClick={() => handleSelectWallet(wallet.id)}
                  className="flex-1 flex items-center gap-2 sm:gap-2.5 px-3 py-3 min-h-[44px]"
                >
                  <div 
                    className="w-2 h-2 rounded-sm shrink-0" 
                    style={{ backgroundColor: wallet.color }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-mono text-xs text-theme-text-primary block truncate">
                      {getWalletDisplayName(wallet)}
                    </span>
                    <span className="font-mono text-[9px] text-theme-text-muted block truncate">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>
                  {selectedWalletId === wallet.id && (
                    <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                  )}
                </button>
                {/* Delete button - Always visible on mobile, hover on desktop */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteWallet(e, wallet.id)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 mr-2 rounded-sm text-theme-text-muted hover:text-[#ff4444] active:text-[#ff4444] hover:bg-[#ff4444]/10 active:bg-[#ff4444]/10 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label={`Delete ${wallet.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <div className="h-px bg-theme-border/50 mx-3" />
            
            {/* Add Wallet */}
            <button
              type="button"
              onClick={handleAddWallet}
              className="w-full flex items-center gap-2 px-3 py-3 hover:bg-theme-accent-muted active:bg-theme-accent-muted transition-colors text-theme-text-muted hover:text-theme-accent min-h-[44px] border-l-2 border-l-transparent hover:border-l-theme-accent"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-xs">--add-new</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
