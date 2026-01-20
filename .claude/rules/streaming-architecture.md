---
paths: app/api/positions/stream/route.ts, app/api/wallet/aggregate/stream/route.ts, hooks/use-positions-stream.ts, hooks/use-wallet-data-stream.ts, components/home/defi-stream-provider.tsx, components/home/wallet-data-stream-provider.tsx, lib/store/wallet-store.ts
---

# SSE Streaming Architecture

## Overview

Hyperfolio uses **Server-Sent Events (SSE)** for progressive data loading. This provides real-time feedback to users as data is fetched, rather than waiting for all data to load.

## Two-Stream System

The application runs **two independent SSE streams** in parallel:

| Stream | Endpoint | Purpose | Hook |
|--------|----------|---------|------|
| **DeFi Positions** | `/api/positions/stream` | Streams protocol positions progressively | `usePositionsStream` |
| **Wallet Data** | `/api/wallet/aggregate/stream` | Streams tokens, NFTs, history | `useWalletDataStream` |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         app/page.tsx                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐│
│  │  DefiStreamProvider             │  │  WalletDataStreamProvider││
│  │  - usePositionsStream hook      │  │  - useWalletDataStream  ││
│  │  - /api/positions/stream        │  │  - /api/wallet/aggregate│
│  └─────────────────────────────────┘  └─────────────────────────┘│
│           │                                      │               │
│           ▼                                      ▼               │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐│
│  │    wallet-store (Zustand)       │  │    wallet-store         ││
│  │  - streaming.isStreaming        │  │  - streaming.isStreaming││
│  │  - streaming.streamProgress     │  │  - streaming.progress   ││
│  │  - streaming.streamedProtocols  │  │  - walletDataStreaming  ││
│  └─────────────────────────────────┘  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Provider Pattern

Both streams use an identical provider pattern:

```typescript
export function DefiStreamProvider({ children }: { children: React.ReactNode }) {
  const { wallets, selectedWalletId, streaming, triggerSync } = useWalletStore()
  const { streamPositions, isStreaming, progress, error } = usePositionsStream()

  // Memoize addresses to prevent unnecessary re-renders
  const addresses = useMemo(() => {
    return selectedWalletId
      ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
      : wallets.map(w => w.address)
  }, [selectedWalletId, wallets])

  // Watch for syncTrigger changes to restart streams
  useEffect(() => {
    if (syncTrigger > lastSyncTriggerRef.current && addresses.length > 0) {
      const timer = setTimeout(() => {
        startStreamRef.current()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [syncTrigger, addresses.length])

  return <Provider value={{ ... }}>{children}</Provider>
}
```

## Sync Flow

When user clicks the Sync button:

```
[User clicks Sync]
        │
        ▼
[PortfolioHero.handleRefresh()]
        │
        ▼
[wallet-store.triggerSync(true)]
        │
        ├──► Increments syncTrigger counter
        ├──► Clears existing data
        ├──► Sets skipCache: true
        └──► Sets isStreaming: true
        │
        ▼
[Providers detect syncTrigger change]
        │
        ├──► [DefiStreamProvider] useEffect fires
        │     └──► Calls usePositionsStream.startStream()
        │
        └──► [WalletDataStreamProvider] useEffect fires
              └──► Calls useWalletDataStream.startStream()
        │
        ▼
[Streams run independently, updating progress]
        │
        ▼
[Both streams complete → isStreaming: false]
```

## Critical Implementation Patterns

### 1. Use Refs for Stream Functions (CRITICAL)

**Always use refs to store stream functions** to prevent cleanup race conditions:

```typescript
// GOOD - ref pattern
const startStreamRef = useRef(startStream)
const stopStreamRef = useRef(stopStream)

useEffect(() => {
  startStreamRef.current = startStream
  stopStreamRef.current = stopStream
}, [startStream, stopStream])

// Use refs in effects
useEffect(() => {
  if (shouldStart) {
    startStreamRef.current()
  }
  return () => {
    stopStreamRef.current()
  }
}, [shouldStart])
```

### 2. Memoize Addresses

**Always memoize the addresses array** used in stream dependencies:

```typescript
// GOOD - memoized
const addresses = useMemo(() => {
  return selectedWalletId
    ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
    : wallets.map(w => w.address)
}, [selectedWalletId, wallets])
```

### 3. Use Stable Keys for Dependencies

For streams that depend on multiple addresses, use a sorted string key:

```typescript
// GOOD - stable key
const addressesKey = useMemo(() => {
  return addresses.slice().sort().join(',')
}, [addresses])

useEffect(() => {
  startStream()
  return () => stopStream()
}, [addressesKey])
```

## SSE Hook Pattern

All streaming hooks follow this pattern:

```typescript
export function usePositionsStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [data, setData] = useState<Position[]>([])
  const [error, setError] = useState<string | null>(null)
  const hasStartedRef = useRef(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const startStream = useCallback((addresses: string[], skipCache = false) => {
    if (hasStartedRef.current) return

    const params = new URLSearchParams({
      addresses: addresses.join(','),
      ...(skipCache && { cache: 'false' }),
    })

    const eventSource = new EventSource(`/api/positions/stream?${params}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'progress':
          setProgress(message.data)
          break
        case 'data':
          setData(prev => [...prev, ...message.data])
          break
        case 'complete':
          setProgress(message.data)
          setIsStreaming(false)
          eventSource.close()
          break
        case 'error':
          setError(message.data)
          setIsStreaming(false)
          eventSource.close()
          break
      }
    }

    setIsStreaming(true)
    hasStartedRef.current = true
  }, [])

  const stopStream = useCallback(() => {
    eventSourceRef.current?.close()
    setIsStreaming(false)
    hasStartedRef.current = false
  }, [])

  return { startStream, stopStream, isStreaming, progress, data, error }
}
```

## SSE API Route Pattern

Server-side SSE routes follow this pattern:

```typescript
// app/api/positions/stream/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const addresses = searchParams.get('addresses')?.split(',') || []
  const skipCache = searchParams.get('cache') === 'false'

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send({ type: 'start', data: { total: protocols.length } })

        for (const protocol of protocols) {
          const positions = await fetchProtocolPositions(protocol, addresses, skipCache)
          send({ type: 'data', data: positions })
          send({ type: 'progress', data: { completed: i + 1, total: protocols.length } })
        }

        send({ type: 'complete', data: { completed: protocols.length, total: protocols.length } })
      } catch (error) {
        send({ type: 'error', data: error.message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## Store Integration

Streaming state is managed in the Zustand store:

```typescript
// lib/store/wallet-store.ts
interface StreamingState {
  isStreaming: boolean
  isStreamComplete: boolean
  streamProgress: { completed: number; total: number }
  streamedProtocols: Map<string, StreamedProtocol>
}

interface WalletDataStreaming {
  isStreaming: boolean
  isComplete: boolean
  progress: { completed: number; total: number }
  errors: string[]
}

interface WalletStore {
  streaming: StreamingState
  walletDataStreaming: WalletDataStreaming
  syncTrigger: number

  triggerSync: (skipCache?: boolean) => void
  updateStreamingProgress: (progress: StreamProgress) => void
  addStreamedProtocol: (protocol: string, data: StreamedProtocol) => void
}
```

## Debugging Streams

### Add Console Logs

Add logs to track stream lifecycle:

```typescript
useEffect(() => {
  if (syncTrigger > lastSyncTriggerRef.current && addresses.length > 0) { 
    stopStreamRef.current()
    const timer = setTimeout(() => {

      startStreamRef.current()
    }, 50)
    lastSyncTriggerRef.current = syncTrigger
    return () => {
   
      clearTimeout(timer)
    }
  }
}, [syncTrigger, addresses.length])
```

### Check Network Tab

1. Open browser DevTools → Network tab
2. Filter by "event-stream" or "stream"
3. Verify both SSE endpoints are called
4. Check the "EventStream" tab for messages

### Check Store State

```typescript
// In console, inspect Zustand store
const store = useWalletStore.getState()
console.log('syncTrigger:', store.syncTrigger)
console.log('isStreaming:', store.streaming.isStreaming)
console.log('progress:', store.streaming.streamProgress)
```

## Common Issues and Solutions

### Issue: Only One Stream Triggers

**Symptoms**: DeFi stream starts but wallet data stream doesn't (or vice versa)

**Likely Causes**:
1. Effect dependencies differ between providers
2. Cleanup is preventing one stream from starting
3. Addresses array is causing unnecessary re-renders

**Solutions**:
1. Verify both providers have identical effect structures
2. Add console logs to track when each effect fires
3. Use refs for stream functions (see Critical Pattern #1)
4. Check that both providers are using memoized addresses

### Issue: Stream Starts Multiple Times

**Symptoms**: Multiple EventSource connections open

**Solution**: Use `hasStartedRef` to track if stream has started:

```typescript
const hasStartedRef = useRef(false)

const startStream = useCallback(() => {
  if (hasStartedRef.current) return
  hasStartedRef.current = true
  // ... start stream
}, [])

useEffect(() => {
  return () => {
    hasStartedRef.current = false // Reset on cleanup
  }
}, [])
```

### Issue: Progress Not Updating

**Symptoms**: Progress counter stays at 0

**Solution**: Ensure progress updates are using immutable state updates:

```typescript
// BAD
setProgress(prev => {
  prev.completed += 1
  return prev
})

// GOOD
setProgress(prev => ({
  ...prev,
  completed: prev.completed + 1,
}))
```

## Key Files Reference

### Streaming Providers
- [components/home/defi-stream-provider.tsx](components/home/defi-stream-provider.tsx) - DeFi positions streaming
- [components/home/wallet-data-stream-provider.tsx](components/home/wallet-data-stream-provider.tsx) - Wallet data streaming

### Streaming Hooks
- [hooks/use-positions-stream.ts](hooks/use-positions-stream.ts) - Positions SSE hook
- [hooks/use-wallet-data-stream.ts](hooks/use-wallet-data-stream.ts) - Wallet data SSE hook

### API Routes
- [app/api/positions/stream/route.ts](app/api/positions/stream/route.ts) - DeFi positions SSE endpoint
- [app/api/wallet/aggregate/stream/route.ts](app/api/wallet/aggregate/stream/route.ts) - Wallet data SSE endpoint

### State Management
- [lib/store/wallet-store.ts](lib/store/wallet-store.ts) - Global streaming state

### Main Entry Points
- [app/page.tsx](app/page.tsx) - Main page that mounts providers
- [components/portfolio-hero/portfolio-hero.tsx](components/portfolio-hero/portfolio-hero.tsx) - Hero with sync button
