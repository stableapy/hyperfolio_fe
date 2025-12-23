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
      <DialogContent className="w-[95vw] max-w-[380px] sm:max-w-[420px] max-h-[85vh] p-0 bg-theme-card-bg border-theme-border/70 flex flex-col rounded-sm overflow-hidden" showCloseButton={false}>
        {/* Compact terminal header with wallet info inline */}
        <DialogHeader className="px-3 py-1.5 bg-theme-bg/50 border-b border-theme-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-[10px] flex items-center gap-1">
              <span className="text-theme-accent font-bold">&gt;</span>
              <span className="text-theme-text-muted">swap</span>
              {fromToken && (
                <span className="text-theme-accent font-bold ml-0.5">{fromToken.symbol}</span>
              )}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* Compact wallet info */}
              {isConnected && address && (
                <div className="flex items-center gap-1 bg-theme-bg/50 border border-theme-border/50 px-1.5 py-0.5 rounded-sm">
                  <span className="text-[10px]">{activeConnector ? getWalletIcon(activeConnector.name) : "💼"}</span>
                  <span className="font-mono text-[9px] text-theme-accent tabular-nums">
                    {address.slice(0, 4)}...{address.slice(-3)}
                  </span>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="text-[8px] font-mono text-theme-text-muted hover:text-[#dc3545] transition-colors ml-0.5"
                  >
                    ✕
                  </button>
                </div>
              )}
              <EscCloseButton onClick={() => onOpenChange(false)} />
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 px-2 py-1.5 overflow-y-auto min-h-0 bg-theme-bg/30">
          <style jsx global>{`
            .kyberswap-widget-container {
              padding-bottom: 8px;
            }
            .kyberswap-widget-container > div {
              box-shadow: none !important;
            }
            /* Remove all shadows from widget elements */
            .kyberswap-widget-container [class^="sc-"],
            .kyberswap-widget-container [class*=" sc-"],
            .kyberswap-widget-container div[class^="sc-"],
            .kyberswap-widget-container > div > div {
              box-shadow: none !important;
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
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="font-mono text-theme-text-muted text-[10px] text-center">
                {!injectedConnector ? (
                  <>
                    <span className="block mb-2"># no wallet detected</span>
                    <div className="flex gap-3">
                      <a
                        href="https://rabby.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-accent hover:underline"
                      >
                        🐰 rabby
                      </a>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-accent hover:underline"
                      >
                        🦊 metamask
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
                  className="px-3 py-1.5 bg-theme-accent/10 border border-theme-accent/40 text-theme-accent font-mono text-[10px] font-medium rounded-sm hover:bg-theme-accent/20 transition-all disabled:opacity-50"
                >
                  {isConnecting ? "..." : "--connect"}
                </button>
              )}
            </div>
          )}
          {isConnected && !isCorrectChain && (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="font-mono text-[#e6a700] text-[10px] text-center">
                # switch to hyperevm
              </div>
              <button
                type="button"
                onClick={handleSwitchChain}
                disabled={isSwitching}
                className="px-3 py-1.5 bg-theme-accent/10 border border-theme-accent/40 text-theme-accent font-mono text-[10px] font-medium rounded-sm hover:bg-theme-accent/20 transition-all disabled:opacity-50"
              >
                {isSwitching ? "switching..." : "--switch-network"}
              </button>
            </div>
          )}
          {isConnected && isCorrectChain && !isWidgetReady && (
            <div className="flex items-center justify-center py-6">
              <div className="font-mono text-theme-text-muted text-[10px]">initializing...</div>
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

