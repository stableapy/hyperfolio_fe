// Types for NFTs Section components

export interface NFT {
  id: string
  name: string
  collection: string
  image: string
  floorPrice: number
  usdPrice: number
  tokenId: string
}

export type ViewMode = "grid" | "list"

export interface NFTsSectionProps {
  isLoading?: boolean
}

export interface NFTSummaryCardsProps {
  totalValue: number
  nftCount: number
  showSkeleton: boolean
}

export interface NFTSearchControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export interface NFTGridViewProps {
  nfts: NFT[]
  showSkeleton: boolean
}

export interface NFTListViewProps {
  nfts: NFT[]
  showSkeleton: boolean
}

export interface NFTGridCardProps {
  nft: NFT
}

export interface NFTListItemProps {
  nft: NFT
}

export interface NFTEmptyStateProps {
  hasSearchQuery: boolean
}

export interface NFTTotals {
  totalValue: number
  nftCount: number
}

