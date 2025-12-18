# HyperEVM Wallet Tracker - Frontend

A modern, high-performance wallet tracker application built with Next.js 15 for the HyperEVM blockchain.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React Server Components (primary), Zustand (client state)
- **Data Fetching**: Built-in fetch API with caching
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
hyperfolio_fe/
├── .cursor/
│   └── rules/              # Cursor AI rules for code generation
│       └── nextjs-best-practices.mdc
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth route group
│   ├── (dashboard)/        # Dashboard route group
│   ├── api/                # API routes
│   ├── components/         # Server Components
│   ├── lib/                # Utilities
│   ├── hooks/              # Custom hooks (Client)
│   ├── types/              # TypeScript types
│   ├── ui/                 # UI components
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── public/                 # Static assets
├── src/                    # Additional source files
└── package.json
```

## 🎯 Core Principles

- **DRY (Don't Repeat Yourself)**: Extract reusable logic into utilities, hooks, and components
- **Server Components First**: Default to Server Components, only use Client Components when necessary
- **Type Safety**: Use TypeScript strict mode with explicit types
- **Performance**: Optimize requests with caching, parallel fetching, and streaming
- **Error Handling**: Implement comprehensive error boundaries and fallbacks

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.9+ (LTS)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

## 📚 Key Features

### Server Components
- Default rendering strategy for optimal performance
- Direct data fetching without client-side JavaScript
- Automatic code splitting by route

### Data Fetching
- Parallel data fetching with Promise.all
- Strategic caching with revalidate options
- Streaming UI with Suspense boundaries
- On-demand revalidation with revalidateTag/revalidatePath

### Type Safety
- Strict TypeScript configuration
- Explicit type definitions for all functions
- Runtime validation with Zod schemas

### Performance
- Server-side rendering for faster initial load
- Automatic code splitting
- Image optimization with next/image
- Static asset optimization

## 🔒 Security

- Server-only code protection with `server-only` package
- Environment variable validation
- API route authentication
- Secure cookie handling

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📖 Cursor Rules

This project includes comprehensive Cursor rules for AI-assisted development:

- **File**: `.cursor/rules/nextjs-best-practices.mdc`
- **Features**: 
  - Next.js 15 best practices
  - TypeScript patterns
  - Server/Client Component guidelines
  - Data fetching patterns
  - Error handling strategies
  - Performance optimizations

The rules are automatically applied when using Cursor's AI features.

## 🌐 Environment Variables

```env
# Public variables (accessible on client)
NEXT_PUBLIC_API_URL=https://api.hyperevm.com
NEXT_PUBLIC_CHAIN_ID=1

# Server-only variables
HYPEREVM_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

## 📝 Code Style

- **Formatting**: Prettier
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Commit Messages**: Conventional Commits

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS**
- **Self-hosted**

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-latest-updates#react-server-components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the cursor rules for consistent code
2. Write tests for new features
3. Use conventional commit messages
4. Ensure TypeScript strict mode compliance
5. Follow DRY principles

## 📄 License

MIT

