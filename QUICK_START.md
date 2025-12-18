# Quick Start Guide

## 🚀 Initial Setup

### 1. Initialize Next.js Project

```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Or use the interactive CLI
npx create-next-app@latest
```

### 2. Install Additional Dependencies

```bash
# Core dependencies
npm install server-only zod zustand

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier prettier-plugin-tailwindcss
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Setup Environment Variables

Create `.env.local`:

```env
# Public variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=1

# Server-only variables
HYPEREVM_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

### 5. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 6. Setup ESLint and Prettier

Create `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 7. Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 📁 Create Initial Structure

```bash
# Create directory structure
mkdir -p src/app/api
mkdir -p src/app/components
mkdir -p src/app/lib
mkdir -p src/app/hooks
mkdir -p src/app/types
mkdir -p src/app/ui
mkdir -p src/test
```

## 🎨 First Steps

### 1. Create Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HyperEVM Wallet Tracker',
  description: 'Track your HyperEVM wallet balances and transactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Create Home Page

```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        HyperEVM Wallet Tracker
      </h1>
      <p className="text-lg text-gray-600">
        Connect your wallet to get started
      </p>
    </main>
  );
}
```

### 3. Create API Utility

```typescript
// src/app/lib/api.ts
import 'server-only';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWallets() {
  const res = await fetch(`${API_URL}/wallets`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch wallets');
  }
  
  return res.json();
}
```

### 4. Test the Setup

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm test

# Run linting
npm run lint

# Type check
npm run type-check
```

## 🎯 Next Steps

1. **Connect to Backend**: Update API endpoints in `.env.local`
2. **Create Wallet Components**: Build UI for wallet display
3. **Implement Authentication**: Add wallet connection logic
4. **Add Error Handling**: Create error boundaries
5. **Setup Testing**: Write tests for critical features

## 📚 Learn More

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for design patterns
- Read [README.md](./README.md) for full documentation
- Check `.cursor/rules/nextjs-best-practices.mdc` for coding guidelines

## 🐛 Troubleshooting

### Issue: Module not found errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: TypeScript errors
**Solution**: Run `npm run type-check` to see detailed errors

### Issue: Build fails
**Solution**: Check that all environment variables are set in `.env.local`

### Issue: Cursor rules not working
**Solution**: Ensure `.cursor/rules/` directory exists and rules are in `.mdc` format

## 💡 Tips

- Use Server Components by default
- Fetch data in parallel with Promise.all
- Use Suspense for streaming content
- Add error boundaries for better UX
- Test critical paths with E2E tests
- Monitor performance with Lighthouse

## 🆘 Need Help?

- Check the [Next.js docs](https://nextjs.org/docs)
- Review the cursor rules in `.cursor/rules/`
- Search existing issues
- Create a new issue with detailed information

