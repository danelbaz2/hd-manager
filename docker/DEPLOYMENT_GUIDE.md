# HD-Manager Production Deployment Guide

## Overview

This guide explains how to deploy HD-Manager on a Linux server using Docker.

---

## Step 1: Build & Export Images (on Windows)

Run the export script from the `docker` folder:

```bash
cd docker
bash export-images.sh
```

This creates:

- `exports/hd-manager-backend.tar`
- `exports/hd-manager-frontend.tar`
- `exports/mongo-4.4.tar`

---

## Step 2: Transfer Files to Linux Server

Copy these files to your Linux server:

```
# Required files:
exports/hd-manager-backend.tar
exports/hd-manager-frontend.tar
exports/mongo-4.4.tar
docker-compose.prod.yml
nginx/nginx.conf
ca/server.crt
ca/server.key
```

### Recommended folder structure on Linux:

```
/opt/hd-manager/
├── docker-compose.prod.yml
├── nginx/
│   └── nginx.conf
└── ca/
    ├── server.crt
    └── server.key
```

---

## Step 3: Load Docker Images

```bash
cd /opt/hd-manager

# Load all images
docker load -i hd-manager-backend.tar
docker load -i hd-manager-frontend.tar
docker load -i mongo-4.4.tar

# Verify images loaded
docker images | grep -E "hd-manager|mongo"
```

---

## Step 4: Create Docker Volumes (One-Time)

```bash
docker volume create mongodb_data
docker volume create mongodb_config
docker volume create uploads
```

---

## Step 5: Configure docker-compose.prod.yml

Edit the file and update these values:

### Required Security Secrets

Generate new secrets:

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT_SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate ADMIN_API_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Required Configuration Changes

| Variable         | Description                     | Example                 |
| ---------------- | ------------------------------- | ----------------------- |
| `CORS_ORIGINS`   | Your server's URL               | `https://192.168.80.5`  |
| `SECRET_KEY`     | Flask secret (generate new!)    | `a1b2c3d4...`           |
| `JWT_SECRET_KEY` | JWT signing key (generate new!) | `e5f6g7h8...`           |
| `ADMIN_API_KEY`  | Key for admin curl commands     | `mySecretAdminKey123`   |
| `SERVICENOW_URL` | Your ServiceNow instance        | `https://your-snow.com` |
| `MARS_URL`       | Your MARS instance              | `https://your-mars.com` |

---

## Step 6: Start the Application

```bash
cd /opt/hd-manager
docker-compose -f docker-compose.prod.yml up -d
```

Verify all containers are running:

```bash
docker ps
```

Expected output:

```
CONTAINER ID   IMAGE                       STATUS         NAMES
xxxx           hd-manager-frontend:latest  Up X minutes   frontend
xxxx           hd-manager-backend:latest   Up X minutes   backend
xxxx           mongo:4.4                   Up X minutes   mongodb-server
```

---

## Step 7: Access the Application

Open your browser and navigate to:

```
https://YOUR_SERVER_IP/
```

> **Note**: You'll see a browser security warning for self-signed certificates. Click "Advanced" → "Proceed" to continue.

---

## Profile Pictures / Uploads

Profile pictures are stored in the `uploads` Docker volume. After a fresh deployment:

### Option A: Users upload new profile pictures

Users can upload new profile pictures through the Settings → Profile menu.

### Option B: Migrate existing pictures

If you have existing profile pictures from development:

```bash
# On your Windows machine, copy the uploads folder to Linux
# Then on Linux:
docker cp /path/to/profiles backend:/app/uploads/

# Or copy individual files:
docker cp /path/to/file.png backend:/app/uploads/profiles/
```

---

## Runtime Admin Commands

### Toggle Request Logging

```bash
# Turn ON request logging (see all API calls)
curl -k https://localhost/api/logger/requests/on/YOUR_ADMIN_API_KEY

# Turn OFF request logging
curl -k https://localhost/api/logger/requests/off/YOUR_ADMIN_API_KEY
```

### Change Log Level

```bash
curl -k https://localhost/api/logger/DEBUG/YOUR_ADMIN_API_KEY
curl -k https://localhost/api/logger/INFO/YOUR_ADMIN_API_KEY
curl -k https://localhost/api/logger/ERROR/YOUR_ADMIN_API_KEY
```

---

## Useful Docker Commands

| Command                                             | Description              |
| --------------------------------------------------- | ------------------------ |
| `docker-compose -f docker-compose.prod.yml up -d`   | Start all services       |
| `docker-compose -f docker-compose.prod.yml down`    | Stop all services        |
| `docker-compose -f docker-compose.prod.yml restart` | Restart all services     |
| `docker-compose -f docker-compose.prod.yml logs -f` | View all logs (follow)   |
| `docker logs backend`                               | View backend logs        |
| `docker logs frontend`                              | View frontend/nginx logs |
| `docker logs mongodb-server`                        | View MongoDB logs        |
| `docker exec -it backend bash`                      | Shell into backend       |
| `docker exec -it mongodb-server mongosh`            | MongoDB shell            |

---

## Updating the Application

When you have a new version:

```bash
# 1. On Windows: rebuild and export images
bash export-images.sh

# 2. Transfer new .tar files to Linux

# 3. On Linux: load new images
docker load -i hd-manager-backend.tar
docker load -i hd-manager-frontend.tar

# 4. Restart with new images
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## Troubleshooting

### Profile pictures not showing

1. Check if uploads volume has files: `docker exec backend ls -la /app/uploads/profiles/`
2. Check nginx logs: `docker logs frontend`
3. Users need to re-upload profile pictures after fresh deployment

### curl commands not working

1. Verify your `ADMIN_API_KEY` matches exactly
2. Use `-k` flag to bypass SSL verification
3. Check backend is running: `docker ps`

### Container won't start

1. Check logs: `docker logs <container_name>`
2. Verify volumes exist: `docker volume ls`
3. Verify images loaded: `docker images`

---

## Environment Variables Reference

### Backend (backend-server)

| Variable         | Default                                   | Description                              |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| `PORT`           | 5000                                      | Server port                              |
| `DEBUG`          | False                                     | Debug mode (keep False in production)    |
| `CORS_ORIGINS`   | -                                         | Allowed origins (comma-separated)        |
| `SECRET_KEY`     | -                                         | **Required** Flask secret                |
| `JWT_SECRET_KEY` | -                                         | **Required** JWT signing key             |
| `ADMIN_API_KEY`  | -                                         | Key for admin endpoints                  |
| `MONGO_URI`      | mongodb://mongodb-server:27017/hd-manager | MongoDB connection                       |
| `LOG_LEVEL`      | INFO                                      | Log verbosity (DEBUG/INFO/WARNING/ERROR) |
| `LOG_REQUESTS`   | false                                     | Enable API request logging               |

### Frontend (nginx-front)

| Variable         | Default   | Description             |
| ---------------- | --------- | ----------------------- |
| `SYSTEM_NAME`    | Flow Task | Display name in UI      |
| `SERVICENOW_URL` | -         | ServiceNow instance URL |
| `MARS_URL`       | -         | MARS system URL         |
