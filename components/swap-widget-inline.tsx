"use client"

import React, { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { useAccount, useConnect, useDisconnect, useConnectors } from "wagmi"
import { useEthersProvider, useEthersSigner } from "@/lib/wagmi/config"
import { useKyberSwapTokenList } from "@/hooks/use-hyperevm-tokens"
import { TerminalCard } from "./terminal-card"

// Dynamically import the KyberSwap widget to avoid SSR issues
const KyberSwapWidget = dynamic(
  () => import("@kyberswap/widgets").then((mod) => mod.Widget),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="font-mono text-[#708090]">Loading swap widget...</div>
      </div>
    ),
    ssr: false,
  }
)

// Default destination token: USDC on HyperEVM
const DEFAULT_TO_TOKEN = {
  address: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
  symbol: "USDC",
  chainId: 999,
}

// Get wallet icon based on connector name
function getWalletIcon(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("rabby")) return "🐰"
  if (lowerName.includes("metamask")) return "🦊"
  if (lowerName.includes("coinbase")) return "🔵"
  if (lowerName.includes("walletconnect")) return "🔗"
  if (lowerName.includes("trust")) return "🛡️"
  if (lowerName.includes("rainbow")) return "🌈"
  return "💼"
}

interface SwapWidgetInlineProps {
  fromToken?: {
    address: string
    symbol: string
    chainId: number
  }
  toToken?: {
    address: string
    symbol: string
    chainId: number
  }
}

export function SwapWidgetInline({
  fromToken,
  toToken,
}: SwapWidgetInlineProps) {
  const { address, isConnected, chainId, connector: activeConnector } = useAccount()
  const connectors = useConnectors()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const ethersProvider = useEthersProvider({ chainId: 999 })
  const ethersSigner = useEthersSigner({ chainId: 999 })
  const [isProviderReady, setIsProviderReady] = useState(false)
  
  // Get HyperEVM token list with caching
  const { tokenList } = useKyberSwapTokenList()

  // Get the injected connector (Rabby, MetaMask, etc.)
  const injectedConnector = useMemo(() => {
    return connectors.find((c) => c.type === 'injected' || c.id === 'injected')
  }, [connectors])

  // Handle connect - directly use injected wallet
  const handleConnect = () => {
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  // Check if provider and signer are ready
  useEffect(() => {
    const checkProvider = async () => {
      if (ethersProvider && ethersSigner) {
        try {
          await ethersProvider.getNetwork()
          await ethersSigner.getAddress()
          setIsProviderReady(true)
        } catch (error) {
          console.error("Provider not ready:", error)
          setIsProviderReady(false)
        }
      } else {
        setIsProviderReady(false)
      }
    }
    
    checkProvider()
  }, [ethersProvider, ethersSigner])

  // KyberSwap Widget theme - matching Hyperfolio design system
  const theme = useMemo(() => ({
    // Background colors - matching terminal-card
    primary: "#0a0e0f",
    secondary: "#111618",
    dialog: "#0a0e0f",
    // Rounded corners
    borderRadius: "8px",
    buttonRadius: "8px",
    // Borders - matching terminal-card
    stroke: "#1a2225",
    interactive: "#1a2225",
    // Accent color - Hyperfolio green
    accent: "#00ff41",
    success: "#00ff41",
    warning: "#ffaa00",
    error: "#ff4444",
    // Text colors
    text: "#ffffff",
    subText: "#708090",
    // Typography - Geist Mono
    fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
    boxShadow: "none",
  }), [])

  // Fee configuration (0.1% = 10 bps)
  const feeSetting = useMemo(() => ({
    feeAmount: 10,
    feeReceiver: "0x8A4a9A0B03E01AbE12e39e40fB14BbE625a0CF7A",
    chargeFeeBy: "currency_in" as const,
    isInBps: true,
  }), [])

  return (
    <TerminalCard>
      <div className="p-3">
        {/* Header with wallet info inline */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[#00ff41] text-xs flex items-center gap-1.5">
            <span className="text-[#708090]">&gt;</span>
            <span>SWAP</span>
            {fromToken && (
              <span className="text-[10px] text-[#708090]">({fromToken.symbol})</span>
            )}
          </div>
          
          {/* Wallet status - compact */}
          {isConnected && address ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{activeConnector ? getWalletIcon(activeConnector.name) : "💼"}</span>
              <span className="font-mono text-[10px] text-[#00ff41]">
                {address.slice(0, 4)}...{address.slice(-3)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-[9px] font-mono text-[#708090] hover:text-[#ff4444] transition-colors ml-1"
              >
                ✕
              </button>
            </div>
          ) : injectedConnector ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-2 py-0.5 text-[10px] font-mono text-[#00ff41] border border-[#00ff41]/30 rounded hover:bg-[#00ff41]/10 transition-colors disabled:opacity-50"
            >
              {isConnecting ? "..." : "Connect"}
            </button>
          ) : null}
        </div>
        
        <style jsx global>{`
          .kyberswap-widget-inline {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .kyberswap-widget-inline * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .kyberswap-widget-inline *::-webkit-scrollbar {
            display: none !important;
          }
          /* Target KyberSwap styled-components classes */
          .kyberswap-widget-inline [class^="sc-"][class*=" "] input,
          .kyberswap-widget-inline input[class^="sc-"] {
            font-size: 20px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"] {
            font-size: 13px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"] div {
            font-size: 13px !important;
          }
          .kyberswap-widget-inline span[class^="sc-"] {
            font-size: 13px !important;
          }
          /* Token selector buttons only (buttons with token images) */
          .kyberswap-widget-inline button[class^="sc-"]:has(img) {
            min-width: 100px !important;
            padding: 6px 8px !important;
            gap: 4px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) img {
            width: 18px !important;
            height: 18px !important;
            flex-shrink: 0 !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) svg {
            flex-shrink: 0 !important;
            width: 14px !important;
            height: 14px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) div {
            margin: 0 4px !important;
          }
          /* Select a token button (no img, has span) */
          .kyberswap-widget-inline button[class^="sc-"]:has(span) {
            min-width: 120px !important;
            padding: 6px 8px !important;
          }
        `}</style>
        
        {!isConnected && !injectedConnector && (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="font-mono text-[#708090] text-[10px] text-center">
              No wallet detected
            </div>
            <div className="flex gap-3">
              <a
                href="https://rabby.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#00ff41] hover:underline"
              >
                🐰 Rabby
              </a>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#00ff41] hover:underline"
              >
                🦊 MetaMask
              </a>
            </div>
          </div>
        )}
        
        {!isConnected && injectedConnector && (
          <div className="flex items-center justify-center py-6">
            <div className="font-mono text-[#708090] text-[10px]">
              Connect wallet to swap
            </div>
          </div>
        )}
        
        {isConnected && !isProviderReady && (
          <div className="flex items-center justify-center py-4">
            <div className="font-mono text-[#708090] text-[10px]">Initializing...</div>
          </div>
        )}
        
        {isConnected && isProviderReady && ethersProvider && ethersSigner && address && (
          <div className="kyberswap-widget-inline">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {React.createElement(KyberSwapWidget as any, {
              key: `swap-inline-${fromToken?.address || 'default'}`,
              client: "Hyperfolio",
              theme,
              title: <></>, // Hide the default "Swap" title
              tokenList: tokenList, // HyperEVM tokens from HyperSwap Labs
              enableRoute: true,
              enableDexes: "kyberswap-elastic,uniswapv3,uniswap",
              feeSetting,
              provider: ethersSigner,
              width: "100%",
              defaultTokenIn: fromToken?.address || undefined,
              defaultTokenOut: toToken?.address || DEFAULT_TO_TOKEN.address,
              chainId: chainId || 999,
              connectedAccount: {
                address: address,
                chainId: chainId || 999,
              },
              /* eslint-disable @typescript-eslint/no-explicit-any */
              onSubmitTx: async (txData: any) => {
              /* eslint-enable @typescript-eslint/no-explicit-any */
                try {
                  console.log("Transaction data received:", txData)
                  
                  if (typeof txData === 'string') {
                    return txData
                  }
                  
                  if (ethersSigner) {
                    console.log("Sending transaction through signer...")
                    const tx = await ethersSigner.sendTransaction({
                      to: txData.to,
                      from: txData.from,
                      value: txData.value,
                      data: txData.data,
                      gasLimit: txData.gasLimit,
                    })
                    console.log("Transaction sent:", tx.hash)
                    
                    await tx.wait()
                    console.log("Transaction confirmed:", tx.hash)
                    
                    return tx.hash
                  }
                  
                  return txData?.hash || ''
                } catch (error) {
                  console.error("Transaction error:", error)
                  throw error
                }
            },
            })}
          </div>
        )}
      </div>
    </TerminalCard>
  )
}
