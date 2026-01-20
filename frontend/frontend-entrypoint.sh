#!/bin/sh
# ==============================================
# Frontend Entrypoint Script
# ==============================================
# This script runs when the container starts and injects
# runtime configuration from environment variables into config.js
# 
# Usage: Set environment variables in docker-compose.prod.yml:
#   - SYSTEM_NAME: Application name displayed in UI
#   - API_URL: Backend API URL
#   - API_MAX_RETRIES: Max API retry attempts
#   - API_RETRY_DELAY: Delay between retries (ms)
#   - SOCKET_TIMEOUT: Socket connection timeout (ms)
#   - IDLE_TIMEOUT: User idle timeout (ms)
#   - SERVICENOW_URL: Your ServiceNow instance URL
#   - MARS_URL: Your MARS system URL

CONFIG_FILE="/usr/share/nginx/html/config.js"

# Default values if env vars are not set
SYSTEM_NAME=${SYSTEM_NAME:-"Flow Task"}
API_URL=${API_URL:-"/api"}
API_MAX_RETRIES=${API_MAX_RETRIES:-"2"}
API_RETRY_DELAY=${API_RETRY_DELAY:-"500"}
SOCKET_TIMEOUT=${SOCKET_TIMEOUT:-"10000"}
IDLE_TIMEOUT=${IDLE_TIMEOUT:-"300000"}
SERVICENOW_URL=${SERVICENOW_URL:-"https://servicenow.com"}
MARS_URL=${MARS_URL:-"https://mars-system.com"}

echo "=== Frontend Configuration ==="
echo "System Name: $SYSTEM_NAME"
echo "API URL: $API_URL"
echo "API Max Retries: $API_MAX_RETRIES"
echo "API Retry Delay: $API_RETRY_DELAY ms"
echo "Socket Timeout: $SOCKET_TIMEOUT ms"
echo "Idle Timeout: $IDLE_TIMEOUT ms"
echo "ServiceNow URL: $SERVICENOW_URL"
echo "MARS URL: $MARS_URL"
echo "=============================="

# Generate runtime config
cat > "$CONFIG_FILE" << EOF
// Runtime configuration - generated at container startup
// Do not edit directly - configure via environment variables
window.__RUNTIME_CONFIG__ = {
  SYSTEM_NAME: "$SYSTEM_NAME",
  API_URL: "$API_URL",
  API_MAX_RETRIES: $API_MAX_RETRIES,
  API_RETRY_DELAY: $API_RETRY_DELAY,
  SOCKET_TIMEOUT: $SOCKET_TIMEOUT,
  IDLE_TIMEOUT: $IDLE_TIMEOUT,
  SERVICENOW_URL: "$SERVICENOW_URL",
  MARS_URL: "$MARS_URL"
};
EOF

echo "Config written to $CONFIG_FILE"

# Start nginx
exec nginx -g "daemon off;"

