"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useKyberSwapTokenList } from "@/hooks/use-hyperevm-tokens"
import { TerminalCard } from "@/components/ui/terminal-card"

// Module imports
import { useSwapConfig, useSwapWallet } from "./hooks"
import { getWalletIcon } from "./utils"
import { DEFAULT_TO_TOKEN } from "./constants"
import type { SwapWidgetInlineProps } from "./types"

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

export function SwapWidgetInline({
  fromToken,
  toToken,
}: SwapWidgetInlineProps) {
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
  } = useSwapWallet()
  
  const { tokenList } = useKyberSwapTokenList()

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
        
        {isConnected && !isCorrectChain && (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="font-mono text-[#ffaa00] text-[10px] text-center">
              ⚠️ Switch to HyperEVM
            </div>
            <button
              type="button"
              onClick={handleSwitchChain}
              disabled={isSwitching}
              className="px-3 py-1 text-[10px] font-mono text-[#00ff41] border border-[#00ff41]/30 rounded hover:bg-[#00ff41]/10 transition-colors disabled:opacity-50"
            >
              {isSwitching ? "Switching..." : "Switch Network"}
            </button>
          </div>
        )}
        
        {isConnected && isCorrectChain && !isWidgetReady && (
          <div className="flex items-center justify-center py-4">
            <div className="font-mono text-[#708090] text-[10px]">Initializing...</div>
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

