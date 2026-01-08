#!/bin/sh
# ==============================================
# Frontend Entrypoint Script
# ==============================================
# This script runs when the container starts and injects
# runtime configuration from environment variables into config.js
# 
# Usage: Set environment variables in docker-compose.prod.yml:
#   - SERVICENOW_URL: Your ServiceNow instance URL
#   - MARS_URL: Your MARS system URL

CONFIG_FILE="/usr/share/nginx/html/config.js"

# Default values if env vars are not set
SERVICENOW_URL=${SERVICENOW_URL:-"https://servicenow.com"}
MARS_URL=${MARS_URL:-"https://mars-system.com"}

echo "=== Frontend Configuration ==="
echo "ServiceNow URL: $SERVICENOW_URL"
echo "MARS URL: $MARS_URL"
echo "=============================="

# Generate runtime config
cat > "$CONFIG_FILE" << EOF
// Runtime configuration - generated at container startup
// Do not edit directly - configure via environment variables
window.__RUNTIME_CONFIG__ = {
  SERVICENOW_URL: "$SERVICENOW_URL",
  MARS_URL: "$MARS_URL"
};
EOF

echo "Config written to $CONFIG_FILE"

# Start nginx
exec nginx -g "daemon off;"

