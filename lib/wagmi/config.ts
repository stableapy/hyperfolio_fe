"use client"

import { useMemo } from "react"
import { createConfig, http, cookieStorage, createStorage, useWalletClient } from "wagmi"
import { mainnet, sepolia, arbitrum, optimism } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import { BrowserProvider, JsonRpcSigner } from "ethers"
import type { Account, Chain, Client, Transport } from "viem"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Get HyperEVM chain config if available
const getHyperEVMChain = () => {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 999
  
  return {
    id: chainId,
    name: process.env.NEXT_PUBLIC_NETWORK_NAME || "HyperEVM",
    nativeCurrency: {
      decimals: 18,
      name: "ETH",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_API_URL?.replace("api.", "rpc.") || "https://rpc.hyperlend.finance"],
      },
    },
    blockExplorers: {
      default: {
        name: "HyperEVM Explorer",
        url: "https://explorer.hyperevm.com",
      },
    },
  }
}

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum, optimism, getHyperEVMChain()],
  connectors: [
    // Generic injected connector - detects any injected wallet (Rabby, MetaMask, Coinbase, etc.)
    injected(),
    // WalletConnect for mobile wallets and QR code scanning
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [999]: http(process.env.NEXT_PUBLIC_API_URL?.replace("api.", "rpc.") || "https://rpc.hyperlend.finance"),
  },
})

// Convert Viem client to Ethers provider for KyberSwap
export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  
  if (transport.type === 'fallback') {
    return new BrowserProvider(transport.transports[0].value, network)
  }
  return new BrowserProvider(transport, network)
}

// Convert Viem wallet client to Ethers signer
export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

// Hook to get Ethers provider from Wagmi
// Note: Don't pass chainId to useWalletClient - it returns undefined if wallet isn't on that chain
// Instead, we get the current wallet client and the widget handles chain switching
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  // Get wallet client for current chain (not filtered by chainId)
  const { data: walletClient } = useWalletClient()
  return useMemo(
    () => (walletClient ? clientToProvider(walletClient) : undefined),
    [walletClient]
  )
}

// Hook to get Ethers signer from Wagmi
// Note: Don't pass chainId to useWalletClient - it returns undefined if wallet isn't on that chain
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  // Get wallet client for current chain (not filtered by chainId)
  const { data: walletClient } = useWalletClient()
  return useMemo(
    () => (walletClient ? clientToSigner(walletClient) : undefined),
    [walletClient]
  )
}

