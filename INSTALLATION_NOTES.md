# Installation Notes

## ✅ Installation réussie

Les dépendances ont été installées avec succès !

### Commandes utilisées

```bash
npm install --legacy-peer-deps
```

### Pourquoi `--legacy-peer-deps` ?

Le flag `--legacy-peer-deps` a été utilisé pour résoudre le conflit de dépendances entre:
- React 19.2.0 (utilisé dans le projet)
- `vaul@0.9.9` (qui nécessitait React 16, 17 ou 18)

**Solution**: Mise à jour de `vaul` vers la version `^1.1.0` qui supporte React 19.

### Modifications apportées

1. **vaul**: `^0.9.9` → `^1.1.0` (support React 19)
2. **eslint-plugin-prettier**: `^6.0.0` → `^5.2.1` (version compatible)
3. **eslint-config-prettier**: `^10.0.0` → `^9.1.0` (version compatible)

### Prochaines étapes

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run type-check

# Linter le code
npm run lint

# Formater le code
npm run format
```

### Notes importantes

- **L'installation s'est bien passée** avec 712 packages installés
- **5 vulnérabilités détectées** (4 modérées, 1 critique)
- Pour corriger les vulnérabilités (avec breaking changes possibles):
  ```bash
  npm audit fix --force
  ```

### Structure du projet

```
hyperfolio_fe/
├── app/                    # Pages Next.js App Router
├── components/            # Composants React (shadcn/ui)
├── hooks/                 # Custom hooks
├── lib/                   # Utilitaires
├── test/                  # Tests
├── .cursor/rules/         # Règles Cursor AI
└── public/                # Assets statiques
```

### Démarrer le projet

```bash
# En développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start
```

### Composer avec le backend

Le projet est configuré pour communiquer avec votre backend NestJS:
- **URL**: `http://api.hyperfolio.xyz`
- **API Key**: Configurée dans `.env.local`

Voir `ENV_VARIABLES.md` pour plus de détails.

