"use client"

import { Wallet, ChevronDown, Check, Plus, Trash2 } from "lucide-react"
import type { WalletDropdownProps } from "./types"
import { formatAddress } from "./utils"

/**
 * Wallet Dropdown component for selecting and managing wallets
 * Used in the sticky navigation header
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1a2225] bg-[#0d1214]/80 hover:border-[#00ff41]/40 transition-all"
      >
        <Wallet className="w-4 h-4 text-[#00ff41]" />
        <span className="font-mono text-xs text-white hidden sm:inline">
          {selectedWallet ? selectedWallet.name : 'All'}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#708090] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
          
          <div className="absolute right-0 mt-2 w-56 py-2 rounded-xl border border-[#1a2225] bg-[#0d1214]/95 backdrop-blur-md shadow-2xl z-50">
            <button
              type="button"
              onClick={() => {
                onSelectWallet(null)
                onClose()
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
            >
              <span className="font-mono text-sm text-white">All Wallets</span>
              {selectedWalletId === null && (
                <Check className="w-4 h-4 text-[#00ff41]" />
              )}
            </button>
            
            <div className="h-px bg-[#1a2225] my-1" />
            
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center group hover:bg-white/5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectWallet(wallet.id)
                    onClose()
                  }}
                  className="flex-1 flex items-center gap-2 px-4 py-2.5"
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: wallet.color }}
                  />
                  <div className="flex-1 text-left">
                    <span className="font-mono text-sm text-white">{wallet.name}</span>
                    <span className="font-mono text-[10px] text-[#708090] ml-2">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>
                  {selectedWalletId === wallet.id && (
                    <Check className="w-4 h-4 text-[#00ff41]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (selectedWalletId === wallet.id) {
                      onSelectWallet(null)
                    }
                    onRemoveWallet(wallet.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 mr-2 rounded text-[#708090] hover:text-red-500 hover:bg-red-500/10 transition-all"
                  aria-label={`Delete ${wallet.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <div className="h-px bg-[#1a2225] my-1" />
            
            <button
              type="button"
              onClick={() => {
                onClose()
                onAddWallet()
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors text-[#708090] hover:text-white"
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


