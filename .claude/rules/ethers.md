---
paths: src/common/utils/multicall.ts, src/common/utils/archive-rpc-provider.ts, src/**/*blockchain*.ts, src/**/*web3*.ts, src/**/*ethers*.ts, price-feeder/**/*.ts
---

# Ethers.js v6 Best Practices for Hyperfolio API

## Version Information

This project uses **ethers.js v6.14.1** - ensure all code uses v6 syntax (breaking changes from v5).

## Provider Setup

```typescript
// GOOD: Use BrowserProvider or JsonRpcProvider with explicit config
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, {
  staticNetwork: true, // Prevents unnecessary network detection
  batchMaxCount: 100,  // Batch up to 100 requests
});

// BAD: Using v5 syntax or default provider
const provider = new ethers.providers.JsonRpcProvider(url); // v5 syntax!
```

## Contract Instantiation

```typescript
// GOOD: Explicit typing with interface
import type { Token } from './abis';

const tokenContract = new ethers.Contract(
  tokenAddress,
  TokenAbi,
  provider,
) as unknown as Token;

// Always specify the signer for write operations
const tokenWithSigner = tokenContract.connect(signer) as Token;
```

## Typed Contract ABIs

**Always define TypeScript interfaces for contract ABIs:**

```typescript
// src/abis/types/token.ts
export interface Token {
  balanceOf(account: string): Promise<bigint>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  transfer(to: string, amount: bigint): Promise<TransactionResponse>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<TransactionResponse>;
}

// Import and use the interface
import type { Token } from '@/abis/types/token';
```

## BigNumber Handling (v6 Changes)

**ethers.js v6 uses native `bigint` instead of BigNumber:**

```typescript
// GOOD: v6 uses native bigint
const balance: bigint = await token.balanceOf(wallet);
const amount = 1000000000000000000n; // bigint literal

// Format to string
const balanceString = balance.toString();

// Parse from string
const parsed = BigInt(balanceString);

// BAD: v5 BigNumber syntax (doesn't work in v6)
const balance = await token.balanceOf(wallet);
const formatted = balance.toString(); // This is fine, but...
const amount = ethers.utils.parseEther('1.0'); // WRONG in v6!
```

## Ether/Wei Formatting (v6 Changes)

```typescript
// GOOD: v6 formatting functions
import { ethers } from 'ethers';

// Parse ether to wei (bigint)
const amountInWei = ethers.parseEther('1.5'); // Returns bigint

// Format wei to ether (string)
const amountInEther = ethers.formatEther(amountInWei);

// Parse units
const gwei = ethers.parseUnits('4.5', 9); // 9 decimals for Gwei

// Format units
const formatted = ethers.formatUnits(amountInWei, 18);

// BAD: v5 syntax
const amount = ethers.utils.parseEther('1.0'); // WRONG!
```

## Multicall Patterns

### Using the Multicall Service

```typescript
// GOOD: Use the project's MulticallService
import { MulticallService } from '@/common/utils/multicall';

const results = await this.multicallService.callAll([
  token.balanceOf(wallet1),
  token.balanceOf(wallet2),
  token.allowance(wallet1, spender),
]);

// BAD: Sequential calls
const balance1 = await token.balanceOf(wallet1);
const balance2 = await token.balanceOf(wallet2);
```

### Manual Multicall (when needed)

```typescript
import { Multicall3 } from '@/abis/types/multicall3';

const multicall = new ethers.Contract(
  multicallAddress,
  Multicall3Abi,
  provider,
) as Multicall3;

// Prepare calls
const calls = [
  [tokenAddress, tokenInterface.encodeFunctionData('balanceOf', [wallet])],
  [tokenAddress, tokenInterface.encodeFunctionData('decimals', [])],
];

// Execute multicall
const [, returnData] = await multicall.aggregate.staticCall(calls);

// Decode results
const balances = returnData.map((data, i) =>
  ethers.AbiCoder.defaultAbiCoder().decode(
    ['uint256'],
    data,
  )[0],
);
```

## Transaction Handling

```typescript
// Sending transactions
async function sendTransaction() {
  const tx = await token.transfer(recipient, amount);

  // Wait for confirmation
  const receipt = await tx.wait();

  // Check status
  if (receipt?.status === 1) {
    console.log('Transaction successful');
  }

  return receipt;
}

// Estimating gas
const gasEstimate = await token.transfer.estimateGas(recipient, amount);
const gasPrice = await provider.getFeeData();

// Use EIP-1559 (v6 default)
const tx = await token.transfer(recipient, amount, {
  maxFeePerGas: gasPrice.maxFeePerGas,
  maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
});
```

## Event Listening

```typescript
// Query past events
const filter = token.filters.Transfer(sender, recipient);
const events = await token.queryFilter(filter, fromBlock, toBlock);

// Listen to new events
token.on(token.filters.Transfer(wallet), (from, to, value, event) => {
  console.log(`Transfer of ${value} from ${from} to ${to}`);
});

// Clean up listeners
token.removeAllListeners();
```

## Error Handling

```typescript
try {
  const balance = await token.balanceOf(wallet);
} catch (error) {
  if (error instanceof ethers.CallException) {
    // Contract call reverted
    console.error('Call reverted:', error.reason);
  } else if (error instanceof ethers.TransactionResponse) {
    // Transaction failed
    console.error('Transaction failed');
  } else {
    // Network error, etc.
    console.error('Unexpected error:', error);
  }
}
```

## Network Configuration

```typescript
// Define supported networks
export const SUPPORTED_NETWORKS = {
  hyperevm: {
    chainId: 2024201,
    name: 'HyperEVM',
    rpcUrl: process.env.RPC_URL_HYPEREVM,
    explorerUrl: 'https://hyperscan.xyz',
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: process.env.RPC_URL_ETHEREUM,
    explorerUrl: 'https://etherscan.io',
  },
} as const;

// Get provider for network
function getProvider(network: keyof typeof SUPPORTED_NETWORKS) {
  const config = SUPPORTED_NETWORKS[network];
  return new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
}
```

## Archive RPC Provider

When using the archive provider for historical data:

```typescript
import { ArchiveRpcProvider } from '@/common/utils/archive-rpc-provider';

const archiveProvider = new ArchiveRpcProvider(rpcUrl);

// Get state at specific block
const balanceAtBlock = await token.balanceOf(wallet, {
  blockTag: blockNumber,
});

// Get historical events
const events = await token.queryFilter(
  token.filters.Transfer(),
  fromBlock,
  toBlock,
);
```

## Wallet/Signer Management

```typescript
// NEVER hardcode private keys
// Use environment variables or secure vaults
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('PRIVATE_KEY not set');
}

const wallet = new ethers.Wallet(privateKey, provider);

// Or use mnemonic
const mnemonic = process.env.MNEMONIC;
const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
const wallet = hdNode.derivePath(`m/44'/60'/0'/0/0`);
```

## Gas Optimization

```typescript
// Batch similar calls
const [balance, decimals, symbol] = await Promise.all([
  token.balanceOf(wallet),
  token.decimals(),
  token.symbol(),
]);

// Use multicall for multiple same-contract calls
const balances = await multicallService.callAll(
  wallets.map(w => token.balanceOf(w)),
);

// Enable static calls for read-only
const result = await contract.someFunction.staticCall(arg1, arg2);
```

## Testing with Ethers

```typescript
// Mock contract calls
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn().mockImplementation(() => ({
    balanceOf: jest.fn().mockResolvedValue(BigInt(1000000)),
    decimals: jest.fn().mockResolvedValue(18),
  })),
}));

// Use local testnet or anvil/hardhat for integration tests
const localProvider = new ethers.JsonRpcProvider('http://localhost:8545');
```

## Security Best Practices

1. **NEVER log private keys or mnemonic phrases**
2. **NEVER commit private keys to version control**
3. **Use environment variables for sensitive data**
4. **Validate all user inputs** before passing to contracts
5. **Check return values** from contract calls
6. **Handle reverts gracefully** with try/catch
7. **Use read-only providers** when possible (no signer)
8. **Validate addresses** using `ethers.isAddress()`
9. **Use checksummed addresses** with `ethers.getAddress()`

## Common Pitfalls

```typescript
// WRONG: Assuming decimals is always 18
const amount = BigInt(1) * BigInt(10 ** 18);

// RIGHT: Get decimals from token
const decimals = await token.decimals();
const amount = BigInt(1) * BigInt(10 ** decimals);

// WRONG: Using parseFloat for large numbers
const usdValue = parseFloat(wei.toString()) / 1e18;

// RIGHT: Use ethers.formatUnits
const usdValue = ethers.formatUnits(wei, 18);

// WRONG: String concatenation for addresses
const address = '0x' + userHash;

// RIGHT: Use proper address format
const address = ethers.getAddress('0x...' + userHash.slice(0, 40));
```

## Performance Tips

1. **Batch RPC calls** using multicall
2. **Cache contract instances** (don't recreate on every request)
3. **Use static network** config to skip network detection
4. **Enable batch provider** for JSON-RPC batching
5. **Limit concurrent requests** to avoid rate limits
6. **Use WebSocket provider** for real-time updates
7. **Implement circuit breakers** for failing RPC nodes
