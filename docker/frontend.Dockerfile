# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React/Vite application
FROM node:20-alpine AS builder

WORKDIR /app


# Use RELATIVE URL - nginx will proxy to backend
# No need to know the server IP!
ARG VITE_SYSTEM_NAME="Flow Task"
ARG VITE_API_URL="/api"
ARG VITE_API_MAX_RETRIES="2"
ARG VITE_API_RETRY_DELAY="500"
ARG VITE_SOCKET_TIMEOUT="10000"
ARG VITE_IDLE_TIMEOUT="300000"

# Set environment variables for build
ENV VITE_SYSTEM_NAME=$VITE_SYSTEM_NAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_MAX_RETRIES=$VITE_API_MAX_RETRIES
ENV VITE_API_RETRY_DELAY=$VITE_API_RETRY_DELAY
ENV VITE_SOCKET_TIMEOUT=$VITE_SOCKET_TIMEOUT
ENV VITE_IDLE_TIMEOUT=$VITE_IDLE_TIMEOUT

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

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
