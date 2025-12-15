# Users API

## Base URL
http://localhost:5000/api/users

## Entity Structure

### User Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entityId` | string | Auto-generated | Unique identifier |
| `fullName` | string | ✅ Yes | User's full name (min 2 chars) |
| `username` | string | ✅ Yes | Username (min 2 chars) |
| `passwordHash` | string | ✅ Yes | Hashed password |
| `role` | string | ✅ Yes | User role: `regular` or `admin` |
| `color` | string | ✅ Yes | Hex color code (e.g., `#3b82f6`) |
| `profileImage` | string | ❌ No | URL to profile image |
| `base` | object | Auto-generated | Metadata (see below) |

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
    "entityId": "675f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "מאור",
    "username": "maor",
    "passwordHash": "hash123",
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
Create a new user.

**Request Body:**
```json
{
  "fullName": "New User",
  "username": "newuser",
  "passwordHash": "secret123",
  "role": "regular",
  "color": "#10b981"
}
```

**Response:** `201 Created`
```json
{
  "entityId": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "New User",
  "username": "newuser",
  "passwordHash": "secret123",
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
| `id` | string | User's entityId |

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
- `passwordHash`
- `role` (`regular` | `admin`)
- `color` (hex format: `#xxxxxx`)
- `profileImage`

> ⚠️ **Note:** Extra fields not in the list above will be rejected.

**Response:** `200 OK`
```json
{
  "entityId": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "Updated Name",
  "username": "maor",
  "passwordHash": "hash123",
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

---

### DELETE /api/users/:id
Soft delete a user (sets `base.isDeleted` to `true`).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User's entityId |

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
| `color` | Must match pattern `^#[0-9a-f]{6}$` (lowercase hex) |

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
