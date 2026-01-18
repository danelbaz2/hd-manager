# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React/Vite application
FROM node:20-alpine AS builder

WORKDIR /app


# Use RELATIVE URL - nginx will proxy to backend
# No need to know the server IP!
ARG SYSTEM_NAME="Flow Task"
ARG API_URL="/api"
ARG API_MAX_RETRIES="2"
ARG API_RETRY_DELAY="500"
ARG SOCKET_TIMEOUT="10000"
ARG IDLE_TIMEOUT="300000"

# Set environment variables for build
ENV VITE_SYSTEM_NAME=$SYSTEM_NAME
ENV VITE_API_URL=$API_URL
ENV VITE_API_MAX_RETRIES=$API_MAX_RETRIES
ENV VITE_API_RETRY_DELAY=$API_RETRY_DELAY
ENV VITE_SOCKET_TIMEOUT=$SOCKET_TIMEOUT
ENV VITE_IDLE_TIMEOUT=$IDLE_TIMEOUT

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy source code for debugging/access (preserved at /source)
COPY --from=builder /app/src /source/src
COPY --from=builder /app/package.json /source/package.json

# Copy entrypoint script for runtime configuration
COPY frontend-entrypoint.sh /entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to inject config then start nginx
ENTRYPOINT ["/entrypoint.sh"]


