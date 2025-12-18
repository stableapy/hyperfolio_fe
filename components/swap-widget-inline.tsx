"use client"

import React, { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { useAccount, useConnect } from "wagmi"
import { useEthersProvider, useEthersSigner } from "@/lib/wagmi/config"
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
  const { address, isConnected, chainId } = useAccount()
  const { connectors, connect } = useConnect()
  const ethersProvider = useEthersProvider({ chainId: 999 })
  const ethersSigner = useEthersSigner({ chainId: 999 })
  const [isProviderReady, setIsProviderReady] = useState(false)

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
    <TerminalCard>
      <div className="p-4">
        <div className="font-mono text-[#00ff41] text-sm mb-4 flex items-center gap-2">
          <span className="text-[#708090]">&gt;</span>
          SWAP TOKENS
          {fromToken && (
            <span className="text-xs text-[#708090]">
              (from {fromToken.symbol})
            </span>
          )}
        </div>
        
        {isConnected && address && (
          <div className="mb-3 font-mono text-xs text-[#708090]">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
        
        <style jsx global>{`
          .kyberswap-widget-inline {
            width: 100%;
          }
          .kyberswap-widget-inline * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .kyberswap-widget-inline *::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>
        
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="font-mono text-[#708090] text-xs text-center">
              {connectors.length === 0 ? (
                <>
                  No wallet detected.
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
                "Connect wallet to swap"
              )}
            </div>
            {connectors.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {connectors.slice(0, 2).map((connector) => (
                  <button
                    key={connector.uid}
                    type="button"
                    onClick={() => connect({ connector })}
                    className="px-3 py-2 bg-[#111618] border border-[#1a2225] rounded-lg font-mono text-xs text-[#00ff41] hover:border-[#00ff41] transition-colors w-full"
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {isConnected && !isProviderReady && (
          <div className="flex items-center justify-center py-8">
            <div className="font-mono text-[#708090] text-xs">Initializing...</div>
          </div>
        )}
        
        {isConnected && isProviderReady && ethersProvider && ethersSigner && address && (
          <div className="kyberswap-widget-inline">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {React.createElement(KyberSwapWidget as any, {
              key: `swap-inline-${fromToken?.address || 'default'}`,
              client: "Hyperfolio",
              theme,
              tokenList: [],
              enableRoute: true,
              enableDexes: "kyberswap-elastic,uniswapv3,uniswap",
              feeSetting,
              provider: ethersSigner,
              width: "100%",
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
