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
# API_INTERNAL_URL=http://hyperfolio-api:3000 (set at runtime for Docker internal networking)

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

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for zero-downtime deployments
# Using wget (included in Alpine) - Coolify waits for this to pass before routing traffic
HEALTHCHECK --interval=5s --timeout=5s --start-period=40s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

