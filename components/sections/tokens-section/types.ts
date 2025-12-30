// Types for Tokens Section components

export interface Token {
  id: string;
  address: string; // Token contract address
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  logo: string;
  walletAddress?: string;
  walletName?: string;
  walletColor?: string;
}

export interface SwapToken {
  address: string;
  symbol: string;
  chainId: number;
}

export interface TokensSectionProps {
  isLoading?: boolean;
}

export interface TokenImageProps {
  src?: string;
  symbol: string;
  className?: string;
}

export interface TokenRowProps {
  token: Token;
  selectedWalletId: string | null;
  isGrouped: boolean;
  privacyMode: boolean;
  totalValue: number;
  onSwapClick: (token: Token, e: React.MouseEvent) => void;
}

export interface TokenRowMobileProps {
  token: Token;
  selectedWalletId: string | null;
  isGrouped: boolean;
  privacyMode: boolean;
  totalValue: number;
}

export interface TokenSummaryCardsProps {
  totalValue: number;
  tokenCount: number;
  isLoading: boolean;
  privacyMode?: boolean;
}

export interface TokenSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isGrouped: boolean;
  onGroupedChange: (grouped: boolean) => void;
  showGroupToggle: boolean;
}

export interface TokenListSkeletonProps {
  count?: number;
}

export type SortField = 'symbol' | 'balance' | 'value' | 'change24h';
export type SortOrder = 'asc' | 'desc';
