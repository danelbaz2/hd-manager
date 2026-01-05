#!/bin/bash
# ==============================================
# Docker Image Export Script for HD-Manager
# ==============================================
# This script builds and exports Docker images as .tar files
# for transfer to another machine (e.g., Linux VM)

set -e

echo "=============================================="
echo "  HD-Manager Docker Image Export"
echo "=============================================="

# Define image names
BACKEND_IMAGE="hd-manager-backend"
FRONTEND_IMAGE="hd-manager-frontend"
MONGO_IMAGE="mongo:7.0"
EXPORT_DIR="./exports"

# Create export directory
mkdir -p $EXPORT_DIR

echo ""
echo "[1/6] Building backend image..."
docker build -t $BACKEND_IMAGE:latest -f backend.Dockerfile ../backend

echo ""
echo "[2/6] Building frontend image..."
docker build -t $FRONTEND_IMAGE:latest -f frontend.Dockerfile ../frontend

echo ""
echo "[3/6] Pulling MongoDB image..."
docker pull $MONGO_IMAGE

echo ""
echo "[4/6] Saving backend image to tar..."
docker save -o $EXPORT_DIR/hd-manager-backend.tar $BACKEND_IMAGE:latest
echo "     Created: $EXPORT_DIR/hd-manager-backend.tar"

echo ""
echo "[5/6] Saving frontend image to tar..."
docker save -o $EXPORT_DIR/hd-manager-frontend.tar $FRONTEND_IMAGE:latest
echo "     Created: $EXPORT_DIR/hd-manager-frontend.tar"

echo ""
echo "[6/6] Saving MongoDB image to tar..."
docker save -o $EXPORT_DIR/mongo-7.0.tar $MONGO_IMAGE
echo "     Created: $EXPORT_DIR/mongo-7.0.tar"

echo ""
echo "=============================================="
echo "  Export Complete!"
echo "=============================================="
echo ""
echo "Files to copy to Linux VM:"
echo "  - $EXPORT_DIR/hd-manager-backend.tar"
echo "  - $EXPORT_DIR/hd-manager-frontend.tar"
echo "  - $EXPORT_DIR/mongo-7.0.tar"
echo "  - docker-compose.prod.yml"
echo "  - nginx/nginx.conf"
echo "  - ca/server.crt"
echo "  - ca/server.key"
echo ""
echo "On the Linux VM, run:"
echo "  docker load -i hd-manager-backend.tar"
echo "  docker load -i hd-manager-frontend.tar"
echo "  docker load -i mongo-7.0.tar"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
