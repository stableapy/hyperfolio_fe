"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Wallet, ChevronDown, Check, Plus, Trash2, ArrowRightLeft } from "lucide-react"
import { AddWalletDialog } from "@/components/add-wallet-dialog"
import { PortfolioHero } from "@/components/portfolio-hero"
import { SectionNav } from "@/components/section-nav"
import { TokensSection } from "@/components/sections/tokens-section"
import { NFTsSection } from "@/components/sections/nfts-section"
import { DeFiSection } from "@/components/sections/defi-section"
import { HypercoreSection } from "@/components/sections/hypercore-section"
import { TransactionsSection } from "@/components/sections/transactions-section"
import { SwapWidgetModal } from "@/components/swap-widget-modal"
import { useWalletStore } from "@/lib/store/wallet-store"

// Floating Swap Button component using Portal
// Visible on mobile always (when in content section), on desktop only when NOT on tokens section
function FloatingSwapButton({ 
  onClick, 
  isVisible, 
  activeSection 
}: { 
  onClick: () => void
  isVisible: boolean
  activeSection: string 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) return null

  // On desktop (lg+), hide when on tokens section (which has inline swap widget)
  // On mobile, always show when in content section
  const hideOnDesktop = activeSection === "tokens"

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      className={`${hideOnDesktop ? 'lg:hidden' : ''} flex items-center gap-2 px-5 py-3.5 bg-[#00ff41] text-[#0a0e0f] font-mono text-sm font-bold rounded-full shadow-xl hover:bg-[#00ff41]/90 hover:scale-105 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        boxShadow: '0 4px 20px rgba(0, 255, 65, 0.4)',
      }}
    >
      <ArrowRightLeft className="w-5 h-5" />
      <span>Swap</span>
    </button>,
    document.body
  )
}

export default function Home() {
  const {
    wallets,
    isLoading,
    aggregateData,
    error,
    addWallet,
    syncAllWallets,
    selectedWalletId,
    selectWallet,
    removeWallet,
  } = useWalletStore()
  
  // Track if data section is visible for animation
  const dataSectionRef = useRef<HTMLDivElement>(null)
  const [isDataVisible, setIsDataVisible] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  
  // Track if we're past the hero section (for floating swap button)
  const [isInContentSection, setIsInContentSection] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  
  // Intersection observer for reveal animation and swap button visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDataVisible(true)
        }
        // Show swap button when content section is visible
        setIsInContentSection(entry.isIntersecting)
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    
    if (dataSectionRef.current) {
      observer.observe(dataSectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])

  // Get selected wallet info
  const selectedWallet = selectedWalletId 
    ? wallets.find(w => w.id === selectedWalletId) 
    : null

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const [activeSection, setActiveSection] = useState("tokens")
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)

  // Sync wallets data on mount and when wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      syncAllWallets()
    }
  }, [wallets.length, syncAllWallets])

  const handleAddWallet = (wallet: { name: string; address: string; color: string }) => {
    addWallet(wallet)
  }

  const handleRefresh = () => {
    // Pass true to skip cache and get fresh data from backend
    syncAllWallets(true)
  }

  // Calculate aggregate values from data
  const totalValue = aggregateData?.total_value || 0
  const totalChange24h = aggregateData?.total_change_24h || 0

  return (
    <main className="min-h-screen bg-[#0a0f0f]">
      {/* Floating Swap Button - Mobile: always visible in content section, Desktop: visible except on tokens section */}
      {wallets.length > 0 && (
        <FloatingSwapButton 
          onClick={() => setIsSwapModalOpen(true)} 
          isVisible={isInContentSection}
          activeSection={activeSection}
        />
      )}

      {/* Swap Modal for Mobile */}
      <SwapWidgetModal
        open={isSwapModalOpen}
        onOpenChange={setIsSwapModalOpen}
      />

      {/* Hero Section - Full width, no padding */}
      <PortfolioHero 
        totalValue={totalValue} 
        change24h={totalChange24h} 
        isLoading={isLoading} 
        onRefresh={handleRefresh}
        onAddWallet={() => setIsAddWalletOpen(true)}
      />

      {/* Error display */}
      {error && (
        <div className="container mx-auto px-6">
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="font-mono text-sm text-red-400">ERROR: {error}</p>
          </div>
        </div>
      )}

      {/* Add Wallet Dialog */}
      <AddWalletDialog 
        isOpen={isAddWalletOpen} 
        onClose={() => setIsAddWalletOpen(false)} 
        onAdd={handleAddWallet} 
      />

      {/* Content Sections with reveal animation */}
      <div 
        ref={dataSectionRef}
        className={`transition-all duration-700 ease-out ${
          isDataVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8"
        }`}
      >
        {wallets.length === 0 ? (
          <div className="container mx-auto px-6 py-20 text-center">
            <div className="font-mono text-2xl text-[#00ff41] mb-4">&gt; NO_WALLETS_CONFIGURED</div>
            <div className="font-mono text-sm text-[#708090] mb-6">Add your first wallet to start tracking your portfolio</div>
            <button
              type="button"
              onClick={() => setIsAddWalletOpen(true)}
              className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono text-sm font-bold hover:bg-[#00d9ff] transition-colors glow-green"
            >
              + ADD FIRST WALLET
            </button>
          </div>
        ) : (
          <div className="container mx-auto px-6 py-8">
            {/* Sticky navigation header with shadow on scroll */}
            <div className="sticky top-0 z-40 -mx-6 px-6 pt-4 mb-6 bg-gradient-to-b from-[#0a0f0f] via-[#0a0f0f]/98 to-[#0a0f0f]/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 overflow-x-auto">
                  <SectionNav activeSection={activeSection} onSectionChange={setActiveSection} />
                </div>
                
                {/* Wallet Selector in sticky header */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1a2225] bg-[#0d1214]/80 hover:border-[#00ff41]/40 transition-all"
                  >
                    <Wallet className="w-4 h-4 text-[#00ff41]" />
                    <span className="font-mono text-xs text-white hidden sm:inline">
                      {selectedWallet ? selectedWallet.name : 'All'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-[#708090] transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isWalletDropdownOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setIsWalletDropdownOpen(false)}
                        aria-label="Close dropdown"
                      />
                      
                      <div className="absolute right-0 mt-2 w-56 py-2 rounded-xl border border-[#1a2225] bg-[#0d1214]/95 backdrop-blur-md shadow-2xl z-50">
                        <button
                          type="button"
                          onClick={() => {
                            selectWallet(null)
                            setIsWalletDropdownOpen(false)
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
                                selectWallet(wallet.id)
                                setIsWalletDropdownOpen(false)
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
                                  selectWallet(null)
                                }
                                removeWallet(wallet.id)
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
                            setIsWalletDropdownOpen(false)
                            setIsAddWalletOpen(true)
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
              </div>
            </div>

            {/* Section content with slight delay for stagger effect */}
            <div className={`transition-all duration-500 delay-200 ${
              isDataVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              {activeSection === "tokens" && <TokensSection isLoading={isLoading} />}
              {activeSection === "nfts" && <NFTsSection isLoading={isLoading} />}
              {activeSection === "defi" && <DeFiSection isLoading={isLoading} />}
              {activeSection === "hypercore" && <HypercoreSection isLoading={isLoading} />}
              {activeSection === "transactions" && <TransactionsSection isLoading={isLoading} />}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
