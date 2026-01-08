#!/bin/sh
set -e

# Rolling deployment workaround for Coolify/Traefik
# This script adds a configurable startup delay to prevent router name conflicts
# during rolling deployments where two containers exist simultaneously

# Environment variable to control startup delay (default: 10 seconds)
STARTUP_DELAY=${STARTUP_DELAY:-10}

# Environment variable to enable/disable delay (default: enabled)
ENABLE_STARTUP_DELAY=${ENABLE_STARTUP_DELAY:-true}

# Create health check marker file (used to control when container reports healthy)
HEALTH_MARKER="/tmp/healthy"
rm -f "$HEALTH_MARKER"

# Log startup information
echo "================================================"
echo "  Hyperfolio Frontend Container Starting"
echo "================================================"
echo "  Node.js: $(node --version)"
echo "  Startup delay: ${STARTUP_DELAY}s (enabled: ${ENABLE_STARTUP_DELAY})"
echo "  Port: ${PORT:-3000}"
echo "================================================"

# Apply startup delay if enabled
# This gives time for the old container to be removed during rolling deployment
if [ "$ENABLE_STARTUP_DELAY" = "true" ] && [ "$STARTUP_DELAY" -gt 0 ]; then
  echo "[Entrypoint] Waiting ${STARTUP_DELAY}s for old container cleanup..."
  sleep "$STARTUP_DELAY"
  echo "[Entrypoint] Startup delay complete, launching server..."
fi

# Mark container as ready for health checks BEFORE starting the server
# The health check will look for this file first
touch "$HEALTH_MARKER"

# Handle graceful shutdown
cleanup() {
  echo "[Entrypoint] Received shutdown signal, cleaning up..."
  rm -f "$HEALTH_MARKER"
  # Give time for Traefik to deregister this container
  sleep 2
  exit 0
}

trap cleanup SIGTERM SIGINT SIGQUIT

# Execute the main command (node server.js)
exec "$@"













