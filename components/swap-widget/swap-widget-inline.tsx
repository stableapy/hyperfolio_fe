"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useKyberSwapTokenList } from "@/hooks/use-hyperevm-tokens"
import { TerminalCard } from "@/components/ui/terminal-card"

// Module imports
import { useSwapConfig, useSwapWallet } from "./hooks"
import { getWalletIcon } from "./utils"
import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from "./constants"
import type { SwapWidgetInlineProps } from "./types"

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

export function SwapWidgetInline({
  fromToken,
  toToken,
}: SwapWidgetInlineProps) {
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
  } = useSwapWallet()
  
  const { tokenList } = useKyberSwapTokenList()

  return (
    <TerminalCard showHeader compact title="swap --execute" className="overflow-visible">
      <div className="px-2 pt-1.5 pb-1">
        {/* Compact header with wallet info */}
        <div className="flex items-center justify-between mb-1">
          <div className="font-mono text-[10px] flex items-center gap-1">
            <span className="text-theme-accent font-bold">&gt;</span>
            <span className="text-theme-text-muted">--token</span>
            {fromToken ? (
              <span className="text-theme-accent font-bold">{fromToken.symbol}</span>
            ) : (
              <span className="text-theme-text-muted">any</span>
            )}
          </div>
          
          {/* Wallet status - compact */}
          {isConnected && address ? (
            <div className="flex items-center gap-1 bg-theme-bg/50 border border-theme-border/50 px-1 py-0.5 rounded-sm">
              <span className="text-[10px]">{activeConnector ? getWalletIcon(activeConnector.name) : "💼"}</span>
              <span className="font-mono text-[9px] text-theme-accent tabular-nums">
                {address.slice(0, 4)}...{address.slice(-3)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-[8px] font-mono text-theme-text-muted hover:text-[#dc3545] transition-colors"
              >
                ✕
              </button>
            </div>
          ) : injectedConnector ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-1.5 py-0.5 text-[9px] font-mono text-theme-accent border border-theme-accent/40 rounded-sm hover:bg-theme-accent/10 transition-colors disabled:opacity-50"
            >
              {isConnecting ? "..." : "--connect"}
            </button>
          ) : null}
        </div>
        
        <style jsx global>{`
          .kyberswap-widget-inline {
            width: 100%;
            display: flex;
            justify-content: center;
            transform: scale(0.92);
            transform-origin: top center;
            margin-bottom: -30px;
          }
          .kyberswap-widget-inline > div {
            width: 100% !important;
            box-shadow: none !important;
          }
          /* Remove all shadows from widget elements */
          .kyberswap-widget-inline [class^="sc-"],
          .kyberswap-widget-inline [class*=" sc-"],
          .kyberswap-widget-inline div[class^="sc-"],
          .kyberswap-widget-inline > div > div {
            box-shadow: none !important;
          }
          .kyberswap-widget-inline * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .kyberswap-widget-inline *::-webkit-scrollbar {
            display: none !important;
          }
          /* Reduce overall padding in widget */
          .kyberswap-widget-inline [class^="sc-"] {
            font-size: 12px !important;
          }
          /* Target KyberSwap styled-components classes */
          .kyberswap-widget-inline [class^="sc-"][class*=" "] input,
          .kyberswap-widget-inline input[class^="sc-"] {
            font-size: 18px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"] {
            font-size: 11px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"] div {
            font-size: 11px !important;
          }
          .kyberswap-widget-inline span[class^="sc-"] {
            font-size: 11px !important;
          }
          /* Token selector buttons only (buttons with token images) */
          .kyberswap-widget-inline button[class^="sc-"]:has(img) {
            min-width: 90px !important;
            padding: 4px 6px !important;
            gap: 3px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) img {
            width: 16px !important;
            height: 16px !important;
            flex-shrink: 0 !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) svg {
            flex-shrink: 0 !important;
            width: 12px !important;
            height: 12px !important;
          }
          .kyberswap-widget-inline button[class^="sc-"]:has(img) div {
            margin: 0 3px !important;
          }
          /* Select a token button (no img, has span) */
          .kyberswap-widget-inline button[class^="sc-"]:has(span) {
            min-width: 100px !important;
            padding: 4px 6px !important;
          }
        `}</style>
        
        {!isConnected && !injectedConnector && (
          <div className="flex flex-col items-center justify-center py-3 space-y-1.5">
            <div className="font-mono text-theme-text-muted text-[9px]">
              # no wallet detected
            </div>
            <div className="flex gap-2">
              <a
                href="https://rabby.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-mono text-theme-accent hover:underline"
              >
                🐰 rabby
              </a>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-mono text-theme-accent hover:underline"
              >
                🦊 metamask
              </a>
            </div>
          </div>
        )}
        
        {!isConnected && injectedConnector && (
          <div className="flex items-center justify-center py-4">
            <div className="font-mono text-theme-text-muted text-[9px]">
              # connect wallet to swap
            </div>
          </div>
        )}
        
        {isConnected && !isCorrectChain && (
          <div className="flex flex-col items-center justify-center py-3 space-y-1.5">
            <div className="font-mono text-[#e6a700] text-[9px]">
              # switch to hyperevm
            </div>
            <button
              type="button"
              onClick={handleSwitchChain}
              disabled={isSwitching}
              className="px-1.5 py-0.5 text-[9px] font-mono text-theme-accent border border-theme-accent/40 rounded-sm hover:bg-theme-accent/10 transition-colors disabled:opacity-50"
            >
              {isSwitching ? "switching..." : "--switch-network"}
            </button>
          </div>
        )}
        
        {isConnected && isCorrectChain && !isWidgetReady && (
          <div className="flex items-center justify-center py-3">
            <div className="font-mono text-theme-text-muted text-[9px]">initializing...</div>
          </div>
        )}
        
        {isWidgetReady && (
          <div className="kyberswap-widget-inline">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {React.createElement(KyberSwapWidget as any, {
              key: `swap-inline-${fromToken?.address || 'default'}`,
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
    </TerminalCard>
  )
}

