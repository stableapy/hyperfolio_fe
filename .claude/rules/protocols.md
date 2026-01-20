---
paths: src/protocols/**/*.ts, src/protocols/**/*.spec.ts
---

# Protocol Service Pattern for Hyperfolio API

All protocol services follow the same architectural pattern for consistency and maintainability.

## Standard Protocol Service Structure

```typescript
@Injectable()
export class ProtocolService {
  constructor(
    private readonly multicallService: MulticallService,
    private readonly cacheService: MultiSourceCacheService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get all positions for a wallet across this protocol
   * @param walletAddress - The wallet address to query
   * @param options - Optional filters (chainId, blockNumber, etc.)
   * @returns Promise<Position[]> - Array of normalized positions
   */
  async getPositions(
    walletAddress: string,
    options?: PositionOptions,
  ): Promise<Position[]> {
    // 1. Check cache first
    // 2. Fetch from blockchain using multicall
    // 3. Normalize to Position DTO
    // 4. Cache results
    // 5. Return positions
  }
}
```

## The 4-Step Protocol Pattern

### Step 1: Check Cache

```typescript
async getPositions(walletAddress: string): Promise<Position[]> {
  const cacheKey = `protocol:${this.name}:positions:${walletAddress}`;
  const cached = await this.cacheService.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as Position[];
  }

  // Continue to fetch...
}
```

### Step 2: Fetch from Blockchain

```typescript
// Use multicall for batch operations
const calls = [
  // Contract call 1
  this.contract.balanceOf(walletAddress),
  // Contract call 2
  this.contract.getUserStakes(walletAddress),
  // ... more calls
];

const results = await this.multicallService.callAll(calls);
```

### Step 3: Normalize to Position DTO

```typescript
const positions: Position[] = results
  .filter(result => result?.gt(0)) // Filter zero values
  .map((result, index) => ({
    protocol: this.protocolName,
    chainId: this.chainId,
    walletAddress,
    tokenAddress: tokens[index],
    balance: result.toString(),
    decimals: decimals[index],
    usdValue: await this.calculateUsdValue(result, tokens[index]),
    metadata: {
      lastUpdated: Date.now(),
      blockNumber: options?.blockNumber,
    },
  } as Position));
```

### Step 4: Cache and Return

```typescript
await this.cacheService.set(
  cacheKey,
  JSON.stringify(positions),
  300, // 5 minute TTL
);

return positions;
```

## Standard Position DTO

All protocol services MUST return positions matching the `Position` interface:

```typescript
interface Position {
  protocol: string;        // Protocol name (e.g., 'uniswap-v3')
  chainId: number;         // Chain ID (e.g., 2024201 for HyperEVM)
  walletAddress: string;   // Lowercase wallet address
  tokenAddress: string;    // Token contract address
  balance: string;         // Balance as string (bigint)
  decimals: number;        // Token decimals
  usdValue?: string;       // USD value as string
  metadata?: {
    lastUpdated: number;
    blockNumber?: number;
    [key: string]: unknown;
  };
}
```

## Protocol Service Configuration

Each protocol service should be configured via environment variables:

```typescript
@Injectable()
export class UniswapV3Service {
  private readonly contractAddress: string;
  private readonly chainId: number;
  private readonly name = 'uniswap-v3';

  constructor(
    private readonly multicallService: MulticallService,
    private readonly cacheService: MultiSourceCacheService,
    configService: ConfigService,
  ) {
    this.contractAddress = configService.get<string>(
      'PROTOCOL_UNISWAP_V3_ADDRESS',
    );
    this.chainId = configService.get<number>('CHAIN_ID', 2024201);
  }
}
```

## Error Handling

```typescript
async getPositions(walletAddress: string): Promise<Position[]> {
  try {
    // ... implementation
  } catch (error) {
    // Log error for monitoring
    logger.error(`Protocol ${this.name} error`, {
      wallet: walletAddress,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array on failure (graceful degradation)
    return [];
  }
}
```

## Multicall Best Practices

- **Always batch calls** - Never loop and await individual calls
- **Limit batch size** - Keep batches under 100 calls when possible
- **Use typed results** - Define return types for contract calls
- **Handle reverts** - Filter out failed calls or use try/catch

```typescript
// GOOD: Batch all calls
const [balance, allowance, rewards] = await Promise.all([
  token.balanceOf(wallet),
  token.allowance(wallet, spender),
  rewardsContract.earned(wallet),
]);

// BAD: Sequential calls
const balance = await token.balanceOf(wallet);
const allowance = await token.allowance(wallet, spender);
const rewards = await rewardsContract.earned(wallet);
```

## Protocol Registration

Add all protocol services to `src/protocols/protocols.module.ts`:

```typescript
@Module({
  providers: [
    // Core services
    MulticallService,
    PositionAggregatorService,

    // Protocol services (40+ protocols)
    UniswapV3Service,
    SushiswapService,
    // ... more protocols
  ],
  exports: [
    PositionAggregatorService,
    // Export all protocol services
    UniswapV3Service,
    SushiswapService,
  ],
})
export class ProtocolsModule {}
```

## Protocol Discovery

Use the `PositionAggregatorService` to query all protocols:

```typescript
async getAllPositions(
  walletAddress: string,
  protocols?: string[],
): Promise<Position[]> {
  const protocolServices = this.getProtocolServices(protocols);

  const allPositions = await Promise.allSettled(
    protocolServices.map(service =>
      service.getPositions(walletAddress),
    ),
  );

  return allPositions
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
}
```

## Testing Protocol Services

```typescript
describe('UniswapV3Service', () => {
  it('should return empty array for wallet with no positions', async () => {
    jest.spyOn(multicallService, 'callAll').mockResolvedValue([0n, 0n]);

    const positions = await service.getPositions(emptyWallet);

    expect(positions).toEqual([]);
  });

  it('should cache results', async () => {
    await service.getPositions(wallet);
    await service.getPositions(wallet);

    expect(cacheService.get).toHaveBeenCalledTimes(1);
  });
});
```

## Protocol Naming Conventions

- **Service class**: `{ProtocolName}Service` (e.g., `UniswapV3Service`)
- **File name**: `{protocol-name}.service.ts` (kebab-case)
- **Protocol ID**: use kebab-case (e.g., `uniswap-v3`, `sushiswap`)
- **Cache key prefix**: `protocol:{protocolId}:`

## Adding a New Protocol

1. Create service file: `src/protocols/services/{protocol-name}.service.ts`
2. Implement the 4-step pattern
3. Add to `src/protocols/protocols.module.ts`
4. Register in `PositionAggregatorService`
5. Add tests in `src/protocols/services/{protocol-name}.spec.ts`
6. Update documentation in CLAUDE.md
