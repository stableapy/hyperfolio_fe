"use client"

import type React from "react"
import { useState } from "react"
import { Plus, AlertCircle, Wallet } from "lucide-react"

import { EscCloseButton } from "@/components/ui/esc-close-button"
import { PRESET_COLORS } from "./constants"
import { isValidWalletInput } from "./utils"
import type { AddWalletDialogProps } from "./types"

export function AddWalletDialog({ isOpen, onClose, onAdd }: AddWalletDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0])
  const [addressError, setAddressError] = useState("")

  if (!isOpen) return null

  const handleAddressChange = (value: string) => {
    setAddress(value)
    // Clear error when user starts typing
    if (addressError) {
      setAddressError("")
    }
  }

  const handleAddressBlur = () => {
    // Validate on blur - show error if invalid format
    if (address && !isValidWalletInput(address)) {
      setAddressError("Invalid format. Enter a valid Ethereum address (0x...) or .hl/.hype domain.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate address format (accepts both 0x... and .hl/.hype domains)
    if (!address || !isValidWalletInput(address)) {
      setAddressError("Invalid format. Enter a valid Ethereum address (0x...) or .hl/.hype domain.")
      return
    }

    // Use address as default name if no name provided
    const walletName = name.trim() || address

    // All validations passed - backend handles .hl domain resolution
    onAdd({ name: walletName, address, color: selectedColor })
    setName("")
    setAddress("")
    setSelectedColor(PRESET_COLORS[0])
    setAddressError("")
    onClose()
  }

  const handleClose = () => {
    // Reset form state when closing
    setName("")
    setAddress("")
    setSelectedColor(PRESET_COLORS[0])
    setAddressError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Close dialog"
      />
      
      {/* Dialog - Terminal style */}
      <div className="relative bg-theme-card-bg border border-theme-border/70 rounded-sm w-full max-w-md shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Terminal window header */}
        <div className="flex items-center justify-between px-3 py-2 bg-theme-bg/50 border-b border-theme-border/50">
          <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">
            wallet --add
          </span>
          <EscCloseButton onClick={handleClose} />
        </div>
        
        {/* Content */}
        <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center bg-theme-accent/10 border border-theme-accent/20 rounded-sm overflow-hidden">
            <div className="px-2 py-2 border-r border-theme-accent/20">
              <span className="font-mono text-xs font-bold text-theme-accent">&gt;</span>
            </div>
            <div className="px-2 py-2">
              <Wallet className="w-4 h-4 text-theme-accent" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold text-theme-text-primary">--new-wallet</h2>
            <p className="text-[10px] font-mono text-theme-text-muted"># track a new address</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wallet Address - PRIMARY INPUT - Terminal style */}
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="flex items-center gap-1.5 text-xs font-mono text-theme-text-muted">
              <span className="text-theme-accent">&gt;</span>
              --address
            </label>
            <div className="relative bg-theme-bg border border-theme-border/70 rounded-sm overflow-hidden">
              <div className="flex items-center">
                <div className="px-3 py-3 bg-theme-accent/10 border-r border-theme-accent/20">
                  <span className="font-mono text-xs font-bold text-theme-accent">0x</span>
                </div>
                <input
                  id="wallet-address"
                  type="text"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onBlur={handleAddressBlur}
                  placeholder="paste address or .hl/.hype domain..."
                  className={`flex-1 px-3 py-3 bg-transparent font-mono text-sm text-theme-accent placeholder:text-theme-text-muted/50 focus:outline-none transition-all ${
                    addressError ? "text-[#ff4444]" : ""
                  }`}
                  required
                />
              </div>
            </div>
            {addressError ? (
              <div className="flex items-start gap-2 text-[10px] font-mono text-[#ff4444]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span># error: {addressError}</span>
              </div>
            ) : (
              <p className="text-[10px] font-mono text-theme-text-muted">
                # ethereum address (0x...) or .hl/.hype domain
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-theme-border/50" />

          {/* Secondary Options - Terminal style */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-theme-text-muted uppercase tracking-wider"># optional flags</p>
            
            {/* Wallet Name - SECONDARY - Terminal style */}
            <div className="flex items-center gap-2">
              <label htmlFor="wallet-name" className="text-[10px] font-mono text-theme-text-muted w-14 shrink-0">
                --label
              </label>
              <div className="flex-1 bg-theme-bg border border-theme-border/70 rounded-sm overflow-hidden">
                <input
                  id="wallet-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Trading, DeFi, NFTs..."
                  className="w-full px-3 py-2 bg-transparent font-mono text-xs text-theme-text-primary placeholder:text-theme-text-muted/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Color Tag - INLINE - Terminal style */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-theme-text-muted w-14 shrink-0">--color</span>
              <div className="flex gap-1 flex-wrap" role="radiogroup" aria-label="Select wallet color">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-sm border transition-all ${
                      selectedColor === color 
                        ? "scale-110 border-white/60" 
                        : "scale-100 border-theme-border/50 opacity-50 hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 6px ${color}50` : "none",
                    }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions - Terminal style */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-theme-bg border border-theme-border/70 rounded-sm font-mono text-xs text-theme-text-muted hover:text-theme-text-primary hover:border-theme-accent/30 transition-all"
            >
              <span className="text-theme-text-muted">&gt;</span>
              --cancel
            </button>
            <button
              type="submit"
              disabled={!address || !!addressError}
              className="flex-1 flex items-center justify-center bg-theme-accent/10 border border-theme-accent/50 rounded-sm overflow-hidden font-mono text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-theme-accent/20"
            >
              <div className="flex items-center gap-1.5 px-3 py-2.5">
                <Plus className="w-3.5 h-3.5 text-theme-accent" />
                <span className="text-theme-accent">--add</span>
              </div>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

