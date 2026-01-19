# Deployment Guide

Docker-based deployment for production environments.

---

## 📁 Docker Files

```
docker/
├── Dockerfile.backend     # Backend image
├── Dockerfile.frontend    # Frontend build image
├── docker-compose.yml     # Development compose
├── docker-compose.prod.yml # Production compose
└── nginx.conf             # Nginx reverse proxy config
```

---

## 🚀 Quick Deploy

### 1. Build Images

```bash
cd docker

# Build backend
docker build -f Dockerfile.backend -t hd-manager-backend ../backend

# Build frontend
docker build -f Dockerfile.frontend -t hd-manager-frontend ../frontend
```

### 2. Configure Environment

Create `docker/.env` with production values:

```env
SECRET_KEY=your-secure-random-key
MONGO_URI=mongodb://mongo:27017/hd_manager
CORS_ORIGINS=https://your-domain.com
```

### 3. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## ⚙️ Environment Variables

### Required

| Variable     | Description                       |
| ------------ | --------------------------------- |
| `SECRET_KEY` | JWT signing key (generate random) |
| `MONGO_URI`  | MongoDB connection string         |

### Optional

| Variable                   | Default                 | Description                    |
| -------------------------- | ----------------------- | ------------------------------ |
| `PORT`                     | `5000`                  | Backend port                   |
| `CORS_ORIGINS`             | `http://localhost:5173` | Allowed origins                |
| `LOG_REQUESTS`             | `false`                 | Enable request logs            |
| `LOG_LEVEL`                | `INFO`                  | Logging level                  |
| `DB_HEALTH_CHECK_INTERVAL` | `5`                     | DB health check interval (sec) |
| `DEBUG`                    | `false`                 | Flask debug mode               |
| `SSL_CERT_PATH`            | -                       | SSL certificate path           |
| `SSL_KEY_PATH`             | -                       | SSL key path                   |

---

## 🔒 SSL/HTTPS

For HTTPS, provide SSL certificates:

```env
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

Or use a reverse proxy (nginx recommended).

---

## 📊 Health Checks

### Endpoint

```
GET /api/health
```

Returns `200` (healthy) or `503` (database disconnected).

### Background Monitor

The backend automatically monitors MongoDB connection:

- Checks every **5 seconds** (configurable via `DB_HEALTH_CHECK_INTERVAL`)
- Logs `ERROR` immediately when connection is lost
- Logs `ERROR` every 5s while disconnected
- Logs `INFO` when connection is restored

---

## 🗄️ MongoDB

Production MongoDB should have:

- Authentication enabled
- Proper backup strategy
- Indexes (auto-created on startup)

```bash
# Connect to verify
mongosh "mongodb://user:pass@host:27017/hd_manager"
```

---

## 📝 Logs

Toggle request logging at runtime:

```bash
# Enable
curl http://localhost:5000/api/logger/requests/on/{API_KEY}

# Disable
curl http://localhost:5000/api/logger/requests/off/{API_KEY}

# Change log level
curl http://localhost:5000/api/logger/{DEBUG|INFO|WARNING|ERROR}/{API_KEY}
```

Default `API_KEY`: \*\*\*\* (or set via `ADMIN_API_KEY` env var)
