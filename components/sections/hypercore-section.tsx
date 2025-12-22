"use client"

import { useState, useMemo } from "react"
import { DollarSign, TrendingUp, Lock, Vault } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { useWalletStore } from "@/lib/store/wallet-store"

// Token image component with fallback for broken/missing images
function TokenImage({ src, symbol, className }: { src?: string | null; symbol: string; className?: string }) {
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

interface SpotBalance {
  coin: string
  token: number
  total: string
  hold: string
  entryNtl: string
  usdPrice: string
  usdValue: string
  image_url: string | null
  symbol: string
  name: string
  decimals: string
}

interface PerpPosition {
  positions: any[]
  margin: {
    usdcBalance: string
    lastUpdate: number
  }
}

interface StakingInfo {
  totalHype: string
  stakedHype: string
  availableHype: string
  delegations: any[]
  delegatorSummary: {
    delegated: string
    undelegated: string
    totalPendingWithdrawal: string
    nPendingWithdrawals: number
    totalStakedUsd: string
  }
  usdPrice: string
  image_url: string
  lastUpdate: number
}

interface VaultDetail {
  vaultAddress: string
  equity: string
  lockedUntilTimestamp: number
  name: string
  description: string
  leader: string
  apr: number
  maxDistributable: string
  maxWithdrawable: string
  isClosed: boolean
  allowDeposits: boolean
  allTimePnl: string
  pnl: string
  lastUpdate: number
}

interface VaultInfo {
  vaults: VaultDetail[]
  totalVaultValue: string
}

interface PortfolioSummary {
  totalValue: string
  spotValue: string
  perpValue: string
  stakedValue: string
  vaultValue: string
  lastUpdate: number
}

export function HypercoreSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [activeTab, setActiveTab] = useState<"spot" | "perp" | "staking" | "vaults">("spot")

  // Get Hypercore data from selected wallet or all wallets
  const hypercoreData = useMemo(() => {
    if (wallets.length === 0) return null
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.userData?.data) {
        return walletData[wallet.address].userData.data
      }
    } else {
      // Aggregate data from all wallets
      const aggregated = {
        spotBalances: [] as SpotBalance[],
        perpPositions: { positions: [], margin: { usdcBalance: "0.0", lastUpdate: Date.now() } } as PerpPosition,
        stakingInfo: {
          totalHype: "0.0",
          stakedHype: "0",
          availableHype: "0",
          delegations: [],
          delegatorSummary: {
            delegated: "0.0",
            undelegated: "0.0",
            totalPendingWithdrawal: "0.0",
            nPendingWithdrawals: 0,
            totalStakedUsd: "0"
          },
          usdPrice: "0",
          image_url: "",
          lastUpdate: Date.now()
        } as StakingInfo,
        vaultInfo: { vaults: [], totalVaultValue: "0" } as VaultInfo,
        portfolioSummary: {
          totalValue: "0",
          spotValue: "0",
          perpValue: "0",
          stakedValue: "0",
          vaultValue: "0",
          lastUpdate: Date.now()
        } as PortfolioSummary,
      }
      
      wallets.forEach(wallet => {
        const data = walletData[wallet.address]?.userData?.data
        if (data) {
          // Aggregate spot balances
          if (data.spotBalances) {
            data.spotBalances.forEach((balance: SpotBalance) => {
              const existing = aggregated.spotBalances.find(b => b.coin === balance.coin)
              if (existing) {
                existing.total = (parseFloat(existing.total) + parseFloat(balance.total)).toString()
                existing.usdValue = (parseFloat(existing.usdValue) + parseFloat(balance.usdValue)).toString()
              } else {
                aggregated.spotBalances.push({ ...balance })
              }
            })
          }
          
          // Aggregate staking
          if (data.stakingInfo) {
            aggregated.stakingInfo.totalHype = (parseFloat(aggregated.stakingInfo.totalHype) + parseFloat(data.stakingInfo.totalHype)).toString()
            aggregated.stakingInfo.stakedHype = (parseFloat(aggregated.stakingInfo.stakedHype) + parseFloat(data.stakingInfo.stakedHype)).toString()
            aggregated.stakingInfo.delegatorSummary.totalStakedUsd = (parseFloat(aggregated.stakingInfo.delegatorSummary.totalStakedUsd) + parseFloat(data.stakingInfo.delegatorSummary?.totalStakedUsd || "0")).toString()
          }
          
          // Aggregate vaults
          if (data.vaultInfo) {
            aggregated.vaultInfo.vaults.push(...data.vaultInfo.vaults)
            aggregated.vaultInfo.totalVaultValue = (parseFloat(aggregated.vaultInfo.totalVaultValue) + parseFloat(data.vaultInfo.totalVaultValue)).toString()
          }
          
          // Aggregate portfolio summary
          if (data.portfolioSummary) {
            aggregated.portfolioSummary.totalValue = (parseFloat(aggregated.portfolioSummary.totalValue) + parseFloat(data.portfolioSummary.totalValue)).toString()
            aggregated.portfolioSummary.spotValue = (parseFloat(aggregated.portfolioSummary.spotValue) + parseFloat(data.portfolioSummary.spotValue)).toString()
            aggregated.portfolioSummary.perpValue = (parseFloat(aggregated.portfolioSummary.perpValue) + parseFloat(data.portfolioSummary.perpValue)).toString()
            aggregated.portfolioSummary.stakedValue = (parseFloat(aggregated.portfolioSummary.stakedValue) + parseFloat(data.portfolioSummary.stakedValue)).toString()
            aggregated.portfolioSummary.vaultValue = (parseFloat(aggregated.portfolioSummary.vaultValue) + parseFloat(data.portfolioSummary.vaultValue)).toString()
          }
        }
      })
      
      return aggregated
    }
    
    return null
  }, [wallets, walletData, selectedWalletId])

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hypercoreData
  const hasData = !!hypercoreData

  const tabs = [
    { id: "spot" as const, label: "Spot", icon: DollarSign, color: "#00ff41" },
    { id: "perp" as const, label: "Perp", icon: TrendingUp, color: "#00d9ff" },
    { id: "staking" as const, label: "Staking", icon: Lock, color: "#ff00ff" },
    { id: "vaults" as const, label: "Vaults", icon: Vault, color: "#ffaa00" },
  ]

  // Show "no data" message when not loading and no data
  if (!hasData && !isLoading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="font-mono text-xs sm:text-sm text-[#708090] mb-1 sm:mb-2">NO HYPERCORE DATA</div>
        <div className="font-mono text-[10px] sm:text-sm text-[#556070]">Add a wallet to view Hypercore data</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00ff41]" />
              <div className="font-mono text-[10px] sm:text-xs text-[#708090]">SPOT</div>
            </div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-16 sm:w-28 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-white font-semibold">
                ${(() => { const v = parseFloat(hypercoreData?.portfolioSummary?.spotValue || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00d9ff]" />
              <div className="font-mono text-[10px] sm:text-xs text-[#708090]">PERP</div>
            </div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-14 sm:w-24 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-white font-semibold">
                ${(() => { const v = parseFloat(hypercoreData?.portfolioSummary?.perpValue || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff00ff]" />
              <div className="font-mono text-[10px] sm:text-xs text-[#708090]">STAKED</div>
            </div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-14 sm:w-24 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-white font-semibold">
                ${(() => { const v = parseFloat(hypercoreData?.portfolioSummary?.stakedValue || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <Vault className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffaa00]" />
              <div className="font-mono text-[10px] sm:text-xs text-[#708090]">VAULTS</div>
            </div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-14 sm:w-24 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-white font-semibold">
                ${(() => { const v = parseFloat(hypercoreData?.portfolioSummary?.vaultValue || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>
      </div>

      {/* Tabs - icons only on mobile, icons + labels on desktop */}
      <div className="flex gap-1 sm:gap-2 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 sm:px-4 py-2 rounded transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === tab.id
                  ? "bg-[#1a2225] text-white"
                  : "text-[#708090] hover:text-white"
              }`}
              style={{
                color: activeTab === tab.id ? tab.color : undefined,
              }}
            >
              <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline font-mono text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <TerminalCard>
        <TerminalContent>
          {/* Show skeletons when loading */}
          {showSkeleton && (
            <div className="divide-y divide-[#1a2225]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2.5 sm:p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1a2225]" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
                        <div className="h-4 sm:h-5 w-10 sm:w-14 bg-[#1a2225] rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-14 sm:w-16 bg-[#1a2225] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === "spot" && hasData && (
            <div className="divide-y divide-[#1a2225]">
              {hypercoreData && hypercoreData.spotBalances.length > 0 ? (
                hypercoreData.spotBalances
                  .filter((b: SpotBalance) => parseFloat(b.total) > 0)
                  .map((balance: SpotBalance) => {
                    const total = parseFloat(balance.total)
                    const usdValue = parseFloat(balance.usdValue)
                    return (
                      <div key={balance.coin} className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
                        {/* Horizontal layout */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Left: Token Info */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <TokenImage src={balance.image_url} symbol={balance.symbol} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">{balance.symbol}</span>
                              <span className="font-mono text-[10px] sm:text-xs text-[#708090] bg-[#1a2225] px-1.5 py-0.5 rounded">
                                {total >= 1000 ? `${(total/1000).toFixed(1)}K` : total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Right: Value */}
                          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            {/* Hold - hidden on mobile */}
                            <div className="hidden sm:block text-right">
                              <div className="font-mono text-[10px] text-[#556070]">HOLD</div>
                              <div className="font-mono text-xs text-[#708090]">{parseFloat(balance.hold).toLocaleString()}</div>
                            </div>

                            {/* Entry - hidden on mobile */}
                            <div className="hidden md:block text-right">
                              <div className="font-mono text-[10px] text-[#556070]">ENTRY</div>
                              <div className="font-mono text-xs text-[#708090]">{parseFloat(balance.entryNtl).toLocaleString()}</div>
                            </div>

                            {/* USD Value */}
                            <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
                              ${usdValue >= 1000 ? `${(usdValue/1000).toFixed(1)}K` : usdValue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="font-mono text-xs sm:text-sm text-[#708090]">NO SPOT BALANCES</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "perp" && hasData && (
            <div className="text-center py-6 sm:py-8">
              <div className="font-mono text-xs sm:text-sm text-[#708090]">NO PERP POSITIONS</div>
              <div className="font-mono text-[10px] sm:text-xs text-[#556070] mt-1 sm:mt-2">
                Margin: ${parseFloat(hypercoreData?.perpPositions?.margin?.usdcBalance || "0").toFixed(2)}
              </div>
            </div>
          )}

          {activeTab === "staking" && hasData && hypercoreData && (
            <div className="space-y-2 sm:space-y-3">
              {/* Summary */}
              <div className="p-2.5 sm:p-3 border border-[#1a2225] rounded-lg bg-[#0a0e0f]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-0.5 sm:mb-1">TOTAL HYPE</div>
                    <div className="font-mono text-xs sm:text-sm text-white font-semibold">
                      {(() => { const v = parseFloat(hypercoreData.stakingInfo?.totalHype || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-0.5 sm:mb-1">STAKED VALUE</div>
                    <div className="font-mono text-xs sm:text-sm text-[#ff00ff] font-semibold">
                      ${(() => { const v = parseFloat(hypercoreData.stakingInfo?.delegatorSummary?.totalStakedUsd || "0"); return v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(2) })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delegations */}
              {hypercoreData.stakingInfo?.delegations && hypercoreData.stakingInfo.delegations.length > 0 ? (
                <div className="divide-y divide-[#1a2225]">
                  {hypercoreData.stakingInfo.delegations.map((delegation: any, index: number) => (
                    <div key={index} className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-xs sm:text-sm text-[#00ff41] truncate flex-1 min-w-0">
                          {delegation.address ? `${delegation.address.slice(0, 8)}...${delegation.address.slice(-6)}` : "Unknown"}
                        </div>
                        <div className="font-mono text-xs sm:text-sm text-white font-medium flex-shrink-0">
                          {delegation.amount || "0"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="font-mono text-xs sm:text-sm text-[#708090]">NO DELEGATIONS</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "vaults" && hasData && hypercoreData && (
            <div className="divide-y divide-[#1a2225]">
              {hypercoreData.vaultInfo?.vaults && hypercoreData.vaultInfo.vaults.length > 0 ? (
                hypercoreData.vaultInfo.vaults.map((vault: VaultDetail, index: number) => {
                  const isLocked = vault.lockedUntilTimestamp > Date.now()
                  const equity = parseFloat(vault.equity)
                  const pnl = parseFloat(vault.pnl)
                  
                  return (
                    <div key={index} className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Left: Vault Name */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">{vault.name}</div>
                          {isLocked && (
                            <span className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-[#ffaa00]/20 text-[#ffaa00]">
                              LOCK
                            </span>
                          )}
                          {vault.isClosed && (
                            <span className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-red-500/20 text-red-400">
                              CLOSED
                            </span>
                          )}
                        </div>

                        {/* Right: Equity */}
                        <div className="font-mono text-xs sm:text-sm text-white font-bold flex-shrink-0">
                          ${equity >= 1000 ? `${(equity/1000).toFixed(1)}K` : equity.toFixed(2)}
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* APR */}
                        <span className="px-1.5 py-0.5 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded flex items-center gap-1">
                          <span className="font-mono text-[10px] text-[#00d9ff]">
                            {vault.apr.toFixed(1)}% APR
                          </span>
                        </span>

                        {/* P&L */}
                        <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${pnl >= 0 ? 'bg-[#00ff41]/10 border border-[#00ff41]/20' : 'bg-[#ff4444]/10 border border-[#ff4444]/20'}`}>
                          <span className={`font-mono text-[10px] ${pnl >= 0 ? 'text-[#00ff41]' : 'text-[#ff4444]'}`}>
                            {pnl >= 0 ? '+' : ''}${Math.abs(pnl) >= 1000 ? `${(pnl/1000).toFixed(1)}K` : pnl.toFixed(2)}
                          </span>
                        </span>

                        {/* Max WD - hidden on mobile */}
                        <span className="hidden sm:inline font-mono text-[10px] text-[#708090]">
                          Max: ${parseFloat(vault.maxWithdrawable) >= 1000 ? `${(parseFloat(vault.maxWithdrawable)/1000).toFixed(1)}K` : parseFloat(vault.maxWithdrawable).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="font-mono text-xs sm:text-sm text-[#708090]">NO VAULTS</div>
                </div>
              )}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

