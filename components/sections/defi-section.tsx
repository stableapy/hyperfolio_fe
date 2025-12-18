"use client"

import { useState, useMemo } from "react"
import { TrendingUp, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { LoadingSpinner } from "../loading-spinner"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformDeFiPositions, groupPositionsByProtocol, type DeFiPositionDisplay, type ProtocolGroup } from "@/lib/utils/data-transformers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MOCK_POSITIONS: DeFiPositionDisplay[] = [
  {
    id: "1",
    protocol: "HyperSwap",
    type: "liquidity",
    assets: ["HYPE", "ETH"],
    deposited: 12500.0,
    current: 13250.0,
    apy: 24.5,
    rewards: 125.5,
    logo: "/placeholder.svg?height=40&width=40",
    positionDetails: undefined,
    protocolUrl: undefined,
  },
  {
    id: "2",
    protocol: "HyperLend",
    type: "lending",
    assets: ["USDC"],
    deposited: 5000.0,
    current: 5125.0,
    apy: 8.2,
    rewards: 42.3,
    logo: "/placeholder.svg?height=40&width=40",
    positionDetails: undefined,
    protocolUrl: undefined,
  },
  {
    id: "3",
    protocol: "HyperStake",
    type: "staking",
    assets: ["HYPE"],
    deposited: 8000.0,
    current: 8640.0,
    apy: 15.8,
    rewards: 98.7,
    logo: "/placeholder.svg?height=40&width=40",
    positionDetails: undefined,
    protocolUrl: undefined,
  },
  {
    id: "4",
    protocol: "HyperFarm",
    type: "farming",
    assets: ["LINK", "ETH"],
    deposited: 6500.0,
    current: 7150.0,
    apy: 32.1,
    rewards: 156.2,
    logo: "/placeholder.svg?height=40&width=40",
    positionDetails: undefined,
    protocolUrl: undefined,
  },
]

const TYPE_LABELS = {
  lending: "Lending",
  liquidity: "Liquidity Pool",
  staking: "Staking",
  farming: "Yield Farming",
}

const TYPE_COLORS = {
  lending: "#00ff41",
  liquidity: "#00d9ff",
  staking: "#ff00ff",
  farming: "#ffaa00",
}

export function DeFiSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(new Set())

  // Get positions from selected wallet or all wallets
  const { positions, protocolsData } = useMemo(() => {
    if (wallets.length === 0) return { positions: [], protocolsData: [] }
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.positions) {
        return {
          positions: transformDeFiPositions(
            walletData[wallet.address].positions,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ),
          protocolsData: walletData[wallet.address].positions?.data?.protocols || []
        }
      }
    } else {
      // Aggregate positions from all wallets with wallet info
      const allPositions: DeFiPositionDisplay[] = []
      const allProtocolsData: any[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.positions) {
          allPositions.push(...transformDeFiPositions(
            walletData[wallet.address].positions,
            { address: wallet.address, name: wallet.name, color: wallet.color }
          ))
          if (walletData[wallet.address].positions?.data?.protocols) {
            allProtocolsData.push(...walletData[wallet.address].positions.data.protocols)
          }
        }
      })
      return { positions: allPositions, protocolsData: allProtocolsData }
    }
    
    return { positions: MOCK_POSITIONS, protocolsData: [] }
  }, [wallets, walletData, selectedWalletId])

  // Group positions by protocol
  const protocolGroups = useMemo(() => {
    return groupPositionsByProtocol(positions, protocolsData)
  }, [positions, protocolsData])

  const totalDeposited = positions.reduce((sum, pos) => sum + pos.deposited, 0)
  const totalCurrent = positions.reduce((sum, pos) => sum + pos.current, 0)
  const totalRewards = positions.reduce((sum, pos) => sum + pos.rewards, 0)
  const totalPnL = totalCurrent - totalDeposited
  const totalPnLPercent = totalDeposited > 0 ? (totalPnL / totalDeposited) * 100 : 0
  
  // Calculate weighted portfolio APY
  const positionsWithApy = positions.filter(pos => pos.apy > 0)
  const weightedApy = positionsWithApy.length > 0 
    ? positionsWithApy.reduce((sum, pos) => sum + (pos.apy * pos.current), 0) / totalCurrent
    : 0
  
  // Calculate portfolio-level estimated yield
  const portfolioYield = {
    daily: positionsWithApy.reduce((sum, pos) => {
      const yield1 = pos.estimatedYield ? parseFloat(pos.estimatedYield.daily) : 0
      return sum + yield1
    }, 0),
    weekly: positionsWithApy.reduce((sum, pos) => {
      const yield1 = pos.estimatedYield ? parseFloat(pos.estimatedYield.weekly) : 0
      return sum + yield1
    }, 0),
    monthly: positionsWithApy.reduce((sum, pos) => {
      const yield1 = pos.estimatedYield ? parseFloat(pos.estimatedYield.monthly) : 0
      return sum + yield1
    }, 0),
  }

  const toggleProtocol = (protocolId: string) => {
    const newExpanded = new Set(expandedProtocols)
    if (newExpanded.has(protocolId)) {
      newExpanded.delete(protocolId)
    } else {
      newExpanded.add(protocolId)
    }
    setExpandedProtocols(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <TerminalCard>
          <TerminalContent>
            <div className="font-mono text-xs text-[#708090] mb-2">TOTAL DEPOSITED</div>
            <div className="font-mono text-xl text-white font-semibold">
              ${totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>



        <TerminalCard>
          <TerminalContent>
            <div className="font-mono text-xs text-[#708090] mb-2">UNCLAIMED REWARDS</div>
            <div className="font-mono text-xl text-[#00d9ff] font-semibold">
              ${totalRewards.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent>
            <div className="font-mono text-xs text-[#708090] mb-2">WEIGHTED APY</div>
            {weightedApy > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center gap-2  hover:opacity-80 transition-opacity"
                    >
                      <div className="font-mono text-xl text-[#00ff41] font-semibold">
                        {weightedApy.toFixed(2)}%
                      </div>
                      <TrendingUp className="w-4 h-4 text-[#00ff41]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-[#00ff41] font-bold mb-2">Portfolio Estimated Yield</div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Daily:</span>
                        <span className="text-white">${portfolioYield.daily.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Weekly:</span>
                        <span className="text-white">${portfolioYield.weekly.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#708090]">Monthly:</span>
                        <span className="text-white">${portfolioYield.monthly.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[#1a2225] mt-2 pt-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-[#708090]">Positions with APY:</span>
                          <span className="text-white">{positionsWithApy.length} / {positions.length}</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="font-mono text-xl text-[#708090] font-semibold">--</div>
            )}
          </TerminalContent>
        </TerminalCard>
      </div>

      <div className="space-y-3">
        {protocolGroups.map((protocol) => {
          const isProtocolExpanded = expandedProtocols.has(protocol.id)
          const protocolPnL = protocol.positions.reduce((sum, pos) => sum + (pos.current - pos.deposited), 0)
          const protocolRewards = protocol.positions.reduce((sum, pos) => sum + pos.rewards, 0)

          return (
            <TerminalCard key={protocol.id} className="hover:border-[#1a2225] transition-colors">
              {/* Protocol Header */}
              <button 
                type="button"
                className="w-full p-3 cursor-pointer hover:bg-[#111618] transition-colors text-left" 
                onClick={() => toggleProtocol(protocol.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={protocol.logo || "/placeholder.svg"}
                      alt={protocol.name}
                      className="w-7 h-7 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#00ff41] font-semibold">{protocol.name}</span>
                      <span className="font-mono text-xs text-[#708090]">
                        ({protocol.positions.length})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-sm text-[#00ff41]">
                        ${protocol.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Protocol-level APY Badge */}
                    {protocol.stats?.weightedApyPercent && protocol.stats.weightedApyPercent > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="px-2 py-1 border border-[#1a2225] rounded flex items-center gap-1 hover:border-[#00ff41]/30 hover:bg-[#00ff41]/5 transition-colors"
                            >
                              <TrendingUp className="w-3 h-3 text-[#00ff41]" />
                              <span className="font-mono text-xs text-[#00ff41]">
                                {Number(protocol.stats.weightedApyPercent).toFixed(2)}%
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                            <div className="font-mono text-xs space-y-1">
                             
                              {protocol.stats.estimatedYield && (
                                <>
                                  <div className="text-[#00ff41] font-bold mt-2 mb-1">Estimated Yield</div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-[#708090]">Daily:</span>
                                    <span className="text-white">${protocol.stats.estimatedYield.daily}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-[#708090]">Weekly:</span>
                                    <span className="text-white">${protocol.stats.estimatedYield.weekly}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-[#708090]">Monthly:</span>
                                    <span className="text-white">${protocol.stats.estimatedYield.monthly}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {isProtocolExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#708090]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#708090]" />
                    )}
                  </div>
                </div>
              </button>

              {/* Positions List - Grouped by Type */}
              {isProtocolExpanded && (
                <div className="px-4 pb-3 border-t border-[#1a2225] pt-2">
                  {/* Group positions by type */}
                  {(() => {
                    const positionsByType = protocol.positions.reduce((acc, pos) => {
                      if (!acc[pos.type]) acc[pos.type] = []
                      acc[pos.type].push(pos)
                      return acc
                    }, {} as Record<string, typeof protocol.positions>)

                    return Object.entries(positionsByType).map(([type, typePositions]) => (
                      <div key={type} className="mb-2 last:mb-0">
                        {/* Type Header - shown once per type */}
                        <div className="flex items-center gap-2 mb-1 py-1">
                          <span
                            className="font-mono text-[10px] uppercase tracking-wider"
                            style={{ color: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                          </span>
                          {typePositions.length > 1 && (
                            <span className="font-mono text-[10px] text-[#708090]">
                              ({typePositions.length})
                            </span>
                          )}
                        </div>

                        {/* Positions under this type */}
                        {typePositions.map((position) => {
                          const pnl = position.current - position.deposited
                          const pnlPercent = (pnl / position.deposited) * 100
                          const isLiquidityPool = position.type === 'liquidity'

                          return (
                            <div key={position.id} className="py-2.5 ml-2 px-2 -mx-2 rounded-sm border-l-2 border-transparent hover:border-[#00ff41]/50 hover:bg-[#0a0e0f]/50 transition-colors cursor-pointer">
                              {/* Main Row */}
                              <div className="flex items-center justify-between gap-4 text-xs">
                                {/* Left: Token Details */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {/* Wallet Indicator - Only show in multi-wallet view */}
                                  {!selectedWalletId && position.walletColor && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ 
                                              backgroundColor: position.walletColor, 
                                              boxShadow: `0 0 6px ${position.walletColor}` 
                                            }}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-2">
                                          <div className="font-mono text-xs">
                                            <span className="text-[#708090]">Wallet: </span>
                                            <span style={{ color: position.walletColor }}>{position.walletName}</span>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {/* Token Details inline */}
                                  {position.positionDetails?.token && !position.positionDetails?.pair && (
                                    <>
                                      {position.positionDetails.token.image_url && (
                                        <img src={position.positionDetails.token.image_url} alt={position.positionDetails.token.symbol} className="w-6 h-6 rounded-full" />
                                      )}
                                      <span className="font-mono text-sm text-white">{parseFloat(position.positionDetails.token.formattedBalance).toLocaleString()}</span>
                                      <span className="font-mono text-sm text-[#708090]">{position.positionDetails.token.symbol}</span>
                                    </>
                                  )}
                                  {position.positionDetails?.pair && (
                                    <>
                                      {position.positionDetails.token0?.image_url && (
                                        <img src={position.positionDetails.token0.image_url} alt={position.positionDetails.token0.symbol} className="w-6 h-6 rounded-full" />
                                      )}
                                      {position.positionDetails.token1?.image_url && (
                                        <img src={position.positionDetails.token1.image_url} alt={position.positionDetails.token1.symbol} className="w-6 h-6 rounded-full -ml-2" />
                                      )}
                                      <span className="font-mono text-sm text-[#708090]">{position.positionDetails.pair}</span>
                                      {position.positionDetails.feeTier && (
                                        <span className="font-mono text-xs text-[#708090]">• {position.positionDetails.feeTier * 100}%</span>
                                      )}
                                    </>
                                  )}
                                  {/* Fallback if no position details */}
                                  {!position.positionDetails?.token && !position.positionDetails?.pair && (
                                    <div className="font-mono text-sm text-[#708090] truncate">{position.assets.join(" / ")}</div>
                                  )}
                                </div>

                          {/* Right: Stats */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Value */}
                            <div className="text-right">
                              <div className="font-mono text-sm text-white">
                                ${position.current.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </div>
                            </div>

                            {/* APY Badge with Tooltip */}
                            {position.apy > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      type="button"
                                      className="px-2 py-1 border border-[#1a2225] rounded flex items-center gap-1 hover:border-[#00ff41]/30 hover:bg-[#00ff41]/5 transition-colors"
                                    >
                                      <TrendingUp className="w-3 h-3 text-[#00ff41]" />
                                      <span className="font-mono text-xs text-[#00ff41]">
                                        {Number(position.apy).toFixed(2)}%
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  {position.estimatedYield && (
                                    <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                                      <div className="font-mono text-xs space-y-1">
                                        <div className="text-[#00ff41] font-bold mb-2">Estimated Yield</div>
                                        <div className="flex justify-between gap-4">
                                          <span className="text-[#708090]">Daily:</span>
                                          <span className="text-white">${position.estimatedYield.daily}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                          <span className="text-[#708090]">Weekly:</span>
                                          <span className="text-white">${position.estimatedYield.weekly}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                          <span className="text-[#708090]">Monthly:</span>
                                          <span className="text-white">${position.estimatedYield.monthly}</span>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {/* Uncollected Fees - Show tooltip with breakdown */}
                            {isLiquidityPool && position.rewards > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      type="button"
                                      className="px-2 py-1 border border-[#1a2225] rounded hover:border-[#00d9ff]/30 hover:bg-[#00d9ff]/5 transition-colors"
                                    >
                                      <div className="font-mono text-xs text-[#00d9ff]">
                                        ${position.rewards.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                      </div>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                                    <div className="font-mono text-xs space-y-1">
                                      <div className="text-[#00d9ff] font-bold mb-2">Uncollected Fees</div>
                                      
                                      {position.positionDetails?.uncollectedFees && (
                                        <>
                                          {position.positionDetails.uncollectedFees.token0 && parseFloat(position.positionDetails.uncollectedFees.token0) > 0 && (
                                            <div className="flex justify-between gap-4">
                                              <span className="text-[#708090]">
                                                {position.positionDetails.token0?.symbol || 'Token 0'}:
                                              </span>
                                              <div className="text-right">
                                                <div className="text-white">{parseFloat(position.positionDetails.uncollectedFees.token0).toFixed(6)}</div>
                                                <div className="text-[#708090] text-[10px]">
                                                  ${position.positionDetails.uncollectedFees.token0UsdValue}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {position.positionDetails.uncollectedFees.token1 && parseFloat(position.positionDetails.uncollectedFees.token1) > 0 && (
                                            <div className="flex justify-between gap-4">
                                              <span className="text-[#708090]">
                                                {position.positionDetails.token1?.symbol || 'Token 1'}:
                                              </span>
                                              <div className="text-right">
                                                <div className="text-white">{parseFloat(position.positionDetails.uncollectedFees.token1).toFixed(6)}</div>
                                                <div className="text-[#708090] text-[10px]">
                                                  ${position.positionDetails.uncollectedFees.token1UsdValue}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          <div className="border-t border-[#1a2225] mt-2 pt-2">
                                            <div className="flex justify-between gap-4">
                                              <span className="text-[#708090]">Total:</span>
                                              <span className="text-[#00d9ff] font-bold">
                                                ${position.positionDetails.uncollectedFees.usdValue}
                                              </span>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {/* Protocol Link */}
                            {position.protocolUrl && (
                              <a 
                                href={position.protocolUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#708090] hover:text-[#00d9ff] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                            </div>
                          )
                        })}
                      </div>
                    ))
                  })()}
                </div>
              )}
            </TerminalCard>
          )
        })}
      </div>

      {protocolGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="font-mono text-[#708090] mb-2">NO DEFI POSITIONS</div>
          <div className="font-mono text-sm text-[#708090]">Start earning by depositing into DeFi protocols</div>
        </div>
      )}
    </div>
  )
}
