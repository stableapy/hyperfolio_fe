---
name: next-component
description: How to create Next.js 15 components with proper Server/Client boundaries and TypeScript
license: MIT
compatibility: opencode
metadata:
  project: hyperfolio
  type: component
---

## Decision: Server or Client?

| Need | Use |
|------|-----|
| Data fetching | Server Component |
| Static content | Server Component |
| onClick, onChange | Client Component |
| useState, useEffect | Client Component |
| Browser APIs | Client Component |

## Server Component Template

```typescript
// components/sections/example-section/example-card.tsx
import { formatUnits } from 'viem';

interface ExampleCardProps {
  data: ExampleData;
  showBalance?: boolean;
}

export function ExampleCard({ data, showBalance = true }: ExampleCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-medium">{data.title}</h3>
      {showBalance && (
        <p className="text-muted-foreground">
          {formatUnits(data.balance, data.decimals)}
        </p>
      )}
    </div>
  );
}
```

## Client Component Template

```typescript
// components/sections/example-section/example-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExampleButtonProps {
  onAction: (value: string) => void;
}

export function ExampleButton({ onAction }: ExampleButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAction('value');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Click Me'}
    </Button>
  );
}
```

## Checklist

- [ ] Props interface defined with explicit types
- [ ] No `any` types
- [ ] `'use client'` only if needed
- [ ] Tailwind classes for styling
- [ ] Loading states handled
- [ ] Error states handled

## When to Use

Load this skill when creating:
- New React components
- UI elements
- Section components

