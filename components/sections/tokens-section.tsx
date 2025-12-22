"use client"

import { useState, useMemo } from "react"
import { Search, Layers, Grid3x3, ArrowRightLeft } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { SwapWidgetInline } from "../swap-widget-inline"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTokens, groupTokensBySymbol } from "@/lib/utils/data-transformers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Token image component with fallback for broken/missing images
function TokenImage({ src, symbol, className }: { src?: string; symbol: string; className?: string }) {
  const [hasError, setHasError] = useState(false)
  
  if (!src || hasError) {
    return (
      <div className={`bg-[#1a2225] flex items-center justify-center ${className || "w-7 h-7 rounded-full flex-shrink-0"}`}>
        <span className="font-mono text-xs text-[#708090]">{symbol?.charAt(0) || "?"}</span>
      </div>
    )
  }
  
  return (
    <img 
      src={src} 
      alt={symbol} 
      className={className || "w-7 h-7 rounded-full flex-shrink-0"} 
      onError={() => setHasError(true)}
    />
  )
}

interface Token {
  id: string
  address: string // Token contract address
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  logo: string
  walletAddress?: string
  walletName?: string
  walletColor?: string
}

type SortField = "symbol" | "balance" | "value" | "change24h"
type SortOrder = "asc" | "desc"

// Default sort configuration
const DEFAULT_SORT_FIELD: SortField = "value"
const DEFAULT_SORT_ORDER: SortOrder = "desc"

export function TokensSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isGrouped, setIsGrouped] = useState(true) // Group tokens by default in multi-wallet view
  const [selectedSwapToken, setSelectedSwapToken] = useState<{
    address: string
    symbol: string
    chainId: number
  } | undefined>(undefined)

  // Get tokens from selected wallet or all wallets - no mock data, show what we have
  const rawTokens = useMemo(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.composition?.data?.tokens) {
        return transformTokens(
          walletData[wallet.address].composition.data.tokens,
          { address: wallet.address, name: wallet.name, color: wallet.color }
        )
      }
      return [] // No data yet for this wallet
    } else {
      // Aggregate tokens from all wallets with wallet info
      const allTokens: Token[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.composition?.data?.tokens) {
          allTokens.push(...transformTokens(
            walletData[wallet.address].composition.data.tokens,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ))
        }
      })
      return allTokens
    }
  }, [wallets, walletData, selectedWalletId])
  
  // Check if we have any data loaded
  const hasData = rawTokens.length > 0

  // Apply grouping if enabled and in multi-wallet view
  const tokens = useMemo(() => {
    if (!selectedWalletId && isGrouped && rawTokens.length > 0) {
      return groupTokensBySymbol(rawTokens)
    }
    return rawTokens
  }, [rawTokens, isGrouped, selectedWalletId])

  const handleSwapClick = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // KyberSwap uses 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native tokens
    // Convert 0x0000... addresses to the KyberSwap native token format
    const tokenAddress = token.address === '0x0000000000000000000000000000000000000000'
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : token.address
    
    // Set the token to swap from (use the actual token contract address)
    const swapToken = {
      address: tokenAddress,
      symbol: token.symbol,
      chainId: 999, // HyperEVM chain ID
    }
    console.log('Setting swap token:', swapToken)
    setSelectedSwapToken(swapToken)
  }

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  ).sort((a, b) => {
    const multiplier = DEFAULT_SORT_ORDER === "asc" ? 1 : -1
    let diff = 0
    switch (DEFAULT_SORT_FIELD) {
      case "symbol":
        diff = a.symbol.localeCompare(b.symbol)
        break
      case "balance":
        diff = a.balance - b.balance
        break
      case "value":
        diff = a.value - b.value
        break
      case "change24h":
        diff = a.change24h - b.change24h
        break
    }
    return diff * multiplier
  })

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData

  // Calculate totals
  const totals = useMemo(() => {
    const totalValue = filteredTokens.reduce((sum, t) => sum + t.value, 0)
    const tokenCount = filteredTokens.length
    return { totalValue, tokenCount }
  }, [filteredTokens])

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left: Token List */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 pb-20 lg:pb-0">
        
        {/* Summary Card */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <TerminalCard>
            <TerminalContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className="font-mono text-[10px] sm:text-xs text-[#708090]">VALUE</div>
              </div>
              {showSkeleton ? (
                <div className="h-5 sm:h-7 w-20 sm:w-28 bg-[#1a2225] rounded animate-pulse" />
              ) : (
                <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
                  ${totals.totalValue >= 1000 ? `${(totals.totalValue / 1000).toFixed(1)}K` : totals.totalValue.toFixed(2)}
                </div>
              )}
            </TerminalContent>
          </TerminalCard>
          
          <TerminalCard>
            <TerminalContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className="font-mono text-[10px] sm:text-xs text-[#708090]">COUNT</div>
              </div>
              {showSkeleton ? (
                <div className="h-5 sm:h-7 w-10 sm:w-16 bg-[#1a2225] rounded animate-pulse" />
              ) : (
                <div className="font-mono text-base sm:text-xl text-white font-semibold">
                  {totals.tokenCount}
                </div>
              )}
            </TerminalContent>
          </TerminalCard>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
            />
          </div>

          {/* Group/Ungroup Toggle - Only show in multi-wallet view */}
          {!selectedWalletId && wallets.length > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsGrouped(!isGrouped)}
                    className={`px-3 sm:px-4 py-2.5 sm:py-2 bg-[#111618] border rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-2 ${
                      isGrouped 
                        ? "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10" 
                        : "border-[#1a2225] text-[#708090] hover:border-[#708090]"
                    }`}
                  >
                    {isGrouped ? <Layers className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                    <span className="sm:inline">{isGrouped ? "Grouped" : "Ungrouped"}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
                  <div className="font-mono text-xs text-[#708090]">
                    {isGrouped ? "Click to show tokens by wallet" : "Click to group same tokens together"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <TerminalCard>
          <div className="divide-y divide-[#1a2225]">
            {/* Show skeletons when loading and no data */}
            {showSkeleton && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 sm:p-4 animate-pulse">
                    {/* Mobile skeleton */}
                    <div className="flex sm:hidden items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1a2225]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-14 bg-[#1a2225] rounded" />
                          <div className="h-4 w-10 bg-[#1a2225] rounded" />
                        </div>
                        <div className="h-3 w-24 bg-[#1a2225] rounded" />
                        <div className="h-2.5 w-20 bg-[#1a2225] rounded" />
                      </div>
                      <div className="h-5 w-16 bg-[#1a2225] rounded" />
                    </div>
                    {/* Desktop skeleton */}
                    <div className="hidden sm:flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#1a2225]" />
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-14 bg-[#1a2225] rounded" />
                            <div className="h-5 w-16 bg-[#1a2225] rounded" />
                          </div>
                          <div className="h-3 w-24 bg-[#1a2225] rounded" />
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="h-3 w-28 bg-[#1a2225] rounded" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-20 bg-[#1a2225] rounded" />
                        <div className="hidden lg:block h-8 w-20 bg-[#1a2225] rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Show real data */}
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="p-3 sm:p-4 hover:bg-[#111618] transition-colors cursor-pointer group"
              >
                {/* Mobile Layout (< sm) - Compact horizontal with value on right */}
                <div className="flex sm:hidden items-center gap-3">
                  {/* Token Icon */}
                  <div className="relative">
                    <TokenImage src={token.logo} symbol={token.symbol} className="w-10 h-10 rounded-full flex-shrink-0" />
                    {/* Wallet indicator dot */}
                    {!selectedWalletId && !isGrouped && token.walletColor && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0e0f]"
                        style={{ backgroundColor: token.walletColor }}
                      />
                    )}
                  </div>
                  
                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm text-[#00ff41] font-bold truncate">{token.symbol}</span>
                      <span className="font-mono text-[10px] text-[#708090] bg-[#1a2225] px-1.5 py-0.5 rounded">
                        ${token.price < 0.01 ? token.price.toFixed(4) : token.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#708090] truncate">{token.name}</div>
                    <div className="font-mono text-[10px] text-[#556070] mt-0.5">
                      {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.symbol}
                    </div>
                  </div>
                  
                  {/* Value - Right aligned */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm text-[#00ff41] font-bold">
                      ${token.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout (>= sm) - Clean horizontal with badges */}
                <div className="hidden sm:flex items-center justify-between gap-4">
                  {/* Left: Token Info with icon */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <TokenImage src={token.logo} symbol={token.symbol} className="w-10 h-10 rounded-full flex-shrink-0" />
                      {/* Wallet indicator dot */}
                      {!selectedWalletId && !isGrouped && token.walletColor && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0e0f] cursor-help"
                                style={{ backgroundColor: token.walletColor }}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
                              <div className="font-mono text-xs">
                                <span className="text-[#708090]">Wallet: </span>
                                <span style={{ color: token.walletColor }}>{token.walletName}</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#00ff41] font-bold truncate">{token.symbol}</span>
                        <span className="font-mono text-[11px] text-[#708090] bg-[#1a2225] px-2 py-0.5 rounded">
                          ${token.price < 0.01 ? token.price.toFixed(4) : token.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#708090] truncate">{token.name}</div>
                    </div>
                  </div>

                  {/* Center: Balance */}
                  <div className="hidden md:block text-center min-w-[140px]">
                    <div className="font-mono text-xs text-[#556070]">
                      {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[#708090]">{token.symbol}</span>
                    </div>
                  </div>

                  {/* Right: Value + Swap */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right min-w-[100px]">
                      <div className="font-mono text-base text-[#00ff41] font-bold">
                        ${token.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Swap Button - Hidden on tablet, shown on lg+ */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => handleSwapClick(token, e)}
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded-lg hover:bg-[#00ff41]/20 hover:border-[#00ff41]/40 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#00ff41]" />
                            <span className="font-mono text-xs text-[#00ff41]">Swap</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
                          <div className="font-mono text-xs text-[#708090]">
                            Swap {token.symbol}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TerminalCard>

        {filteredTokens.length === 0 && !showSkeleton && (
          <div className="text-center py-8 sm:py-12">
            <div className="font-mono text-sm sm:text-base text-[#708090] mb-2">
              {searchQuery ? "NO TOKENS FOUND" : "NO TOKENS"}
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#708090]">
              {searchQuery ? "Try adjusting your search query" : "Add a wallet to view tokens"}
            </div>
          </div>
        )}
      </div>

      {/* Right: Sticky Swap Widget - Hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block w-[380px] flex-shrink-0">
        <div className="sticky top-20">
          <SwapWidgetInline fromToken={selectedSwapToken} />
        </div>
      </div>
    </div>
  )
}
