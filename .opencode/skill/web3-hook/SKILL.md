---
name: web3-hook
description: How to create Web3 React hooks with Wagmi, proper error handling, and token decimals
license: MIT
compatibility: opencode
metadata:
  project: hyperfolio
  type: web3
---

## Hook Template

```typescript
// hooks/use-token-balance.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { usePublicClient } from 'wagmi';

interface UseTokenBalanceOptions {
  address: `0x${string}`;
  tokenAddress: `0x${string}`;
  decimals: number;
}

interface TokenBalance {
  raw: bigint;
  formatted: string;
}

export function useTokenBalance({ address, tokenAddress, decimals }: UseTokenBalanceOptions) {
  const publicClient = usePublicClient();

  return useQuery<TokenBalance>({
    queryKey: ['tokenBalance', address, tokenAddress],
    queryFn: async () => {
      if (!publicClient) throw new Error('No client');

      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      });

      return {
        raw: balance,
        formatted: formatUnits(balance, decimals),
      };
    },
    enabled: !!address && !!tokenAddress && !!publicClient,
    staleTime: 30_000, // 30 seconds
  });
}
```

## RPC Retry Pattern

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Token Decimals Reference

| Token | Decimals | Address |
|-------|----------|---------|
| HYPE | 18 | Native |
| stHYPE | 18 | 0x... |
| USDT | 6 | 0x... |
| USDC | 6 | 0x... |
| WBTC | 8 | 0x... |

## Checklist

- [ ] Use BigInt for all token amounts
- [ ] Correct decimals per token
- [ ] RPC retry logic for unreliable calls
- [ ] Error handling with user-friendly messages
- [ ] Loading and error states exposed
- [ ] Query keys include all dependencies

## Common Mistakes

❌ Using Number for token amounts (precision loss)
❌ Hardcoding decimals (tokens have different decimals)
❌ No retry logic (RPCs can fail)
❌ Missing `enabled` condition (prevents unnecessary calls)

## When to Use

Load this skill when:
- Creating Web3 hooks
- Reading from contracts
- Handling token balances

