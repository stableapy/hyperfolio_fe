'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Lock, Vault } from 'lucide-react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { useWalletStore } from '@/lib/store/wallet-store';
import { useHypercoreData } from './hooks';
import { SummaryCards } from './summary-cards';
import { TabNavigation } from './tab-navigation';
import { ContentSkeleton } from './content-skeleton';
import { SpotTab } from './spot-tab';
import { PerpTab } from './perp-tab';
import { StakingTab } from './staking-tab';
import { VaultsTab } from './vaults-tab';
import type { HypercoreSectionProps, TabId, TabConfig } from './types';

// Tab configuration with terminal-style colors
// Note: spot uses CSS variable to respect light/dark theme accent
const TABS: TabConfig[] = [
  { id: 'spot', label: 'Spot', icon: DollarSign, color: 'var(--theme-accent)' },
  { id: 'perp', label: 'Perp', icon: TrendingUp, color: 'var(--theme-cyan)' },
  {
    id: 'staking',
    label: 'Staking',
    icon: Lock,
    color: 'var(--theme-magenta)',
  },
  { id: 'vaults', label: 'Vaults', icon: Vault, color: 'var(--theme-orange)' },
];

/**
 * Terminal-style empty state component
 */
function EmptyState() {
  return (
    <div className="py-8 text-center sm:py-12">
      <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
        NO HYPERCORE DATA
      </div>
      <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
        <span className="text-theme-accent">&gt;</span> Add a wallet to view
        Hypercore data
      </div>
    </div>
  );
}

/**
 * Get terminal command based on active tab
 */
function getTerminalCommand(activeTab: TabId): string {
  const commands: Record<TabId, string> = {
    spot: 'hypercore --spot',
    perp: 'hypercore --perp',
    staking: 'hypercore --staking',
    vaults: 'hypercore --vaults',
  };
  return commands[activeTab];
}

/**
 * Hypercore section component displaying spot, perp, staking, and vault data
 * Uses terminal-style layout matching tokens-section and defi-section
 */
export function HypercoreSection({ isLoading = false }: HypercoreSectionProps) {
  const { hypercoreData } = useHypercoreData();
  const privacyMode = useWalletStore((state) => state.privacyMode);
  const [activeTab, setActiveTab] = useState<TabId>('spot');

  // Determine display states
  const showSkeleton = isLoading && !hypercoreData;
  const hasData = !!hypercoreData;

  // Show empty state when not loading and no data
  if (!hasData && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Summary Cards - Terminal style badges */}
      <SummaryCards
        data={hypercoreData}
        showSkeleton={showSkeleton}
        privacyMode={privacyMode}
      />

      {/* Tab Navigation - Terminal style */}
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content - Terminal Card */}
      <TerminalCard showHeader title={getTerminalCommand(activeTab)}>
        <div className="divide-theme-border/30 divide-y">
          {/* Loading skeleton */}
          {showSkeleton && <ContentSkeleton />}

          {/* Spot Tab */}
          {activeTab === 'spot' && hasData && (
            <SpotTab
              balances={hypercoreData.spotBalances}
              privacyMode={privacyMode}
            />
          )}

          {/* Perp Tab */}
          {activeTab === 'perp' && hasData && (
            <PerpTab
              positions={hypercoreData.perpPositions?.positions || []}
              marginBalance={
                hypercoreData.perpPositions?.margin?.usdcBalance || '0'
              }
              privacyMode={privacyMode}
            />
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && hasData && (
            <StakingTab
              stakingInfo={hypercoreData.stakingInfo}
              privacyMode={privacyMode}
            />
          )}

          {/* Vaults Tab */}
          {activeTab === 'vaults' && hasData && (
            <VaultsTab
              vaults={hypercoreData.vaultInfo?.vaults || []}
              privacyMode={privacyMode}
            />
          )}
        </div>
      </TerminalCard>
    </div>
  );
}
