# Environment Variables

## Setup

Copy the variables below to your `.env.local` file for local development.

## Public Variables (Client-Side)

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

```env
NEXT_PUBLIC_API_URL=http://api.hyperfolio.xyz
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_NETWORK_NAME=HyperEVM

# GlueX Widget Integration
NEXT_PUBLIC_GLUEX_INTEGRATOR=your_integrator_id
NEXT_PUBLIC_GLUEX_API_KEY=your_api_key

# Wallet Connection (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## Server-Only Variables

These variables are never exposed to the client and are only available in Server Components and API routes.

```env
HYPEREVM_API_KEY=statuspage_aCMuCwVdKbV0T0M6qc_Pots9LS4GLlVgHfpKXTKcxjU
DATABASE_URL=postgresql://user:password@localhost:5432/hyperfolio
JWT_SECRET=your_jwt_secret_here
```

## Optional Variables

```env
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Monitoring
SENTRY_DSN=your_sentry_dsn

# Wallet Configuration
WALLET_NETWORK_RPC=https://rpc.hyperevm.com
WALLET_SUPPORTED_CHAINS=1,8453,42161
```

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Generate strong secrets for production
- Use different API keys for development and production
- Rotate keys regularly

