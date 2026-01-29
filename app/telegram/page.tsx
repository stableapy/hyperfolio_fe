'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';

import { AddWalletDialog } from '@/components/wallet';
import { EmptyState, DefiStreamProvider } from '@/components/home';
import { WalletDataStreamProvider } from '@/components/home/wallet-data-stream-provider';
import { SectionContent } from '@/components/home/section-content';
import { SectionNav, SECTION_NAV_ITEMS } from '@/components/section-nav';
import { WalletSelector } from '@/components/portfolio-hero/wallet-selector';
import { isValidWalletInput } from '@/components/wallet/utils';
import { useWalletStore } from '@/lib/store/wallet-store';

const TELEGRAM_SECTIONS = SECTION_NAV_ITEMS.filter((section) =>
  ['tokens', 'defi', 'hypercore', 'nfts'].includes(section.id)
);

function extractWalletCandidate(input: string | null): string | null {
  if (!input) return null;
  const decoded = decodeURIComponent(input).trim();
  if (!decoded) return null;
  if (decoded.includes('wallet=')) {
    const params = new URLSearchParams(decoded);
    return params.get('wallet');
  }
  return decoded;
}

function readTelegramStartParam(): string | null {
  if (typeof window === 'undefined') return null;
  const tg = (window as Window & { Telegram?: { WebApp?: any } }).Telegram;
  const startParam = tg?.WebApp?.initDataUnsafe?.start_param;
  if (!startParam) return null;
  return extractWalletCandidate(startParam);
}

export default function TelegramApp() {
  const {
    wallets,
    loading,
    isLoading,
    addWallet,
    selectedWalletId,
    selectWallet,
    removeWallet,
  } = useWalletStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlProcessedRef = useRef(false);

  const [activeSection, setActiveSection] = useState('tokens');
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [quickWallet, setQuickWallet] = useState('');
  const [quickError, setQuickError] = useState('');
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const interstitialTriggeredRef = useRef(false);

  const walletParam = useMemo(() => {
    const wallet = searchParams.get('wallet') || searchParams.get('address');
    const startapp = searchParams.get('startapp');
    return extractWalletCandidate(wallet || startapp);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlProcessedRef.current) return;
      urlProcessedRef.current = true;

      const candidate = walletParam || readTelegramStartParam();
      if (!candidate) return;

      if (!isValidWalletInput(candidate)) {
        const url = new URL(window.location.href);
        url.searchParams.delete('wallet');
        url.searchParams.delete('address');
        url.searchParams.delete('startapp');
        router.replace(url.pathname + url.search);
        return;
      }

      const walletExists = wallets.some(
        (w) => w.address.toLowerCase() === candidate.toLowerCase()
      );

      if (!walletExists) {
        addWallet({
          name: candidate,
          address: candidate,
          color: '#6366f1',
        });
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('wallet');
      url.searchParams.delete('address');
      url.searchParams.delete('startapp');
      router.replace(url.pathname + url.search);
    }, 100);

    return () => clearTimeout(timer);
  }, [walletParam, wallets, addWallet, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as Window & { Telegram?: { WebApp?: any } }).Telegram;
    if (!tg?.WebApp) return;
    tg.WebApp.ready();
    tg.WebApp.expand();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFirstTap = () => {
      if (interstitialTriggeredRef.current) return;
      interstitialTriggeredRef.current = true;

      const controller = (window as Window & { TelegramAdsController?: any })
        .TelegramAdsController;
      if (!controller?.triggerInterstitialBanner) return;
      controller.triggerInterstitialBanner().catch(() => {});
    };

    document.addEventListener('pointerdown', handleFirstTap, { once: true });
    return () => {
      document.removeEventListener('pointerdown', handleFirstTap);
    };
  }, []);

  const handleQuickSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = quickWallet.trim();
    if (!value || !isValidWalletInput(value)) {
      setQuickError('Enter a valid 0x address or .hl/.hype domain.');
      return;
    }

    const walletExists = wallets.some(
      (w) => w.address.toLowerCase() === value.toLowerCase()
    );

    if (!walletExists) {
      addWallet({
        name: value,
        address: value,
        color: '#6366f1',
      });
    }

    setQuickWallet('');
    setQuickError('');
  };

  return (
    <main className="min-h-screen bg-theme-bg pb-24">
      <Script
        src="https://telegram.org/js/telegram-web-app.js?56"
        strategy="beforeInteractive"
      />
      <Script
        src="https://richinfo.co/richpartners/telegram/js/tg-ob.js"
        strategy="afterInteractive"
      />
      <Script id="richads-init" strategy="afterInteractive">
        {`window.TelegramAdsController = new TelegramAdsController();
window.TelegramAdsController.initialize({ pubId: "1000656", appId: "5934" });`}
      </Script>

      {wallets.length > 0 && <DefiStreamProvider />}
      {wallets.length > 0 && <WalletDataStreamProvider />}

      <div className="sticky top-0 z-40 w-full border-b border-theme-border/70 bg-theme-bg/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-theme-text-muted">
                hyperfolio_telegram
              </p>
              <h1 className="font-mono text-lg text-theme-text-primary">
                Hyperfolio TG
              </h1>
            </div>
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              isOpen={isWalletSelectorOpen}
              onToggle={() => setIsWalletSelectorOpen(!isWalletSelectorOpen)}
              onClose={() => setIsWalletSelectorOpen(false)}
              onSelectWallet={selectWallet}
              onRemoveWallet={removeWallet}
              onAddWallet={() => setIsAddWalletOpen(true)}
            />
          </div>

          <form
            onSubmit={handleQuickSubmit}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="text"
              value={quickWallet}
              onChange={(event) => {
                setQuickWallet(event.target.value);
                if (quickError) setQuickError('');
              }}
              placeholder="Paste wallet or .hl/.hype"
              className="w-full flex-1 rounded-sm border border-theme-border/70 bg-theme-card-bg px-3 py-2 font-mono text-xs text-theme-text-primary placeholder:text-theme-text-muted/60 focus:border-theme-accent/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-sm border border-theme-accent/50 bg-theme-accent/10 px-3 py-2 font-mono text-xs text-theme-accent hover:bg-theme-accent/20"
              >
                --add
              </button>
              <button
                type="button"
                onClick={() => setIsAddWalletOpen(true)}
                className="flex-1 rounded-sm border border-theme-border/70 bg-theme-card-bg px-3 py-2 font-mono text-xs text-theme-text-muted hover:text-theme-text-primary"
              >
                --more
              </button>
            </div>
          </form>
          {quickError && (
            <p className="font-mono text-[10px] text-[#ff4444]">
              {quickError}
            </p>
          )}

          <div className="overflow-x-auto">
            <SectionNav
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              sections={TELEGRAM_SECTIONS}
            />
          </div>
        </div>
      </div>

      <AddWalletDialog
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAdd={(wallet) => addWallet(wallet)}
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {wallets.length === 0 ? (
          <EmptyState onAddWallet={() => setIsAddWalletOpen(true)} />
        ) : (
          <SectionContent
            activeSection={activeSection}
            isLoading={isLoading}
            isDataVisible={true}
            isWalletDataLoading={loading.isWalletDataLoading}
            isPositionsLoading={loading.isPositionsLoading}
          />
        )}
      </div>

      <div
        id="tg-ads-banner"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-theme-border/70 bg-theme-bg/95 backdrop-blur-md"
      >
        <div className="mx-auto flex min-h-[60px] w-full max-w-5xl items-center justify-center px-4 py-2 font-mono text-[10px] text-theme-text-muted">
          ads_loading...
        </div>
      </div>
    </main>
  );
}
