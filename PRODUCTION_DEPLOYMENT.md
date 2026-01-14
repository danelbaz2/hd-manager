# 🚀 HD Manager - Production Deployment Guide

## Overview

This guide explains how to deploy HD Manager to your production Linux VM using Docker.

---

## 📋 Prerequisites

On your **production Linux VM**, ensure you have:

- Docker installed (`docker --version`)
- Docker Compose installed (`docker-compose --version`)
- Sufficient disk space (at least 5GB recommended)
- Network access to pull MongoDB image (or have it pre-loaded)

---

## 🔧 Step 1: Prepare Your Development Machine

### 1.1 Generate Production Secrets

On your **development machine**, generate secure secrets:

```bash
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"

# Generate ADMIN_API_KEY
python -c "import secrets; print('ADMIN_API_KEY=' + secrets.token_urlsafe(32))"

# Generate API_KEY (optional - for Postman/external tools)
python -c "import secrets; print('API_KEY=' + secrets.token_urlsafe(32))"
```

**Save these values securely!** You'll need them in Step 3.

### 1.2 Build Docker Images

Navigate to your project directory:

```bash
cd c:\Users\user\dev\hd-manager\docker
```

Build the images:

```bash
# Build backend image
docker build -f backend.Dockerfile -t hd-manager-backend:latest ../backend

# Build frontend image
docker build -f frontend.Dockerfile -t hd-manager-frontend:latest ../frontend
```

### 1.3 Export Images for Air-Gapped Transfer

If your production VM is air-gapped (no internet), export the images:

```bash
# Export backend image
docker save hd-manager-backend:latest -o hd-manager-backend.tar

# Export frontend image
docker save hd-manager-frontend:latest -o hd-manager-frontend.tar

# Export MongoDB image (if needed)
docker pull mongo:7.0
docker save mongo:7.0 -o mongo-7.0.tar
```

Transfer these `.tar` files to your production VM via USB, network share, etc.

---

## 🖥️ Step 2: Prepare Production VM

### 2.1 Create Project Directory

On your **production Linux VM**:

```bash
# Create project directory
mkdir -p /opt/hd-manager/docker
cd /opt/hd-manager
```

### 2.2 Load Docker Images (if air-gapped)

If you exported images:

```bash
# Load images
docker load -i hd-manager-backend.tar
docker load -i hd-manager-frontend.tar
docker load -i mongo-7.0.tar

# Verify images loaded
docker images | grep hd-manager
docker images | grep mongo
```

### 2.3 Copy Docker Configuration Files

Transfer these files from your dev machine to `/opt/hd-manager/docker/`:

- `docker-compose.prod.yml`
- `nginx/nginx.conf`
- `ca/` directory (SSL certificates)
- `frontend-entrypoint.sh`

You can use `scp`, USB, or any file transfer method:

```bash
# Example using scp (from dev machine)
scp -r docker/* user@production-vm:/opt/hd-manager/docker/
```

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Create Production .env File

On your **production VM**, create `/opt/hd-manager/docker/.env.prod`:

```bash
cd /opt/hd-manager/docker
nano .env.prod
```

Paste the following content and **replace all CHANGE_ME values** with the secrets you generated in Step 1.1:

```env
# =============================================================================
# HD Manager - Production Environment Variables
# =============================================================================

# -----------------------------------------------------------------------------
# REQUIRED SECRETS - CHANGE ALL OF THESE!
# -----------------------------------------------------------------------------

SECRET_KEY=PASTE_YOUR_GENERATED_SECRET_KEY_HERE
JWT_SECRET_KEY=PASTE_YOUR_GENERATED_JWT_SECRET_HERE
ADMIN_API_KEY=PASTE_YOUR_GENERATED_ADMIN_KEY_HERE
API_KEY=PASTE_YOUR_GENERATED_API_KEY_HERE_OR_LEAVE_EMPTY

# -----------------------------------------------------------------------------
# SERVER CONFIGURATION
# -----------------------------------------------------------------------------

PORT=5000
DEBUG=False
CORS_ORIGINS=https://192.168.80.5,https://flow-task

# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------

MONGO_URI=mongodb://mongodb-server:27017/hd-manager

# -----------------------------------------------------------------------------
# FILE UPLOADS
# -----------------------------------------------------------------------------

MAX_FILE_SIZE_MB=10
UPLOAD_ALLOWED_EXTENSIONS=pdf,doc,docx,xls,xlsx,txt,png,jpg,jpeg,gif

# -----------------------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------------------

LOG_LEVEL=INFO
LOG_REQUESTS=false

# -----------------------------------------------------------------------------
# FRONTEND CONFIGURATION
# -----------------------------------------------------------------------------

SYSTEM_NAME=Flow Task
API_URL=/api
API_MAX_RETRIES=2
API_RETRY_DELAY=500
SOCKET_TIMEOUT=10000
IDLE_TIMEOUT=300000

# External System URLs - Configure for your environment
SERVICENOW_URL=https://your-servicenow-instance.com
MARS_URL=https://your-mars-instance.com
```

**Important Configuration Notes:**

- **CORS_ORIGINS**: Update with your actual server IP/hostname
- **SYSTEM_NAME**: Customize the system name shown in the UI
- **SERVICENOW_URL / MARS_URL**: Update with your actual URLs
- **API_KEY**: Leave empty if you don't need external API access

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### 3.2 Secure the .env File

```bash
# Restrict permissions (only root can read)
chmod 600 .env.prod
```

---

## 🐳 Step 4: Create Docker Volumes

Create persistent volumes for data:

```bash
docker volume create mongodb_data
docker volume create mongodb_config
docker volume create uploads
```

Verify volumes:

```bash
docker volume ls | grep -E 'mongodb|uploads'
```

---

## 🚀 Step 5: Launch the Application

### 5.1 Start Services

```bash
cd /opt/hd-manager/docker

# Start all services in detached mode
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 5.2 Verify Services are Running

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                IMAGE                         STATUS
# backend             hd-manager-backend:latest     Up
# frontend            hd-manager-frontend:latest    Up
# mongodb-server      mongo:7.0                     Up
```

### 5.3 Check Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View backend logs only
docker-compose -f docker-compose.prod.yml logs backend

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Backend Health

```bash
# From the production VM
curl -k https://localhost/api/health

# Or from another machine (replace with your VM IP)
curl -k https://192.168.80.5/api/health
```

Expected response: `{"status": "healthy"}`

### 6.2 Access the Application

Open a browser and navigate to:

```
https://192.168.80.5
```

(Replace with your actual server IP/hostname)

You should see the HD Manager login page.

---

## 🔄 Step 7: Seed Initial Data (Optional)

If this is a fresh installation, you may want to seed initial data:

```bash
# Enter the backend container
docker exec -it backend bash

# Run the seed script
python seed.py --init

# Exit the container
exit
```

---

## 📊 Management Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
# Stop all services (data persists in volumes)
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (DELETES ALL DATA!)
docker-compose -f docker-compose.prod.yml down -v
```

### Update Application

```bash
# 1. Transfer new images to production VM
# 2. Load new images
docker load -i hd-manager-backend-new.tar
docker load -i hd-manager-frontend-new.tar

# 3. Restart services
cd /opt/hd-manager/docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## 🔐 Security Checklist

Before going to production, verify:

- ✅ All secrets in `.env.prod` are unique and randomly generated
- ✅ `.env.prod` file permissions are `600` (only root can read)
- ✅ `DEBUG=False` in `.env.prod`
- ✅ `CORS_ORIGINS` is set to your actual domain/IP
- ✅ SSL certificates are valid and properly configured
- ✅ Firewall rules allow only necessary ports (443 for HTTPS)
- ✅ MongoDB is not exposed to the internet (only accessible within Docker network)

---

## 🆘 Troubleshooting

### Backend Won't Start - "SECRET_KEY not set"

**Problem**: Backend crashes with `RuntimeError: CRITICAL: SECRET_KEY environment variable is not set!`

**Solution**:

1. Check that `.env.prod` exists and has `SECRET_KEY` set
2. Verify you're using `--env-file .env.prod` when starting docker-compose
3. Restart the backend: `docker-compose -f docker-compose.prod.yml restart backend`

### Cannot Access Application (Connection Refused)

**Problem**: Browser shows "Connection refused" or "Cannot connect"

**Solution**:

1. Check containers are running: `docker-compose -f docker-compose.prod.yml ps`
2. Check firewall: `sudo ufw status` (allow port 443)
3. Verify CORS_ORIGINS includes your access URL
4. Check nginx logs: `docker-compose -f docker-compose.prod.yml logs frontend`

### Database Connection Errors

**Problem**: Backend logs show MongoDB connection errors

**Solution**:

1. Check MongoDB is running: `docker ps | grep mongodb`
2. Verify MONGO_URI in `.env.prod` is correct
3. Check MongoDB logs: `docker logs mongodb-server`

---

## 📞 Support

For issues or questions:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify configuration in `.env.prod`
3. Review this deployment guide

---

## 🎯 Quick Reference

```bash
# Start application
cd /opt/hd-manager/docker
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Stop application
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend

# Access backend shell
docker exec -it backend bash

# Access MongoDB shell
docker exec -it mongodb-server mongosh hd-manager
```

---

**Congratulations! Your HD Manager application is now running in production! 🎉**
