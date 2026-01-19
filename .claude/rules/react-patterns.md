---
paths: components/**/*.tsx, hooks/**/*.ts, app/**/*.tsx
---

# React Patterns for Hyperfolio Frontend

## Critical: useEffect Cleanup Race Conditions

When an effect has functions in its dependency array that may change, **use refs** to prevent cleanup from cancelling scheduled work.

### The Problem

```typescript
// BAD - cleanup race condition
useEffect(() => {
  if (syncTrigger > lastSyncTriggerRef.current) {
    const timer = setTimeout(() => {
      startStream() // startStream changed → cleanup runs → timer cancelled!
    }, 50)
    lastSyncTriggerRef.current = syncTrigger
    return () => clearTimeout(timer)
  }
}, [syncTrigger, startStream]) // startStream changes trigger cleanup
```

### The Solution

```typescript
// GOOD - use refs for stable references
const startStreamRef = useRef(startStream)
useEffect(() => {
  startStreamRef.current = startStream
}, [startStream])

useEffect(() => {
  if (syncTrigger > lastSyncTriggerRef.current) {
    const timer = setTimeout(() => {
      startStreamRef.current() // Uses ref, no cleanup race
    }, 50)
    lastSyncTriggerRef.current = syncTrigger
    return () => clearTimeout(timer)
  }
}, [syncTrigger]) // Only depends on syncTrigger
```

### Files Using This Pattern
- [components/home/defi-stream-provider.tsx](components/home/defi-stream-provider.tsx)
- [components/home/wallet-data-stream-provider.tsx](components/home/wallet-data-stream-provider.tsx)

## useMemo for Stable Dependencies

**Always memoize arrays/objects used in useEffect dependencies** to prevent unnecessary re-renders:

```typescript
// BAD - new array on every render
const addresses = selectedWalletId
  ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
  : wallets.map(w => w.address)

useEffect(() => {
  startStream()
}, [addresses]) // Effect runs every render!
```

```typescript
// GOOD - memoized, only changes when dependencies change
const addresses = useMemo(() => {
  return selectedWalletId
    ? wallets.filter(w => w.id === selectedWalletId).map(w => w.address)
    : wallets.map(w => w.address)
}, [selectedWalletId, wallets])

useEffect(() => {
  startStream()
}, [addresses]) // Effect runs only when addresses actually change
```

## Streaming State Pattern

For SSE (Server-Sent Events) streaming, use this consistent state pattern:

```typescript
interface StreamState {
  isStreaming: boolean
  isComplete: boolean
  progress: { completed: number; total: number }
  errors: string[]
}

const [streamState, setStreamState] = useState<StreamState>({
  isStreaming: false,
  isComplete: false,
  progress: { completed: 0, total: 0 },
  errors: [],
})

// Update progress incrementally
setStreamState(prev => ({
  ...prev,
  progress: {
    completed: prev.progress.completed + 1,
    total: newTotal,
  },
}))
```

## Ref Pattern for Has-Started Tracking

Use refs to track if an async operation has started to prevent duplicate starts:

```typescript
const hasStartedRef = useRef(false)

useEffect(() => {
  if (enabled && addresses.length > 0 && !hasStartedRef.current) {
    startStream()
    hasStartedRef.current = true
  }
  return () => {
    stopStream()
    hasStartedRef.current = false
  }
}, [enabled, addresses.length])
```

## Custom Hook Return Shape

All custom hooks should return a consistent shape:

```typescript
interface UseDataReturn<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  // ... additional properties as needed
}

export function useTokensData(wallets: Wallet[]): UseDataReturn<Token> {
  // ... hook logic
  return {
    data: filteredTokens,
    isLoading: isFetching,
    error: errorMessage,
  }
}
```

## Server vs Client Components

### Default to Server Components
- Server Components are the default in Next.js 16
- Only add `"use client"` when you need:
  - React hooks (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (window, localStorage, etc.)
  - Third-party libraries that require client-side rendering

### When to Use Client Components
```typescript
"use client"

// Client component - uses hooks and event handlers
import { useState } from "react"

export function MyComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

```typescript
// Server component - no hooks, pure rendering
export async function MyServerComponent() {
  const data = await fetchData() // Can use async/await
  return <div>{data}</div>
}
```

## Component Patterns

### Feature-Based Co-location

Group related files together:

```
components/portfolio-hero/
├── portfolio-hero.tsx       # Main component
├── use-portfolio-data.ts    # Custom hook
├── types.ts                 # TypeScript types
└── portfolio-hero.test.tsx  # Tests
```

### Props Destructuring

```typescript
// GOOD - destructure props with types
interface Props {
  title: string
  count: number
  onAction: () => void
}

export function MyComponent({ title, count, onAction }: Props) {
  return <div>{title}: {count}</div>
}
```

### Early Returns for Loading States

```typescript
// GOOD - early returns
export function TokenList({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) {
    return <EmptyState />
  }

  return (
    <ul>
      {tokens.map(token => <TokenRow key={token.id} token={token} />)}
    </ul>
  )
}
```

## Performance Patterns

### Memoization Guidelines

```typescript
// Use useMemo for expensive computations
const filteredTokens = useMemo(
  () => tokens.filter(t => t.value > 0),
  [tokens]
)

// Use useCallback for callbacks passed to child components
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

// Don't over-optimize - simple operations don't need memoization
const displayName = `${firstName} ${lastName}` // Fine without useMemo
```

### Key Props for Lists

```typescript
// Always provide stable, unique keys
{tokens.map(token => (
  <TokenRow key={token.address} token={token} />
))}

// BAD - using index as key
{tokens.map((token, index) => (
  <TokenRow key={index} token={token} />
))}
```

## Error Handling Patterns

### Error Boundaries

```typescript
// Wrap components that might throw
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

### Try-Catch in Effects

```typescript
useEffect(() => {
  async function fetchData() {
    try {
      const data = await api.fetch()
      setData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  fetchData()
}, [])
```

## Forms with React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
})

export function WalletForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('wallet')} />
      {errors.wallet && <span>{errors.wallet.message}</span>}
    </form>
  )
}
```

## Common Pitfalls

### Don't Mutate State Directly

```typescript
// BAD
state.items.push(newItem)
setState(state)

// GOOD
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem],
}))
```

### Don't Use useEffect for Derived State

```typescript
// BAD - unnecessary effect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// GOOD - compute during render
const fullName = `${firstName} ${lastName}`
```

### Don't Create Functions in Render

```typescript
// BAD - new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// GOOD - stable reference
const handleClick = useCallback(() => {
  // ... handle click with id
}, [id])

<button onClick={handleClick}>Click</button>
```

## Debugging React Issues

### When Effects Don't Run

1. Check dependencies array - are they actually changing?
2. Add console.log inside the effect
3. Use React DevTools Profiler to see re-renders
4. Check if the component is unmounting/remounting

### When Components Re-render Too Much

1. Use React DevTools Profiler to identify why
2. Check if props are new objects/arrays each render
3. Wrap objects/arrays in useMemo
4. Wrap callbacks in useCallback
5. Check if parent is re-rendering unnecessarily
