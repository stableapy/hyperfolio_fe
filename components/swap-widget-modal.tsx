"use client"

import React, { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAccount, useConnect, useDisconnect, useConnectors, useSwitchChain } from "wagmi"
import { useEthersProvider, useEthersSigner } from "@/lib/wagmi/config"
import { useKyberSwapTokenList } from "@/hooks/use-hyperevm-tokens"

// HyperEVM chain ID
const HYPEREVM_CHAIN_ID = 999

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

interface SwapWidgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function SwapWidgetModal({
  open,
  onOpenChange,
  fromToken,
  toToken,
}: SwapWidgetModalProps) {
  const { address, isConnected, chainId, connector: activeConnector } = useAccount()
  const connectors = useConnectors()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  
  // Get provider/signer for current chain (not filtered by chainId)
  const ethersProvider = useEthersProvider()
  const ethersSigner = useEthersSigner()
  const [isProviderReady, setIsProviderReady] = useState(false)
  
  // Prevent StrictMode double-render from causing AbortController issues
  // Only render widget after component has fully mounted
  const [hasMounted, setHasMounted] = useState(false)
  
  // Check if user is on the correct chain (HyperEVM)
  const isCorrectChain = chainId === HYPEREVM_CHAIN_ID
  
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

  // Debug: Log when fromToken changes
  useEffect(() => {
    console.log('SwapWidgetModal - fromToken prop:', fromToken)
    console.log('SwapWidgetModal - defaultTokenIn will be:', fromToken?.address || undefined)
  }, [fromToken])

  // Wait for component to fully mount before rendering widget
  // This prevents React 18 StrictMode double-render from causing AbortController issues
  useEffect(() => {
    if (!open) {
      setHasMounted(false)
      return
    }
    
    const timer = setTimeout(() => {
      setHasMounted(true)
    }, 100) // Small delay to skip StrictMode's double-invoke cycle
    
    return () => clearTimeout(timer)
  }, [open])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md lg:max-w-lg h-[90vh] sm:h-[750px] lg:h-[800px] p-0 bg-[#0a0e0f] border-[#1a2225] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-[#1a2225] flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-[#00ff41] text-sm sm:text-base">
              SWAP TOKENS
              {fromToken && (
                <span className="ml-2 text-[10px] sm:text-xs text-[#708090]">
                  (from {fromToken.symbol})
                </span>
              )}
            </DialogTitle>
          </div>
          
          {/* Connected wallet info with disconnect button */}
          {isConnected && address && (
            <div className="mt-2 flex items-center justify-between gap-2 sm:gap-3 p-1.5 sm:p-2 bg-[#111618] rounded-lg border border-[#1a2225]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base">{activeConnector ? getWalletIcon(activeConnector.name) : "💼"}</span>
                <div className="font-mono text-[10px] sm:text-xs">
                  <span className="text-[#00ff41]">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  {activeConnector && (
                    <span className="text-[#708090] ml-1 sm:ml-2 hidden sm:inline">via {activeConnector.name}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => disconnect()}
                className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono text-[#ff4444] hover:bg-[#ff4444]/10 rounded transition-colors border border-transparent hover:border-[#ff4444]/30"
              >
                Disconnect
              </button>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 pb-6 overflow-y-auto min-h-0">
          <style jsx global>{`
            .kyberswap-widget-container {
              min-height: 600px;
              padding-bottom: 16px;
            }
            .kyberswap-widget-container * {
              scrollbar-width: thin !important;
              scrollbar-color: #1a2225 transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar {
              width: 4px !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-thumb {
              background: #1a2225 !important;
              border-radius: 2px !important;
            }
          `}</style>
          
          {!isConnected && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="font-mono text-[#708090] text-sm text-center max-w-md">
                {!injectedConnector ? (
                  <>
                    No wallet extension detected. Please install a Web3 wallet.
                    <div className="flex flex-col gap-2 mt-4">
                      <a
                        href="https://rabby.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ff41] hover:underline flex items-center justify-center gap-2"
                      >
                        🐰 Install Rabby Wallet →
                      </a>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ff41] hover:underline flex items-center justify-center gap-2"
                      >
                        🦊 Install MetaMask →
                      </a>
                    </div>
                  </>
                ) : (
                  "Connect your wallet to swap tokens"
                )}
              </div>
              
              {injectedConnector && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] font-mono text-sm font-medium rounded-lg hover:bg-[#00ff41]/90 transition-colors disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          )}
          {isConnected && !isCorrectChain && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="font-mono text-[#ffaa00] text-sm text-center max-w-md">
                ⚠️ Please switch to HyperEVM network to swap tokens
              </div>
              <div className="font-mono text-[#708090] text-xs text-center">
                Current network: Chain ID {chainId}
              </div>
              <button
                type="button"
                onClick={() => switchChain({ chainId: HYPEREVM_CHAIN_ID })}
                disabled={isSwitching}
                className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] font-mono text-sm font-medium rounded-lg hover:bg-[#00ff41]/90 transition-colors disabled:opacity-50"
              >
                {isSwitching ? "Switching..." : "Switch to HyperEVM"}
              </button>
            </div>
          )}
          {isConnected && isCorrectChain && (!isProviderReady || !hasMounted) && (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-[#708090]">Initializing swap widget...</div>
            </div>
          )}
          {isConnected && isCorrectChain && isProviderReady && hasMounted && ethersProvider && ethersSigner && address && (
            <div className="kyberswap-widget-container flex justify-center">
              {/* KyberSwap widget type definitions are incomplete, using createElement with any cast */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {React.createElement(KyberSwapWidget as any, {
                key: `swap-widget-${fromToken?.address || 'default'}-${open}`, // Force re-render when token changes
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
                    
                    // If txData is already a hash string, return it
                    if (typeof txData === 'string') {
                      return txData
                    }
                    
                    // If we have a signer, send the transaction
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
                      
                      // Wait for transaction to be mined
                      await tx.wait()
                      console.log("Transaction confirmed:", tx.hash)
                      
                      return tx.hash
                    }
                    
                    // Fallback - return hash if available
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
      </DialogContent>
    </Dialog>
  )
}

