"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const WELCOME_STORAGE_KEY = "hyperfolio-welcome-seen"

interface WelcomeModalProps {
  onComplete?: () => void
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Check localStorage on mount to see if user has seen the welcome modal
  useEffect(() => {
    setHasMounted(true)
    
    const hasSeenWelcome = localStorage.getItem(WELCOME_STORAGE_KEY)
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, "true")
    setIsOpen(false)
    onComplete?.()
  }

  if (!hasMounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleDismiss}
        aria-label="Close dialog"
      />
      
      {/* Dialog */}
      <div className="relative bg-[#0d1214]/95 border border-[#1a2225] rounded-xl w-full max-w-md shadow-2xl backdrop-blur-md">
        {/* Close button */}
        <button 
          type="button"
          onClick={handleDismiss} 
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#708090] hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold text-white mb-2">
              <span className="text-[#00ff41]">&gt;</span> Welcome to{" "}
              <span className="text-[#00ff41]">HYPERFOLIO</span>
            </h2>
            <p className="font-mono text-sm text-[#708090] leading-relaxed">
              Track your HyperEVM portfolio across multiple wallets.
            </p>
          </div>

          {/* Simple feature list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-[#00ff41] font-mono text-sm">•</span>
              <p className="font-mono text-sm text-[#708090]">
                <span className="text-white">Multi-wallet tracking</span> — Add any wallet address to monitor
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#00d9ff] font-mono text-sm">•</span>
              <p className="font-mono text-sm text-[#708090]">
                <span className="text-white">Real-time data</span> — Tokens, NFTs, DeFi positions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#a855f7] font-mono text-sm">•</span>
              <p className="font-mono text-sm text-[#708090]">
                <span className="text-white">Integrated swap</span> — Trade directly via KyberSwap
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00ff41]/90 transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

// Utility function to reset welcome state (useful for testing)
export function resetWelcomeState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WELCOME_STORAGE_KEY)
  }
}

// Utility function to check if user has seen welcome
export function hasSeenWelcome(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(WELCOME_STORAGE_KEY) === "true"
  }
  return false
}
