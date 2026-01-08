// API Response Types for Hyperfolio API

export interface Token {
  address: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: string;
  usdPrice: string;
  usdValue: string;
  image_url: string | null;
  type: string;
}

export interface WalletCompositionResponse {
  data: {
    tokens: Token[];
    totalWalletValue: string;
    hypePrice: string;
  };
  cache: {
    lastUpdate: string;
    cacheAge: string;
    cacheAgeSeconds: number;
    source: string;
    isStale: boolean;
  };
}

export interface WalletComposition {
  spot: number;
  perp: number;
  staking: number;
  vaults: number;
  total_value: number;
}

// Token information in decoded transaction
export interface DecodedToken {
  address: string;
  amountRaw: string;
  priceUSD: number;
  symbol: string;
  decimals: number;
  valueUSD: number;
  amount: string;
}

// Protocol information in decoded transaction
export interface DecodedProtocol {
  id: string;
  name: string;
  logo: string;
}

// Decoded transaction details
export interface DecodedTransaction {
  method: string;
  action: string;
  direction: 'in' | 'out' | 'neutral';
  confidence?: 'high' | 'medium' | 'low';
  protocol?: DecodedProtocol;
  tokens?: DecodedToken[];
  amounts?: {
    amountInRaw?: string;
    amountOutRaw?: string;
  };
  addresses?: {
    from?: string;
    to?: string;
    spender?: string;
  };
  metadata?: {
    referralCode?: string;
    protocolFamily?: string;
    referrerId?: string;
  };
}

export interface Transaction {
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  methodId: string;
  functionName: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  txreceipt_status: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
  type: string;
  decoded?: DecodedTransaction;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  page?: number;
  offset?: number;
  total?: number;
  hasMore?: boolean;
  filters?: Record<string, unknown>;
}

export interface NFT {
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  collection_name: string;
  floor_price?: number;
  last_sale_price?: number;
  usdValue?: number;
  fxValue?: number;
  usdPrice?: number;
  fxPrice?: number;
}

export interface DeFiPosition {
  protocol: string;
  position_type: string;
  asset: string;
  balance: string;
  value_usd: number;
  apy?: number;
  collateral?: number;
  debt?: number;
}

export interface PositionProtocol {
  id: string;
  name: string;
  logo: string;
  url: string;
  totalValueUSD: string;
  positions: any[]; // Detailed position structure
}

export interface PositionsResponse {
  data: {
    protocols: PositionProtocol[];
  };
  cache?: {
    lastUpdate: string;
    cacheAge: string;
    cacheAgeSeconds: number;
    source: string;
    isStale: boolean;
  };
}

export interface PortfolioHistoryPoint {
  timestamp: number;
  value: number;
}

export interface PortfolioSnapshot {
  user_address: string;
  total_value_usd: number;
  total_positions: number;
  active_protocols: number;
  token_value_usd?: number;
  defi_value_usd?: number;
  hypercore_value_usd?: number;
  nft_value_usd?: number;
  lending_value_usd?: number;
  liquidity_value_usd?: number;
  staking_value_usd?: number;
  other_value_usd?: number;
  protocols_breakdown?: Record<string, number>;
  snapshot_date: string;
  snapshot_timestamp: number;
  created_at: string;
}

export interface PortfolioHistorySummary {
  current_value: number;
  change_24h: number;
  change_7d: number;
  change_30d: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
}

export interface PortfolioHistoryResponse {
  snapshots: PortfolioSnapshot[];
  summary: PortfolioHistorySummary;
}

export interface SpotPosition {
  token: string;
  balance: string;
  value_usd: number;
  price: number;
  change_24h?: number;
}

export interface PerpPosition {
  symbol: string;
  side: string;
  size: string;
  entry_price: number;
  mark_price: number;
  pnl: number;
  pnl_percent: number;
  margin: number;
}

export interface StakingPosition {
  token: string;
  amount: string;
  apy: number;
  rewards: string;
  unlock_date?: number;
}

export interface VaultPosition {
  vault_name: string;
  balance: string;
  apy: number;
  value_usd: number;
  shares: string;
}

export interface UserData {
  spot: SpotPosition[];
  perp: PerpPosition[];
  staking: StakingPosition[];
  vaults: VaultPosition[];
}

export interface PointsData {
  protocolName: string;
  points: number;
  rank?: number;
  multiplier?: number;
}

export interface PointsProtocolData {
  protocolName: string;
  points: number;
}

export interface PointsResponse {
  data: PointsProtocolData[];
  cache: {
    lastUpdate: string;
    cacheAge: string;
    cacheAgeSeconds: number;
    source: string;
    isStale: boolean;
  };
}

export interface SwapStats {
  total_swaps: number;
  total_volume: number;
  avg_gas_cost: number;
  most_swapped_pair: string;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  color: string;
  composition?: WalletComposition;
  lastUpdated?: number;
}

export interface AggregateData {
  total_value: number;
  total_change_24h: number;
  total_spot: number;
  total_perp: number;
  total_staking: number;
  total_vaults: number;
  total_hypercore: number;
  tokens: SpotPosition[];
  nfts: NFT[];
  points?: PointsData[];
  // Note: DeFi positions are now loaded via SSE streaming for progressive loading
  // See: hooks/use-positions-stream.ts
  // Note: Transactions are loaded independently via /api/wallet/transactions endpoint
  // See: components/sections/transactions-section/hooks/use-transactions.ts
  history: PortfolioHistoryPoint[];
}

// Stream events for individual wallet API responses (fine-grained progressive loading)
// Note: 'transactions' removed - loaded independently via /api/wallet/transactions
export type WalletDataType =
  | 'composition'
  | 'nfts'
  | 'hypercore'
  | 'history'
  | 'points';

export interface WalletDataStreamMessage {
  type: WalletDataType | 'complete' | 'error';
  address?: string;
  endpoint?: string; // For error messages
  data?: unknown; // Varies by type
  aggregate?: AggregateData; // Only for 'complete' type
  error?: string; // Only for 'error' type
}

// Partial wallet data (each wallet gets filled in incrementally as data arrives)
export interface PartialWalletData {
  composition?: WalletCompositionResponse;
  compositionRaw?: WalletCompositionResponse;
  // Note: transactions removed - loaded independently via /api/wallet/transactions
  nfts?: { data: { nfts: NFT[]; totalNftValue: number }; cache: unknown };
  hypercore?: UserData;
  history?: PortfolioHistoryPoint[];
  points?: PointsData[];
}

/**
 * Token details for pool tokens (AMM pairs, underlying assets, collateral)
 */
export interface PoolTokenDetails {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Pool information for yield opportunities
 * Token fields vary by position type:
 * - AMM: token0 + token1 (LP pairs)
 * - Lending/Staking/Yield: underlyingToken (single asset)
 * - Derivatives: underlyingToken + collateralToken
 */
export interface YieldPoolInfo {
  address?: string;
  name?: string;
  symbol?: string;
  tvlUsd?: number;
  liquidityUsd?: number;
  /** First token in AMM pair (only for category: 'amm') */
  token0?: PoolTokenDetails;
  /** Second token in AMM pair (only for category: 'amm') */
  token1?: PoolTokenDetails;
  /** Primary asset for single-asset positions (lending, staking, yield, derivatives) */
  underlyingToken?: PoolTokenDetails;
  /** Settlement/collateral token (derivatives only) */
  collateralToken?: PoolTokenDetails;
}

export interface YieldOpportunity {
  id: string;
  protocol: {
    id: string;
    name: string;
    category: string;
    website: string;
    chainId: number;
  };
  category: 'lending' | 'amm' | 'yield' | 'staking' | 'derivatives';
  type: 'supply' | 'borrow' | 'lp' | 'stake' | 'pt' | 'yt' | 'vault';
  pool: YieldPoolInfo;
  apy: {
    baseApy?: number;
    totalApy?: number;
    rewardApy?: number;
  };
  risk: {
    riskLevel: 'low' | 'medium' | 'high';
    liquidationRisk?: boolean;
    impermanentLossRisk?: boolean;
  };
  metadata: {
    underlyingToken?: string;
    underlyingSymbol?: string;
    protocolSpecific?: Record<string, unknown>;
  };
  lastUpdated: string;
  dataSource: 'on-chain' | 'api';
}

export interface YieldResponse {
  opportunities: YieldOpportunity[];
  byCategory: {
    lending: YieldOpportunity[];
    amm: YieldOpportunity[];
    yield: YieldOpportunity[];
    staking: YieldOpportunity[];
  };
  byProtocol: Record<string, YieldOpportunity[]>;
  lastUpdated: string;
  totalCount: number;
}
