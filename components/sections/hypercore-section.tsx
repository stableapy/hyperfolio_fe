"use client"

import { useState, useMemo } from "react"
import { DollarSign, TrendingUp, Lock, Vault } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { LoadingSpinner } from "../loading-spinner"
import { useWalletStore } from "@/lib/store/wallet-store"

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!hypercoreData) {
    return (
      <div className="text-center py-12">
        <div className="font-mono text-[#708090] mb-2">NO HYPERCORE DATA</div>
        <div className="font-mono text-sm text-[#708090]">Add a wallet to view Hypercore data</div>
      </div>
    )
  }

  const tabs = [
    { id: "spot" as const, label: "Spot", icon: DollarSign, color: "#00ff41" },
    { id: "perp" as const, label: "Perp", icon: TrendingUp, color: "#00d9ff" },
    { id: "staking" as const, label: "Staking", icon: Lock, color: "#ff00ff" },
    { id: "vaults" as const, label: "Vaults", icon: Vault, color: "#ffaa00" },
  ]

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <TerminalCard>
          <TerminalContent>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#00ff41]" />
              <div className="font-mono text-xs text-[#708090]">SPOT VALUE</div>
            </div>
            <div className="font-mono text-xl text-white font-semibold">
              ${parseFloat(hypercoreData.portfolioSummary.spotValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#00d9ff]" />
              <div className="font-mono text-xs text-[#708090]">PERP VALUE</div>
            </div>
            <div className="font-mono text-xl text-white font-semibold">
              ${parseFloat(hypercoreData.portfolioSummary.perpValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[#ff00ff]" />
              <div className="font-mono text-xs text-[#708090]">STAKED VALUE</div>
            </div>
            <div className="font-mono text-xl text-white font-semibold">
              ${parseFloat(hypercoreData.portfolioSummary.stakedValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>

        <TerminalCard>
          <TerminalContent>
            <div className="flex items-center gap-2 mb-2">
              <Vault className="w-4 h-4 text-[#ffaa00]" />
              <div className="font-mono text-xs text-[#708090]">VAULT VALUE</div>
            </div>
            <div className="font-mono text-xl text-white font-semibold">
              ${parseFloat(hypercoreData.portfolioSummary.vaultValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </TerminalContent>
        </TerminalCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#1a2225] text-white"
                  : "text-[#708090] hover:text-white"
              }`}
              style={{
                color: activeTab === tab.id ? tab.color : undefined,
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-mono text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <TerminalCard>
        <TerminalContent>
          {activeTab === "spot" && (
            <div className="divide-y divide-[#1a2225]">
              {hypercoreData.spotBalances.length > 0 ? (
                hypercoreData.spotBalances
                  .filter((b: SpotBalance) => parseFloat(b.total) > 0)
                  .map((balance: SpotBalance) => (
                    <div key={balance.coin} className="p-4 hover:bg-[#111618] transition-colors">
                      {/* Main Row */}
                      <div className="flex items-center justify-between gap-4 text-xs">
                        {/* Left: Token Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {balance.image_url && (
                            <img src={balance.image_url} alt={balance.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />
                          )}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-mono text-sm text-[#708090]">&gt;</span>
                            <div className="flex flex-col min-w-0">
                              <div className="font-mono text-sm text-[#00ff41] font-semibold truncate">{balance.symbol}</div>
                              <div className="font-mono text-xs text-[#708090] truncate">{balance.name}</div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {/* Total */}
                          <div className="text-right">
                            <div className="font-mono text-xs text-[#708090]">TOTAL</div>
                            <div className="font-mono text-sm text-white">{parseFloat(balance.total).toLocaleString()}</div>
                          </div>

                          {/* Hold */}
                          <div className="text-right">
                            <div className="font-mono text-xs text-[#708090]">HOLD</div>
                            <div className="font-mono text-sm text-white">{parseFloat(balance.hold).toLocaleString()}</div>
                          </div>

                          {/* Entry */}
                          <div className="text-right">
                            <div className="font-mono text-xs text-[#708090]">ENTRY</div>
                            <div className="font-mono text-sm text-white">{parseFloat(balance.entryNtl).toLocaleString()}</div>
                          </div>

                          {/* USD Value */}
                          <div className="text-right">
                            <div className="font-mono text-xs text-[#708090]">VALUE</div>
                            <div className="font-mono text-sm text-[#00d9ff]">${parseFloat(balance.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="font-mono text-[#708090]">NO SPOT BALANCES</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "perp" && (
            <div className="text-center py-8">
              <div className="font-mono text-[#708090]">NO PERP POSITIONS</div>
              <div className="font-mono text-xs text-[#708090] mt-2">
                Margin Balance: ${parseFloat(hypercoreData.perpPositions.margin.usdcBalance).toFixed(2)}
              </div>
            </div>
          )}

          {activeTab === "staking" && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="p-3 border border-[#1a2225] rounded-lg bg-[#0a0e0f]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-[#708090] mb-1">TOTAL HYPE</div>
                    <div className="font-mono text-sm text-white font-semibold">
                      {parseFloat(hypercoreData.stakingInfo.totalHype).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-[#708090] mb-1">STAKED VALUE</div>
                    <div className="font-mono text-sm text-[#ff00ff] font-semibold">
                      ${parseFloat(hypercoreData.stakingInfo.delegatorSummary?.totalStakedUsd || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delegations */}
              {hypercoreData.stakingInfo.delegations && hypercoreData.stakingInfo.delegations.length > 0 ? (
                <div className="divide-y divide-[#1a2225]">
                  {hypercoreData.stakingInfo.delegations.map((delegation: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-[#111618] transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-mono text-sm text-[#708090]">&gt;</span>
                          <div className="font-mono text-sm text-[#00ff41] truncate">
                            {delegation.address || "Unknown"}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono text-xs text-[#708090]">DELEGATED</div>
                          <div className="font-mono text-sm text-white">{delegation.amount || "0"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="font-mono text-sm text-[#708090]">NO DELEGATIONS</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "vaults" && (
            <div className="divide-y divide-[#1a2225]">
              {hypercoreData.vaultInfo.vaults && hypercoreData.vaultInfo.vaults.length > 0 ? (
                hypercoreData.vaultInfo.vaults.map((vault: VaultDetail, index: number) => {
                  const isLocked = vault.lockedUntilTimestamp > Date.now()
                  
                  return (
                    <div key={index} className="p-4 hover:bg-[#111618] transition-colors">
                      {/* Main Row */}
                      <div className="flex items-center justify-between gap-4 text-xs mb-2">
                        {/* Left: Vault Info */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-mono text-sm text-[#708090]">&gt;</span>
                          <div className="flex flex-col min-w-0">
                            <div className="font-mono text-sm text-[#00ff41] font-semibold truncate">{vault.name}</div>
                            <div className="font-mono text-xs text-[#708090] truncate">{vault.description}</div>
                          </div>
                        </div>

                        {/* Right: Status */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#ffaa00]/20 text-[#ffaa00]">
                              LOCKED
                            </span>
                          )}
                          {vault.isClosed && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/20 text-red-400">
                              CLOSED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 ml-5 mt-2">
                        {/* Equity */}
                        <div className="text-right">
                          <div className="font-mono text-xs text-[#708090]">EQUITY</div>
                          <div className="font-mono text-sm text-white">
                            ${parseFloat(vault.equity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        {/* APR */}
                        <div className="text-right">
                          <div className="font-mono text-xs text-[#708090]">APR</div>
                          <div className="font-mono text-sm text-[#00d9ff]">
                            {vault.apr.toFixed(2)}%
                          </div>
                        </div>

                        {/* P&L */}
                        <div className="text-right">
                          <div className="font-mono text-xs text-[#708090]">P&L</div>
                          <div className={`font-mono text-sm font-semibold ${parseFloat(vault.pnl) >= 0 ? "text-[#00ff41]" : "text-[#ff4444]"}`}>
                            {parseFloat(vault.pnl) >= 0 ? "+" : ""}${parseFloat(vault.pnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        {/* Max Withdrawable */}
                        <div className="text-right">
                          <div className="font-mono text-xs text-[#708090]">MAX WD</div>
                          <div className="font-mono text-sm text-white">
                            ${parseFloat(vault.maxWithdrawable).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="font-mono text-[#708090]">NO VAULTS</div>
                </div>
              )}
            </div>
          )}
        </TerminalContent>
      </TerminalCard>
    </div>
  )
}

