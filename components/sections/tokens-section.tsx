"use client"

import { useState, useMemo } from "react"
import { Search, Layers, Grid3x3, ArrowRightLeft } from "lucide-react"
import { TerminalCard } from "../terminal-card"
import { LoadingSpinner } from "../loading-spinner"
import { SwapWidgetInline } from "../swap-widget-inline"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformTokens, groupTokensBySymbol } from "@/lib/utils/data-transformers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const MOCK_TOKENS: Token[] = [
  {
    id: "1",
    address: "0x0000000000000000000000000000000000000000", // Native HYPE token (will be converted to KyberSwap format)
    symbol: "HYPE",
    name: "HyperEVM",
    balance: 1250.5,
    value: 15630.25,
    price: 12.5,
    change24h: 5.2,
    logo: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    address: "0x0000000000000000000000000000000000000001", // Mock ETH address
    symbol: "ETH",
    name: "Ethereum",
    balance: 8.75,
    value: 28350.0,
    price: 3240.0,
    change24h: -2.1,
    logo: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    address: "0x0000000000000000000000000000000000000002", // Mock USDC address
    symbol: "USDC",
    name: "USD Coin",
    balance: 5420.0,
    value: 5420.0,
    price: 1.0,
    change24h: 0.01,
    logo: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    address: "0x0000000000000000000000000000000000000003", // Mock LINK address
    symbol: "LINK",
    name: "Chainlink",
    balance: 450.25,
    value: 6753.75,
    price: 15.0,
    change24h: 8.5,
    logo: "/placeholder.svg?height=32&width=32",
  },
]

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

  // Get tokens from selected wallet or all wallets
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
    
    return MOCK_TOKENS
  }, [wallets, walletData, selectedWalletId])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Left: Token List */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
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
                    className={`px-4 py-2 bg-[#111618] border rounded-lg font-mono text-sm transition-colors flex items-center gap-2 ${
                      isGrouped 
                        ? "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10" 
                        : "border-[#1a2225] text-[#708090] hover:border-[#708090]"
                    }`}
                  >
                    {isGrouped ? <Layers className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                    {isGrouped ? "Grouped" : "Ungrouped"}
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
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="p-4 hover:bg-[#111618] transition-colors cursor-pointer group"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  {/* Left: Token Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Wallet Indicator - Only show in ungrouped multi-wallet view */}
                      {!selectedWalletId && !isGrouped && token.walletColor && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ 
                                  backgroundColor: token.walletColor, 
                                  boxShadow: `0 0 6px ${token.walletColor}` 
                                }}
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
                      <span className="font-mono text-sm text-[#708090]">&gt;</span>
                      <div className="flex flex-col min-w-0">
                        <div className="font-mono text-sm text-[#00ff41] font-semibold truncate">{token.symbol}</div>
                        <div className="font-mono text-xs text-[#708090] truncate">{token.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Balance */}
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#708090]">BALANCE</div>
                      <div className="font-mono text-sm text-white">{token.balance.toLocaleString()}</div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#708090]">PRICE</div>
                      <div className="font-mono text-sm text-white">${token.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#708090]">VALUE</div>
                      <div className="font-mono text-sm text-[#00ff41]">${token.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </div>

                    {/* Swap Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => handleSwapClick(token, e)}
                            className="p-2 border border-[#1a2225] rounded hover:border-[#00ff41]/30 hover:bg-[#00ff41]/5 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#00ff41]" />
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

        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <div className="font-mono text-[#708090] mb-2">NO TOKENS FOUND</div>
            <div className="font-mono text-sm text-[#708090]">Try adjusting your search query</div>
          </div>
        )}
      </div>

      {/* Right: Sticky Swap Widget */}
      <div className="w-[380px] flex-shrink-0">
        <div className="sticky top-4">
          <SwapWidgetInline fromToken={selectedSwapToken} />
        </div>
      </div>
    </div>
  )
}
