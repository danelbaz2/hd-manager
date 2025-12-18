# Authentication API

## Base URL
http://localhost:5000/api/auth

---

## Endpoints

### POST /api/auth/login
Authenticate a user with username and password.

**Request Body:**
```json
{
  "username": "maor",
  "password": "hash123"
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `username` | Required, minimum 2 characters |
| `password` | Required, minimum 1 character |

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
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
}
```

> 🔒 **Note:** `passwordHash` is not included in the response for security.

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "error": "1 validation error for LoginModel\nusername\n  String should have at least 2 characters"
}
```

`401 Unauthorized` - Invalid credentials
```json
{
  "error": "Invalid credentials"
}
```

---

### GET /api/auth/me
Get the current authenticated user.

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `X-User-Id` | string | ✅ Yes | The user's ID |

**Example Request:**
```http
GET /api/auth/me
X-User-Id: 675f1a2b3c4d5e6f7a8b9c0d
```

**Response:** `200 OK`
```json
{
  "user": {
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
}
```

**Error Responses:**

`401 Unauthorized` - Missing header
```json
{
  "error": "Authentication required"
}
```

`404 Not Found` - User not found
```json
{
  "error": "User not found"
}
```

---

### POST /api/auth/logout
Logout the current user.

**Response:** `200 OK`
```json
{
  "message": "Logout successful"
}
```

> ℹ️ **Note:** For client-side, simply discard the stored user ID or token.

---

## Security Notes

- Passwords are hashed using **bcrypt** before storage
- Password verification uses `bcrypt.checkpw()` 
- The `passwordHash` field is never returned in auth responses
- For production, consider implementing JWT tokens instead of the `X-User-Id` header

---

## Error Responses Summary

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error (missing/invalid fields) |
| `401` | Authentication failed (invalid credentials or missing header) |
| `404` | User not found |
| `500` | Server error |
