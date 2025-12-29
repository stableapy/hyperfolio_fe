'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { WagmiProvider, type State } from 'wagmi';
import { ThemeProvider } from 'next-themes';
import { config } from '@/lib/wagmi/config';

type Props = {
  children: ReactNode;
  initialState?: State;
};

export function Providers({ children, initialState }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry strategy: don't retry on 4xx, retry 3 times on network errors
            retry: (failureCount, error) => {
              // Don't retry on 4xx client errors
              if (error instanceof Error && error.message.includes('401')) {
                return false; // Unauthorized
              }
              if (error instanceof Error && error.message.includes('403')) {
                return false; // Forbidden
              }
              if (error instanceof Error && error.message.includes('404')) {
                return false; // Not found
              }
              if (error instanceof Error && error.message.includes('400')) {
                return false; // Bad request
              }
              // Retry 3 times on network errors or 5xx
              return failureCount < 3;
            },
            // Exponential backoff: 1s, 2s, 4s max 30s
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            // Cache data for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Don't refetch on window focus (we have manual refresh)
            refetchOnWindowFocus: false,
            // Refetch when network reconnects
            refetchOnReconnect: true,
          },
          mutations: {
            // Don't retry mutations (write operations)
            retry: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <WagmiProvider config={config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
