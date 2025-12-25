/**
 * API timeout configuration
 * All values in milliseconds
 */

// Per-request timeouts (individual fetch calls)
export const REQUEST_TIMEOUTS = {
  /** Default timeout for most API requests */
  DEFAULT: Number(process.env.SSE_REQUEST_TIMEOUT_MS) || 10000, // 10s

  /** Timeout for wallet composition (token data) */
  WALLET_COMPOSITION: Number(process.env.SSE_COMPOSITION_TIMEOUT_MS) || 10000, // 10s

  /** Timeout for NFT data */
  WALLET_NFTS: Number(process.env.SSE_NFT_TIMEOUT_MS) || 10000, // 10s

  /** Timeout for Hypercore user data */
  HYPERCORE_USER_DATA: Number(process.env.SSE_HYPERCORE_TIMEOUT_MS) || 10000, // 10s

  /** Timeout for portfolio history */
  PORTFOLIO_HISTORY: Number(process.env.SSE_HISTORY_TIMEOUT_MS) || 10000, // 10s

  /** Timeout for DeFi positions streaming */
  POSITIONS_STREAM: Number(process.env.SSE_POSITIONS_TIMEOUT_MS) || 10000, // 10s
} as const

// Overall stream timeouts (entire SSE session)
export const STREAM_TIMEOUTS = {
  /** Maximum time for wallet aggregate stream to complete */
  WALLET_AGGREGATE: Number(process.env.SSE_STREAM_TIMEOUT_MS) || 20000, // 20s

  /** Maximum time for positions stream to complete */
  POSITIONS_STREAM: Number(process.env.SSE_POSITIONS_STREAM_TIMEOUT_MS) || 20000, // 20s
} as const

// Timeout for initial SSE connection establishment
export const CONNECTION_TIMEOUT = Number(process.env.SSE_CONNECTION_TIMEOUT_MS) || 5000 // 5s
