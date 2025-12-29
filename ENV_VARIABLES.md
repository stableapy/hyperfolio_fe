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

# Internal API Security - Signed Token Authentication
# 
# This secret is used for HMAC signing of API tokens. The authentication flow:
# 1. Server generates a signed token on page load (with User-Agent fingerprint + 10min expiry)
# 2. Token is passed to client via TokenProvider component
# 3. Client includes token in x-api-token header for all API requests
# 4. Middleware validates: signature, expiration, and fingerprint match
#
# Generate a strong random string (32+ characters recommended):
#   openssl rand -hex 32
#
# If not set, API routes will rely on origin validation only (development mode)
INTERNAL_API_SECRET=your_strong_random_secret_here_32chars

# Internal API URL for Docker/Coolify deployments (faster server-side calls)
# Uses Docker internal networking instead of going through public internet
#
# REQUIREMENTS:
# 1. Enable "Consistent Container Names" in Coolify for the backend service
# 2. Both frontend and backend must be on the same Docker network (use "coolify" network)
# 3. The backend service name in Coolify should be "hyperfolio-api"
#
# With consistent names enabled, containers are named exactly as the service name
# instead of {service}-{uuid}-{deployment-id}
#
# The code automatically falls back to NEXT_PUBLIC_API_URL if API_INTERNAL_URL is not set
API_INTERNAL_URL=http://hyperfolio-api:3000
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

## Coolify Deployment Notes

### After Frontend Redeploy

1. **Remove orphan containers** - Old containers with deployment IDs may persist:
   ```bash
   docker ps -a | grep eww8w8wgsw8wsgsg8gg8c840 | grep -v "Up" | awk '{print $1}' | xargs -r docker rm
   ```

2. **Reconnect RPC nodes to coolify network** (if disconnected):
   ```bash
   docker network connect coolify hyperliquid-node
   docker network connect coolify hyperliquid-archive
   ```

3. **Restart Traefik** if routing issues persist:
   ```bash
   docker restart coolify-proxy
   ```

### SSL/Cloudflare Configuration

For LetsEncrypt certificate renewal:
- In Cloudflare, set `api.hyperfolio.xyz` to **DNS Only** (gray cloud) temporarily
- This allows LetsEncrypt to validate the certificate directly
- After renewal, you can re-enable the orange cloud (Proxied)

### Container Naming

Enable "Consistent Container Names" in Coolify for both frontend and backend:
- Frontend: `eww8w8wgsw8wsgsg8gg8c840` (project UUID)
- Backend: `hyperfolio-api-s8ck4kwg0ksg848gs4cwog48`

This prevents duplicate router conflicts in Traefik when redeploying

