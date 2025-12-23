"use client"

import { useState, useEffect, useRef } from "react"
import { AddWalletDialog } from "@/components/wallet"
import { WelcomeModal } from "@/components/welcome-modal"
import { ApiBanner } from "@/components/api-banner"
import { PortfolioHero } from "@/components/portfolio-hero"
import { SwapWidgetModal } from "@/components/swap-widget"
import { SeoFooter } from "@/components/seo-footer"
import { useWalletStore } from "@/lib/store/wallet-store"

// Home page components
import { 
  FloatingSwapButton, 
  EmptyState, 
  StickyNavHeader, 
  SectionContent,
  DefiStreamProvider,
} from "@/components/home"

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
  
  // Handle scroll to content section
  const handleScrollToContent = () => {
    dataSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
  
  // Track if we're past the hero section (for floating swap button)
  const [isInContentSection, setIsInContentSection] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("tokens")
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  
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
    <main className="min-h-screen bg-theme-bg">
      {/* API Promotion Banner - Top of page */}
      <ApiBanner />

      {/* Welcome Modal - Shows on first visit */}
      <WelcomeModal />

      {/* DeFi Streaming Provider - Initiates position streaming at page level */}
      {wallets.length > 0 && <DefiStreamProvider />}

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
        onScrollToContent={handleScrollToContent}
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
          <EmptyState onAddWallet={() => setIsAddWalletOpen(true)} />
        ) : (
          <div className="container mx-auto px-6 py-8">
            {/* Sticky navigation header with shadow on scroll */}
            <StickyNavHeader
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={selectWallet}
              onRemoveWallet={removeWallet}
              onAddWallet={() => setIsAddWalletOpen(true)}
            />

            {/* Section content with slight delay for stagger effect */}
            <SectionContent
              activeSection={activeSection}
              isLoading={isLoading}
              isDataVisible={isDataVisible}
            />
          </div>
        )}
      </div>

      {/* SEO-optimized footer with social links and content */}
      <SeoFooter />
    </main>
  )
}
