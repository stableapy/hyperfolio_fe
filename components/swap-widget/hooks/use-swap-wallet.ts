import { useState, useMemo, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useConnectors,
  useSwitchChain,
} from 'wagmi';
import { useEthersProvider, useEthersSigner } from '@/lib/wagmi/config';
import { HYPEREVM_CHAIN_ID } from '../constants';

interface UseSwapWalletOptions {
  /**
   * Whether the parent component is open/mounted
   * Used to reset mount state for modal variants
   */
  isOpen?: boolean;
}

/**
 * Hook that manages wallet connection state for swap widgets
 * Handles connection, chain switching, and provider readiness
 */
export function useSwapWallet(options: UseSwapWalletOptions = {}) {
  const { isOpen = true } = options;

  const {
    address,
    isConnected,
    chainId,
    connector: activeConnector,
  } = useAccount();
  const connectors = useConnectors();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // Get provider/signer for current chain
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const [isProviderReady, setIsProviderReady] = useState(false);

  // Prevent StrictMode double-render from causing AbortController issues
  const [hasMounted, setHasMounted] = useState(false);

  // Check if user is on the correct chain (HyperEVM)
  const isCorrectChain = chainId === HYPEREVM_CHAIN_ID;

  // Get the injected connector (Rabby, MetaMask, etc.)
  const injectedConnector = useMemo(() => {
    return connectors.find((c) => c.type === 'injected' || c.id === 'injected');
  }, [connectors]);

  // Handle connect - directly use injected wallet
  const handleConnect = () => {
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Handle chain switch
  const handleSwitchChain = () => {
    switchChain({ chainId: HYPEREVM_CHAIN_ID });
  };

  // Wait for component to fully mount before rendering widget
  // This prevents React 18 StrictMode double-render from causing AbortController issues
  useEffect(() => {
    if (!isOpen) {
      setHasMounted(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 10); // Small delay to skip StrictMode's double-invoke cycle

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Check if provider and signer are ready
  useEffect(() => {
    const checkProvider = async () => {
      if (ethersProvider && ethersSigner) {
        try {
          await ethersProvider.getNetwork();
          await ethersSigner.getAddress();
          setIsProviderReady(true);
        } catch (error) {
          console.error('Provider not ready:', error);
          setIsProviderReady(false);
        }
      } else {
        setIsProviderReady(false);
      }
    };

    checkProvider();
  }, [ethersProvider, ethersSigner]);

  // Combined ready state for rendering the widget (widget handles connection state internally)
  const isWidgetReady = hasMounted;

  return {
    // Account state
    address,
    isConnected,
    chainId,
    activeConnector,

    // Provider state
    ethersProvider,
    ethersSigner,
    isProviderReady,
    hasMounted,

    // Chain state
    isCorrectChain,

    // Connectors
    injectedConnector,

    // Actions
    handleConnect,
    handleSwitchChain,
    disconnect,

    // Loading states
    isConnecting,
    isSwitching,

    // Ready state
    isWidgetReady,
  };
}
