# 🚀 Production Quick Start

## One-Time Setup (On Production VM)

```bash
# 1. Create directory
mkdir -p /opt/hd-manager/docker
cd /opt/hd-manager/docker

# 2. Load Docker images (if air-gapped)
docker load -i hd-manager-backend.tar
docker load -i hd-manager-frontend.tar
docker load -i mongo-7.0.tar

# 3. Create .env.prod file with your secrets
nano .env.prod
# (See .env.prod.example for template)

# 4. Create volumes
docker volume create mongodb_data
docker volume create mongodb_config
docker volume create uploads

# 5. Start application
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## Daily Operations

### Start Application

```bash
cd /opt/hd-manager/docker
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Stop Application

```bash
docker-compose -f docker-compose.prod.yml down
```

### View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## Access

- **Web UI**: `https://YOUR_SERVER_IP`
- **Backend API**: `https://YOUR_SERVER_IP/api`

---

## Troubleshooting

### Check if running

```bash
docker-compose -f docker-compose.prod.yml ps
```

### View backend logs

```bash
docker logs backend
```

### Access backend shell

```bash
docker exec -it backend bash
```

### Restart backend only

```bash
docker-compose -f docker-compose.prod.yml restart backend
```

---

## Security Reminders

✅ Never commit `.env.prod` to Git  
✅ Use strong, unique secrets  
✅ Keep `DEBUG=False` in production  
✅ Regularly backup MongoDB volumes

---

For detailed instructions, see **PRODUCTION_DEPLOYMENT.md**
