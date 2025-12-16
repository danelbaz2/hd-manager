# Contacts API

## Base URL
http://localhost:5000/api/contacts

## Entity Structure

### Contact Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Auto-generated | Unique identifier |
| `fullName` | string | ✅ Yes | Contact's full name (min 2 chars) |
| `position` | string | ❌ No | Job position |
| `department` | string | ❌ No | Department |
| `phoneNumber` | string | ✅ Yes | Phone number (required) |
| `tagsIds` | array | ❌ No | Array of associated tag IDs |
| `base` | object | Auto-generated | Metadata (see below) |

### Base Metadata Object
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | boolean | Soft delete flag |
| `isActive` | boolean | Active status |
| `createdAt` | integer | Creation timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |
| `lut` | integer | Last update time (ms) |
| `entityType` | string | Always `"contact"` |

---

## Endpoints

### GET /api/contacts
Get all active contacts (non-deleted).

**Response:** `200 OK`
```json
[
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "תמיכה טכנית",
    "position": "חיצוני",
    "department": "IT",
    "phoneNumber": "050-0000000",
    "tagsIds": ["675f1a2b3c4d5e6f7a8b9c10"],
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1734256394000,
      "updatedAt": 1734256394000,
      "lut": 1734256394000,
      "entityType": "contact"
    }
  }
]
```

---

### POST /api/contacts
Create a new contact.

**Request Body:**
```json
{
  "fullName": "New Contact",
  "position": "Manager",
  "department": "Sales",
  "phoneNumber": "050-1234567",
  "tagsIds": ["675f1a2b3c4d5e6f7a8b9c10"]
}
```

**Response:** `201 Created`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "New Contact",
  "position": "Manager",
  "department": "Sales",
  "phoneNumber": "050-1234567",
  "tagsIds": ["675f1a2b3c4d5e6f7a8b9c10"],
  "base": {
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1734256394000,
    "updatedAt": 1734256394000,
    "lut": 1734256394000,
    "entityType": "contact"
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

### PUT /api/contacts/:id
Update an existing contact. Only provided fields will be updated.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Contact's ID |

**Request Body:** (all fields optional)
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "052-9876543"
}
```

**Allowed Fields:**
- `fullName` (min 2 chars)
- `position`
- `department`
- `phoneNumber` (min 1 char)
- `tagsIds` (array)

> ⚠️ **Note:** Extra fields not in the list above will be rejected.

**Response:** `200 OK`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "Updated Name",
  "phoneNumber": "052-9876543",
  ...
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Contact not found"
}
```

---

### DELETE /api/contacts/:id
Soft delete a contact (sets `base.isDeleted` to `true`).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Contact's ID |

**Response:** `200 OK`
```json
{
  "message": "Deleted"
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Contact not found"
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `fullName` | Minimum 2 characters |
| `phoneNumber` | Required, minimum 1 character |

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error or invalid request |
| `404` | Contact not found |
