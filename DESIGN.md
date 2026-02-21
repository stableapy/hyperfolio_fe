# DESIGN.md - Hyperfolio Frontend Architecture

> Portfolio pour développeurs avec intégrations DeFi sur HyperEVM

Ce document sert de référence pour les IA et développeurs travaillant sur `hyperfolio-fe`. Il décrit l'architecture, les patterns, et les conventions du projet.

---

## Table des Matières

1. [Architecture du Projet](#architecture-du-projet)
2. [Design System](#design-system)
3. [Emplacement des Composants](#emplacement-des-composants)
4. [Patterns de Code](#patterns-de-code)
5. [Conventions de Nommage](#conventions-de-nommage)
6. [Gestion d'État](#gestion-détat)
7. [Data Fetching Patterns](#data-fetching-patterns)
8. [Intégrations Web3](#intégrations-web3)
9. [Styling Guidelines](#styling-guidelines)
10. [Architecture Decisions](#architecture-decisions)

---

## Architecture du Projet

### Structure des Dossiers

```
hyperfolio-fe/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes (server-side)
│   ├── billing/              # Billing & subscription pages
│   ├── telegram/             # Telegram integration pages
│   ├── api-docs/           # API documentation UI
│   ├── layout.tsx            # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css           # Global styles & theme
│   └── providers.tsx        # React Query & Web3 providers
│
├── components/               # React components
│   ├── ui/                  # Radix UI wrappers (40+ components)
│   ├── sections/            # Feature sections (DeFi, Tokens, NFTs, etc.)
│   ├── home/                # Home page specific components
│   ├── wallet/              # Wallet management components
│   ├── portfolio-hero/       # Hero section components
│   ├── subscriptions/        # Billing/subscription components
│   └── swap-widget/        # Swap integration
│
├── lib/                     # Utility libraries
│   ├── api/                # API client & fetching
│   │   ├── client.ts       # Typed API client (fetch wrappers)
│   │   ├── fetch.ts        # Secure fetch utilities
│   │   ├── security.ts     # API key & security
│   │   └── token.ts        # Token utilities
│   ├── config/             # Configuration
│   │   └── api.ts         # API endpoints & base URL
│   ├── store/              # State management
│   │   └── wallet-store.ts # Zustand wallet store
│   ├── types/              # TypeScript types
│   │   └── api.ts         # API response types
│   ├── wagmi/              # Web3 utilities
│   ├── subscriptions/       # Subscription helpers
│   └── utils/             # General utilities
│
├── hooks/                   # Custom React hooks
│   ├── use-positions-stream.ts         # SSE streaming for positions
│   ├── use-wallet-data-stream.ts       # SSE streaming for wallet data
│   └── use-hyperevm-tokens.ts        # HyperEVM token utilities
│
├── public/                  # Static assets
├── test/                   # Tests (Vitest, Playwright)
└── styles/                 # Global styles
    └── globals.css          # Tailwind imports & theme variables
```

### Tech Stack

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|----------|--------|
| Framework | Next.js | 16.1.1 | App Router, Server Components |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.1.9 | Utility-first CSS |
| UI Library | Radix UI | 20+ packages | Accessible primitives |
| State | Zustand | 5.0.2 | Client state management |
| Data Fetching | React Query | 5.90.5 | Server state & caching |
| Web3 | Wagmi | 2.19.1 | Ethereum interactions |
| Web3 | Viem | 2.38.5 | Ethereum utilities |
| Web3 | Ethers | 6.16.0 | Contract interactions |
| Forms | React Hook Form | 7.60.0 | Form validation |
| Validation | Zod | 3.25.76 | Schema validation |
| Charts | Recharts | 2.15.4 | Data visualization |
| Testing | Vitest | 2.1.9 | Unit tests |
| Testing | Playwright | 1.48.0 | E2E tests |

---

## Design System

### Radix UI Components

Les composants Radix UI sont wrappers autour des primitives accessibles. Ils sont situés dans `components/ui/`.

#### Composants Disponibles (40+)

**Form & Input:**
- `input.tsx` - Text input
- `textarea.tsx` - Textarea
- `input-otp.tsx` - One-time password input
- `input-group.tsx` - Input with addons
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider

**Navigation:**
- `button.tsx` - Primary button component
- `button-group.tsx` - Grouped buttons
- `dropdown-menu.tsx` - Dropdown menus
- `navigation-menu.tsx` - Navigation menus
- `context-menu.tsx` - Right-click menus
- `menubar.tsx` - Top-level navigation
- `tabs.tsx` - Tab navigation
- `sidebar.tsx` - Collapsible sidebar

**Dialog & Modal:**
- `dialog.tsx` - Modal dialogs
- `alert-dialog.tsx` - Confirmation dialogs
- `popover.tsx` - Popover tooltips
- `tooltip.tsx` - Hover tooltips
- `toast.tsx` - Toast notifications (via Sonner)
- `toaster.tsx` - Toast container

**Data Display:**
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars
- `card.tsx` - Card containers
- `table.tsx` - Data tables
- `empty.tsx` - Empty state placeholder
- `spinner.tsx` - Loading spinner
- `pagination.tsx` - Pagination controls
- `separator.tsx` - Visual dividers

**Layout:**
- `collapsible.tsx` - Collapsible sections
- `accordion.tsx` - Accordion menus
- `scroll-area.tsx` - Scrollable areas
- `aspect-ratio.tsx` - Aspect ratio containers
- `toggle-group.tsx` - Grouped toggles

**Animation:**
- `carousel.tsx` - Image carousel
- `theme-toggle.tsx` - Dark/light mode switch

#### Utilisation des Composants Radix

Tous les composants Radix UI suivent ce pattern:

```tsx
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <Button variant="default" size="md">
      Click me
    </Button>
  );
}
```

**Props communs:**
- `variant`: `default | secondary | destructive | ghost | link`
- `size`: `sm | md | lg | icon`
- `className`: Tailwind classes pour override

### Thème & Couleurs

Le système utilise Tailwind CSS 4 avec des variables CSS pour le thème.

#### Variables de Thème

**Light Mode (`:root`):**
```css
--theme-bg: #f5f8f5;              /* Background principal */
--theme-bg-alt: #e8efe8;           /* Background alternatif */
--theme-accent: #0d9488;           /* Accent principal (teal) */
--theme-accent-darker: #0f766e;     /* Accent foncé */
--theme-text-primary: #0a1a0f;      /* Texte principal */
--theme-text-secondary: #3d5a47;    /* Texte secondaire */
--theme-border: rgba(0, 60, 20, 0.12); /* Bordures */
--theme-glow: rgba(13, 148, 136, 0.2); /* Effet glow */
```

**Dark Mode (`.dark`):**
Variables adaptées automatiquement via la classe `.dark` sur `<html>`.

#### Couleurs d'Accent

Teal est la couleur principale, avec des accents secondaires:

- **Primary:** `#0d9488` (Teal)
- **Cyan:** `#0e7490` (Secondary accent)
- **Purple:** `#7c3aed` (Features)
- **Orange:** `#ea580c` (Warnings)
- **Red:** `#dc2626` (Errors/Destructive)

#### Utilisation du Thème

```tsx
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Toggle dark/light mode
<ThemeToggle />

// Access theme programmatically
const { theme, setTheme } = useTheme();
```

### Typography

- Font: System font stack (Inter-like)
- Headings: `font-bold` (Tailwind)
- Body: `font-normal`
- Monospace: `font-mono` pour addresses, hashes

---

## Emplacement des Composants

### components/ui/

Composants primitives et réutilisables de Radix UI.

**Règles:**
- Utiliser uniquement des composants UI de cette structure
- Ne pas créer de nouveaux composants UI ici sauf si réutilisables globalement
- Utiliser `class-variance-authority` (CVA) pour les variants
- Utiliser `clsx` et `tailwind-merge` (`cn()`) pour les classes

Exemple de structure:

```tsx
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

### components/sections/

Composants de fonctionnalités pour les différentes sections du portfolio.

**Sections disponibles:**
- DeFi Positions - Affichage des positions DeFi avec streaming
- Tokens - Liste des tokens du wallet
- NFTs - Collection NFT
- Transactions - Historique des transactions
- Points - Points DeFi par protocole
- Yield - Opportunités de yield

**Règles:**
- Chaque section est un composant autonome
- Utilise les composants UI de `components/ui/`
- Accepte des props pour personnalisation
- Gère son propre état local si nécessaire

Exemple:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty';

interface DeFiPositionsProps {
  positions: StreamedProtocol[];
  isLoading?: boolean;
}

export function DeFiPositions({ positions, isLoading }: DeFiPositionsProps) {
  if (isLoading) return <Spinner />;
  if (!positions.length) return <EmptyState />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>DeFi Positions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Render positions */}
      </CardContent>
    </Card>
  );
}
```

### components/home/

Composants spécifiques à la page d'accueil.

**Composants:**
- `FloatingSwapButton` - Bouton swap flottant
- `EmptyState` - État vide du portfolio
- `StickyNavHeader` - Navigation sticky avec scroll
- `SectionContent` - Conteneur de section
- `DefiStreamProvider` - Provider pour streaming DeFi
- `WalletDataStreamProvider` - Provider pour streaming wallet

**Règles:**
- Ne pas réutiliser hors de `app/page.tsx` sauf composants génériques
- Maintenir une séparation claire entre UI et logique

---

## Patterns de Code

### Server Components vs Client Components

**Next.js 16 App Router:**

Les composants sont Server Components par défaut. Ajouter `'use client'` en haut du fichier pour créer un Client Component.

#### Quand utiliser Server Components:

- ✅ Fetch de données côté serveur (API calls, DB queries)
- ✅ Contenu statique (SEO, metadonnées)
- ✅ Gestion de formulaires (Server Actions)
- ✅ Pages de documentation
- ✅ Pages API (`app/api/*`)

**Exemple:**

```tsx
// Server Component (par défaut)
import { prisma } from '@/lib/prisma';

export async function ServerComponent() {
  const data = await prisma.user.findMany();

  return <div>{/* Render data */}</div>;
}
```

#### Quand utiliser Client Components:

- ✅ Gestion d'état local (`useState`, `useReducer`)
- ✅ Effets browser (`useEffect`, `useLayoutEffect`)
- ✅ Événements user (`onClick`, `onChange`, etc.)
- ✅ Web3 interactions (Wagmi hooks)
- ✅ Intégrations tierces nécessitant le client
- ✅ Streaming SSE (Server-Sent Events)
- ✅ Animations avec React libraries

**Exemple:**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';

export function ClientComponent() {
  const { wallets } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Client-side effect
  }, []);

  return <div>{/* Render interactive UI */}</div>;
}
```

#### Pattern Hybride

Séparer la logique serveur et client:

```tsx
// app/page.tsx (Server Component)
import { ServerComponent } from '@/components/server';
import { ClientComponent } from '@/components/client';

export default async function Page() {
  const serverData = await getServerData();

  return (
    <div>
      <ServerComponent data={serverData} />
      <ClientComponent />
    </div>
  );
}
```

### Error Handling Patterns

#### API Errors

```tsx
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

function MyComponent() {
  const { data, error } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await fetch('/api/wallet');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return <div>{/* Render */}</div>;
}
```

#### Form Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers';
import { z } from 'zod';

const schema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
});

export function AddWalletForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('wallet')} />
      {errors.wallet && <span>{errors.wallet.message}</span>}
    </form>
  );
}
```

---

## Conventions de Nommage

### Files & Directories

**Kebab-case pour les fichiers:**
- `wallet-store.ts` ✅
- `use-positions-stream.ts` ✅
- `DeFiPositions.tsx` ❌ (use `defi-positions.tsx`)

**PascalCase pour les composants:**
- `DeFiPositions.tsx` ✅
- `AddWalletDialog.tsx` ✅
- `addWalletDialog.tsx` ❌

**camelCase pour les fichiers de logique:**
- `fetch.ts` ✅
- `security.ts` ✅
- `useWalletStore.ts` ❌ (use `wallet-store.ts`)

### Variables & Functions

**camelCase pour variables et fonctions:**
```tsx
const walletAddress = '0x...';
const isLoading = false;
const fetchWalletData = async () => {};
```

**PascalCase pour les composants:**
```tsx
export function WalletDialog() {}
export const WalletList = () => {};
```

**UPPER_SNAKE_CASE pour les constantes:**
```typescript
const API_BASE_URL = 'https://api.hyperfolio.xyz';
const MAX_WALLETS = 10;
```

### Types & Interfaces

**PascalCase pour les types et interfaces:**
```typescript
interface WalletData {}
type WalletStatus = 'connected' | 'disconnected';
type ProtocolPosition = { protocol: string; amount: number };
```

**Suffix descriptif pour les types:**
- `...Props` - Props de composant: `WalletDialogProps`
- `...Response` - Réponses API: `WalletCompositionResponse`
- `...State` - État: `StreamingState`
- `...Config` - Configuration: `ApiConfig`

---

## Gestion d'État

### Zustand Store

Zustand est utilisé pour l'état client global. Le store principal est `wallet-store.ts`.

#### Structure du Wallet Store

```typescript
interface WalletState {
  // Wallets list
  wallets: Wallet[];
  selectedWalletId: string | null;

  // Loading states
  isLoading: boolean;
  loading: Set<string>; // Wallet addresses currently loading

  // Data
  composition: WalletCompositionResponse | null;
  nfts: unknown;
  positions: unknown;
  points: PointsData[];

  // Actions
  addWallet: (wallet: Wallet) => void;
  removeWallet: (id: string) => void;
  selectWallet: (id: string) => void;
  triggerSync: (id: string) => void;
}
```

#### Utilisation du Store

```tsx
'use client';

import { useWalletStore } from '@/lib/store/wallet-store';

function MyComponent() {
  const {
    wallets,
    addWallet,
    removeWallet,
    isLoading,
  } = useWalletStore();

  return (
    <div>
      {wallets.map(w => (
        <div key={w.id}>
          {w.address}
          <button onClick={() => removeWallet(w.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

#### Créer un nouveau Store

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyStore {
  state: string;
  setState: (state: string) => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      state: 'initial',
      setState: (state) => set({ state }),
    }),
    { name: 'my-store' }
  )
);
```

### Local Component State

Utiliser `useState` pour l'état local:

```tsx
'use client';

import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tokens');

  return <div>{/* Render */}</div>;
}
```

### Server State (React Query)

React Query gère le cache et la synchronisation des données serveur.

```tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

// Query (GET)
function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => fetchWalletData(walletId),
    staleTime: 60_000, // 1 minute
  });

  return <div>{/* Render */}</div>;
}

// Mutation (POST/PUT/DELETE)
function AddWalletForm() {
  const mutation = useMutation({
    mutationFn: (address: string) => addWallet(address),
    onSuccess: () => {
      toast.success('Wallet added');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  return <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(address); }}>
    {/* Form */}
  </form>;
}
```

---

## Data Fetching Patterns

### API Client Structure

L'API client est dans `lib/api/`:

```
lib/api/
├── client.ts       # Client principal avec fetch wrappers
├── fetch.ts        # Utilitaires fetch sécurisés
├── security.ts     # Gestion API key
└── token.ts        # Utilitaires tokens
```

### Secure Fetch

Tous les appels API doivent utiliser `secureFetch`:

```typescript
import { secureFetch } from '@/lib/api/fetch';

const data = await secureFetch('/api/wallet/composition', {
  headers: {
    'X-API-Key': apiKey,
  },
});
```

### React Query Integration

**Query Keys Convention:**

```typescript
// Unique identifiers pour le cache
['wallets']                          // Tous les wallets
['wallet', walletId]                  // Wallet spécifique
['positions', walletId]               // Positions d'un wallet
['transactions', walletId]            // Transactions d'un wallet
['points', walletId]                  // Points d'un wallet
```

**Exemple complet:**

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { secureFetch } from '@/lib/api/fetch';

function WalletSection({ walletId }: { walletId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wallet', walletId],
    queryFn: async () => {
      const response = await secureFetch(`/api/wallet/${walletId}`);
      if (!response.ok) throw new Error('Failed to fetch wallet');
      return response.json();
    },
    staleTime: 30_000, // 30 secondes
    refetchInterval: 60_000, // Refetch toutes les 60s
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* Render data */}</div>;
}
```

### SSE (Server-Sent Events) Streaming

Pour les données en temps réel (positions, wallet data), utiliser SSE.

**Hook personnalisé:**

```typescript
// hooks/use-positions-stream.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventSource } from 'eventsource'; // ou fetch API native

interface StreamOptions {
  url: string;
  onMessage: (data: unknown) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useSSEStream({ url, onMessage, onError, onComplete }: StreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => setIsStreaming(true);
    eventSource.onmessage = (event) => onMessage(JSON.parse(event.data));
    eventSource.onerror = (err) => {
      setIsStreaming(false);
      setError('Stream error');
      onError?.(err as Error);
    };

    return () => eventSource.close();
  }, [url]);

  return { isStreaming, error };
}
```

---

## Intégrations Web3

### Wagmi Configuration

Wagmi est configuré dans `app/providers.tsx`:

```tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi/config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Utilisation des Wagmi Hooks

**Exemples courants:**

```tsx
'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

function WalletSection() {
  // Account info
  const { address, isConnected, chain } = useAccount();

  // Connection
  const { connect, connectors, isPending } = useConnect();

  // Disconnection
  const { disconnect } = useDisconnect();

  // Balance
  const { data: balance } = useBalance({
    address,
  });

  if (!isConnected) {
    return (
      <div>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
          >
            {connector.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
```

### Viem Utilities

Viem est utilisé pour les interactions bas niveau avec les contrats:

```typescript
import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { hyperevm } from 'viem/chains';

const client = createPublicClient({
  chain: hyperevm,
  transport: http(),
});

// Read contract
const balance = await client.getBalance({
  address: '0x...',
});

// Parse/format units
const amount = parseUnits('1.5', 18); // 1.5 * 10^18
const formatted = formatUnits(amount, 18); // "1.5"
```

### Ethers.js

Ethers est utilisé pour certaines intégrations spécifiques:

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.hyperevm.org');
const wallet = new ethers.Wallet(privateKey, provider);

// Transaction
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0'),
});
```

---

## Styling Guidelines

### Tailwind CSS 4

**Version:** 4.1.9 avec PostCSS

#### Classes de Base

**Spacing:**
- `p-4` - Padding 1rem
- `m-2` - Margin 0.5rem
- `gap-4` - Gap 1rem

**Layout:**
- `flex`, `flex-col`, `flex-row`
- `grid`, `grid-cols-2`
- `hidden`, `block`, `inline-flex`

**Typography:**
- `text-sm`, `text-base`, `text-lg`
- `font-bold`, `font-medium`
- `text-primary`, `text-secondary`

**Colors:**
- `bg-primary`, `bg-secondary`
- `text-foreground`, `text-muted-foreground`
- `border-border`, `border-input`

**States:**
- `hover:bg-primary/90` - Hover avec opacité
- `active:scale-95` - Active scale
- `disabled:opacity-50` - Disabled state

#### Thème Dark Mode

Utiliser les préfixes Tailwind avec mode:

```tsx
<div className="bg-background text-foreground dark:bg-card dark:text-card-foreground">
  {/* Content */}
</div>
```

Ou utiliser `useTheme` pour le mode conditionnel:

```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return <div className={isDark ? 'dark-styles' : 'light-styles'} />;
}
```

#### Animations

Utiliser `tw-animate-css`:

```tsx
import { fadeIn, slideUp } from 'tw-animate-css';

<div className={fadeIn()}>
  <div className={slideUp()}>
    {/* Content */}
  </div>
</div>
```

---

## Architecture Decisions

### 1. Server Components First

**Décision:** Utiliser Server Components par défaut, `'use client'` uniquement si nécessaire.

**Raisons:**
- Performance (pas de JS client pour le rendu initial)
- SEO (contenu accessible au crawl)
- Sécurité (data fetch côté serveur)

### 2. Zustand pour l'État Global

**Décision:** Zustand au lieu de Redux/Context.

**Raisons:**
- API simple et légère
- Intégration React Query pour server state
- Persistance facile avec middleware

### 3. React Query pour Server State

**Décision:** React Query pour tous les appels API.

**Raisons:**
- Cache automatique
- Gestion des race conditions
- Refetch automatique (revalidation)
- Optimistic updates supportées

### 4. SSE pour Temps Réel

**Décision:** SSE (Server-Sent Events) au lieu de WebSockets.

**Raisons:**
- Plus simple à implémenter
- Connection unidirectionnelle suffisante
- Reconnection automatique
- Compatible avec HTTP standard

### 5. Radix UI pour Accessibilité

**Décision:** Radix UI comme base composants.

**Raisons:**
- Accessibilité (a11y) intégrée
- Headless (style libre)
- Bonnes performances
- Support types TypeScript

### 6. Tailwind CSS pour Styling

**Décision:** Utility-first CSS avec Tailwind.

**Raisons:**
- Cohérence visuelle
- Pas de CSS custom à maintenir
- Dark mode intégré
- Responsive facile

### 7. TypeScript Strict

**Décision:** TypeScript avec mode strict activé.

**Raisons:**
- Catch d'erreurs à la compilation
- Autocompletion IDE
- Documentation vivante via types

### 8. Type Safety avec Zod

**Décision:** Zod pour validation runtime et TypeScript types.

**Raisons:**
- Validation des inputs (API, forms)
- Inférence de types automatique
- Messages d'erreur personnalisables

---

## Best Practices

### Performance

1. **Code Splitting:** Utiliser `dynamic()` pour les composants lourds
2. **Image Optimization:** Utiliser `next/image` pour toutes les images
3. **Caching:** Configurer React Query avec `staleTime` approprié
4. **Debounce:** Debounce les inputs utilisateur (search, etc.)
5. **Lazy Loading:** Lazy load les composants non critiques

### Accessibilité

1. **ARIA Labels:** Toujours inclure des labels pour les inputs
2. **Keyboard Navigation:** Naviguable au clavier
3. **Contrast:** Contraste suffisant (WCAG AA)
4. **Focus Management:** Focus visible et géré
5. **Screen Readers:** Contenu accessible aux lecteurs d'écran

### Sécurité

1. **API Keys:** Jamais exposer dans le client (env only)
2. **Validation:** Toujours valider les inputs côté serveur
3. **XSS:** Utiliser `dangerouslySetInnerHTML` avec précaution
4. **CORS:** Configurer CORS correctement côté serveur
5. **Rate Limiting:** Respecter les limits API

---

## Outils de Développement

### Scripts NPM

```bash
# Développement
npm run dev              # Start dev server (localhost:3000)

# Build
npm run build           # Production build
npm run start           # Start production server

# Linting & Formatting
npm run lint            # ESLint
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier format
npm run format:check    # Check formatting
npm run type-check      # TypeScript type check

# Tests
npm run test            # Unit tests (Vitest)
npm run test:ui         # Vitest UI
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E tests (Playwright)
```

### Débogage

1. **React DevTools:** Extension navigateur pour inspecter les composants
2. **Wagmi DevTools:** Extension pour Web3 state
3. **Next.js DevTools:** Logging et performance
4. **Console Logs:** Utiliser `console.log` pour débogage temporaire

---

## Ressources

### Documentation Officielle

- [Next.js 16](https://nextjs.org/docs)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Wagmi](https://wagmi.sh/)
- [Viem](https://viem.sh/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Zod](https://zod.dev/)

### Liens Internes

- Backend API: `~/repo/hyperfolio-api/`
- Documentation: `~/repo/hyperfolio-api/docs/`
- Memory: `~/.openclaw/workspace/memory/topics/hyperfolio.md`

---

## Changelog

- **2026-02-21:** Création initiale du DESIGN.md
- **2026-02-19:** Mise à jour de la structure avec Tailwind 4

---

*Pour toute question ou clarification sur l'architecture, référer à ce document en premier.*
