"use client"

import type React from "react"
import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useWalletStore } from "@/lib/store/wallet-store"

import type { WalletTabsProps } from "./types"

export function WalletTabs({ wallets, onWalletChange, onAddWallet, onRemoveWallet }: WalletTabsProps) {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null)
  const { selectedWalletId } = useWalletStore()

  const handleWalletClick = (walletId: string) => {
    const newSelection = selectedWalletId === walletId ? null : walletId
    onWalletChange?.(newSelection)
  }

  const handleRemove = (e: React.MouseEvent, walletId: string) => {
    e.stopPropagation()
    onRemoveWallet?.(walletId)
    if (selectedWalletId === walletId) {
      onWalletChange?.(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          onWalletChange?.(null)
        }}
        className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
          selectedWalletId === null
            ? "bg-[#00ff41] text-[#0a0e0f] border-[#00ff41] glow-green"
            : "bg-[#111618] text-[#00ff41] border-[#1a2225] hover:border-[#00ff41]"
        }`}
      >
        ALL_WALLETS
      </button>

      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          onClick={() => handleWalletClick(wallet.id)}
          onMouseEnter={() => setHoveredWallet(wallet.id)}
          onMouseLeave={() => setHoveredWallet(null)}
          className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all flex items-center gap-2 relative group  ${
            selectedWalletId === wallet.id
              ? "bg-[#111618] border-2"
              : "bg-[#111618] border-[#1a2225] hover:border-opacity-50"
          }`}
          style={{
            borderColor: selectedWalletId === wallet.id ? wallet.color : undefined,
            boxShadow: selectedWalletId === wallet.id ? `0 0 10px ${wallet.color}40` : undefined,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: wallet.color, boxShadow: `0 0 8px ${wallet.color}` }}
          />
          <span style={{ color: selectedWalletId === wallet.id ? wallet.color : "#00ff41" }}>{wallet.name}</span>
          <span className="text-[#708090] text-xs">{wallet.address}</span>

          {hoveredWallet === wallet.id && (
            <button
              type="button"
              onClick={(e) => handleRemove(e, wallet.id)}
              className="ml-2 p-1 rounded bg-red-500/20 hover:bg-red-500/40 transition-colors"
              title="Remove wallet"
            >
              <X className="w-3 h-3 text-red-400" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAddWallet}
        className="px-4 py-2 rounded-lg font-mono text-sm border border-dashed border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/10 transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        ADD_WALLET
      </button>
    </div>
  )
}

