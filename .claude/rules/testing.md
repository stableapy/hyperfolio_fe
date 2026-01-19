---
paths: test/**/*.ts, **/*.spec.ts, **/*.test.ts, src/**/*.spec.ts
---

# Testing Best Practices for Hyperfolio API

## Framework: Jest with ts-jest

This project uses **Jest 29.7+** with **ts-jest** for TypeScript testing.

## Test File Organization

```
src/
├── wallet/
│   ├── wallet.service.ts
│   ├── wallet.controller.ts
│   ├── wallet.module.ts
│   └── wallet.service.spec.ts       # Unit tests alongside source
test/
├── jest-e2e.json                    # E2E test config
└── app.e2e-spec.ts                  # E2E tests
```

## Unit Test Structure

```typescript
describe('WalletService', () => {
  let service: WalletService;
  let cacheService: jest.Mocked<MultiSourceCacheService>;
  let multicallService: jest.Mocked<MulticallService>;

  beforeEach(async () => {
    // Create mock dependencies
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<MultiSourceCacheService>;

    const mockMulticallService = {
      callAll: jest.fn(),
    } as unknown as jest.Mocked<MulticallService>;

    // Create test module
    const module = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: MultiSourceCacheService,
          useValue: mockCacheService,
        },
        {
          provide: MulticallService,
          useValue: mockMulticallService,
        },
      ],
    }).compile();

    service = module.get(WalletService);
    cacheService = module.get(MultiSourceCacheService);
    multicallService = module.get(MulticallService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPositions', () => {
    it('should return cached positions if available', async () => {
      // Arrange
      const wallet = '0x123...';
      const cachedPositions = [{ protocol: 'uniswap', balance: '100' }];
      cacheService.get.mockResolvedValue(JSON.stringify(cachedPositions));

      // Act
      const result = await service.getPositions(wallet);

      // Assert
      expect(result).toEqual(cachedPositions);
      expect(cacheService.get).toHaveBeenCalledWith(
        `wallet:positions:${wallet}`,
      );
      expect(multicallService.callAll).not.toHaveBeenCalled();
    });

    it('should fetch from blockchain when cache miss', async () => {
      // Arrange
      const wallet = '0x123...';
      cacheService.get.mockResolvedValue(null);
      multicallService.callAll.mockResolvedValue([BigInt(100), BigInt(200)]);

      // Act
      const result = await service.getPositions(wallet);

      // Assert
      expect(result).toHaveLength(2);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });
});
```

## Test Naming Conventions

- **File name**: `{filename}.spec.ts` for unit tests
- **Describe block**: Should match the class/function being tested
- **Test names**: Should be descriptive and follow `should... when...` pattern

```typescript
// GOOD
describe('WalletService.getPositions', () => {
  it('should return empty array when wallet has no positions', async () => {
  });

  it('should throw error when RPC call fails', async () => {
  });

  it('should cache results after successful fetch', async () => {
  });
});

// BAD
describe('WalletService', () => {
  it('works', () => {
  });

  it('test1', () => {
  });
});
```

## AAA Pattern (Arrange-Act-Assert)

All tests should follow the AAA pattern:

```typescript
it('should return wallet balance', async () => {
  // ARRANGE - Set up test data and mocks
  const wallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const expectedBalance = BigInt(1000000);
  jest.spyOn(tokenContract, 'balanceOf').mockResolvedValue(expectedBalance);

  // ACT - Execute the code under test
  const balance = await service.getBalance(wallet);

  // ASSERT - Verify the result
  expect(balance).toBe(expectedBalance);
  expect(tokenContract.balanceOf).toHaveBeenCalledWith(wallet);
});
```

## Mocking External Dependencies

### Mocking NestJS Services

```typescript
// Mock a service dependency
const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
};

const module = await Test.createTestingModule({
  providers: [
    WalletService,
    { provide: MultiSourceCacheService, useValue: mockCacheService },
  ],
}).compile();
```

### Mocking Ethers Contracts

```typescript
// Mock ethers contract
const mockTokenContract = {
  balanceOf: jest.fn().mockResolvedValue(BigInt(1000)),
  decimals: jest.fn().mockResolvedValue(18),
  symbol: jest.fn().mockResolvedValue('TOKEN'),
};

jest.mock('@/contracts/token', () => ({
  getTokenContract: jest.fn(() => mockTokenContract),
}));
```

### Mocking ConfigService

```typescript
const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, unknown> = {
      'RPC_URL': 'http://localhost:8545',
      'CHAIN_ID': 2024201,
    };
    return config[key];
  }),
};
```

## Testing Async Code

```typescript
// Use async/await for async operations
it('should fetch positions from blockchain', async () => {
  const result = await service.getPositions(wallet);
  expect(result).toBeDefined();
});

// Test for errors
it('should throw when RPC fails', async () => {
  jest.spyOn(provider, 'getBlockNumber').mockRejectedValue(
    new Error('RPC Error'),
  );

  await expect(service.getCurrentBlock()).rejects.toThrow('RPC Error');
});

// Test with timeout
it('should complete within timeout', async () => {
  const result = await service.getPositions(wallet, { timeout: 5000 });
  expect(result).toBeDefined();
}, 10000); // 10s test timeout
```

## Testing HTTP Controllers

```typescript
describe('WalletController', () => {
  let controller: WalletController;
  let service: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            getPortfolio: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WalletController);
    service = module.get(WalletService);
  });

  it('should return wallet portfolio', async () => {
    const mockPortfolio = {
      address: '0x123...',
      totalUsdValue: '1000.00',
      positions: [],
    };
    service.getPortfolio.mockResolvedValue(mockPortfolio);

    const result = await controller.getWallet('0x123...');

    expect(result).toEqual(mockPortfolio);
    expect(service.getPortfolio).toHaveBeenCalledWith('0x123...');
  });
});
```

## E2E Testing

```typescript
describe('Wallet API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/wallets/:address (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/wallets/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
      .set('x-api-key', process.env.TEST_API_KEY)
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body).toHaveProperty('positions');
  });
});
```

## Coverage Goals

- **Statement coverage**: > 80%
- **Branch coverage**: > 75%
- **Function coverage**: > 80%
- **Line coverage**: > 80%

```bash
# Run coverage
npm run test:cov

# Check specific file coverage
npm run test:cov -- --coverage --collectCoverageFrom='src/wallet/**/*.ts'
```

## Test Configuration

```typescript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!main.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.interface.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

## Testing Protocol Services

```typescript
describe('UniswapV3Service', () => {
  it('should return empty array when no positions', async () => {
    // Mock multicall to return zero balances
    multicallService.callAll.mockResolvedValue([0n, 0n, 0n]);

    const positions = await service.getPositions(emptyWallet);

    expect(positions).toEqual([]);
    expect(positions).not.toContain(
      expect.objectContaining({ balance: '0' }),
    );
  });

  it('should filter zero balances', async () => {
    multicallService.callAll.mockResolvedValue([100n, 0n, 50n]);

    const positions = await service.getPositions(wallet);

    expect(positions).toHaveLength(2); // Only non-zero balances
  });
});
```

## Integration Testing with Database

```typescript
describe('Database Integration Tests', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      entities: [Portfolio, Transaction],
      synchronize: true,
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.synchronize(true); // Drop and recreate
  });
});
```

## Common Test Utilities

```typescript
// test/utils/test-helpers.ts
export const mockWallet = (
  override?: Partial<Wallet>,
): Wallet => ({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  chainId: 2024201,
  ...override,
});

export const mockPosition = (
  override?: Partial<Position>,
): Position => ({
  protocol: 'uniswap-v3',
  chainId: 2024201,
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  tokenAddress: '0x...',
  balance: '1000000',
  decimals: 18,
  usdValue: '1000.00',
  ...override,
});

export const expectPositionsMatch = (
  actual: Position[],
  expected: Position[],
) => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((position, i) => {
    expect(position).toMatchObject(expected[i]);
  });
};
```

## Running Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run coverage
npm run test:cov

# Run specific test file
npm run test -- wallet.service.spec.ts

# Run matching tests
npm run test -- --testNamePattern="should return"
```

## Testing Checklist

Before committing code, ensure:

- [ ] All new features have unit tests
- [ ] All edge cases are covered (null, undefined, empty arrays)
- [ ] Error paths are tested
- [ ] Async operations are properly awaited
- [ ] Mocks are verified (toHaveBeenCalledTimes, etc.)
- [ ] Test files are named `*.spec.ts`
- [ ] Coverage is above 80%
- [ ] No console.log or debugging code left in tests
