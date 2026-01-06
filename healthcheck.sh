#!/bin/sh

# Custom health check script for rolling deployments
# This script ensures the container only reports healthy when:
# 1. The startup delay has completed (marker file exists)
# 2. The Next.js server is actually responding

HEALTH_MARKER="/tmp/healthy"

# Check 1: Verify startup delay has completed
if [ ! -f "$HEALTH_MARKER" ]; then
  echo "Health check: Container still in startup delay phase"
  exit 1
fi

# Check 2: Verify Next.js server is responding
if ! curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "Health check: Server not responding"
  exit 1
fi

echo "Health check: OK"
exit 0











