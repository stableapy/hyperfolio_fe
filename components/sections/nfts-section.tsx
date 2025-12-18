"use client"

import { useState, useMemo } from "react"
import { Grid3x3, List, Search, ExternalLink } from "lucide-react"
import { TerminalCard } from "../terminal-card"
import { LoadingSpinner } from "../loading-spinner"
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

const MOCK_NFTS: NFT[] = [
  {
    id: "1",
    name: "Cyber Punk #1234",
    collection: "Cyber Punks",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 2.5,
    usdPrice: 120.0,
    tokenId: "#1234",
  },
  {
    id: "2",
    name: "Matrix Ape #5678",
    collection: "Matrix Apes",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 1.8,
    usdPrice: 86.3,
    tokenId: "#5678",
  },
  {
    id: "3",
    name: "Neon Cat #9012",
    collection: "Neon Cats",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 0.5,
    usdPrice: 24.0,
    tokenId: "#9012",
  },
  {
    id: "4",
    name: "Glitch Art #3456",
    collection: "Glitch Collection",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 4.2,
    usdPrice: 201.3,
    tokenId: "#3456",
  },
  {
    id: "5",
    name: "Digital Dreams #7890",
    collection: "Digital Dreams",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 1.2,
    usdPrice: 57.5,
    tokenId: "#7890",
  },
  {
    id: "6",
    name: "Crypto Warrior #2345",
    collection: "Crypto Warriors",
    image: "/placeholder.svg?height=300&width=300",
    floorPrice: 3.8,
    usdPrice: 182.2,
    tokenId: "#2345",
  },
]

type ViewMode = "grid" | "list"

export function NFTsSection({ isLoading = false }: { isLoading?: boolean }) {
  const { wallets, walletData, selectedWalletId } = useWalletStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  // Get NFTs from selected wallet or all wallets
  const nfts = useMemo(() => {
    if (wallets.length === 0) return []
    
    if (selectedWalletId) {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet && walletData[wallet.address]?.nfts) {
        return transformNFTs(walletData[wallet.address].nfts)
      }
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
    
    return MOCK_NFTS
  }, [wallets, walletData, selectedWalletId])

  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708090]" />
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] placeholder:text-[#708090] focus:outline-none focus:border-[#00ff41] transition-colors"
          />
        </div>
        <div className="flex gap-2 bg-[#111618] border border-[#1a2225] rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid" ? "bg-[#1a2225] text-[#00ff41]" : "text-[#708090] hover:text-[#00ff41]"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="absolute top-2 right-2 p-2 bg-[#111618]/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-[#00d9ff]" />
                </a>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <div className="font-mono text-xs text-[#00ff41] font-semibold mb-0.5 truncate">{nft.name}</div>
                  <div className="font-mono text-[10px] text-[#708090] truncate">{nft.collection}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1a2225]">
                  <div>
                    <div className="font-mono text-[10px] text-[#708090]">FLOOR</div>
                    <div className="font-mono text-xs text-white">{nft.floorPrice.toFixed(2)} HYPE</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-[#708090]">VALUE</div>
                    <div className="font-mono text-xs text-[#00d9ff]">${nft.usdPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          ))}
        </div>
      ) : (
        <TerminalCard>
          <div className="divide-y divide-[#1a2225]">
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className="p-4 hover:bg-[#111618] transition-colors cursor-pointer group"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  {/* Left: Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-9 h-9 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-mono text-sm text-[#708090]">&gt;</span>
                      <div className="flex flex-col min-w-0">
                        <div className="font-mono text-sm text-[#00ff41] font-semibold truncate">{nft.name}</div>
                        <div className="font-mono text-xs text-[#708090] truncate">{nft.collection}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Floor Price */}
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#708090]">FLOOR</div>
                      <div className="font-mono text-sm text-white">{nft.floorPrice.toFixed(2)} HYPE</div>
                    </div>

                    {/* USD Value */}
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#708090]">VALUE</div>
                      <div className="font-mono text-sm text-[#00d9ff]">${nft.usdPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </div>

                    {/* External Link */}
                    <a
                      href={`https://opensea.io/assets/hyperevm/${nft.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#708090] hover:text-[#00d9ff] transition-colors opacity-0 group-hover:opacity-100"
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

      {filteredNFTs.length === 0 && (
        <div className="text-center py-12">
          <div className="font-mono text-[#708090] mb-2">NO NFTs FOUND</div>
          <div className="font-mono text-sm text-[#708090]">Try adjusting your search query</div>
        </div>
      )}
    </div>
  )
}
