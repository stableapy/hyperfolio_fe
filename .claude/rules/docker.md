---
paths: docker-compose*.yml, docker-compose*.yaml, Dockerfile*, .dockerignore, **/*docker*
---

# Docker and Coolify Best Practices for Hyperfolio API

## Docker Compose Version

Always use **version 3.8+** for production deployments:

```yaml
version: "3.9"
services:
  # ...
```

## Service Configuration

### Restart Policy

```yaml
services:
  hyperfolio-api:
    restart: unless-stopped  # Always restart unless stopped manually
```

### Health Checks

**ALL services must have health checks:**

```yaml
services:
  hyperfolio-api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Resource Limits

```yaml
services:
  hyperfolio-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## Coolify Deployment Labels

For Coolify deployments, include required labels:

```yaml
services:
  hyperfolio-api:
    labels:
      # Coolify configuration
      coolify.managed: "true"
      coolify.skip: "false"  # Set to "true" for stateful services

      # Traefik routing
      traefik.enable: "true"
      traefik.http.routers.api.rule: "Host(`api.hyperfolio.xyz`)"
      traefik.http.routers.api.tls: "true"
      traefik.http.routers.api.tls.certresolver: "letsencrypt"
      traefik.http.services.api.loadbalancer.server.port: "3000"

      # Zero-downtime deployment
      update_config.order: "start-first"  # Start new before stopping old
```

### Stateful Services (Redis, PostgreSQL)

```yaml
services:
  hyperfolio-redis:
    labels:
      coolify.skip: "true"  # Never recreate stateful services
    volumes:
      - redis_data:/data
```

## Log Management

```yaml
services:
  hyperfolio-api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Environment Variables

Use environment files for configuration:

```yaml
services:
  hyperfolio-api:
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
```

## Networking

```yaml
networks:
  coolify:
    external: true  # Use Coolify network

services:
  hyperfolio-api:
    networks:
      - coolify
```

## Full Service Example

```yaml
version: "3.9"

services:
  hyperfolio-api:
    image: hyperfolio-api:latest
    container_name: hyperfolio-api
    restart: unless-stopped
    deploy:
      replicas: 6  # PM2 instances inside container
      resources:
        limits:
          cpus: '12'
          memory: 20G
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
    labels:
      coolify.managed: "true"
      traefik.enable: "true"
      traefik.http.routers.api.rule: "Host(`api.hyperfolio.xyz`)"
      traefik.http.routers.api.tls: "true"
      traefik.http.routers.api.tls.certresolver: "letsencrypt"
      update_config.order: "start-first"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - coolify
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  hyperfolio-cache-worker:
    image: hyperfolio-api:latest
    container_name: hyperfolio-cache-worker
    command: "npm run cache-worker"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
    env_file:
      - .env.production
    labels:
      coolify.managed: "true"
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 60s
      timeout: 10s
      retries: 3
    networks:
      - coolify

  hyperfolio-price-feeder:
    image: hyperfolio-price-feeder:latest
    container_name: hyperfolio-price-feeder-prod
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    env_file:
      - .env.production
    labels:
      coolify.managed: "true"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - coolify

  hyperfolio-redis:
    image: redis:7-alpine
    container_name: hyperfolio-redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    labels:
      coolify.skip: "true"  # Stateful - never recreate
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - coolify

  hyperfolio-postgres:
    image: postgres:15-alpine
    container_name: hyperfolio-postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
    labels:
      coolify.skip: "true"  # Stateful - never recreate
    environment:
      - POSTGRES_USER=hyperfolio
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=hyperfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hyperfolio"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - coolify

volumes:
  redis_data:
  postgres_data:

networks:
  coolify:
    external: true
```

## Dockerfile Best Practices

### Multi-stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "dist/main"]
```

### Dockerfile for Price Feeder

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .
RUN npm run build

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
```

## .dockerignore

```gitignore
# Dependencies
node_modules
npm-debug.log

# Build artifacts
dist
*.log

# Environment files
.env
.env.*
!.env.example

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Tests
coverage
*.spec.ts

# Documentation
README.md
docs

# Docker
Dockerfile
docker-compose*.yml
.dockerignore
```

## Common Docker Commands

```bash
# Build and start
docker-compose -f docker-compose.coolify.yml up -d

# View logs
docker logs -f hyperfolio-api

# Restart service
docker-compose -f docker-compose.coolify.yml restart hyperfolio-api

# Execute command in container
docker exec -it hyperfolio-api sh

# Check health
curl http://localhost:3000/health

# Clean up
docker-compose -f docker-compose.coolify.yml down -v
```

## Troubleshooting

### Container Exits Immediately

1. Check logs: `docker logs <container>`
2. Verify healthcheck: The container might be failing health checks
3. Check resource limits: Might be hitting memory/CPU limits

### High Memory Usage

1. Set appropriate memory limits in docker-compose
2. Check for memory leaks in the application
3. Monitor with: `docker stats`

### Network Issues

1. Ensure all services are on the same network
2. Check if external network (coolify) exists: `docker network ls`
3. Verify port mappings

### Stateful Data Loss

1. **NEVER** recreate containers with `coolify.skip: "true"` label
2. Ensure volumes are properly mounted
3. Backup data before maintenance
