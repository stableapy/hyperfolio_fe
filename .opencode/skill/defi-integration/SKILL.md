---
name: defi-integration
description: How to integrate DeFi protocols on HyperEVM - positions, yields, swaps
license: MIT
compatibility: opencode
metadata:
  project: hyperfolio
  type: defi
---

## Supported Protocols

| Protocol | Type | Integration |
|----------|------|-------------|
| HyperSwap | DEX | Swap widget |
| KittenSwap | DEX | API |
| HyperLend | Lending | Positions API |
| Kinetiq | Staking | stHYPE balance |
| Pendle | Yield | PT/YT positions |

## Position Data Structure

```typescript
interface DeFiPosition {
  protocol: string;
  type: 'lending' | 'staking' | 'lp' | 'yield';
  tokens: {
    symbol: string;
    amount: bigint;
    decimals: number;
    usdValue: number;
  }[];
  apy?: number;
  healthFactor?: number;
}
```

## Fetching Positions Pattern

```typescript
// lib/api/defi.ts
export async function fetchDeFiPositions(address: string): Promise<DeFiPosition[]> {
  const [lending, staking, lp] = await Promise.all([
    fetchLendingPositions(address),
    fetchStakingPositions(address),
    fetchLPPositions(address),
  ]);

  return [...lending, ...staking, ...lp];
}
```

## APY Calculation

```typescript
// APY from protocol API or calculate from rewards
function calculateAPY(
  rewardsPerYear: bigint,
  stakedAmount: bigint,
  decimals: number
): number {
  if (stakedAmount === 0n) return 0;
  
  const rewards = Number(formatUnits(rewardsPerYear, decimals));
  const staked = Number(formatUnits(stakedAmount, decimals));
  
  return (rewards / staked) * 100;
}
```

## Health Factor Display

```typescript
function getHealthStatus(healthFactor: number): {
  status: 'safe' | 'warning' | 'danger';
  color: string;
} {
  if (healthFactor >= 2) return { status: 'safe', color: 'text-green-500' };
  if (healthFactor >= 1.5) return { status: 'warning', color: 'text-yellow-500' };
  return { status: 'danger', color: 'text-red-500' };
}
```

## Security Checklist

- [ ] Validate all contract addresses
- [ ] Never expose private keys
- [ ] Verify transaction parameters before sending
- [ ] Handle slippage appropriately
- [ ] Check allowances before swaps

## When to Use

Load this skill when:
- Adding new DeFi protocol support
- Displaying positions
- Calculating yields/APY
- Building swap functionality

