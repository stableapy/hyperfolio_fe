// NFT transformation utilities
import { safeFloat } from '../parsers'

export interface NFTDisplay {
  id: string
  name: string
  collection: string
  image: string
  floorPrice: number
  usdPrice: number
  tokenId: string
}

/**
 * Transform NFTs from API response to display format
 */
export function transformNFTs(nftsData: any): NFTDisplay[] {
  if (!nftsData?.data?.nfts) return []

  return nftsData.data.nfts.map((nft: any) => ({
    id: `${nft.address}-${nft.token_id}`,
    name: nft.name,
    collection: nft.collection_name,
    image: nft.image_url || '',
    floorPrice: nft.floor_price || 0,
    usdPrice: safeFloat(nft.usdPrice ?? nft.usdValue),
    tokenId: nft.token_id,
  }))
}
