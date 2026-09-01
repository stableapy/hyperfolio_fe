// Types for Hypercore Section components

export interface SpotBalance {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
  usdPrice: string;
  usdValue: string;
  image_url: string | null;
  symbol: string;
  name: string;
  decimals: string;
  hip?: 1 | 4;
  assetKind?: 'spot' | 'outcome';
  tokenId?: string | null;
  szDecimals?: number | null;
  weiDecimals?: number | null;
  isCanonical?: boolean | null;
  evmContract?: { address: string; evm_extra_wei_decimals?: number } | null;
  fullName?: string | null;
  deployerTradingFeeShare?: string | null;
  tokenDetails?: {
    seededUsdc: string;
    deployer: string | null;
    deployTime: string | null;
    maxSupply: string | null;
    totalSupply: string | null;
    circulatingSupply: string | null;
  } | null;
  spotPair?: {
    name: string;
    index: number;
    assetId: number;
    quoteToken: string | null;
    isCanonical: boolean | null;
  } | null;
  outcome?: {
    encoding: number;
    outcomeId: number;
    side: number;
    sideName: string;
    marketName: string;
    outcomeName: string;
    description: string;
    templateId: string | null;
    category: string | null;
    expiry: string | null;
    rawOutcomeName: string | null;
    rawDescription: string | null;
    quoteToken: string;
    venue: string | null;
    questionId: number | null;
    questionRole: 'named' | 'fallback' | null;
    namedOutcomes: number[];
    settledNamedOutcomes: number[];
    isSettled: boolean | null;
    feeScale: string | null;
    deployerFeeScale: string | null;
    venueDeployer: {
      address: string;
      venue: string;
      subDeployers: Array<[string, string[]]>;
    } | null;
  } | null;
}

export interface PerpPositionDetail {
  type: string;
  position: {
    coin: string;
    szi: string;
    leverage: {
      type: string;
      value: number;
    };
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string;
    marginUsed: string;
    maxLeverage: number;
    cumFunding: {
      allTime: string;
      sinceOpen: string;
      sinceChange: string;
    };
    image_url: string | null;
    symbol: string;
    name: string;
    decimals: string;
    isHip3?: boolean;
    dexName?: string;
    collateralToken?: string;
  };
}

export interface DexBalance {
  dex: string;
  dexName: string;
  collateralToken: number;
  collateralSymbol: string;
  accountValue: string;
  accountValueUsd: string;
  withdrawable: string;
}

export interface PerpPosition {
  positions: PerpPositionDetail[];
  margin: {
    accountMode: string;
    usdcBalance: string;
    accountValueUsd: string;
    dexBalances: DexBalance[];
    lastUpdate: number;
  };
}

export interface DelegatorSummary {
  delegated: string;
  undelegated: string;
  totalPendingWithdrawal: string;
  nPendingWithdrawals: number;
  totalStakedUsd: string;
}

export interface Delegation {
  address?: string;
  amount?: string;
}

export interface StakingInfo {
  totalHype: string;
  stakedHype: string;
  availableHype: string;
  delegations: Delegation[];
  delegatorSummary: DelegatorSummary;
  usdPrice: string;
  image_url: string;
  lastUpdate: number;
}

export interface VaultDetail {
  vaultAddress: string;
  equity: string;
  lockedUntilTimestamp: number;
  name: string;
  description: string;
  leader: string;
  apr: number;
  maxDistributable: string;
  maxWithdrawable: string;
  isClosed: boolean;
  allowDeposits: boolean;
  allTimePnl: string;
  pnl: string;
  lastUpdate: number;
}

export interface VaultInfo {
  vaults: VaultDetail[];
  totalVaultValue: string;
}

export interface PortfolioSummary {
  totalValue: string;
  spotValue: string;
  perpValue: string;
  stakedValue: string;
  vaultValue: string;
  lastUpdate: number;
}

export interface HypercoreData {
  spotBalances: SpotBalance[];
  perpPositions: PerpPosition;
  stakingInfo: StakingInfo;
  vaultInfo: VaultInfo;
  portfolioSummary: PortfolioSummary;
}

export type TabId = 'spot' | 'perp' | 'outcomes' | 'staking' | 'vaults';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
}

export interface HypercoreSectionProps {
  isLoading?: boolean;
}

export interface SummaryCardsProps {
  data: HypercoreData | null;
  showSkeleton: boolean;
  privacyMode?: boolean;
}

export interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export interface SpotTabProps {
  balances: SpotBalance[];
  privacyMode?: boolean;
}

export interface PerpTabProps {
  positions?: PerpPositionDetail[];
  marginBalance?: string;
  accountMode?: string;
  dexBalances?: DexBalance[];
  privacyMode?: boolean;
}

export interface OutcomesTabProps {
  balances: SpotBalance[];
  privacyMode?: boolean;
}

export interface StakingTabProps {
  stakingInfo: StakingInfo;
  privacyMode?: boolean;
}

export interface VaultsTabProps {
  vaults: VaultDetail[];
  privacyMode?: boolean;
}

export interface ContentSkeletonProps {
  count?: number;
}
