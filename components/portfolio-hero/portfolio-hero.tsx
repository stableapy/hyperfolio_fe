"use client"

import { useState, useMemo, useEffect } from "react"
import { RefreshCw, Maximize2 } from "lucide-react"
import { useWalletStore } from "@/lib/store/wallet-store"

// Sub-components
import { WalletSelector } from "./wallet-selector"
import { StatPills } from "./stat-pills"
import { PortfolioChart } from "./portfolio-chart"
import { ChartModal } from "./chart-modal"

// Hooks
import { usePortfolioHistory, usePortfolioBreakdown, useApyData } from "./hooks"

// Utils and Types
import { formatValue, calculateWalletTotalValue } from "./utils"
import type { PortfolioHeroProps } from "./types"

export function PortfolioHero({ totalValue, change24h, isLoading = false, onRefresh, onAddWallet, onScrollToContent }: PortfolioHeroProps) {
  const { selectedWalletId, wallets, walletData, aggregateData, selectWallet, removeWallet } = useWalletStore()
  
  // Local state
  const [privacyMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  // Custom hooks
  const { isLoadingHistory, chartData, getModalChartData } = usePortfolioHistory({
    selectedWalletId,
    wallets,
  })
  
  const breakdown = usePortfolioBreakdown({
    selectedWalletId,
    wallets,
    walletData,
    aggregateData,
  })
  
  const apyData = useApyData({
    selectedWalletId,
    wallets,
    walletData,
  })
  
  // Hide scroll indicator when user scrolls, show when back at top
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Show chart as soon as chart data is available (no artificial delay)
  useEffect(() => {
    // Chart only depends on history data, not main portfolio loading state
    if (!isLoadingHistory && chartData.length > 0) {
      setShowChart(true)
    } else if (isLoadingHistory) {
      setShowChart(false)
    }
  }, [isLoadingHistory, chartData.length])

  // Get display data from selected wallet or aggregate
  const displayData = useMemo(() => {
    if (selectedWalletId) {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId)
      if (selectedWallet && walletData[selectedWallet.address]) {
        const data = walletData[selectedWallet.address]
        return {
          value: calculateWalletTotalValue(data),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          change24h: (data.composition as any)?.total_change_24h || change24h,
          walletName: selectedWallet.name
        }
      }
    }
    return {
      value: totalValue,
      change24h,
      walletName: null
    }
  }, [selectedWalletId, wallets, walletData, totalValue, change24h])

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh?.()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const isPositive = displayData.change24h >= 0
  const formattedValue = formatValue(displayData.value, privacyMode)

  return (
    <section className="relative min-h-[calc(100svh-44px)] overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0f] via-[#0a0f0f] to-[#0d1214]/30" />
      
      {/* Subtle grid pattern - smaller on mobile */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(#00ff41 1px, transparent 1px),
            linear-gradient(90deg, #00ff41 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col container mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Header with wallet selector */}
        <header className="pt-3 sm:pt-6 md:pt-8 pb-2 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-2">
                <span className="text-[#00ff41] text-lg sm:text-2xl font-mono font-bold">&gt;</span>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight">
                  <span className="text-[#00ff41] text-glow-green">HYPER</span>
                  <span className="text-white">FOLIO_</span>
                </h1>
              </div>
              <p className="text-[#708090] font-mono text-[10px] sm:text-sm tracking-wide hidden sm:block">
                Multi-wallet DeFi portfolio tracker for HyperEVM
              </p>
            </div>
            
            {/* Wallet Selector */}
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              isOpen={isWalletDropdownOpen}
              onToggle={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              onClose={() => setIsWalletDropdownOpen(false)}
              onSelectWallet={selectWallet}
              onRemoveWallet={removeWallet}
              onAddWallet={() => onAddWallet?.()}
            />
          </div>
        </header>
        
        {/* Main Content - Portfolio Value & Stats - Centered vertically */}
        <div className="flex-1 flex flex-col justify-center pb-16 sm:pb-36 md:pb-52 lg:pb-64">
          {/* Content with granular loading states - show UI immediately, skeleton only data */}
          <div className="max-w-4xl space-y-3 sm:space-y-6 md:space-y-8">
            {/* Label with controls - Always visible immediately */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="font-mono text-[10px] sm:text-sm uppercase tracking-widest text-[#708090]">Portfolio Value</span>
             
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1 sm:p-2 rounded-lg hover:bg-white/5 transition-all text-[#708090] hover:text-[#00d9ff]"
                aria-label="Refresh data"
                disabled={isRefreshing || isLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            {/* Portfolio Value - Inline skeleton when loading */}
            <div className="font-mono tracking-tight leading-none min-h-[3rem] sm:min-h-[5rem] md:min-h-[6rem] lg:min-h-[8rem]">
              {isLoading && displayData.value === 0 ? (
                <div className="h-16 sm:h-20 md:h-24 lg:h-32 w-[80%] sm:w-[70%] max-w-lg bg-[#1a2225] rounded-xl animate-pulse" />
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white transition-all duration-300">
                    {privacyMode ? "••••••" : `$${formattedValue.intPart}`}
                  </span>
                  {!privacyMode && (
                    <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#708090] transition-all duration-300">
                      {formattedValue.decPart}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Stats Pills */}
            <StatPills
              isLoading={isLoading}
              hasData={displayData.value !== 0}
              isPositive={isPositive}
              change24h={displayData.change24h}
              privacyMode={privacyMode}
              breakdown={breakdown}
              apyData={apyData}
            />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator - Positioned absolutely to avoid chart overlap */}
      <div className={`absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-500 ${hasScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          type="button"
          onClick={onScrollToContent}
          className="relative flex flex-col items-center gap-1.5 text-[#708090] animate-bounce hover:text-[#00ff41] transition-colors p-8 -m-8"
          aria-label="Scroll to content"
        >
          <span className="font-mono text-[10px] sm:hidden uppercase tracking-wider">Scroll</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
      
      {/* Expand Chart Button - positioned above the chart */}
      <button
        type="button"
        onClick={() => setIsChartModalOpen(true)}
        className={`absolute bottom-[28%] sm:bottom-[32%] md:bottom-[36%] lg:bottom-[38%] right-4 sm:right-6 md:right-10 lg:right-16 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#00ff41]/30 bg-[#0a0f0f]/80 backdrop-blur-sm hover:border-[#00ff41]/60 hover:bg-[#0a0f0f]/95 transition-all group ${
          showChart && !privacyMode && chartData.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Expand chart"
      >
        <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41] group-hover:scale-110 transition-transform" />
        <span className="font-mono text-[10px] sm:text-xs text-[#708090] group-hover:text-white transition-colors hidden sm:inline">
          Expand
        </span>
      </button>

      {/* Interactive Chart Layer - positioned at bottom */}
      <PortfolioChart
        chartData={chartData}
        isPositive={isPositive}
        showChart={showChart}
        privacyMode={privacyMode}
      />
      
      {/* Bottom fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-28 md:h-32 lg:h-40 bg-gradient-to-t from-[#0a0f0f] to-transparent pointer-events-none z-30" />

      {/* Chart Modal */}
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        getModalChartData={getModalChartData}
        isPositive={isPositive}
      />
    </section>
  )
}

