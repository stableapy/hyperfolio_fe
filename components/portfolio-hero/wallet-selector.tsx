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
        className="flex items-center gap-2 px-3 py-1.5 sm:py-2.5 rounded-lg border border-[#00ff41]/30 bg-[#0a0f0f]/80 backdrop-blur-sm hover:border-[#00ff41]/60 transition-all"
      >
        <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41]" />
        <span className="font-mono text-[11px] sm:text-sm text-white truncate max-w-[120px] sm:max-w-none">
          {wallets.length === 0 
            ? '+ Add' 
            : selectedWallet 
              ? selectedWallet.name 
              : 'All Wallets'}
        </span>
        {wallets.length > 0 && (
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#708090] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      
      {/* Arrow indicator when no wallets */}
      {wallets.length === 0 && (
        <div className="absolute top-full right-0 mt-3 flex flex-col items-center text-[#708090] animate-bounce">
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
          
          {/* Menu - Full width on mobile, fixed width on larger screens */}
          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-64 py-2 rounded-xl border border-[#1a2225] bg-[#0d1214]/95 backdrop-blur-md shadow-2xl z-50">
            {/* All Wallets Option */}
            <button
              type="button"
              onClick={() => handleSelectWallet(null)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="font-mono text-sm text-white">All Wallets</span>
              {selectedWalletId === null && (
                <Check className="w-4 h-4 text-[#00ff41]" />
              )}
            </button>
            
            <div className="h-px bg-[#1a2225] my-1" />
            
            {/* Individual Wallets */}
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center group hover:bg-white/5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleSelectWallet(wallet.id)}
                  className="flex-1 flex items-center gap-3 px-4 py-3"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: wallet.color }}
                  />
                  <div className="flex-1 text-left">
                    <span className="font-mono text-sm text-white">{wallet.name}</span>
                    <span className="font-mono text-xs text-[#708090] ml-2">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>
                  {selectedWalletId === wallet.id && (
                    <Check className="w-4 h-4 text-[#00ff41]" />
                  )}
                </button>
                {/* Delete button - visible on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteWallet(e, wallet.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 mr-2 rounded-lg text-[#708090] hover:text-red-500 hover:bg-red-500/10 transition-all"
                  aria-label={`Delete ${wallet.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="h-px bg-[#1a2225] my-1" />
            
            {/* Add Wallet */}
            <button
              type="button"
              onClick={handleAddWallet}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-[#708090] hover:text-white"
            >
              <Plus className="w-4 h-4" />
              <span className="font-mono text-sm">Add Wallet</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

