"use client"

import React, { useEffect } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useKyberSwapTokenList } from "@/hooks/use-hyperevm-tokens"

// Module imports
import { useSwapConfig, useSwapWallet } from "./hooks"
import { getWalletIcon } from "./utils"
import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from "./constants"
import type { SwapWidgetModalProps } from "./types"

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

export function SwapWidgetModal({
  open,
  onOpenChange,
  fromToken,
  toToken,
}: SwapWidgetModalProps) {
  const { theme, feeSetting } = useSwapConfig()
  const {
    address,
    isConnected,
    chainId,
    activeConnector,
    ethersSigner,
    isCorrectChain,
    injectedConnector,
    handleConnect,
    handleSwitchChain,
    disconnect,
    isConnecting,
    isSwitching,
    isWidgetReady,
  } = useSwapWallet({ isOpen: open })
  
  const { tokenList } = useKyberSwapTokenList()

  // Debug: Log when fromToken changes
  useEffect(() => {
    console.log('SwapWidgetModal - fromToken prop:', fromToken)
    console.log('SwapWidgetModal - defaultTokenIn will be:', 
      fromToken?.address && fromToken.address !== '' 
        ? fromToken.address 
        : DEFAULT_FROM_TOKEN.address
    )
  }, [fromToken])

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
                onClick={handleSwitchChain}
                disabled={isSwitching}
                className="px-6 py-3 bg-[#00ff41] text-[#0a0e0f] font-mono text-sm font-medium rounded-lg hover:bg-[#00ff41]/90 transition-colors disabled:opacity-50"
              >
                {isSwitching ? "Switching..." : "Switch to HyperEVM"}
              </button>
            </div>
          )}
          {isConnected && isCorrectChain && !isWidgetReady && (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-[#708090]">Initializing swap widget...</div>
            </div>
          )}
          {isWidgetReady && (
            <div className="kyberswap-widget-container flex justify-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {React.createElement(KyberSwapWidget as any, {
                key: `swap-widget-${fromToken?.address || 'default'}-${open}`,
                client: "Hyperfolio",
                theme,
                title: <></>,
                tokenList: tokenList,
                enableRoute: true,
                enableDexes: "kyberswap-elastic,uniswapv3,uniswap",
                feeSetting,
                provider: ethersSigner,
                width: "100%",
                defaultTokenIn: fromToken?.address && fromToken.address !== '' 
                  ? fromToken.address 
                  : DEFAULT_FROM_TOKEN.address,
                defaultTokenOut: toToken?.address && toToken.address !== ''
                  ? toToken.address
                  : DEFAULT_TO_TOKEN.address,
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
      </DialogContent>
    </Dialog>
  )
}

