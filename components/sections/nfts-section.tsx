"use client"

import { useState, useMemo } from "react"
import { Grid3x3, List, Search, ExternalLink } from "lucide-react"
import { TerminalCard, TerminalContent } from "../terminal-card"
import { useWalletStore } from "@/lib/store/wallet-store"
import { transformNFTs } from "@/lib/utils/data-transformers"

interface NFT {
  id: string
  name: string
  collection: string
  image: string
  floorPrice: number
  usdPrice: number
  tokenId: string
}

type ViewMode = "grid" | "list"

export function NFTsSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  // Get NFTs from selected wallet or all wallets - no mock data
  const nfts = useMemo(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.nfts) {
        return transformNFTs(walletData[wallet.address].nfts)
      }
      return [] // No data yet
    } else {
      // Aggregate NFTs from all wallets
      const allNFTs: NFT[] = []
      wallets.forEach(wallet => {
        if (walletData[wallet.address]?.nfts) {
          allNFTs.push(...transformNFTs(walletData[wallet.address].nfts))
        }
      })
      return allNFTs
    }
  }, [wallets, walletData, selectedWalletId])
  
  // Check if we have any data loaded
  const hasData = nfts.length > 0

  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Show skeleton when loading and no data yet
  const showSkeleton = isLoading && !hasData

  // Calculate totals
  const totals = useMemo(() => {
    const totalValue = filteredNFTs.reduce((sum, nft) => sum + nft.usdPrice, 0)
    const nftCount = filteredNFTs.length
    return { totalValue, nftCount }
  }, [filteredNFTs])

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <TerminalCard>
          <TerminalContent className="p-3 sm:p-4">
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">VALUE</div>
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
            <div className="font-mono text-[10px] sm:text-xs text-[#708090] mb-1 sm:mb-2">COUNT</div>
            {showSkeleton ? (
              <div className="h-5 sm:h-7 w-10 sm:w-16 bg-[#1a2225] rounded animate-pulse" />
            ) : (
              <div className="font-mono text-base sm:text-xl text-white font-semibold">
                {totals.nftCount}
              </div>
            )}
          </TerminalContent>
        </TerminalCard>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid" ? "bg-[#1a2225] text-[#00ff41]" : "text-[#708090] hover:text-[#00ff41]"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list" ? "bg-[#1a2225] text-[#00ff41]" : "text-[#708090] hover:text-[#00ff41]"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Show skeletons when loading and no data */}
          {showSkeleton && (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TerminalCard key={i}>
                  <div className="animate-pulse">
                    <div className="aspect-square bg-[#1a2225]" />
                    <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                      <div className="h-3 sm:h-4 w-3/4 bg-[#1a2225] rounded" />
                      <div className="h-2.5 sm:h-3 w-1/2 bg-[#1a2225] rounded" />
                      <div className="flex justify-between pt-1.5 sm:pt-2 border-t border-[#1a2225]">
                        <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
                        <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#1a2225] rounded" />
                      </div>
                    </div>
                  </div>
                </TerminalCard>
              ))}
            </>
          )}
          
          {filteredNFTs.map((nft) => (
            <TerminalCard key={nft.id} className="group cursor-pointer hover:border-[#00ff41] transition-all">
              <div className="relative aspect-square overflow-hidden bg-[#0a0e0f]">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e0f] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <a
                  href={`https://opensea.io/assets/hyperevm/${nft.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-[#111618]/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-[#00d9ff]" />
                </a>
              </div>
              <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                <div>
                  <div className="font-mono text-[11px] sm:text-xs text-[#00ff41] font-semibold mb-0.5 truncate">{nft.name}</div>
                  <div className="font-mono text-[9px] sm:text-[10px] text-[#708090] truncate">{nft.collection}</div>
                </div>
                <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#1a2225]">
                  <div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#708090]">FLOOR</div>
                    <div className="font-mono text-[10px] sm:text-xs text-white">{nft.floorPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#708090]">VALUE</div>
                    <div className="font-mono text-[10px] sm:text-xs text-[#00ff41] font-medium">
                      ${nft.usdPrice >= 1000 ? `${(nft.usdPrice / 1000).toFixed(1)}K` : nft.usdPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          ))}
        </div>
      ) : (
        <TerminalCard>
          <div className="divide-y divide-[#1a2225]">
            {/* Show skeletons when loading and no data */}
            {showSkeleton && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-2.5 sm:p-4 animate-pulse">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#1a2225]" />
                        <div className="flex flex-col gap-1">
                          <div className="h-3 sm:h-4 w-24 sm:w-32 bg-[#1a2225] rounded" />
                          <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-[#1a2225] rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-14 sm:w-16 bg-[#1a2225] rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className="p-2.5 sm:p-4 hover:bg-[#111618] transition-colors cursor-pointer group"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Left: Info */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-semibold truncate">{nft.name}</div>
                      <div className="font-mono text-[10px] sm:text-xs text-[#708090] truncate">{nft.collection}</div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    {/* Floor Price - hidden on mobile */}
                    <div className="hidden sm:block text-right">
                      <div className="font-mono text-[10px] text-[#556070]">FLOOR</div>
                      <div className="font-mono text-xs text-[#708090]">{nft.floorPrice.toFixed(2)}</div>
                    </div>

                    {/* USD Value */}
                    <div className="font-mono text-xs sm:text-sm text-[#00ff41] font-bold min-w-[50px] text-right">
                      ${nft.usdPrice >= 1000 ? `${(nft.usdPrice / 1000).toFixed(1)}K` : nft.usdPrice.toFixed(2)}
                    </div>

                    {/* External Link - hidden on mobile */}
                    <a
                      href={`https://opensea.io/assets/hyperevm/${nft.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:block text-[#708090] hover:text-[#00d9ff] transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TerminalCard>
      )}

      {filteredNFTs.length === 0 && !showSkeleton && (
        <div className="text-center py-8 sm:py-12">
          <div className="font-mono text-xs sm:text-sm text-[#708090] mb-1 sm:mb-2">
            {searchQuery ? "NO NFTs FOUND" : "NO NFTs"}
          </div>
          <div className="font-mono text-[10px] sm:text-sm text-[#556070]">
            {searchQuery ? "Try adjusting your search query" : "No NFTs in this wallet"}
          </div>
        </div>
      )}
    </div>
  )
}
