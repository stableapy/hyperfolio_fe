// Types for DeFi Section components

interface PositionTokenDetails {
  image_url?: string;
  symbol: string;
  formattedBalance: string;
}

interface UncollectedFeesDetails {
  token0?: string;
  token1?: string;
  token0UsdValue?: string | number;
  token1UsdValue?: string | number;
  usdValue?: string | number;
}

interface PositionDetails {
  token?: PositionTokenDetails;
  token0?: PositionTokenDetails;
  token1?: PositionTokenDetails;
  pair?: string;
  uncollectedFees?: UncollectedFeesDetails;
}

export interface DeFiPositionDisplay {
  id: string;
  protocol: string;
  type: 'lending' | 'liquidity' | 'staking' | 'farming';
  positionSubType: 'supplied' | 'borrowed' | null;
  assets: string[];
  deposited: number;
  current: number;
  apy: number;
  rewards: number;
  logo: string;
  positionDetails?: PositionDetails;
  protocolUrl?: string;
  estimatedYield?: { daily: string; weekly: string; monthly: string };
  walletAddress?: string;
  walletName?: string;
  walletColor?: string;
}

export interface DefiSectionProps {
  isLoading?: boolean;
}

export interface DefiStatsGridProps {
  isLoading: boolean;
  hasData: boolean;
  totalDeposited: number;
  totalRewards: number;
  weightedApy: number;
  portfolioYield: PortfolioYield;
  positionsWithApy: number;
  totalPositions: number;
  privacyMode?: boolean;
}

export interface PortfolioYield {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface ProtocolGroup {
  id: string;
  name: string;
  logo: string | null;
  url: string;
  totalValue: number;
  positions: DeFiPositionDisplay[];
  stats?: {
    weightedApyPercent?: number | null;
    healthRatio?: number | null;
    estimatedYield?: {
      daily: string;
      weekly: string;
      monthly: string;
    };
  };
}

export interface ProtocolCardProps {
  protocol: ProtocolGroup;
  isExpanded: boolean;
  onToggle: () => void;
  selectedWalletId: string | null;
  privacyMode: boolean;
  totalPortfolioUSD: number;
}

export interface PositionItemProps {
  position: DeFiPositionDisplay;
  showWalletIndicator: boolean;
  privacyMode: boolean;
  totalPortfolioUSD: number;
}
