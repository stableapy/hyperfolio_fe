# Build stage
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm i; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables (NEXT_PUBLIC_ are baked in at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_NETWORK_NAME
ARG NEXT_PUBLIC_GLUEX_INTEGRATOR
ARG NEXT_PUBLIC_GLUEX_API_KEY
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_ANALYTICS_ID

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CHAIN_ID=$NEXT_PUBLIC_CHAIN_ID
ENV NEXT_PUBLIC_NETWORK_NAME=$NEXT_PUBLIC_NETWORK_NAME
ENV NEXT_PUBLIC_GLUEX_INTEGRATOR=$NEXT_PUBLIC_GLUEX_INTEGRATOR
ENV NEXT_PUBLIC_GLUEX_API_KEY=$NEXT_PUBLIC_GLUEX_API_KEY
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_ANALYTICS_ID=$NEXT_PUBLIC_ANALYTICS_ID

# Runtime server-only variables (set in Coolify, not baked into image)
# API_INTERNAL_URL=http://hyperfolio-api:3000
# Requires: "Consistent Container Names" enabled in Coolify for backend
# Both services must be on the same Docker network (coolify network)

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build; \
  else \
    npm run build; \
  fi

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for Coolify health checks (required - Coolify uses curl internally)
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy custom entrypoint and health check scripts for rolling deployment workaround
# These scripts handle startup delay to prevent Traefik router name conflicts
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chown=nextjs:nodejs healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/healthcheck.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Rolling deployment configuration (configurable via Coolify environment variables)
# STARTUP_DELAY: seconds to wait before starting (default: 10)
# ENABLE_STARTUP_DELAY: set to "false" to disable (default: true)
ENV STARTUP_DELAY=10
ENV ENABLE_STARTUP_DELAY=true

# Health check for zero-downtime deployments
# Uses custom script that checks both startup completion and server health
# Increased start-period to account for startup delay + server boot time
HEALTHCHECK --interval=5s --timeout=5s --start-period=60s --retries=5 \
  CMD /usr/local/bin/healthcheck.sh

# Use custom entrypoint for rolling deployment handling
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]

