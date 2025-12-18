# Tasks API

## Base URL
http://localhost:5000/api/tasks

## Entity Structure

### Task Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Auto-generated | Unique identifier |
| `title` | string | ✅ Yes | Task title (min 3 chars) |
| `description` | string | ❌ No | Task description |
| `status` | string | ✅ Yes | Status: `open`, `in_progress`, or `closed` |
| `responsibleUsersId` | array | ❌ No | Array of user IDs responsible for task |
| `participantsIds` | array | ❌ No | Array of participant user IDs |
| `tagsId` | array | ❌ No | Array of tag IDs |
| `date` | integer | ✅ Yes | Task date (timestamp in ms) |
| `deadline` | integer | ❌ No | Deadline (timestamp in ms) |
| `base` | object | Auto-generated | Metadata (see below) |

### Base Metadata Object
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | boolean | Soft delete flag |
| `createdAt` | integer | Creation timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |
| `lut` | integer | Last update time (ms) |
| `entityType` | string | Always `"task"` |

---

## Endpoints

### GET /api/tasks
Get all active tasks (non-deleted).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | integer | Filter by specific date (timestamp ms) |
| `startDate` | integer | Filter by date range start (timestamp ms) |
| `endDate` | integer | Filter by date range end (timestamp ms) |
| `responsibleUsersId` | string | Filter by responsible user ID |

**Example Requests:**
```http
GET /api/tasks
GET /api/tasks?date=1734256394000
GET /api/tasks?startDate=1734256394000&endDate=1734342794000
GET /api/tasks?responsibleUsersId=675f1a2b3c4d5e6f7a8b9c0d
```

**Response:** `200 OK`
```json
[
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0d",
    "title": "בדיקת שרתים שבועית",
    "description": "בדיקה מקיפה של שרתי ה-Production",
    "status": "in_progress",
    "responsibleUsersId": ["675f1a2b3c4d5e6f7a8b9c0e"],
    "participantsIds": ["675f1a2b3c4d5e6f7a8b9c0f"],
    "tagsId": ["675f1a2b3c4d5e6f7a8b9c10"],
    "date": 1734256394000,
    "deadline": 1734429194000,
    "base": {
      "isDeleted": false,
      "createdAt": 1734256394000,
      "updatedAt": 1734256394000,
      "lut": 1734256394000,
      "entityType": "task"
    }
  }
]
```

---

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "open",
  "responsibleUsersId": ["675f1a2b3c4d5e6f7a8b9c0e"],
  "participantsIds": [],
  "tagsId": ["675f1a2b3c4d5e6f7a8b9c10"],
  "date": 1734256394000,
  "deadline": 1734429194000
}
```

**Response:** `201 Created`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "title": "New Task",
  "description": "Task description",
  "status": "open",
  "responsibleUsersId": ["675f1a2b3c4d5e6f7a8b9c0e"],
  "participantsIds": [],
  "tagsId": ["675f1a2b3c4d5e6f7a8b9c10"],
  "date": 1734256394000,
  "deadline": 1734429194000,
  "base": {
    "isDeleted": false,
    "createdAt": 1734256394000,
    "updatedAt": 1734256394000,
    "lut": 1734256394000,
    "entityType": "task"
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

### PUT /api/tasks/:id
Update an existing task. Only provided fields will be updated.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task's ID |

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "status": "closed"
}
```

**Allowed Fields:**
- `title` (min 3 chars)
- `description`
- `status` (`open` | `in_progress` | `closed`)
- `responsibleUsersId` (array)
- `participantsIds` (array)
- `tagsId` (array)
- `date` (integer)
- `deadline` (integer)

> ⚠️ **Note:** Extra fields not in the list above will be rejected.

**Response:** `200 OK`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "title": "Updated Title",
  "status": "closed",
  ...
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Task not found"
}
```

---

### DELETE /api/tasks/:id
Soft delete a task (sets `base.isDeleted` to `true`).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task's ID |

**Response:** `200 OK`
```json
{
  "message": "Deleted"
}
```

**Error:** `404 Not Found`
```json
{
  "error": "Task not found"
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `title` | Minimum 3 characters |
| `status` | Must be `open`, `in_progress`, or `closed` |
| `date` | Required, integer (timestamp in ms) |

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error or invalid request |
| `404` | Task not found |
