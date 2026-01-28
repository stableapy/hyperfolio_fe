"use client"

import { Wallet, ChevronDown, Check, Plus, Trash2 } from "lucide-react"
import type { WalletDropdownProps } from "./types"
import { formatAddress } from "./utils"

/**
 * Wallet Dropdown component for selecting and managing wallets
 * Terminal-style aesthetic with sharp corners and command prompts
 */
export function WalletDropdown({
  wallets,
  selectedWalletId,
  isOpen,
  onToggle,
  onClose,
  onSelectWallet,
  onRemoveWallet,
  onAddWallet,
}: WalletDropdownProps) {
  const selectedWallet = selectedWalletId 
    ? wallets.find(w => w.id === selectedWalletId) 
    : null

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center bg-theme-card-bg/90 backdrop-blur-sm border border-theme-border/70 rounded-sm overflow-hidden hover:border-theme-accent/50 transition-all duration-150"
      >
        <div className="px-1.5 sm:px-2 py-1.5 sm:py-2 bg-theme-accent/10 border-r border-theme-accent/20 flex items-center gap-1 sm:gap-1.5">
          <span className="font-mono text-[10px] sm:text-xs text-theme-accent font-bold">&gt;</span>
          <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-accent shrink-0" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2">
          <span className="font-mono text-[10px] sm:text-xs text-theme-text-primary uppercase tracking-wider truncate max-w-[60px] sm:max-w-[100px]">
            {selectedWallet ? formatAddress(selectedWallet.name) : 'all'}
          </span>
          <ChevronDown className={`w-3 h-3 text-theme-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default" 
            onClick={onClose}
            aria-label="Close dropdown"
          />
          
          {/* Menu - Terminal style with sharp corners */}
          <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-auto mt-2 sm:w-64 py-1 rounded-sm border border-theme-border/70 bg-theme-card-bg/98 backdrop-blur-md shadow-xl z-50 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="px-3 py-2 border-b border-theme-border/50 bg-theme-bg/30">
              <div className="flex items-center gap-2">
                <span className="text-theme-accent font-mono text-xs font-bold">&gt;</span>
                <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">
                  wallet --select
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectWallet(null)
                onClose()
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors min-h-[40px] border-l-2 ${
                selectedWalletId === null 
                  ? "border-l-theme-accent bg-theme-accent/5" 
                  : "border-l-transparent hover:border-l-theme-accent/50 hover:bg-theme-accent-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-theme-text-muted">--</span>
                <span className="font-mono text-xs text-theme-text-primary uppercase tracking-wider">all wallets</span>
              </div>
              {selectedWalletId === null && (
                <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />
              )}
            </button>
            
            <div className="h-px bg-theme-border/50 mx-3" />
            
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`flex items-center group transition-colors border-l-2 ${
                  selectedWalletId === wallet.id 
                    ? "border-l-theme-accent bg-theme-accent/5" 
                    : "border-l-transparent hover:border-l-theme-accent/50 hover:bg-theme-accent-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectWallet(wallet.id)
                    onClose()
                  }}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 min-h-[40px]"
                >
                  <div 
                    className="w-2 h-2 rounded-sm shrink-0" 
                    style={{ backgroundColor: wallet.color }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-mono text-xs text-theme-text-primary block truncate uppercase tracking-wider">{wallet.name}</span>
                    <span className="font-mono text-[9px] text-theme-text-muted block truncate">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>
                  {selectedWalletId === wallet.id && (
                    <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                  )}
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (selectedWalletId === wallet.id) {
                      onSelectWallet(null)
                    }
                    onRemoveWallet(wallet.id)
                  }}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 mr-2 rounded-sm text-theme-text-muted hover:text-red-500 active:text-red-500 hover:bg-red-500/10 active:bg-red-500/10 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label={`Delete ${wallet.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <div className="h-px bg-theme-border/50 mx-3" />
            
            <button
              type="button"
              onClick={() => {
                onClose()
                onAddWallet()
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-theme-accent-muted transition-colors text-theme-text-muted hover:text-theme-accent min-h-[40px] border-l-2 border-l-transparent hover:border-l-theme-accent/50"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-xs uppercase tracking-wider">add wallet</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}


