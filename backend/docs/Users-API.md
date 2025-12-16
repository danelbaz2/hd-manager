# Users API

## Base URL
http://localhost:5000/api/users

## Entity Structure

### User Object (Response)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (auto-generated) |
| `fullName` | string | User's full name |
| `username` | string | Username |
| `role` | string | User role: `regular` or `admin` |
| `color` | string | Hex color code (e.g., `#3b82f6`) |
| `profileImage` | string \| null | URL to profile image |
| `base` | object | Metadata (see below) |

> 🔒 **Note:** `passwordHash` is stored in the database but **never returned** in API responses for security.

### User Object (Request - Create)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ Yes | User's full name (min 2 chars) |
| `username` | string | ✅ Yes | Username (min 2 chars) |
| `passwordHash` | string | ✅ Yes | Plain text password (will be hashed with bcrypt) |
| `role` | string | ✅ Yes | User role: `regular` or `admin` |
| `color` | string | ✅ Yes | Hex color code (e.g., `#3b82f6`) |
| `profileImage` | string | ❌ No | URL to profile image |

### Base Metadata Object
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | boolean | Soft delete flag |
| `isActive` | boolean | Active status |
| `createdAt` | integer | Creation timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |
| `lut` | integer | Last update time (ms) |
| `entityType` | string | Always `"user"` |

---

## Endpoints

### GET /api/users
Get all active users (non-deleted).

**Response:** `200 OK`
```json
[
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "מאור",
    "username": "maor",
    "role": "admin",
    "color": "#3b82f6",
    "profileImage": null,
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1734256394000,
      "updatedAt": 1734256394000,
      "lut": 1734256394000,
      "entityType": "user"
    }
  }
]
```

---

### POST /api/users
Create a new user. Password will be automatically hashed with bcrypt.

**Request Body:**
```json
{
  "fullName": "New User",
  "username": "newuser",
  "passwordHash": "plainTextPassword123",
  "role": "regular",
  "color": "#10b981"
}
```

**Response:** `201 Created`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "New User",
  "username": "newuser",
  "role": "regular",
  "color": "#10b981",
  "profileImage": null,
  "base": {
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1734256394000,
    "updatedAt": 1734256394000,
    "lut": 1734256394000,
    "entityType": "user"
  }
}
```

> 🔒 **Security:** The password is hashed before storage and is **not returned** in the response.

**Validation Errors:** `400 Bad Request`
```json
{
  "error": "validation error message"
}
```

---

### PUT /api/users/:id
Update an existing user. Only provided fields will be updated.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User's ID |

**Request Body:** (all fields optional)
```json
{
  "fullName": "Updated Name",
  "role": "admin"
}
```

**Allowed Fields:**
- `fullName` (min 2 chars)
- `username` (min 2 chars)
- `passwordHash` (will be stored as-is, consider hashing if updating)
- `role` (`regular` | `admin`)
- `color` (hex format: `#xxxxxx`)
- `profileImage`

> ⚠️ **Note:** Extra fields not in the list above will be rejected.

**Response:** `200 OK`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "Updated Name",
  "username": "maor",
  "role": "admin",
  "color": "#3b82f6",
  "profileImage": null,
  "base": {
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1734256394000,
    "updatedAt": 1734260000000,
    "lut": 1734260000000,
    "entityType": "user"
  }
}
```

**Error:** `404 Not Found`
```json
{
  "error": "User not found"
}
```

---

### DELETE /api/users/:id
Soft delete a user (sets `base.isDeleted` to `true`).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User's ID |

**Response:** `200 OK`
```json
{
  "message": "Deleted"
}
```

**Error:** `404 Not Found`
```json
{
  "error": "User not found"
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `fullName` | Minimum 2 characters |
| `username` | Minimum 2 characters |
| `role` | Must be `regular` or `admin` |
| `color` | Must match pattern `^#[0-9a-fA-F]{6}$` |

---

## Security Notes

- Passwords are hashed using **bcrypt** before storage
- The `passwordHash` field is **never returned** in any API response
- For authentication, use the `/api/auth/login` endpoint

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error or invalid request |
| `404` | User not found |

**Example Error:**
```json
{
  "error": "String should have at least 2 characters"
}
```
