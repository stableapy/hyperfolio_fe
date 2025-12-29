import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/store/wallet-store';
import { transformTransactions } from '@/lib/utils/data-transformers';
import { secureFetch } from '@/lib/api/fetch';
import type { Transaction } from '../types';

const TRANSACTIONS_PER_PAGE = 15;

interface TransactionsPageData {
  transactions: Transaction[];
  hasMore: boolean;
  total: number;
}

/**
 * Hook to fetch and paginate transactions using React Query's useInfiniteQuery
 * Auto-fetches when currentAddress changes
 * This implementation eliminates race conditions by using React Query's built-in pagination
 */
export function useTransactions() {
  const { wallets, selectedWalletId, syncTrigger } = useWalletStore();
  const prevSyncTriggerRef = useRef(syncTrigger);

  // Get current wallet address
  const currentAddress = useMemo(() => {
    if (selectedWalletId) {
      const wallet = wallets.find((w) => w.id === selectedWalletId);
      return wallet?.address || null;
    }
    // For multiple wallets, use the first one (or could aggregate)
    return wallets.length > 0 ? wallets[0].address : null;
  }, [wallets, selectedWalletId]);

  // Use Infinite Query for pagination - eliminates manual state management and race conditions
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['transactions', currentAddress, syncTrigger],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!currentAddress) {
        return {
          transactions: [],
          hasMore: false,
          total: 0,
        };
      }

      const response = await secureFetch(
        `/api/wallet/transactions?address=${currentAddress}&page=${pageParam}&offset=${TRANSACTIONS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      const transformedTransactions = transformTransactions(
        data.transactions || []
      );

      return {
        transactions: transformedTransactions,
        hasMore: data.hasMore || false,
        total: data.total || transformedTransactions.length,
      } as TransactionsPageData;
    },
    getNextPageParam: (
      lastPage: TransactionsPageData,
      allPages: TransactionsPageData[]
    ) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!currentAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten pages for easier consumption (maintains backward compatibility)
  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.transactions) || [];
  }, [data]);

  const hasMore = hasNextPage || false;
  const total = data?.pages[0]?.total || 0;

  // Clear transactions when sync is triggered (global refresh)
  useEffect(() => {
    if (syncTrigger !== prevSyncTriggerRef.current) {
      prevSyncTriggerRef.current = syncTrigger;
      refetch();
    }
  }, [syncTrigger, refetch]);

  // Refresh transactions (reset to page 1)
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Load more transactions
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Fetch transactions explicitly (maintain API compatibility)
  const fetchTransactions = useCallback(
    (page: number, reset: boolean) => {
      if (reset) {
        refetch();
      } else {
        fetchNextPage();
      }
    },
    [refetch, fetchNextPage]
  );

  return {
    transactions,
    isLoading,
    error: error instanceof Error ? error : null,
    hasMore,
    total,
    page: data?.pages.length || 1,
    fetchTransactions,
    loadMore,
    refresh,
  };
}
