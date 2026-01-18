# Docker Environment Variables - Complete Guide

## 📋 How Environment Variables Work in Docker

### **Current Setup Overview**

Your application uses **TWO types** of environment variables:

1. **Build-time variables** (Frontend) - Baked into the image during build
2. **Runtime variables** (Backend & Frontend) - Can be changed without rebuilding

---

## 🔧 **1. Backend (Python/Flask) - Runtime Variables**

### **How It Works:**

```yaml
# docker-compose.prod.yml
backend-server:
  environment:
    - SECRET_KEY=${SECRET_KEY}
    - DEBUG=${DEBUG:-False}
    - MONGO_URI=${MONGO_URI:-mongodb://mongodb-server:27017/hd-manager}
```

### **✅ Can You Change Them? YES!**

**Method 1: Using .env file (Recommended)**

```bash
# On your Linux VM, edit .env file
nano .env

# Change any value:
DEBUG=False
SECRET_KEY=new-secret-key-here
SYSTEM_NAME=My New System Name

# Restart containers to apply changes
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml up -d
```

**Method 2: Override in docker-compose**

```bash
# Set environment variable before running
export DEBUG=False
docker-compose -f docker/docker-compose.prod.yml up -d
```

**Method 3: Direct in docker-compose.yml**

```yaml
environment:
  - DEBUG=False # Hardcoded value
```

### **⚠️ Important:**

- ✅ **NO REBUILD NEEDED** - Just restart containers
- ✅ Changes take effect immediately after restart
- ✅ `.env` file is read every time you run `docker-compose up`

---

## 🎨 **2. Frontend (React/Vite) - Mixed Approach**

### **A. Build-time Variables (Baked into Image)**

These are set during `docker build` and **CANNOT be changed** without rebuilding:

```dockerfile
# frontend.Dockerfile
ARG SYSTEM_NAME="Flow Task"
ARG API_URL="/api"

# These get baked into the JavaScript bundle
RUN npm run build
```

**Files affected:**

- `config.ts` - System configuration
- JavaScript bundle - All imports of `import.meta.env.*`

### **❌ Problem: Cannot Change Without Rebuild**

If you change `SYSTEM_NAME` in `.env`, it won't affect the frontend unless you rebuild the image.

---

### **B. Runtime Variables (Can Be Changed!)**

Your setup uses a **smart workaround** with `frontend-entrypoint.sh`:

```yaml
# docker-compose.prod.yml
nginx-front:
  environment:
    - SYSTEM_NAME=${SYSTEM_NAME:-Flow Task}
    - API_URL=${API_URL:-/api}
    - SERVICENOW_URL=${SERVICENOW_URL}
    - MARS_URL=${MARS_URL}
```

**How it works:**

1. Container starts
2. `frontend-entrypoint.sh` runs
3. Script injects environment variables into `window.__ENV__`
4. Frontend reads from `window.__ENV__` at runtime

### **✅ Can You Change Them? YES (for runtime vars)!**

```bash
# Edit .env file
nano .env

# Change values:
SYSTEM_NAME=New System Name
SERVICENOW_URL=https://new-servicenow.com
MARS_URL=https://new-mars.com

# Restart frontend container
docker-compose -f docker/docker-compose.prod.yml restart nginx-front
```

**⚠️ Limitation:**

- ✅ Runtime vars (SYSTEM_NAME, API_URL, external URLs) - **Can change**
- ❌ Build-time vars (embedded in JS bundle) - **Cannot change without rebuild**

---

## 🚀 **Complete Workflow: Changing Environment Variables**

### **Scenario 1: Change Backend Settings (Easy)**

```bash
# 1. SSH into your Linux VM
ssh user@your-vm

# 2. Navigate to project
cd /path/to/hd-manager

# 3. Edit .env file
nano .env

# Change values:
DEBUG=False
SECRET_KEY=new-production-key
LOG_LEVEL=WARNING

# 4. Restart backend container
docker-compose -f docker/docker-compose.prod.yml restart backend-server

# ✅ Done! Changes applied immediately
```

---

### **Scenario 2: Change Frontend Runtime Settings (Easy)**

```bash
# 1. Edit .env file
nano .env

# Change values:
SYSTEM_NAME=Production System
SERVICENOW_URL=https://prod-servicenow.com

# 2. Restart frontend container
docker-compose -f docker/docker-compose.prod.yml restart nginx-front

# ✅ Done! Changes applied immediately
```

---

### **Scenario 3: Change Frontend Build-time Settings (Requires Rebuild)**

```bash
# ❌ This WON'T work:
nano .env
# Change SYSTEM_NAME=New Name
docker-compose restart nginx-front  # ❌ No effect!

# ✅ This WILL work:
# 1. Edit .env file
nano .env

# 2. Rebuild frontend image
docker build -f docker/frontend.Dockerfile \
  --build-arg SYSTEM_NAME="New Name" \
  --build-arg API_URL="/api" \
  -t hd-manager-frontend:latest \
  ./frontend

# 3. Restart with new image
docker-compose -f docker/docker-compose.prod.yml up -d nginx-front

# ✅ Done! But requires rebuild
```

---

## 📊 **Quick Reference Table**

| Variable Type           | Location                                         | Can Change? | How?                  | Rebuild Needed? |
| ----------------------- | ------------------------------------------------ | ----------- | --------------------- | --------------- |
| **Backend ENV**         | `.env` → `docker-compose.yml`                    | ✅ YES      | Edit `.env` + restart | ❌ NO           |
| **Frontend Runtime**    | `.env` → `docker-compose.yml` → `window.__ENV__` | ✅ YES      | Edit `.env` + restart | ❌ NO           |
| **Frontend Build-time** | Dockerfile `ARG` → JS bundle                     | ⚠️ LIMITED  | Rebuild image         | ✅ YES          |
| **Database Data**       | Docker volumes                                   | ✅ PERSISTS | N/A                   | ❌ NO           |

---

## 🎯 **Best Practices**

### **1. Use .env File for Everything**

```bash
# .env (on Linux VM)
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-key
SYSTEM_NAME=Flow Task Production
DEBUG=False
MONGO_URI=mongodb://mongodb-server:27017/hd-manager
SERVICENOW_URL=https://your-servicenow.com
MARS_URL=https://your-mars.com
```

### **2. Never Hardcode Secrets in docker-compose.yml**

```yaml
# ❌ BAD
environment:
  - SECRET_KEY=hardcoded-secret

# ✅ GOOD
environment:
  - SECRET_KEY=${SECRET_KEY}
```

### **3. Use Default Values for Non-Critical Settings**

```yaml
environment:
  - DEBUG=${DEBUG:-False} # Defaults to False if not set
  - LOG_LEVEL=${LOG_LEVEL:-INFO}
```

### **4. Keep .env File Secure**

```bash
# Set proper permissions
chmod 600 .env

# Never commit to git
echo ".env" >> .gitignore
```

---

## 🔄 **Common Operations**

### **Change System Name**

```bash
# Edit .env
SYSTEM_NAME=New System Name

# Restart frontend
docker-compose -f docker/docker-compose.prod.yml restart nginx-front
```

### **Enable/Disable Debug Mode**

```bash
# Edit .env
DEBUG=False  # or True

# Restart backend
docker-compose -f docker/docker-compose.prod.yml restart backend-server
```

### **Change Database Connection**

```bash
# Edit .env
MONGO_URI=mongodb://new-host:27017/new-database

# Restart backend
docker-compose -f docker/docker-compose.prod.yml restart backend-server
```

### **Update External System URLs**

```bash
# Edit .env
SERVICENOW_URL=https://new-servicenow.com
MARS_URL=https://new-mars.com

# Restart frontend
docker-compose -f docker/docker-compose.prod.yml restart nginx-front
```

---

## ⚠️ **Important Notes**

1. **Data Persistence**: Your database data is stored in Docker volumes (`mongodb_data`). These persist even after `docker-compose down`. To completely reset, you'd need to delete the volumes.

2. **Container Restart vs Recreate**:
   - `restart` - Stops and starts the container (keeps same image)
   - `up -d` - Recreates container if config changed
   - `down` + `up -d` - Full teardown and recreation

3. **Environment Variable Priority**:

   ```
   1. Shell environment (export VAR=value)
   2. .env file
   3. Default values in docker-compose.yml (${VAR:-default})
   ```

4. **Viewing Current Environment**:
   ```bash
   # See environment variables in running container
   docker exec backend env | grep SECRET_KEY
   docker exec frontend env | grep SYSTEM_NAME
   ```

---

## 🎓 **Summary**

**YES, you can change environment variables after deployment!**

- ✅ **Backend variables**: Edit `.env` → Restart container → Done
- ✅ **Frontend runtime variables**: Edit `.env` → Restart container → Done
- ⚠️ **Frontend build variables**: Edit `.env` → Rebuild image → Restart → Done

**No need to rebuild images for most configuration changes!** 🎉
