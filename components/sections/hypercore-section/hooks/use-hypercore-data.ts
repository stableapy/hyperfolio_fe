'use client';

import { useMemo } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type {
  HypercoreData,
  SpotBalance,
  PerpPosition,
  PerpPositionDetail,
  StakingInfo,
  VaultInfo,
  PortfolioSummary,
} from '../types';

/**
 * Create initial empty aggregated data structure
 */
function createEmptyAggregatedData(): HypercoreData {
  return {
    spotBalances: [],
    perpPositions: {
      positions: [],
      margin: { usdcBalance: '0.0', lastUpdate: Date.now() },
    },
    stakingInfo: {
      totalHype: '0.0',
      stakedHype: '0',
      availableHype: '0',
      delegations: [],
      delegatorSummary: {
        delegated: '0.0',
        undelegated: '0.0',
        totalPendingWithdrawal: '0.0',
        nPendingWithdrawals: 0,
        totalStakedUsd: '0',
      },
      usdPrice: '0',
      image_url: '',
      lastUpdate: Date.now(),
    },
    vaultInfo: { vaults: [], totalVaultValue: '0' },
    portfolioSummary: {
      totalValue: '0',
      spotValue: '0',
      perpValue: '0',
      stakedValue: '0',
      vaultValue: '0',
      lastUpdate: Date.now(),
    },
  };
}

/**
 * Type guard to check if value is a valid object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if value is an array
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is a number
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Validate and extract spot balances with safe defaults
 */
function validateSpotBalances(data: unknown): SpotBalance[] {
  if (!isArray(data)) return [];
  return data.filter(isObject).map((item): SpotBalance => {
    let imageUrl: string | null = null;
    if (item.image_url === null) {
      imageUrl = null;
    } else if (isString(item.image_url)) {
      imageUrl = item.image_url;
    }

    return {
      coin: isString(item.coin) ? item.coin : '',
      token: isNumber(item.token) ? item.token : 0,
      total: isString(item.total) ? item.total : '0',
      hold: isString(item.hold) ? item.hold : '0',
      entryNtl: isString(item.entryNtl) ? item.entryNtl : '0',
      usdPrice: isString(item.usdPrice) ? item.usdPrice : '0',
      usdValue: isString(item.usdValue) ? item.usdValue : '0',
      image_url: imageUrl,
      symbol: isString(item.symbol) ? item.symbol : '',
      name: isString(item.name) ? item.name : '',
      decimals: isString(item.decimals) ? item.decimals : '0',
    };
  });
}

/**
 * Validate and extract perp positions with safe defaults
 */
function validatePerpPositions(data: unknown): PerpPosition {
  if (!isObject(data)) {
    return {
      positions: [],
      margin: { usdcBalance: '0.0', lastUpdate: Date.now() },
    };
  }

  const positions = isArray(data.positions) ? data.positions : [];
  const validatedPositions = positions
    .filter(isObject)
    .map((item): PerpPositionDetail => {
      let positionObj: Record<string, unknown> | null = null;
      if (isObject(item.position)) {
        positionObj = item.position;
      }

      let imageUrl: string | null = null;
      if (positionObj && positionObj.image_url === null) {
        imageUrl = null;
      } else if (positionObj && isString(positionObj.image_url)) {
        imageUrl = positionObj.image_url;
      }

      return {
        type: isString(item.type) ? item.type : 'unknown',
        position: positionObj
          ? {
              coin: isString(positionObj.coin) ? positionObj.coin : '',
              szi: isString(positionObj.szi) ? positionObj.szi : '0',
              leverage: isObject(positionObj.leverage)
                ? {
                    type: isString(positionObj.leverage.type)
                      ? positionObj.leverage.type
                      : 'unknown',
                    value: isNumber(positionObj.leverage.value)
                      ? positionObj.leverage.value
                      : 0,
                  }
                : { type: 'unknown', value: 0 },
              entryPx: isString(positionObj.entryPx)
                ? positionObj.entryPx
                : '0',
              positionValue: isString(positionObj.positionValue)
                ? positionObj.positionValue
                : '0',
              unrealizedPnl: isString(positionObj.unrealizedPnl)
                ? positionObj.unrealizedPnl
                : '0',
              returnOnEquity: isString(positionObj.returnOnEquity)
                ? positionObj.returnOnEquity
                : '0',
              liquidationPx: isString(positionObj.liquidationPx)
                ? positionObj.liquidationPx
                : '0',
              marginUsed: isString(positionObj.marginUsed)
                ? positionObj.marginUsed
                : '0',
              maxLeverage: isNumber(positionObj.maxLeverage)
                ? positionObj.maxLeverage
                : 0,
              cumFunding: isObject(positionObj.cumFunding)
                ? {
                    allTime: isString(positionObj.cumFunding.allTime)
                      ? positionObj.cumFunding.allTime
                      : '0',
                    sinceOpen: isString(positionObj.cumFunding.sinceOpen)
                      ? positionObj.cumFunding.sinceOpen
                      : '0',
                    sinceChange: isString(positionObj.cumFunding.sinceChange)
                      ? positionObj.cumFunding.sinceChange
                      : '0',
                  }
                : { allTime: '0', sinceOpen: '0', sinceChange: '0' },
              image_url: imageUrl,
              symbol: isString(positionObj.symbol) ? positionObj.symbol : '',
              name: isString(positionObj.name) ? positionObj.name : '',
              decimals: isString(positionObj.decimals)
                ? positionObj.decimals
                : '0',
            }
          : {
              coin: '',
              szi: '0',
              leverage: { type: 'unknown', value: 0 },
              entryPx: '0',
              positionValue: '0',
              unrealizedPnl: '0',
              returnOnEquity: '0',
              liquidationPx: '0',
              marginUsed: '0',
              maxLeverage: 0,
              cumFunding: { allTime: '0', sinceOpen: '0', sinceChange: '0' },
              image_url: null,
              symbol: '',
              name: '',
              decimals: '0',
            },
      };
    });

  const margin = isObject(data.margin) ? data.margin : {};
  return {
    positions: validatedPositions,
    margin: {
      usdcBalance: isString(margin.usdcBalance) ? margin.usdcBalance : '0.0',
      lastUpdate: isNumber(margin.lastUpdate) ? margin.lastUpdate : Date.now(),
    },
  };
}

/**
 * Validate and extract staking info with safe defaults
 */
function validateStakingInfo(data: unknown): StakingInfo {
  if (!isObject(data)) {
    return {
      totalHype: '0.0',
      stakedHype: '0',
      availableHype: '0',
      delegations: [],
      delegatorSummary: {
        delegated: '0.0',
        undelegated: '0.0',
        totalPendingWithdrawal: '0.0',
        nPendingWithdrawals: 0,
        totalStakedUsd: '0',
      },
      usdPrice: '0',
      image_url: '',
      lastUpdate: Date.now(),
    };
  }

  const delegatorSummary = isObject(data.delegatorSummary)
    ? data.delegatorSummary
    : {};
  const delegations = isArray(data.delegations) ? data.delegations : [];
  const validatedDelegations = delegations.filter(isObject).map((item) => {
    const address = item.address;
    const amount = item.amount;
    return {
      address:
        address === undefined || isString(address)
          ? (address as string | undefined)
          : undefined,
      amount:
        amount === undefined || isString(amount)
          ? (amount as string | undefined)
          : undefined,
    };
  });

  return {
    totalHype: isString(data.totalHype) ? data.totalHype : '0.0',
    stakedHype: isString(data.stakedHype) ? data.stakedHype : '0',
    availableHype: isString(data.availableHype) ? data.availableHype : '0',
    delegations: validatedDelegations,
    delegatorSummary: {
      delegated: isString(delegatorSummary.delegated)
        ? delegatorSummary.delegated
        : '0.0',
      undelegated: isString(delegatorSummary.undelegated)
        ? delegatorSummary.undelegated
        : '0.0',
      totalPendingWithdrawal: isString(delegatorSummary.totalPendingWithdrawal)
        ? delegatorSummary.totalPendingWithdrawal
        : '0.0',
      nPendingWithdrawals: isNumber(delegatorSummary.nPendingWithdrawals)
        ? delegatorSummary.nPendingWithdrawals
        : 0,
      totalStakedUsd: isString(delegatorSummary.totalStakedUsd)
        ? delegatorSummary.totalStakedUsd
        : '0',
    },
    usdPrice: isString(data.usdPrice) ? data.usdPrice : '0',
    image_url: isString(data.image_url) ? data.image_url : '',
    lastUpdate: isNumber(data.lastUpdate) ? data.lastUpdate : Date.now(),
  };
}

/**
 * Validate and extract vault info with safe defaults
 */
function validateVaultInfo(data: unknown): VaultInfo {
  if (!isObject(data)) {
    return { vaults: [], totalVaultValue: '0' };
  }

  const vaults = isArray(data.vaults) ? data.vaults : [];
  const validatedVaults = vaults.filter(isObject).map((item) => ({
    vaultAddress: isString(item.vaultAddress) ? item.vaultAddress : '',
    equity: isString(item.equity) ? item.equity : '0',
    lockedUntilTimestamp: isNumber(item.lockedUntilTimestamp)
      ? item.lockedUntilTimestamp
      : 0,
    name: isString(item.name) ? item.name : '',
    description: isString(item.description) ? item.description : '',
    leader: isString(item.leader) ? item.leader : '',
    apr: isNumber(item.apr) ? item.apr : 0,
    maxDistributable: isString(item.maxDistributable)
      ? item.maxDistributable
      : '0',
    maxWithdrawable: isString(item.maxWithdrawable)
      ? item.maxWithdrawable
      : '0',
    isClosed: typeof item.isClosed === 'boolean' ? item.isClosed : false,
    allowDeposits:
      typeof item.allowDeposits === 'boolean' ? item.allowDeposits : false,
    allTimePnl: isString(item.allTimePnl) ? item.allTimePnl : '0',
    pnl: isString(item.pnl) ? item.pnl : '0',
    lastUpdate: isNumber(item.lastUpdate) ? item.lastUpdate : Date.now(),
  }));

  return {
    vaults: validatedVaults,
    totalVaultValue: isString(data.totalVaultValue)
      ? data.totalVaultValue
      : '0',
  };
}

/**
 * Validate and extract portfolio summary with safe defaults
 */
function validatePortfolioSummary(data: unknown): PortfolioSummary {
  if (!isObject(data)) {
    return {
      totalValue: '0',
      spotValue: '0',
      perpValue: '0',
      stakedValue: '0',
      vaultValue: '0',
      lastUpdate: Date.now(),
    };
  }

  return {
    totalValue: isString(data.totalValue) ? data.totalValue : '0',
    spotValue: isString(data.spotValue) ? data.spotValue : '0',
    perpValue: isString(data.perpValue) ? data.perpValue : '0',
    stakedValue: isString(data.stakedValue) ? data.stakedValue : '0',
    vaultValue: isString(data.vaultValue) ? data.vaultValue : '0',
    lastUpdate: isNumber(data.lastUpdate) ? data.lastUpdate : Date.now(),
  };
}

/**
 * Validate Hypercore data with runtime type checking
 * Checks if the data structure matches expected shape and provides safe defaults for missing fields
 */
export function validateHypercoreData(data: unknown): HypercoreData {
  // Check if data has the expected { data: HypercoreData } structure
  const dataObj = isObject(data) ? data : {};
  const hypercoreData = isObject(dataObj.data) ? dataObj.data : {};

  return {
    spotBalances: validateSpotBalances(hypercoreData.spotBalances),
    perpPositions: validatePerpPositions(hypercoreData.perpPositions),
    stakingInfo: validateStakingInfo(hypercoreData.stakingInfo),
    vaultInfo: validateVaultInfo(hypercoreData.vaultInfo),
    portfolioSummary: validatePortfolioSummary(hypercoreData.portfolioSummary),
  };
}

/**
 * Aggregate spot balances from multiple wallets
 */
function aggregateSpotBalances(
  aggregated: SpotBalance[],
  newBalances: SpotBalance[]
): void {
  newBalances.forEach((balance) => {
    const existing = aggregated.find((b) => b.coin === balance.coin);
    if (existing) {
      existing.total = (
        parseFloat(existing.total) + parseFloat(balance.total)
      ).toString();
      existing.usdValue = (
        parseFloat(existing.usdValue) + parseFloat(balance.usdValue)
      ).toString();
    } else {
      aggregated.push({ ...balance });
    }
  });
}

/**
 * Aggregate staking info from multiple wallets
 */
function aggregateStakingInfo(
  aggregated: StakingInfo,
  newStaking: StakingInfo
): void {
  aggregated.totalHype = (
    parseFloat(aggregated.totalHype) + parseFloat(newStaking.totalHype)
  ).toString();
  aggregated.stakedHype = (
    parseFloat(aggregated.stakedHype) + parseFloat(newStaking.stakedHype)
  ).toString();
  aggregated.delegatorSummary.totalStakedUsd = (
    parseFloat(aggregated.delegatorSummary.totalStakedUsd) +
    parseFloat(newStaking.delegatorSummary?.totalStakedUsd || '0')
  ).toString();
}

/**
 * Aggregate vault info from multiple wallets
 */
function aggregateVaultInfo(aggregated: VaultInfo, newVaults: VaultInfo): void {
  aggregated.vaults.push(...newVaults.vaults);
  aggregated.totalVaultValue = (
    parseFloat(aggregated.totalVaultValue) +
    parseFloat(newVaults.totalVaultValue)
  ).toString();
}

/**
 * Aggregate portfolio summary from multiple wallets
 */
function aggregatePortfolioSummary(
  aggregated: PortfolioSummary,
  newSummary: PortfolioSummary
): void {
  aggregated.totalValue = (
    parseFloat(aggregated.totalValue) + parseFloat(newSummary.totalValue)
  ).toString();
  aggregated.spotValue = (
    parseFloat(aggregated.spotValue) + parseFloat(newSummary.spotValue)
  ).toString();
  aggregated.perpValue = (
    parseFloat(aggregated.perpValue) + parseFloat(newSummary.perpValue)
  ).toString();
  aggregated.stakedValue = (
    parseFloat(aggregated.stakedValue) + parseFloat(newSummary.stakedValue)
  ).toString();
  aggregated.vaultValue = (
    parseFloat(aggregated.vaultValue) + parseFloat(newSummary.vaultValue)
  ).toString();
}

/**
 * Aggregate perp positions from multiple wallets
 * Simply concatenates positions as they are already detailed
 */
function aggregatePerpPositions(
  aggregated: PerpPosition,
  newPerp: PerpPosition
): void {
  // Concatenate all positions
  aggregated.positions.push(...newPerp.positions);
  // Sum margin balance
  aggregated.margin.usdcBalance = (
    parseFloat(aggregated.margin.usdcBalance) +
    parseFloat(newPerp.margin.usdcBalance)
  ).toString();
  // Update lastUpdate to the most recent
  aggregated.margin.lastUpdate = Math.max(
    aggregated.margin.lastUpdate,
    newPerp.margin.lastUpdate
  );
}

/**
 * Hook to get and aggregate Hypercore data from wallet store
 * Returns data for selected wallet or aggregated data from all wallets
 */
export function useHypercoreData() {
  const { wallets, walletData, selectedWalletId } = useWalletStore();

  const hypercoreData = useMemo((): HypercoreData | null => {
    if (wallets.length === 0) return null;

    // Single wallet selected
    if (selectedWalletId) {
      const wallet = wallets.find((w) => w.id === selectedWalletId);
      if (wallet && walletData[wallet.address]?.userData) {
        // Use runtime validation instead of unsafe type assertion
        return validateHypercoreData(walletData[wallet.address].userData);
      }
      return null;
    }

    // Aggregate data from all wallets
    const aggregated = createEmptyAggregatedData();

    wallets.forEach((wallet) => {
      const userData = walletData[wallet.address]?.userData;
      if (!userData) return;

      // Use runtime validation instead of unsafe type assertion
      const validatedData = validateHypercoreData(userData);

      // Aggregate spot balances
      if (validatedData.spotBalances) {
        aggregateSpotBalances(
          aggregated.spotBalances,
          validatedData.spotBalances
        );
      }

      // Aggregate perp positions
      if (validatedData.perpPositions) {
        aggregatePerpPositions(
          aggregated.perpPositions,
          validatedData.perpPositions
        );
      }

      // Aggregate staking
      if (validatedData.stakingInfo) {
        aggregateStakingInfo(aggregated.stakingInfo, validatedData.stakingInfo);
      }

      // Aggregate vaults
      if (validatedData.vaultInfo) {
        aggregateVaultInfo(aggregated.vaultInfo, validatedData.vaultInfo);
      }

      // Aggregate portfolio summary
      if (validatedData.portfolioSummary) {
        aggregatePortfolioSummary(
          aggregated.portfolioSummary,
          validatedData.portfolioSummary
        );
      }
    });

    return aggregated;
  }, [wallets, walletData, selectedWalletId]);

  return { hypercoreData };
}
