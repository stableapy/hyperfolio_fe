---
name: api-endpoint
description: How to create Next.js API routes with proper validation, error handling, and caching
license: MIT
compatibility: opencode
metadata:
  project: hyperfolio
  type: api
---

## API Route Template

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ExampleResponse {
  data: ExampleData | null;
  error: { code: string; message: string } | null;
}

export async function GET(request: NextRequest): Promise<NextResponse<ExampleResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_ID', message: 'ID is required' } },
        { status: 400 }
      );
    }

    const data = await fetchData(id);

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch data' } },
      { status: 500 }
    );
  }
}
```

## Dynamic Route Template

```typescript
// app/api/wallets/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ address: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { address } = await context.params;

  // Validate address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_ADDRESS', message: 'Invalid address' } },
      { status: 400 }
    );
  }

  // Fetch and return data...
}
```

## Caching Pattern

```typescript
// Cache for 60 seconds
export async function GET() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  });

  return NextResponse.json({ data: await data.json(), error: null });
}
```

## Checklist

- [ ] Input validation
- [ ] Proper error codes and messages
- [ ] TypeScript response types
- [ ] try/catch with error logging
- [ ] Appropriate HTTP status codes
- [ ] Caching strategy defined

## When to Use

Load this skill when creating:
- New API endpoints
- Modifying existing routes
- Adding validation logic

