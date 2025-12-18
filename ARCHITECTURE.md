# Architecture Overview

## Design Principles

### 1. Server Components First
- Default to Server Components for better performance
- Fetch data on the server to reduce client-side JavaScript
- Only use Client Components when interactivity is required

### 2. DRY (Don't Repeat Yourself)
- Extract reusable logic into utility functions
- Create shared components for common UI patterns
- Use custom hooks for shared state logic
- Centralize API calls in service modules

### 3. Type Safety
- Use TypeScript strict mode
- Define explicit types for all functions and components
- Use Zod for runtime validation
- Never use `any` type

### 4. Performance Optimization
- Fetch data in parallel using Promise.all
- Use caching strategically (force-cache, revalidate)
- Stream content with Suspense boundaries
- Optimize images with next/image
- Code split with dynamic imports

### 5. Error Handling
- Implement error boundaries at route level
- Handle async errors gracefully
- Provide user-friendly error messages
- Log errors for debugging

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Server Components                     │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────┐  │
│  │   Page.tsx   │───▶│   Layout.tsx │──▶│ Components│ │
│  └──────────────┘    └──────────────┘   └──────────┘  │
│         │                   │                  │       │
│         ▼                   ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────┐  │
│  │ Fetch Data   │    │  Shared UI  │   │  Server  │  │
│  │  (Async)     │    │   Elements   │   │ Utilities│ │
│  └──────────────┘    └──────────────┘   └──────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Client Components                    │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────┐  │
│  │ Interactive │    │   Stateful   │   │  Custom  │  │
│  │   Buttons    │    │  Components  │ IPA│  Hooks   │  │
│  └──────────────┘    └──────────────┘   └──────────┘  │
│         │                   │                  │       │
│         ▼                   ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────┐  │
│  │  API Routes  │    │  Zustand     │   │ Client   │  │
│  │  /app/api/*  │    │   Store      │   │ Utilities│ │
│  └──────────────┘    └──────────────┘   └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## File Organization

### App Router Structure
```
app/
├── (auth)/              # Route group for authentication
│   ├── login/
│   │   └── page.tsx
│   └-logout/
│       └── page.tsx
├── (dashboard)/         # Route group for dashboard
│   ├── wallet/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── transactions/
│       └── page.tsx
├── api/                # API routes
│   ├── wallet/
│   │   └── route.ts
│   └── transactions/
│       └── route.ts
├── components/         # Server Components
│   ├── wallet-card.tsx
│   └── transaction-list.tsx
├── lib/                # Server utilities
│   ├── api.ts
│   └── db.ts
├── hooks/              # Client hooks (use client)
│   ├── use-wallet.ts
│   └── use-balance.ts
├── types/              # TypeScript types
│   ├── wallet.ts
│   └── transaction.ts
└── ui/                 # Reusable UI components
    ├── button.tsx
    └── card.tsx
```

## Component Patterns

### Server Component Example
```typescript
// app/wallet/page.tsx
import { getWallets } from '@/lib/api';

export default async function WalletPage() {
  const wallets = await getWallets();
  
  return (
    <div>
      {wallets.map(wallet => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </div>
  );
}
```

### Client Component Example
```typescript
// app/components/connect-button.tsx
'use client';

import { useState } from 'react';

export function ConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    // Connect logic
    setIsConnecting(false);
  };
  
  return (
    <button onClick={handleConnect} disabled={isConnecting}>
      Connect Wallet
    </button>
  );
}
```

## Data Fetching Strategies

### 1. Parallel Fetching
```typescript
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
]);
```

### 2. Sequential Fetching (when dependent)
```typescript
const data1 = await fetchData1();
const data2 = await fetchData2(data1.id);
```

### 3. Streaming with Suspense
```typescript
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>
```

## State Management

### Server State
- Fetch in Server Components
- Use React cache for deduplication
- Revalidate with tags or paths

### Client State
- Use useState for local state
- Use Zustand for global state
- Use Context for theme and providers

## Security

### Server Protection
- Use `server-only` package
- Never expose secrets to client
- Validate input with Zod
- Sanitize user input

### API Protection
- Authenticate requests
- Rate limit endpoints
- Validate request data
- Handle errors gracefully

## Performance

### Optimizations
- Code splitting by route
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization with next/font
- Static generation when possible

### Monitoring
- Core Web Vitals
- Lighthouse audits
- Error tracking (Sentry)
- Analytics

## Testing Strategy

### Unit Tests
- Test utility functions
- Test custom hooks
- Test component logic

### Integration Tests
- Test API routes
- Test data flow
- Test error handling

### E2E Tests
- Test user workflows
- Test critical paths
- Test responsive design

