"use client"

import { useQuery } from "@tanstack/react-query"

// Token structure matching the HyperSwap token list format
export interface HyperEvmToken {
  name: string
  symbol: string
  address: string
  decimals: number
  chainId: number
  logoURI: string
  tags?: string[]
}

interface HyperSwapTokenList {
  name: string
  logoURI: string
  tokens: HyperEvmToken[]
  timestamp: string
  version: {
    major: number
    minor: number
    patch: number
  }
}

// HyperSwap Labs token list URL
const HYPERSWAP_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/HyperSwap-Labs/hyperswap-token-list/main/tokens.json"

// Cache duration: 2 hours (in milliseconds)
const CACHE_DURATION = 2 * 60 * 60 * 1000

// Fallback logo for tokens without a valid logoURI
const FALLBACK_TOKEN_LOGO = "/unknown.png"

/**
 * Fetches the HyperEVM token list from HyperSwap Labs GitHub repository
 */
async function fetchHyperEvmTokenList(): Promise<HyperEvmToken[]> {
  const response = await fetch(HYPERSWAP_TOKEN_LIST_URL, {
    next: { revalidate: 7200 }, // Next.js cache for 2 hours
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch token list: ${response.status}`)
  }

  const data: HyperSwapTokenList = await response.json()

  // Filter only HyperEVM tokens (chainId 999)
  return data.tokens.filter((token) => token.chainId === 999)
}

/**
 * Hook to get the HyperEVM token list with caching
 * Uses TanStack Query for efficient caching and background refetching
 *
 * @returns Token list data, loading state, and error state
 */
export function useHyperEvmTokens() {
  return useQuery({
    queryKey: ["hyperevm-tokens"],
    queryFn: fetchHyperEvmTokenList,
    // Cache for 2 hours
    staleTime: CACHE_DURATION,
    // Keep data in cache for 4 hours even if unused
    gcTime: CACHE_DURATION * 2,
    // Don't refetch on window focus (data doesn't change often)
    refetchOnWindowFocus: false,
    // Retry 2 times on failure
    retry: 2,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  })
}

/**
 * Validate if a logoURI is valid (not empty or whitespace)
 */
function isValidLogoURI(logoURI: string | undefined | null): boolean {
  return Boolean(logoURI && logoURI.trim().length > 0)
}

/**
 * Format tokens for KyberSwap widget compatibility
 * KyberSwap expects a specific token format
 * Uses fallback logo for tokens with invalid logoURI to prevent browser errors
 */
export function formatTokensForKyberSwap(tokens: HyperEvmToken[]) {
  return tokens.map((token) => ({
    name: token.name,
    address: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId: token.chainId,
    logoURI: isValidLogoURI(token.logoURI) ? token.logoURI : FALLBACK_TOKEN_LOGO,
  }))
}

/**
 * Hook that returns tokens formatted for KyberSwap widget
 */
export function useKyberSwapTokenList() {
  const { data: tokens, isLoading, error } = useHyperEvmTokens()

  return {
    tokenList: tokens ? formatTokensForKyberSwap(tokens) : [],
    isLoading,
    error,
  }
}

