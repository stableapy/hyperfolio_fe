"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, AlertCircle, Wallet } from "lucide-react"

interface AddWalletDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (wallet: { name: string; address: string; color: string }) => void
}

const PRESET_COLORS = ["#00ff41", "#00d9ff", "#a855f7", "#ffaa00", "#ff6b35", "#00ffff", "#ff1493", "#7fff00"]

// Validate Ethereum address format
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function AddWalletDialog({ isOpen, onClose, onAdd }: AddWalletDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
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
    // Validate address when user leaves the field
    if (address && !isValidEthereumAddress(address)) {
      setAddressError("Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters.")
    }
  }

  // Format address for display (used as default name)
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate address format
    if (!address || !isValidEthereumAddress(address)) {
      setAddressError("Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters.")
      return
    }
    
    // Use address as default name if no name provided
    const walletName = name.trim() || formatAddress(address)
    
    // All validations passed
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
      
      {/* Dialog */}
      <div className="relative bg-[#0d1214]/95 border border-[#1a2225] rounded-xl p-6 w-full max-w-md shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/20">
              <Wallet className="w-5 h-5 text-[#00ff41]" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white">Add Wallet</h2>
              <p className="text-xs font-mono text-[#708090]">Track a new wallet address</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="p-2 rounded-lg text-[#708090] hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Wallet Address - PRIMARY INPUT */}
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="block text-sm font-mono text-white font-medium">
              Wallet Address
            </label>
            <div className="relative">
              <input
                id="wallet-address"
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onBlur={handleAddressBlur}
                placeholder= "0x..." 
                className={`w-full pl-4 pr-4 py-4 bg-[#0a0f0f] border-2 rounded-xl font-mono text-base text-white placeholder:text-[#708090]/40 focus:outline-none transition-all ${
                  addressError 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-[#1a2225] focus:border-[#00ff41]/60"
                }`}
                required
              />
            </div>
            {addressError ? (
              <div className="flex items-start gap-2 text-xs font-mono text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{addressError}</span>
              </div>
            ) : (
              <p className="text-xs font-mono text-[#708090]/60">
                Paste your Ethereum wallet address
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1a2225]" />

          {/* Secondary Options */}
          <div className="space-y-4">
            <p className="text-xs font-mono text-[#708090] uppercase tracking-wider">Optional Details</p>
            
            {/* Wallet Name - SECONDARY */}
            <div className="flex items-center gap-3">
              <label htmlFor="wallet-name" className="text-xs font-mono text-[#708090] w-16 shrink-0">
                Label
              </label>
              <input
                id="wallet-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Trading, DeFi, NFTs..."
                className="flex-1 px-3 py-2 bg-[#0a0f0f] border border-[#1a2225] rounded-lg font-mono text-sm text-white placeholder:text-[#708090]/40 focus:border-[#00ff41]/50 focus:outline-none transition-all"
              />
            </div>

            {/* Color Tag - INLINE */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#708090] w-16 shrink-0">Color</span>
              <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Select wallet color">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      selectedColor === color 
                        ? "scale-110 border-white/50" 
                        : "scale-100 border-transparent opacity-40 hover:opacity-70"
                    }`}
                    style={{
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 8px ${color}50` : "none",
                    }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-[#1a2225]/60 border border-[#1a2225] rounded-lg font-mono text-sm text-[#708090] hover:text-white hover:border-[#2a3235] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!address || !!addressError}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00ff41] text-[#0a0f0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00ff41]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#00ff41]"
            >
              <Plus className="w-4 h-4" />
              Add Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
