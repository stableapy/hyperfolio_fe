'use client';

import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Maximize2, Eye, EyeOff } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';

// Sub-components
import { WalletSelector } from './wallet-selector';
import { StatPills } from './stat-pills';
import { PortfolioChart } from './portfolio-chart';
import { ChartModal } from './chart-modal';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Hooks
import {
  usePortfolioHistory,
  usePortfolioBreakdown,
  useApyData,
  useAnimatedValue,
} from './hooks';

// Utils and Types
import {
  formatValue,
  calculateWalletTotalValue,
  calculateStreamingTotalValue,
} from './utils';
import type { PortfolioHeroProps } from './types';

export function PortfolioHero({
  change24h,
  dollarChange24h,
  onRefresh,
  onAddWallet,
  onScrollToContent,
}: PortfolioHeroProps) {
  const {
    selectedWalletId,
    wallets,
    walletData,
    aggregateData,
    selectWallet,
    removeWallet,
    streaming,
    loading,
    privacyMode,
    togglePrivacyMode,
  } = useWalletStore();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Custom hooks
  const { isLoadingHistory, chartData, getModalChartData, error } =
    usePortfolioHistory({
      selectedWalletId,
      wallets,
    });

  const breakdown = usePortfolioBreakdown({
    selectedWalletId,
    wallets,
    walletData,
    aggregateData,
  });

  const apyData = useApyData({
    selectedWalletId,
    wallets,
  });

  // Calculate showChart directly - no state needed
  // Show chart if we have data, or keep showing while loading
  const showChart = chartData.length > 0 || isLoadingHistory;

  // Hide scroll indicator when user scrolls, show when back at top
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get display data from selected wallet or aggregate
  const displayData = useMemo(() => {
    // Calculate streaming DeFi value
    // When ALL wallets selected: use server-calculated aggregate total (more accurate)
    // When specific wallet selected: filter positions by wallet address
    const streamingDeFiValue = selectedWalletId
      ? calculateStreamingTotalValue(
          streaming.streamedProtocols,
          [wallets.find((w) => w.id === selectedWalletId)?.address].filter(
            Boolean
          ) as string[]
        )
      : (streaming.streamPortfolioStats?.totalValueUSD
          ? parseFloat(streaming.streamPortfolioStats.totalValueUSD)
          : 0);

    if (selectedWalletId) {
      const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
      if (selectedWallet && walletData[selectedWallet.address]) {
        const data = walletData[selectedWallet.address];
        // calculateWalletTotalValue includes: tokens + NFTs + Hypercore (NOT DeFi positions from walletData)
        // streamingDeFiValue adds the streaming DeFi positions
        const walletValue = calculateWalletTotalValue(data);
        const currentValue = walletValue + streamingDeFiValue;

        // Calculate 24h change on client side to include streaming DeFi positions
        const history =
          (data.history as Array<{ timestamp: number; value: number }>) || [];
        const yesterdayValue =
          history.length >= 2
            ? history[history.length - 2]?.value
            : history[history.length - 1]?.value;

        const pastValue = yesterdayValue || currentValue;
        const walletChange24h =
          pastValue > 0 &&
          !Number.isNaN(currentValue) &&
          !Number.isNaN(pastValue)
            ? ((currentValue - pastValue) / pastValue) * 100
            : 0;

        return {
          value: currentValue,
          change24h: walletChange24h,
          walletName: selectedWallet.name,
        };
      }
    }

    // Aggregate view: sum all wallet token/NFT/Hypercore values + streaming DeFi
    // We don't use totalValue here because it includes DeFi from the non-streamed source,
    // which would double count with streamingDeFiValue
    let aggregateWalletValue = 0;
    wallets.forEach((wallet) => {
      if (walletData[wallet.address]) {
        aggregateWalletValue += calculateWalletTotalValue(
          walletData[wallet.address]
        );
      }
    });

    return {
      value: aggregateWalletValue + streamingDeFiValue,
      change24h,
      walletName: null,
    };
  }, [
    selectedWalletId,
    wallets,
    walletData,
    change24h,
    streaming.streamedProtocols,
  ]);

  // Animate the value with a terminal-style counting effect
  // Duration is shorter for smaller changes, longer for large jumps
  const animationDuration = Math.min(
    1500,
    Math.max(500, Math.abs(displayData.value) / 100)
  );
  const { animatedValue, isAnimating } = useAnimatedValue(displayData.value, {
    duration: animationDuration,
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const isPositive = displayData.change24h >= 0;
  const formattedValue = formatValue(animatedValue, privacyMode);

  return (
    <section className="bg-theme-bg relative flex min-h-[calc(100svh-44px)] flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="from-theme-bg via-theme-bg to-theme-bg-alt/30 absolute inset-0 bg-gradient-to-b" />

      {/* Subtle grid pattern - uses theme-aware grid color for visibility in both modes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--theme-grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--theme-grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 sm:px-6 md:px-10 lg:px-16">
        {/* Header with wallet selector */}
        <header className="pt-3 pb-2 sm:pt-6 sm:pb-6 md:pt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-shrink-0">
              <div className="mb-0.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
                <span className="text-theme-accent font-mono text-lg font-bold sm:text-2xl flex-shrink-0">
                  &gt;
                </span>
                <h1 className="font-mono text-xl font-bold tracking-tight sm:text-3xl md:text-4xl min-w-0">
                  <span className="text-theme-accent dark:text-glow-green">
                    HYPER
                  </span>
                  <span className="text-theme-text-primary">FOLIO_</span>
                </h1>
              </div>
              <p className="text-theme-text-secondary hidden font-mono text-[10px] tracking-wide sm:block sm:text-sm">
                Multi-wallet DeFi portfolio tracker for HyperEVM
              </p>
            </div>

            {/* Controls: Sync, Theme Toggle, Privacy & Wallet Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => togglePrivacyMode()}
                className="bg-theme-card-bg/90 border-theme-border/70 hover:border-theme-accent/50 flex items-center overflow-hidden rounded-sm border backdrop-blur-sm transition-all duration-150 min-h-[44px] min-w-[44px]"
                aria-label={
                  privacyMode
                    ? 'Show portfolio values'
                    : 'Hide portfolio values'
                }
              >
                <div className="bg-theme-accent/10 border-theme-accent/20 border-r px-2 py-2.5 sm:px-2 sm:py-2 flex items-center justify-center min-w-[44px] sm:min-w-0">
                  {privacyMode ? (
                    <EyeOff className="text-theme-accent h-4 w-4 sm:h-4 sm:w-4" />
                  ) : (
                    <Eye className="text-theme-accent h-4 w-4 sm:h-4 sm:w-4" />
                  )}
                </div>
                <span className="text-theme-text-muted hidden sm:block px-1.5 font-mono text-[9px] sm:px-2 sm:text-[10px]">
                  {privacyMode ? '--show' : '--hide'}
                </span>
              </button>
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
              <button
                type="button"
                onClick={handleRefresh}
                className="bg-theme-card-bg/90 border-theme-border/70 hover:border-theme-accent/50 flex items-center overflow-hidden rounded-sm border backdrop-blur-sm transition-all duration-150 disabled:opacity-50 min-h-[44px] min-w-[44px]"
                aria-label="Refresh data"
                disabled={
                  isRefreshing ||
                  loading.isWalletDataLoading ||
                  loading.isPositionsLoading
                }
              >
                <div className="bg-theme-accent/10 border-theme-accent/20 border-r px-2 py-2.5 sm:px-2 sm:py-2 flex items-center justify-center min-w-[44px] sm:min-w-0">
                  <RefreshCw
                    className={`text-theme-accent h-4 w-4 sm:h-4 sm:w-4 ${isRefreshing || loading.isWalletDataLoading || loading.isPositionsLoading ? 'animate-spin' : ''}`}
                  />
                </div>
                <span className="text-theme-text-muted hidden sm:block px-1.5 font-mono text-[9px] sm:px-2 sm:text-[10px]">
                  --sync
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Portfolio Value & Stats - Centered vertically */}
        <div className="flex flex-1 flex-col justify-center pb-12 sm:pb-24 md:pb-32 lg:pb-48">
          {/* Content with granular loading states - show UI immediately, skeleton only data */}
          <div className="max-w-full w-full space-y-3 sm:space-y-6 md:space-y-8">
            {/* Portfolio Value - Shows actual value with animation as data loads */}
            <div className="min-h-[3.5rem] font-mono leading-none tracking-tight overflow-hidden sm:min-h-[5rem] md:min-h-[6rem] lg:min-h-[8rem]">
              <div className="flex flex-wrap items-baseline gap-0">
                <span className="text-theme-text-primary text-3xl font-bold transition-all duration-300 sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
                  {privacyMode ? '••••••' : `$${formattedValue.intPart}`}
                </span>
                {!privacyMode && (
                  <span className="text-theme-text-secondary text-xl font-bold transition-all duration-300 sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
                    {formattedValue.decPart}
                  </span>
                )}
              </div>
            </div>

            {/* Terminal-style loading/streaming indicator - fixed height to prevent layout shift */}
            <div className="h-5 sm:h-6">
              <div
                className={`text-theme-text-muted flex items-center gap-1.5 font-mono text-xs transition-opacity duration-200 sm:text-sm ${
                  loading.isWalletDataLoading ||
                  loading.isPositionsLoading ||
                  isRefreshing ||
                  streaming.isStreaming
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
              >
                <span className="text-theme-accent">&gt;</span>
                {streaming.isStreaming && streaming.streamProgress.total > 0 ? (
                  <>
                    <span>scanning protocols</span>
                    <span className="text-theme-accent tabular-nums">
                      [{streaming.streamProgress.completed}/
                      {streaming.streamProgress.total}]
                    </span>
                  </>
                ) : (
                  <span>fetching portfolio data</span>
                )}
                <span className="animate-pulse">_</span>
              </div>
            </div>

            {/* Stats Pills */}
            <StatPills
              isLoading={loading.isWalletDataLoading}
              hasData={displayData.value !== 0}
              isPositive={isPositive}
              change24h={displayData.change24h}
              dollarChange24h={dollarChange24h}
              privacyMode={privacyMode}
              breakdown={breakdown}
              apyData={apyData}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator - Positioned absolutely to avoid chart overlap */}
      <div
        className={`absolute bottom-2 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-500 sm:bottom-6 md:bottom-8 ${hasScrolled ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <button
          type="button"
          onClick={onScrollToContent}
          className="text-theme-text-secondary hover:text-theme-accent relative -m-8 flex min-h-[44px] min-w-[44px] animate-bounce flex-col items-center gap-1.5 p-8 transition-colors"
          aria-label="Scroll to content"
        >
          <span className="font-mono text-[10px] tracking-wider uppercase sm:hidden">
            Scroll
          </span>
          <svg
            className="h-5 w-5 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>

      {/* Expand Chart Button - positioned above the chart */}
      <button
        type="button"
        onClick={() => setIsChartModalOpen(true)}
        className={`bg-theme-card-bg/90 border-theme-border/70 hover:border-theme-accent/50 group absolute bottom-[20%] right-3 z-30 flex items-center overflow-hidden rounded-sm border backdrop-blur-sm transition-all duration-150 sm:bottom-[25%] sm:right-6 md:bottom-[30%] md:right-10 lg:bottom-[35%] lg:right-16 ${
          showChart && !privacyMode && chartData.length > 0
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-label="Expand chart"
      >
        <div className="bg-theme-accent/10 border-theme-accent/20 border-r px-1.5 py-1 sm:px-2 sm:py-1.5 flex items-center justify-center">
          <span className="text-theme-accent font-mono text-[10px] font-bold sm:text-xs">
            &gt;
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5">
          <Maximize2 className="text-theme-accent h-3 w-3 transition-transform group-hover:scale-110 sm:h-3.5 sm:w-3.5" />
          <span className="text-theme-text-muted group-hover:text-theme-text-secondary hidden font-mono text-[9px] transition-colors sm:inline sm:text-[10px]">
            --expand
          </span>
        </div>
      </button>

      {/* Interactive Chart Layer - positioned at bottom */}
      <PortfolioChart
        chartData={chartData}
        isPositive={isPositive}
        showChart={showChart}
        privacyMode={privacyMode}
      />

      {/* Bottom fade for smooth transition */}
      <div className="from-theme-bg pointer-events-none absolute right-0 bottom-0 left-0 z-30 h-16 bg-gradient-to-t to-transparent sm:h-28 md:h-32 lg:h-40" />

      {/* Chart Modal */}
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        getModalChartData={getModalChartData}
        isPositive={isPositive}
        privacyMode={privacyMode}
      />
    </section>
  );
}
