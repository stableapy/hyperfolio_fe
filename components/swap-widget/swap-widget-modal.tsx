"use client"

import React, { useEffect } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EscCloseButton } from "@/components/ui/esc-close-button"
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
        <div className="font-mono text-theme-text-muted text-xs">loading swap widget...</div>
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
  const { theme, feeSetting, defaultSlippage, exactAmount } = useSwapConfig()
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
      <DialogContent className="w-[95vw] max-w-md lg:max-w-lg h-[90vh] sm:h-[750px] lg:h-[800px] p-0 bg-theme-card-bg border-theme-border/70 flex flex-col rounded-sm overflow-hidden" showCloseButton={false}>
        {/* Terminal window header */}
        <div className="flex items-center justify-between px-3 py-2 bg-theme-bg/50 border-b border-theme-border/50 flex-shrink-0">
          <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">
            swap --execute
          </span>
          <EscCloseButton onClick={() => onOpenChange(false)} />
        </div>
        
        <DialogHeader className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 border-b border-theme-border/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-xs sm:text-sm flex items-center gap-1.5">
              <span className="text-theme-accent font-bold">&gt;</span>
              <span className="text-theme-text-muted">--token</span>
              {fromToken ? (
                <span className="text-theme-accent font-bold">{fromToken.symbol}</span>
              ) : (
                <span className="text-theme-text-muted">any</span>
              )}
            </DialogTitle>
          </div>
          
          {/* Connected wallet info - terminal style */}
          {isConnected && address && (
            <div className="mt-2 flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-theme-bg/50 border border-theme-border/50 rounded-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm">{activeConnector ? getWalletIcon(activeConnector.name) : "💼"}</span>
                <div className="font-mono text-[10px] sm:text-xs">
                  <span className="text-theme-accent font-medium tabular-nums">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  {activeConnector && (
                    <span className="text-theme-text-muted ml-1.5 hidden sm:inline">via {activeConnector.name}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => disconnect()}
                className="px-2 py-0.5 text-[10px] font-mono text-[#dc3545] hover:bg-[#dc3545]/10 rounded-sm transition-colors border border-transparent hover:border-[#dc3545]/30"
              >
                --disconnect
              </button>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 pb-6 overflow-y-auto min-h-0 bg-theme-bg/30">
          <style jsx global>{`
            .kyberswap-widget-container {
              min-height: 600px;
              padding-bottom: 16px;
            }
            .kyberswap-widget-container * {
              scrollbar-width: thin !important;
              scrollbar-color: rgba(0,80,20,0.15) transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar {
              width: 4px !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-thumb {
              background: rgba(0,80,20,0.15) !important;
              border-radius: 2px !important;
            }
          `}</style>
          
          {!isConnected && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="font-mono text-theme-text-muted text-xs text-center max-w-md">
                {!injectedConnector ? (
                  <>
                    <span className="block mb-3"># no wallet extension detected</span>
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://rabby.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-accent hover:underline flex items-center justify-center gap-2"
                      >
                        🐰 install rabby →
                      </a>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-accent hover:underline flex items-center justify-center gap-2"
                      >
                        🦊 install metamask →
                      </a>
                    </div>
                  </>
                ) : (
                  "# connect wallet to swap"
                )}
              </div>
              
              {injectedConnector && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-theme-accent/10 border border-theme-accent/40 text-theme-accent font-mono text-xs font-medium rounded-sm hover:bg-theme-accent/20 transition-all disabled:opacity-50"
                >
                  {isConnecting ? "connecting..." : "--connect-wallet"}
                </button>
              )}
            </div>
          )}
          {isConnected && !isCorrectChain && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="font-mono text-[#e6a700] text-xs text-center max-w-md">
                # switch to hyperevm network
              </div>
              <div className="font-mono text-theme-text-muted text-[10px] text-center">
                current: chain_id={chainId}
              </div>
              <button
                type="button"
                onClick={handleSwitchChain}
                disabled={isSwitching}
                className="px-4 py-2 bg-theme-accent/10 border border-theme-accent/40 text-theme-accent font-mono text-xs font-medium rounded-sm hover:bg-theme-accent/20 transition-all disabled:opacity-50"
              >
                {isSwitching ? "switching..." : "--switch-network"}
              </button>
            </div>
          )}
          {isConnected && isCorrectChain && !isWidgetReady && (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-theme-text-muted text-xs">initializing...</div>
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
                defaultSlippage,
                exactAmount,
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

