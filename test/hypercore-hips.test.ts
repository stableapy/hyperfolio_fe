import { describe, expect, it } from 'vitest';
import { validateHypercoreData } from '@/components/sections/hypercore-section/hooks/use-hypercore-data';

describe('Hypercore HIP data', () => {
  it('keeps outcome metadata and HIP-3 collateral accounts', () => {
    const data = validateHypercoreData({
      data: {
        spotBalances: [
          {
            coin: '+1231',
            total: '5',
            hold: '0',
            entryNtl: '2',
            usdPrice: '0.4',
            usdValue: '2',
            symbol: 'No',
            name: 'BTC above target',
            decimals: '6',
            hip: 4,
            assetKind: 'outcome',
            outcome: {
              encoding: 1231,
              outcomeId: 123,
              side: 1,
              sideName: 'No',
              marketName: 'BTC above target',
              outcomeName: 'BTC outcome',
              description: 'Resolves from the BTC mark price',
              templateId: 'priceTouch',
              category: 'price',
              expiry: '2026-10-01T00:00:00.000Z',
              rawOutcomeName: 'template:priceTouch',
              rawDescription: 'perp:BTC|target:100000',
              quoteToken: 'USDC',
              venue: 'out',
              questionId: 7,
              questionRole: 'named',
              namedOutcomes: [123],
              settledNamedOutcomes: [123],
              isSettled: true,
              feeScale: '1.0',
              deployerFeeScale: '0.5',
              venueDeployer: {
                address: '0x0000000000000000000000000000000000000002',
                venue: 'out',
                subDeployers: [],
              },
            },
          },
          {
            coin: 'TEST',
            token: 12,
            total: '2',
            hold: '0',
            entryNtl: '1',
            usdPrice: '1',
            usdValue: '2',
            symbol: 'TEST',
            name: 'Test Token',
            decimals: '8',
            hip: 1,
            assetKind: 'spot',
            tokenDetails: {
              seededUsdc: '100000',
              deployer: '0x0000000000000000000000000000000000000001',
              deployTime: '2026-01-01T00:00:00Z',
            },
          },
        ],
        perpPositions: {
          positions: [],
          margin: {
            accountMode: 'default',
            usdcBalance: '10',
            accountValueUsd: '25',
            lastUpdate: 1,
            dexBalances: [
              {
                dex: 'xyz',
                dexName: 'XYZ',
                collateralToken: 360,
                collateralSymbol: 'USDH',
                accountValue: '25',
                accountValueUsd: '25',
                withdrawable: '20',
              },
            ],
          },
        },
      },
    });

    expect(data.spotBalances[0].outcome).toMatchObject({
      outcomeId: 123,
      sideName: 'No',
      questionId: 7,
      isSettled: true,
      templateId: 'priceTouch',
      expiry: '2026-10-01T00:00:00.000Z',
    });
    expect(data.spotBalances[0].token).toBe(100001231);
    expect(data.spotBalances[1].tokenDetails?.seededUsdc).toBe('100000');
    expect(data.perpPositions.margin.dexBalances[0]).toMatchObject({
      dexName: 'XYZ',
      collateralSymbol: 'USDH',
    });
    expect(data.perpPositions.margin.accountMode).toBe('default');
  });
});
