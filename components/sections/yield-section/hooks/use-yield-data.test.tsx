import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { secureFetch } from '@/lib/api/fetch';
import type { PaginatedYieldResponse, YieldOpportunity } from '@/lib/types/api';
import type { YieldFilters } from '../types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { YieldCard } from '../yield-card';
import { YieldGridCard } from '../yield-grid-card';
import { YieldStats } from '../yield-stats';
import { useYieldData } from './use-yield-data';

vi.mock('@/lib/api/fetch', () => ({ secureFetch: vi.fn() }));
const filters: YieldFilters = {
  selectedTokens: [], selectedCategories: [], selectedProtocols: [],
  searchQuery: '', minApy: '', maxApy: '', minTvl: '', maxTvl: '',
  stablecoinOnly: false, hypeOnly: false, sortOrder: 'desc',
};
const opportunity: YieldOpportunity = {
  id: 'supply-usdc', category: 'lending', type: 'supply',
  protocol: { id: 'test', name: 'Test', category: 'lending', website: 'https://example.com', chainId: 999 },
  pool: { name: 'USDC', symbol: 'USDC' }, apy: { baseApy: 0, totalApy: 0 },
  risk: { riskLevel: 'low' }, metadata: { underlyingSymbol: 'USDC' },
  lastUpdated: '2026-09-08', dataSource: 'api',
};
function response(data: YieldOpportunity[] = [opportunity], pageSize = 25): Response {
  const body: PaginatedYieldResponse = {
    data, metadata: {},
    pagination: { page: 1, page_size: pageSize, total_items: 73, total_pages: Math.ceil(73 / pageSize), has_next: true },
  };
  return new Response(JSON.stringify(body));
}
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.useRealTimers(); });

describe('server-side yield pagination', () => {
  it.each([false, true])('keeps summary availability distinct from zero (available=%s)', async (available) => {
    vi.mocked(secureFetch).mockResolvedValue(response([{ ...opportunity, apy: { baseApy: 0, available } }]));
    const { result } = renderHook(() => useYieldData(filters, { page: 1, pageSize: 25 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats.highestApy).toBe(available ? 0 : null);
    expect(result.current.stats.averageApy).toBe(available ? 0 : null);
    render(<TooltipProvider><YieldStats stats={result.current.stats} isLoading={false} hasData /></TooltipProvider>);
    expect(screen.getAllByText(available ? '0.00%' : 'N/A')).toHaveLength(2);
    expect(screen.queryByText(available ? 'N/A' : '0.00%')).toBeNull();
  });

  it('refetches symbols and addresses and keeps the server count across page sizes', async () => {
    vi.mocked(secureFetch).mockResolvedValueOnce(response()).mockResolvedValueOnce(response([
      opportunity, { ...opportunity, id: 'borrow-usdc', type: 'borrow' },
    ])).mockResolvedValueOnce(response([opportunity], 100));
    const { result, rerender } = renderHook(({ selectedTokens, pageSize }) =>
      useYieldData({ ...filters, selectedTokens }, { page: 1, pageSize }),
      { initialProps: { selectedTokens: [] as string[], pageSize: 25 } });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const address = '0x' + 'a'.repeat(40);
    rerender({ selectedTokens: ['USDC', address], pageSize: 25 });
    await waitFor(() => expect(result.current.opportunities).toHaveLength(2));
    const query = new URL(vi.mocked(secureFetch).mock.calls[1][0], 'https://example.com').searchParams;
    expect(query.getAll('token_symbols')).toEqual(['USDC']);
    expect(query.getAll('token_addresses')).toEqual([address]);
    expect(result.current.pagination?.totalItems).toBe(73);
    expect(result.current.stats.totalCount).toBe(73);
    rerender({ selectedTokens: ['USDC'], pageSize: 100 });
    await waitFor(() => expect(result.current.pagination?.pageSize).toBe(100));
    expect(result.current.pagination?.totalItems).toBe(73);
  });

  it('sends range filters to the API without removing returned rows locally', async () => {
    vi.mocked(secureFetch).mockResolvedValue(response());
    const { result } = renderHook(() => useYieldData({ ...filters, minApy: '4', maxApy: '8', minTvl: '10', maxTvl: '100' }, { page: 1, pageSize: 25 }));
    await waitFor(() => expect(result.current.opportunities).toHaveLength(1));
    const query = new URL(vi.mocked(secureFetch).mock.calls[0][0], 'https://example.com').searchParams;
    expect(query.get('min_apy')).toBe('4');
    expect(query.get('max_apy')).toBe('8');
    expect(query.get('min_tvl')).toBe('10');
    expect(query.get('max_tvl')).toBe('100');
    expect(query.has('min_value')).toBe(false);
  });

  it('aborts obsolete requests and ignores their late responses', async () => {
    let finishOld: (value: Response) => void = () => {};
    vi.mocked(secureFetch).mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve; })).mockResolvedValueOnce(response());
    const { result, rerender } = renderHook(({ selectedTokens }) => useYieldData({ ...filters, selectedTokens }, { page: 1, pageSize: 25 }), { initialProps: { selectedTokens: [] as string[] } });
    const signal = vi.mocked(secureFetch).mock.calls[0][1]?.signal;
    rerender({ selectedTokens: ['USDC'] });
    expect(signal?.aborted).toBe(true);
    await waitFor(() => expect(result.current.opportunities).toHaveLength(1));
    await act(async () => { finishOld(response([{ ...opportunity, id: 'stale' }])); });
    expect(result.current.opportunities[0].id).toBe('supply-usdc');
  });

  it('reports HTTP failures without retrying or retaining previous rows', async () => {
    vi.mocked(secureFetch).mockResolvedValue(new Response('{}', { status: 503 }));
    const { result } = renderHook(() => useYieldData(filters, { page: 1, pageSize: 25 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorDetails?.status).toBe(503);
    expect(result.current.opportunities).toEqual([]);
    expect(secureFetch).toHaveBeenCalledTimes(1);
  });

  it('bounds network retries and cancels scheduled retries on unmount', async () => {
    vi.useFakeTimers();
    vi.mocked(secureFetch).mockRejectedValue(new Error('network unavailable'));
    const { result, unmount } = renderHook(() => useYieldData(filters, { page: 1, pageSize: 25 }));
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(secureFetch).toHaveBeenCalledTimes(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorDetails?.errorType).toBe('NETWORK_ERROR');
    unmount();
    const second = renderHook(() => useYieldData(filters, { page: 1, pageSize: 25 }));
    await act(async () => {});
    second.unmount();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(secureFetch).toHaveBeenCalledTimes(4);
  });
});

describe.each([['list', YieldCard], ['grid', YieldGridCard]] as const)('%s APY availability', (_, Card) => {
  it('shows real zero but updates the same ID to N/A when unavailable', () => {
    const { rerender } = render(<TooltipProvider><Card opportunity={opportunity} /></TooltipProvider>);
    expect(screen.getAllByText('0.00%').length).toBeGreaterThan(0);
    rerender(<TooltipProvider><Card opportunity={{ ...opportunity, apy: { ...opportunity.apy, available: false } }} /></TooltipProvider>);
    expect(screen.queryByText('0.00%')).toBeNull();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('supply').length).toBeGreaterThan(0);
  });
});
