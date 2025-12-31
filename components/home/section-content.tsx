'use client';

import { TokensSection } from '@/components/sections/tokens-section';
import { NFTsSection } from '@/components/sections/nfts-section';
import { DeFiSection } from '@/components/sections/defi-section';
import { HypercoreSection } from '@/components/sections/hypercore-section';
import { TransactionsSection } from '@/components/sections/transactions-section';
import { PointsSection } from '@/components/sections/points-section';
import type { SectionContentProps } from './types';

// Section configuration with SEO-friendly headings
const SECTION_CONFIG = {
  tokens: {
    id: 'tokens-panel',
    heading: 'Token Holdings',
    description:
      'View your HyperEVM token balances with real-time USD valuations',
  },
  nfts: {
    id: 'nfts-panel',
    heading: 'NFT Collections',
    description: 'Browse and manage your NFT collections on HyperEVM',
  },
  defi: {
    id: 'defi-panel',
    heading: 'DeFi Positions',
    description:
      'Track lending, staking and liquidity positions across Hyperliquid protocols',
  },
  hypercore: {
    id: 'hypercore-panel',
    heading: 'Hypercore Assets',
    description:
      'Monitor your Hypercore ecosystem assets and staking positions',
  },
  transactions: {
    id: 'transactions-panel',
    heading: 'Transaction History',
    description: 'View complete transaction records on the HyperEVM blockchain',
  },
  points: {
    id: 'points-panel',
    heading: 'Protocol Points',
    description:
      'View and track your protocol points across different DeFi platforms',
  },
} as const;

/**
 * Section content component that renders the appropriate section
 * based on the active section selection
 * Includes proper H2 headings for SEO
 *
 * Each section uses granular loading states:
 * - Tokens, NFTs, Hypercore, Transactions: use isWalletDataLoading
 * - DeFi: uses isPositionsLoading (positions stream independently)
 */
export function SectionContent({
  activeSection,
  isLoading, // Legacy - kept for backwards compatibility
  isDataVisible,
  isWalletDataLoading = isLoading,
  isPositionsLoading = false,
}: SectionContentProps) {
  const config = SECTION_CONFIG[activeSection as keyof typeof SECTION_CONFIG];

  // Determine which loading state to use based on active section
  const sectionIsLoading =
    activeSection === 'defi'
      ? isPositionsLoading // DeFi uses positions loading state
      : isWalletDataLoading; // All other sections use wallet data loading state

  return (
    <section
      id={config?.id}
      role="tabpanel"
      aria-labelledby={`${activeSection}-tab`}
      className={`transition-all delay-200 duration-500 ${
        isDataVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {/* SEO-friendly section heading - visually hidden but accessible */}
      <h2 className="sr-only">{config?.heading}</h2>
      <p className="sr-only">{config?.description}</p>

      {activeSection === 'tokens' && (
        <TokensSection isLoading={sectionIsLoading} />
      )}
      {activeSection === 'nfts' && <NFTsSection isLoading={sectionIsLoading} />}
      {activeSection === 'defi' && <DeFiSection isLoading={sectionIsLoading} />}
      {activeSection === 'hypercore' && (
        <HypercoreSection isLoading={sectionIsLoading} />
      )}
      {activeSection === 'transactions' && (
        <TransactionsSection isLoading={sectionIsLoading} />
      )}
      {activeSection === 'points' && (
        <PointsSection isLoading={sectionIsLoading} />
      )}
    </section>
  );
}
