# Dependencies Overview

## ✅ Updated Package.json

Le fichier `package.json` a été mis à jour avec toutes les dépendances nécessaires pour le projet HyperEVM Wallet Tracker.

### 📦 Nouvelles dépendances ajoutées

#### Core
- `server-only` - Protection du code serveur uniquement
- `zustand` - Gestion d'état client légère

#### Development Tools
- `prettier` - Formatage de code
- `prettier-plugin-tailwindcss` - Support Tailwind dans Prettier
- `eslint-config-prettier` - Intégration ESLint/Prettier
- `eslint-plugin-prettier` - Plugin Prettier pour ESLint
- `vitest` - Framework de test
- `@vitejs/plugin-react` - Plugin React pour Vitest
- `@testing-library/react` - Tests de composants React
- `@testing-library/jest-dom` - Matchers Jest DOM
- `happy-dom` - Environnement DOM pour les tests
- `@playwright/test` - Tests E2E
- `@vitest/coverage-v8` - Couverture de code

### 🔧 Scripts mis à jour

```json
{
  "dev": "next dev",                    // Développement
  "build": "next build",                // Build production
  "start": "next start",                // Démarrer en production
  "lint": "next lint",                  // Linter le code
  "lint:fix": "next lint --fix",        // Linter et corriger
  "type-check": "tsc --noEmit",         // Vérifier les types TypeScript
  "format": "prettier --write .",       // Formater le code
  "format:check": "prettier --check .", // Vérifier le formatage
  "test": "vitest",                     // Tests unitaires
  "test:ui": "vitest --ui",             // Tests avec interface
  "test:coverage": "vitest --coverage", // Couverture de code
  "test:e2e": "playwright test"        // Tests E2E
}
```

### 📋 Fichiers de configuration créés

1. **`.prettierrc`** - Configuration Prettier
2. **`.prettierignore`** - Fichiers à ignorer par Prettier
3. **`.eslintrc.json`** - Configuration ESLint avec support Prettier
4. **`vitest.config.ts`** - Configuration Vitest
5. **`test/setup.ts`** - Configuration des tests

## 🚀 Installation

```bash
# Installer toutes les dépendances
npm install

# Ou avec yarn
yarn install

# Ou avec pnpm
pnpm install
```

## 📊 Dépendances existantes (du code V0.dev)

Le projet inclut déjà tous les composants shadcn/ui:
- Radix UI (tous les composants)
- Lucide React (icônes)
- Recharts (graphiques)
- React Hook Form + Zod (formulaires)
- Next Themes (gestion des thèmes)
- Tailwind CSS v4
- Et plus...

## ✅ Résumé

✅ **Total des dépendances**: ~60+ packages
✅ **Framework**: Next.js 16.0.0
✅ **React**: 19.2.0
✅ **TypeScript**: Inclus
✅ **Tailwind CSS**: v4.1.9
✅ **Testing**: Vitest + Playwright
✅ **Linting**: ESLint + Prettier
✅ **UI Components**: shadcn/ui complet

## 🔍 Vérification

Pour vérifier que tout est installé correctement:

```bash
# Vérifier les types
npm run type-check

# Linter le code
npm run lint

# Formater le code
npm run format

# Tester
npm test
```

## 📝 Prochaines étapes

1. Installer les dépendances: `npm install`
2. Lancer le serveur de dev: `npm run dev`
3. Commencer à développer!

Voir `QUICK_START.md` pour plus de détails.

