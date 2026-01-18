# API Key Authentication Guide

## Overview

The HD Manager backend now supports **two authentication methods**:

1. **JWT Tokens** (for browser-based frontend)

   - Stored in HttpOnly cookies
   - Automatically managed by the frontend
   - User-specific permissions

2. **API Key** (for Postman, scripts, external tools)
   - Sent in `X-API-Key` header
   - Grants **admin access** to all endpoints
   - Perfect for testing and automation

---

## Setup

### 1. Generate an API Key

Run this command to generate a secure API key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Add to `.env` File

Add the generated key to `backend/.env`:

```env
API_KEY=your-generated-api-key-here
```

### 3. Restart the Backend

The API key is loaded on startup, so restart your Flask app:

```bash
cd backend
python app.py
```

---

## Usage in Postman

### Example: Get All Tasks

1. **Create a new request** in Postman
2. **Set the URL**: `http://localhost:5000/api/tasks`
3. **Add the header**:
   - Key: `X-API-Key`
   - Value: `super-secret-api-key-for-postman-testing`
4. **Send the request** ✅

### Example: Create a New Task

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/tasks`
3. **Headers**:
   - `X-API-Key`: `super-secret-api-key-for-postman-testing`
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
   ```json
   {
     "title": "Test Task from Postman",
     "description": "Created using API key",
     "status": "todo",
     "priority": "high"
   }
   ```
5. **Send** ✅

---

## Usage in Python Scripts

```python
import requests

API_KEY = "super-secret-api-key-for-postman-testing"
BASE_URL = "http://localhost:5000/api"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Get all tasks
response = requests.get(f"{BASE_URL}/tasks", headers=headers)
print(response.json())

# Create a task
new_task = {
    "title": "Automated Task",
    "status": "todo",
    "priority": "medium"
}
response = requests.post(f"{BASE_URL}/tasks", json=new_task, headers=headers)
print(response.json())
```

---

## Usage in cURL

```bash
# Get all tasks
curl -H "X-API-Key: super-secret-api-key-for-postman-testing" \
     http://localhost:5000/api/tasks

# Create a task
curl -X POST \
     -H "X-API-Key: super-secret-api-key-for-postman-testing" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","status":"todo"}' \
     http://localhost:5000/api/tasks
```

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit the API key to Git** - It's in `.env` which is gitignored
2. **Use different keys for dev/staging/production**
3. **Rotate the key periodically** (regenerate and update `.env`)
4. **API key grants FULL ADMIN ACCESS** - treat it like a password
5. **For production**, consider:
   - Using environment-specific keys
   - Implementing rate limiting
   - Adding IP whitelisting
   - Logging API key usage

---

## How It Works

When a request comes in with the `X-API-Key` header:

1. The `jwt_required`, `admin_required`, or `self_or_admin_required` decorator checks the header
2. If the key matches `API_KEY` from `.env`, authentication succeeds
3. The request is treated as coming from a **system admin user**:
   - `user_id`: `'system'`
   - `username`: `'api_key'`
   - `role`: `'admin'`
   - `user_full_name`: `'API Key User'`

This means the API key has **full access** to all endpoints, just like an admin user.

---

## Disabling API Key Authentication

To disable API key authentication (e.g., in production):

1. Remove or comment out the `API_KEY` line in `.env`:

   ```env
   # API_KEY=super-secret-api-key-for-postman-testing
   ```

2. Restart the backend

Now only JWT authentication will work.
