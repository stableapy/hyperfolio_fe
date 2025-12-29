'use client';

import { useState, useEffect, useRef } from 'react';
import { AddWalletDialog } from '@/components/wallet';
import { WelcomeModal } from '@/components/welcome-modal';
import { ApiBanner } from '@/components/api-banner';
import { PortfolioHero } from '@/components/portfolio-hero';
import { SwapWidgetModal } from '@/components/swap-widget';
import { SeoFooter } from '@/components/seo-footer';
import { useWalletStore } from '@/lib/store/wallet-store';
import { calculateStreamingTotalValue } from '@/components/portfolio-hero/utils';

// Home page components
import {
  FloatingSwapButton,
  EmptyState,
  StickyNavHeader,
  SectionContent,
  DefiStreamProvider,
} from '@/components/home';
import { WalletDataStreamProvider } from '@/components/home/wallet-data-stream-provider';

export default function Home() {
  const {
    wallets,
    isLoading,
    loading,
    aggregateData,
    error,
    addWallet,
    triggerSync,
    selectedWalletId,
    selectWallet,
    removeWallet,
  } = useWalletStore();

  // Track if data section is visible for animation
  const dataSectionRef = useRef<HTMLDivElement>(null);
  const [isDataVisible, setIsDataVisible] = useState(false);

  // Handle scroll to content section
  const handleScrollToContent = () => {
    dataSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Track if we're past the hero section (for floating swap button)
  const [isInContentSection, setIsInContentSection] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('tokens');
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  // Intersection observer for reveal animation and swap button visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDataVisible(true);
        }
        // Show swap button when content section is visible
        setIsInContentSection(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (dataSectionRef.current) {
      observer.observe(dataSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Note: Wallet data and DeFi positions are now loaded via streaming providers
  // DefiStreamProvider and WalletDataStreamProvider handle fetching data progressively

  const handleAddWallet = (wallet: {
    name: string;
    address: string;
    color: string;
  }) => {
    addWallet(wallet);
  };

  const handleRefresh = () => {
    // Use triggerSync to clear streamed data and restart stream with fresh data
    triggerSync(true);
  };

  // Calculate aggregate values from data
  const totalValue = aggregateData?.total_value || 0;
  const { streaming } = useWalletStore();

  // Calculate 24h change on client side to include streaming DeFi positions
  // The server-side calculation in getMultiWalletData() doesn't have access to streamed DeFi data
  const streamingDeFiValue = calculateStreamingTotalValue(
    streaming.streamedProtocols
  );
  const currentValueWithDeFi = totalValue + streamingDeFiValue;

  const history = aggregateData?.history || [];
  const yesterdayValue =
    history.length >= 2
      ? history[history.length - 2]?.value
      : history[history.length - 1]?.value;

  const pastValue = yesterdayValue || currentValueWithDeFi;
  const totalChange24h =
    pastValue > 0 &&
    !Number.isNaN(currentValueWithDeFi) &&
    !Number.isNaN(pastValue)
      ? ((currentValueWithDeFi - pastValue) / pastValue) * 100
      : 0;

  return (
    <main className="bg-theme-bg min-h-screen">
      {/* API Promotion Banner - Top of page */}
      <ApiBanner />

      {/* Welcome Modal - Shows on first visit */}
      <WelcomeModal />

      {/* DeFi Streaming Provider - Initiates position streaming at page level */}
      {wallets.length > 0 && <DefiStreamProvider />}

      {/* Wallet Data Streaming Provider - Initiates wallet data streaming at page level */}
      {wallets.length > 0 && <WalletDataStreamProvider />}

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
        change24h={totalChange24h}
        onRefresh={handleRefresh}
        onAddWallet={() => setIsAddWalletOpen(true)}
        onScrollToContent={handleScrollToContent}
      />

      {/* Error display */}
      {error && (
        <div className="container mx-auto px-6">
          <div className="rounded-lg border border-red-500 bg-red-500/20 p-3">
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
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0'
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
              isWalletDataLoading={loading.isWalletDataLoading}
              isPositionsLoading={loading.isPositionsLoading}
            />
          </div>
        )}
      </div>

      {/* SEO-optimized footer with social links and content */}
      <SeoFooter />
    </main>
  );
}
