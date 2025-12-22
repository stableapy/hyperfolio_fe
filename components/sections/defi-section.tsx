"use client"

import { useState, useMemo } from "react"
import { TrendingUp, ChevronDown } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformDeFiPositions, groupPositionsByProtocol, type DeFiPositionDisplay } from "@/lib/utils/data-transformers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  // Get positions from selected wallet or all wallets - no mock data
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
      return { positions: [], protocolsData: [] } // No data yet
    } else {
      // Aggregate positions from all wallets with wallet info
      const allPositions: DeFiPositionDisplay[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, [wallets, walletData, selectedWalletId])
  
  // Check if we have any data loaded
  const hasData = positions.length > 0

  // Group positions by protocol
  const protocolGroups = useMemo(() => {
    return groupPositionsByProtocol(positions, protocolsData)
  }, [positions, protocolsData])

  const totalDeposited = positions.reduce((sum, pos) => sum + pos.deposited, 0)
  const totalCurrent = positions.reduce((sum, pos) => sum + pos.current, 0)
  const totalRewards = positions.reduce((sum, pos) => sum + pos.rewards, 0)
  // P&L calculations - uncomment when needed for display
  // const totalPnL = totalCurrent - totalDeposited
  // const totalPnLPercent = totalDeposited > 0 ? (totalPnL / totalDeposited) * 100 : 0
  void totalCurrent // Suppress unused warning - used for weighted APY calculation
  
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

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData

  return (
    <div className="space-y-4">
      {/* Stats Grid - 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">DEPOSITED</div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-20 sm:w-32 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
                ${totalDeposited >= 1000 ? `${(totalDeposited / 1000).toFixed(1)}K` : totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">REWARDS</div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-16 sm:w-24 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-[#00d9ff] font-semibold">
                ${totalRewards >= 1000 ? `${(totalRewards / 1000).toFixed(1)}K` : totalRewards.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>

        <TerminalCard className="col-span-2 sm:col-span-1">
          <TerminalContent className="p-3 sm:p-4">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">AVG APY</div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-14 sm:w-20 bg-[#1a2225] rounded animate-pulse" />
            ) : weightedApy > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="font-mono text-base sm:text-xl text-[#00ff41] font-semibold">
                        {weightedApy.toFixed(1)}%
                      </div>
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41]" />
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
              <div className="font-mono text-base sm:text-xl text-[#708090] font-semibold">--</div>
            )}
          </TerminalContent>
        </TerminalCard>
      </div>

      <div className="space-y-3">
        {/* Show skeletons when loading and no data */}
        {showSkeleton && (
          <>
            {[1, 2, 3].map((i) => (
              <TerminalCard key={i}>
                <div className="p-2.5 sm:p-3 animate-pulse">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#1a2225]" />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="h-3 sm:h-4 w-20 sm:w-24 bg-[#1a2225] rounded" />
                        <div className="h-2.5 w-12 bg-[#1a2225] rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="h-4 w-16 sm:w-20 bg-[#1a2225] rounded" />
                      <div className="w-4 h-4 bg-[#1a2225] rounded" />
                    </div>
                  </div>
                </div>
              </TerminalCard>
            ))}
          </>
        )}
        
        {protocolGroups.map((protocol) => {
          const isProtocolExpanded = expandedProtocols.has(protocol.id)

          return (
            <TerminalCard key={protocol.id} className="hover:border-[#1a2225] transition-colors">
              {/* Protocol Header */}
              <button 
                type="button"
                className="w-full p-2.5 sm:p-3 cursor-pointer hover:bg-[#111618] transition-colors text-left" 
                onClick={() => toggleProtocol(protocol.id)}
              >
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Left: Protocol info */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <img
                      src={protocol.logo || "/placeholder.svg"}
                      alt={protocol.name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded flex-shrink-0"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
                      <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">{protocol.name}</span>
                      <span className="font-mono text-[10px] sm:text-xs text-[#708090]">
                        {protocol.positions.length} position{protocol.positions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right: Value + APY + Chevron */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Protocol-level APY Badge */}
                    {protocol.stats?.weightedApyPercent && protocol.stats.weightedApyPercent > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded flex items-center gap-1">
                              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00ff41]" />
                              <span className="font-mono text-[10px] sm:text-xs text-[#00ff41]">
                                {Number(protocol.stats.weightedApyPercent).toFixed(1)}%
                              </span>
                            </span>
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

                    {/* Value */}
                    <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
                      ${protocol.totalValue >= 1000 ? `${(protocol.totalValue / 1000).toFixed(1)}K` : protocol.totalValue.toFixed(2)}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-[#708090] transition-transform ${isProtocolExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Positions List - Grouped by Type */}
              {isProtocolExpanded && (
                <div className="px-2 sm:px-4 pb-2 sm:pb-3 border-t border-[#1a2225] pt-2">
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
                            className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider"
                            style={{ color: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                          </span>
                          {typePositions.length > 1 && (
                            <span className="font-mono text-[9px] sm:text-[10px] text-[#708090]">
                              ({typePositions.length})
                            </span>
                          )}
                        </div>

                        {/* Positions under this type */}
                        {typePositions.map((position) => {
                          const isLiquidityPool = position.type === 'liquidity'

                          return (
                            <div key={position.id} className="py-1.5 sm:py-2 ml-1 sm:ml-2 px-1.5 sm:px-2 -mx-1 rounded-sm border-l-2 border-transparent hover:border-[#00ff41]/50 hover:bg-[#0a0e0f]/50 transition-colors cursor-pointer">
                              {/* Horizontal layout on all screens */}
                              <div className="flex items-center justify-between gap-2">
                                {/* Left: Token Details */}
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                  {/* Wallet Indicator - Only show in multi-wallet view */}
                                  {!selectedWalletId && position.walletColor && (
                                    <div
                                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: position.walletColor }}
                                    />
                                  )}
                                  {/* Token icon(s) */}
                                  {position.positionDetails?.token && !position.positionDetails?.pair && (
                                    <>
                                      {position.positionDetails.token.image_url && (
                                        <img src={position.positionDetails.token.image_url} alt={position.positionDetails.token.symbol} className="w-5 h-5 rounded-full flex-shrink-0" />
                                      )}
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span className="font-mono text-[11px] sm:text-xs text-white truncate">
                                          {parseFloat(position.positionDetails.token.formattedBalance) >= 1000 
                                            ? `${(parseFloat(position.positionDetails.token.formattedBalance) / 1000).toFixed(1)}K` 
                                            : parseFloat(position.positionDetails.token.formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="font-mono text-[11px] sm:text-xs text-[#708090]">{position.positionDetails.token.symbol}</span>
                                      </div>
                                    </>
                                  )}
                                  {position.positionDetails?.pair && (
                                    <>
                                      <div className="flex items-center flex-shrink-0">
                                        {position.positionDetails.token0?.image_url && (
                                          <img src={position.positionDetails.token0.image_url} alt={position.positionDetails.token0.symbol} className="w-5 h-5 rounded-full" />
                                        )}
                                        {position.positionDetails.token1?.image_url && (
                                          <img src={position.positionDetails.token1.image_url} alt={position.positionDetails.token1.symbol} className="w-5 h-5 rounded-full -ml-1.5" />
                                        )}
                                      </div>
                                      <span className="font-mono text-[11px] sm:text-xs text-[#708090] truncate">{position.positionDetails.pair}</span>
                                    </>
                                  )}
                                  {/* Fallback if no position details */}
                                  {!position.positionDetails?.token && !position.positionDetails?.pair && (
                                    <span className="font-mono text-[11px] sm:text-xs text-[#708090] truncate">{position.assets.join("/")}</span>
                                  )}
                                </div>

                                {/* Right: Value + APY Badge */}
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                  {/* Value */}
                                  <span className="font-mono text-[11px] sm:text-xs text-white font-medium">
                                    ${position.current >= 1000 ? `${(position.current / 1000).toFixed(1)}K` : position.current.toFixed(2)}
                                  </span>

                                  {/* APY Badge */}
                                  {position.apy > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="px-1 py-0.5 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded flex items-center gap-0.5">
                                            <TrendingUp className="w-2.5 h-2.5 text-[#00ff41]" />
                                            <span className="font-mono text-[10px] text-[#00ff41]">
                                              {Number(position.apy).toFixed(1)}%
                                            </span>
                                          </span>
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

                                  {/* Uncollected Fees */}
                                  {isLiquidityPool && position.rewards > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="px-1 py-0.5 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded">
                                            <span className="font-mono text-[10px] text-[#00d9ff]">
                                              +${position.rewards >= 100 ? `${(position.rewards).toFixed(0)}` : position.rewards.toFixed(2)}
                                            </span>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#0a0e0f] border border-[#1a2225] p-3">
                                          <div className="font-mono text-xs space-y-1">
                                            <div className="text-[#00d9ff] font-bold mb-2">Uncollected Fees</div>
                                            {position.positionDetails?.uncollectedFees && (
                                              <>
                                                {position.positionDetails.uncollectedFees.token0 && parseFloat(position.positionDetails.uncollectedFees.token0) > 0 && (
                                                  <div className="flex justify-between gap-4">
                                                    <span className="text-[#708090]">{position.positionDetails.token0?.symbol}:</span>
                                                    <span className="text-white">${position.positionDetails.uncollectedFees.token0UsdValue}</span>
                                                  </div>
                                                )}
                                                {position.positionDetails.uncollectedFees.token1 && parseFloat(position.positionDetails.uncollectedFees.token1) > 0 && (
                                                  <div className="flex justify-between gap-4">
                                                    <span className="text-[#708090]">{position.positionDetails.token1?.symbol}:</span>
                                                    <span className="text-white">${position.positionDetails.uncollectedFees.token1UsdValue}</span>
                                                  </div>
                                                )}
                                                <div className="border-t border-[#1a2225] mt-2 pt-2 flex justify-between gap-4">
                                                  <span className="text-[#708090]">Total:</span>
                                                  <span className="text-[#00d9ff] font-bold">${position.positionDetails.uncollectedFees.usdValue}</span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
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

      {protocolGroups.length === 0 && !showSkeleton && (
        <div className="text-center py-8 sm:py-12">
          <div className="font-mono text-xs sm:text-sm text-[#708090] mb-1 sm:mb-2">NO DEFI POSITIONS</div>
          <div className="font-mono text-[10px] sm:text-sm text-[#556070]">Start earning by depositing into DeFi protocols</div>
        </div>
      )}
    </div>
  )
}
