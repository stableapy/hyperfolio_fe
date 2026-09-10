import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PositionItem } from './position-item';

afterEach(cleanup);

describe('PositionItem', () => {
  it('shows claimable and paid Signal rewards on the DeFi row', () => {
    render(
      <PositionItem
        showWalletIndicator={false}
        privacyMode={false}
        totalPortfolioUSD={119_586}
        position={{
          id: 'signal-token',
          protocol: 'Signal',
          type: 'staking',
          positionSubType: null,
          assets: ['SIGNAL'],
          deposited: 119_586,
          current: 119_586,
          apy: 0,
          rewards: 0,
          logo: 'signal.ico',
          positionDetails: {
            token: {
              symbol: 'SIGNAL',
              formattedBalance: '36861152',
            },
            reward: {
              symbol: 'HYPE',
              claimable: '0.1933',
              paidToDate: '10.6046',
            },
          },
        }}
      />
    );

    expect(screen.getByText('earns:').parentElement).toHaveTextContent(
      'earns:HYPEclaimable:0.1933 HYPEpaid to date:10.6046 HYPE'
    );
  });
});
