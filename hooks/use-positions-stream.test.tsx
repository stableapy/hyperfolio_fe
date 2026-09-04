import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type StreamPortfolioStats,
  usePositionsStream,
} from '@/hooks/use-positions-stream';

const freshStats: StreamPortfolioStats = {
  totalValueUSD: '200',
  weightedApyPercent: 6,
  totalValueWithApy: 200,
  positionsWithApy: 1,
  totalPositions: 1,
  estimatedYield: { daily: '0.2', weekly: '1.4', monthly: '6' },
};

describe('usePositionsStream', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('aborts the previous request before publishing a restarted stream', async () => {
    const streams: Array<{
      controller: ReadableStreamDefaultController<Uint8Array>;
      signal: AbortSignal;
    }> = [];
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        let streamController:
          | ReadableStreamDefaultController<Uint8Array>
          | undefined;
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            streamController = controller;
          },
        });
        streams.push({
          controller: streamController!,
          signal: init?.signal as AbortSignal,
        });
        return new Response(body, { status: 200 });
      }
    );
    vi.stubGlobal('fetch', fetchMock);
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePositionsStream({
        addresses: ['0xabc'],
        enabled: false,
        onComplete,
      })
    );

    act(() => result.current.startStream());
    await waitFor(() => expect(streams).toHaveLength(1));
    act(() => result.current.startStream());
    await waitFor(() => expect(streams).toHaveLength(2));

    expect(streams[0].signal.aborted).toBe(true);
    const message = `data: ${JSON.stringify({
      type: 'complete',
      portfolioStats: freshStats,
    })}\n\n`;
    act(() => {
      streams[1].controller.enqueue(new TextEncoder().encode(message));
      streams[1].controller.close();
    });

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(freshStats));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.portfolioStats).toEqual(freshStats);
  });
});
