# Tags API

## Base URL
http://localhost:5000/api/tags

## Entity Structure

### Tag Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Auto-generated | Unique identifier |
| `name` | string | ✅ Yes | Tag name (min 1 char) |
| `description` | string | ❌ No | Tag description |
| `relatedContactsIds` | array | ❌ No | Array of related contact IDs |
| `color` | string | ✅ Yes | Hex color code (e.g., `#3b82f6`) |
| `base` | object | Auto-generated | Metadata (see below) |

### Base Metadata Object
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | boolean | Soft delete flag |
| `isActive` | boolean | Active status |
| `createdAt` | integer | Creation timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |
| `lut` | integer | Last update time (ms) |
| `entityType` | string | Always `"tag"` |

---

## Endpoints

### GET /api/tags
Get all active tags (non-deleted).

**Response:** `200 OK`
```json
[
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0d",
    "name": "פיתוח",
    "description": "קשור לפיתוח תוכנה",
    "relatedContactsIds": null,
    "color": "#3b82f6",
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1734256394000,
      "updatedAt": 1734256394000,
      "lut": 1734256394000,
      "entityType": "tag"
    }
  }
]
```

---

### POST /api/tags
Create a new tag.

**Request Body:**
```json
{
  "name": "New Tag",
  "description": "Tag description",
  "color": "#10b981"
}
```

**Response:** `201 Created`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "name": "New Tag",
  "description": "Tag description",
  "relatedContactsIds": null,
  "color": "#10b981",
  "base": {
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1734256394000,
    "updatedAt": 1734256394000,
    "lut": 1734256394000,
    "entityType": "tag"
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

### PUT /api/tags/:id
Update an existing tag. Only provided fields will be updated.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Tag's ID |

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Tag Name",
  "color": "#ef4444"
}
```

**Allowed Fields:**
- `name` (min 1 char)
- `description`
- `relatedContactsIds` (array)
- `color` (hex format: `#xxxxxx`)

> ⚠️ **Note:** Extra fields not in the list above will be rejected.

**Response:** `200 OK`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "name": "Updated Tag Name",
  "color": "#ef4444",
  ...
}
```

---

### DELETE /api/tags/:id
Soft delete a tag (sets `base.isDeleted` to `true`).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Tag's ID |

**Response:** `200 OK`
```json
{
  "message": "Deleted"
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Tag not found"
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | Minimum 1 character |
| `color` | Must match pattern `^#[0-9a-f]{6}$` (lowercase hex) |

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error or invalid request |
| `404` | Tag not found |
