'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EscCloseButton } from '@/components/ui/esc-close-button';
import { useKyberSwapTokenList } from '@/hooks/use-hyperevm-tokens';

// Module imports
import { useSwapConfig, useSwapWallet } from './hooks';
import { getWalletIcon } from './utils';
import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from './constants';
import type { SwapWidgetModalProps } from './types';

// Dynamically import the KyberSwap widget to avoid SSR issues
const KyberSwapWidget = dynamic(
  () => import('@kyberswap/widgets').then((mod) => mod.Widget),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-theme-text-muted font-mono text-xs">
          loading swap widget...
        </div>
      </div>
    ),
    ssr: false,
  }
);

export function SwapWidgetModal({
  open,
  onOpenChange,
  fromToken,
  toToken,
}: SwapWidgetModalProps) {
  const { theme, feeSetting, defaultSlippage, exactAmount } = useSwapConfig();
  const {
    address,
    isConnected,
    chainId,
    activeConnector,
    ethersProvider,
    ethersSigner,
    isCorrectChain,
    injectedConnector,
    handleConnect,
    handleSwitchChain,
    disconnect,
    isConnecting,
    isSwitching,
    isWidgetReady,
  } = useSwapWallet({ isOpen: open });

  const { tokenList } = useKyberSwapTokenList();

  // Debug: Log when fromToken changes
  useEffect(() => {
    console.log('SwapWidgetModal - fromToken prop:', fromToken);
    console.log(
      'SwapWidgetModal - defaultTokenIn will be:',
      fromToken?.address && fromToken.address !== ''
        ? fromToken.address
        : DEFAULT_FROM_TOKEN.address
    );
  }, [fromToken]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-theme-card-bg border-theme-border/70 flex max-h-[85vh] w-[95vw] max-w-[380px] flex-col overflow-hidden rounded-sm p-0 sm:max-w-[420px]"
        showCloseButton={false}
      >
        {/* Compact terminal header with wallet info inline */}
        <DialogHeader className="bg-theme-bg/50 border-theme-border/50 flex-shrink-0 border-b px-3 py-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-1 font-mono text-[10px]">
              <span className="text-theme-accent font-bold">&gt;</span>
              <span className="text-theme-text-muted">swap</span>
              {fromToken && (
                <span className="text-theme-accent ml-0.5 font-bold">
                  {fromToken.symbol}
                </span>
              )}
            </DialogTitle>

            <div className="flex items-center gap-2">
              {/* Compact wallet info */}
              {isConnected && address ? (
                <div className="bg-theme-bg/50 border-theme-border/50 flex items-center gap-1 rounded-sm border px-1.5 py-0.5">
                  <span className="text-[10px]">
                    {activeConnector
                      ? getWalletIcon(activeConnector.name)
                      : '💼'}
                  </span>
                  <span className="text-theme-accent font-mono text-[9px] tabular-nums">
                    {address.slice(0, 4)}...{address.slice(-3)}
                  </span>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="text-theme-text-muted ml-0.5 font-mono text-[8px] transition-colors hover:text-[#dc3545]"
                  >
                    ✕
                  </button>
                </div>
              ) : injectedConnector ? (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="text-theme-accent border-theme-accent/40 hover:bg-theme-accent/10 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] transition-colors disabled:opacity-50"
                >
                  {isConnecting ? '...' : '--connect'}
                </button>
              ) : null}
              <EscCloseButton onClick={() => onOpenChange(false)} />
            </div>
          </div>
        </DialogHeader>

        <div className="bg-theme-bg/30 min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
          <style jsx global>{`
            .kyberswap-widget-container {
              padding-bottom: 8px;
            }
            .kyberswap-widget-container > div {
              box-shadow: none !important;
            }
            /* Remove all shadows from widget elements */
            .kyberswap-widget-container [class^='sc-'],
            .kyberswap-widget-container [class*=' sc-'],
            .kyberswap-widget-container div[class^='sc-'],
            .kyberswap-widget-container > div > div {
              box-shadow: none !important;
            }
            .kyberswap-widget-container * {
              scrollbar-width: thin !important;
              scrollbar-color: rgba(0, 80, 20, 0.15) transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar {
              width: 4px !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .kyberswap-widget-container *::-webkit-scrollbar-thumb {
              background: rgba(0, 80, 20, 0.15) !important;
              border-radius: 2px !important;
            }
          `}</style>

          {isWidgetReady && (
            <div className="kyberswap-widget-container flex justify-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {React.createElement(KyberSwapWidget as any, {
                key: `swap-widget-${fromToken?.address || 'default'}-${open}`,
                client: 'Hyperfolio',
                theme,
                title: <></>,
                tokenList: tokenList,
                enableRoute: true,
                enableDexes: 'kyberswap-elastic,uniswapv3,uniswap',
                feeSetting,
                defaultSlippage,
                exactAmount,
                provider: ethersSigner,
                width: '100%',
                defaultTokenIn:
                  fromToken?.address && fromToken.address !== ''
                    ? fromToken.address
                    : DEFAULT_FROM_TOKEN.address,
                defaultTokenOut:
                  toToken?.address && toToken.address !== ''
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
                    console.log('Transaction data received:', txData);

                    if (typeof txData === 'string') {
                      return txData;
                    }

                    if (ethersSigner) {
                      console.log('Sending transaction through signer...');
                      const tx = await ethersSigner.sendTransaction({
                        to: txData.to,
                        from: txData.from,
                        value: txData.value,
                        data: txData.data,
                        gasLimit: txData.gasLimit,
                      });
                      console.log('Transaction sent:', tx.hash);

                      await tx.wait();
                      console.log('Transaction confirmed:', tx.hash);

                      return tx.hash;
                    }

                    return txData?.hash || '';
                  } catch (error) {
                    console.error('Transaction error:', error);
                    throw error;
                  }
                },
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
