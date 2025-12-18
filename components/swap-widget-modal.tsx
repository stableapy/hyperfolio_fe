"use client"

import React, { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAccount, useConnect } from "wagmi"
import { useEthersProvider, useEthersSigner } from "@/lib/wagmi/config"

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
  const { address, isConnected, chainId } = useAccount()
  const { connectors, connect } = useConnect()
  // Use chainId from account or default to 999 (HyperEVM)
  const ethersProvider = useEthersProvider({ chainId: 999 })
  const ethersSigner = useEthersSigner({ chainId: 999 })
  const [isProviderReady, setIsProviderReady] = useState(false)

  // Debug: Log when fromToken changes
  useEffect(() => {
    console.log('SwapWidgetModal - fromToken prop:', fromToken)
    console.log('SwapWidgetModal - defaultTokenIn will be:', fromToken?.address || undefined)
  }, [fromToken])

  // Handle wallet connection when modal opens
  useEffect(() => {
    if (open && !isConnected && connectors.length > 0) {
      // Try to connect with the first available connector (usually injected/MetaMask)
      const injectedConnector = connectors.find((c) => c.name === "MetaMask" || c.name === "Injected")
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      }
    }
  }, [open, isConnected, connectors, connect])

  // Check if provider and signer are ready
  useEffect(() => {
    const checkProvider = async () => {
      if (ethersProvider && ethersSigner) {
        try {
          // Ensure provider is initialized by checking network
          await ethersProvider.getNetwork()
          // Ensure signer can get address
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

  // KyberSwap Widget theme configuration to match portfolio design
  const theme = useMemo(() => ({
    primary: "#0a0e0f",
    secondary: "#111618",
    dialog: "#0a0e0f",
    borderRadius: "12px",
    buttonRadius: "8px",
    stroke: "#1a2225",
    interactive: "#1a2225",
    accent: "#00ff41",
    success: "#00ff41",
    warning: "#ffaa00",
    error: "#ff4444",
    text: "#ffffff",
    subText: "#708090",
    fontFamily: "monospace",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    // Make fonts smaller
    fontSize: {
      large: "14px",
      medium: "12px",
      small: "11px",
    },
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
      <DialogContent className="max-w-3xl h-[700px] overflow-hidden p-0 bg-[#0a0e0f] border-[#1a2225]">
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-[#1a2225]">
          <DialogTitle className="font-mono text-[#00ff41] text-base">
            SWAP TOKENS
            {fromToken && (
              <span className="ml-2 text-xs text-[#708090]">
                (from {fromToken.symbol})
              </span>
            )}
          </DialogTitle>
          {isConnected && address && (
            <div className="mt-1 font-mono text-xs text-[#708090]">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </DialogHeader>
        
        <div className="h-[calc(700px-65px)] px-4 py-3 overflow-hidden">
          <style jsx global>{`
            .kyberswap-widget-container {
              height: 100%;
            }
            .kyberswap-widget-container * {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar {
              display: none !important;
            }
          `}</style>
          {!isConnected && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="font-mono text-[#708090] text-sm text-center max-w-md">
                {connectors.length === 0 ? (
                  <>
                    No wallet extension detected. Please install MetaMask or another Web3 wallet.
                    <br />
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ff41] hover:underline mt-2 inline-block"
                    >
                      Install MetaMask →
                    </a>
                  </>
                ) : (
                  "Please connect your wallet to use the swap widget"
                )}
              </div>
              {connectors.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      type="button"
                      onClick={() => connect({ connector })}
                      className="px-4 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-sm text-[#00ff41] hover:border-[#00ff41] transition-colors"
                    >
                      Connect {connector.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isConnected && !isProviderReady && (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-[#708090]">Initializing swap widget...</div>
            </div>
          )}
          {isConnected && isProviderReady && ethersProvider && ethersSigner && address && (
            <div className="kyberswap-widget-container flex justify-center h-full">
              {/* KyberSwap widget type definitions are incomplete, using createElement with any cast */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {React.createElement(KyberSwapWidget as any, {
                key: `swap-widget-${fromToken?.address || 'default'}-${open}`, // Force re-render when token changes
                client: "Hyperfolio",
                theme,
                tokenList: [],
                enableRoute: true,
                enableDexes: "kyberswap-elastic,uniswapv3,uniswap",
                feeSetting,
                provider: ethersSigner,
                width: 700,
                defaultTokenIn: fromToken?.address || undefined,
                defaultTokenOut: toToken?.address || undefined,
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

