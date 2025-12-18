# Chat Messages API

## Base URL
http://localhost:5000/api/chat

## Entity Structure

### Chat Message Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Auto-generated | Unique identifier |
| `senderUserId` | integer | ✅ Yes | ID of the user who sent the message |
| `message` | string | ✅ Yes | Message text content |
| `base` | object | Auto-generated | Metadata (see below) |

### Base Metadata Object
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | boolean | Soft delete flag |
| `createdAt` | integer | Message timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |
| `lut` | integer | Last update time (ms) |
| `entityType` | string | Always `"chat_message"` |

---

## Endpoints

### GET /api/chat
Get all chat messages, sorted chronologically (oldest first).

**Response:** `200 OK`
```json
[
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0d",
    "senderUserId": 1,
    "message": "בוקר טוב לכולם!",
    "base": {
      "isDeleted": false,
      "createdAt": 1734256294000,
      "updatedAt": 1734256294000,
      "lut": 1734256294000,
      "entityType": "chat_message"
    }
  },
  {
    "id": "675f1a2b3c4d5e6f7a8b9c0e",
    "senderUserId": 2,
    "message": "בוקר אור, מה המצב?",
    "base": {
      "isDeleted": false,
      "createdAt": 1734256394000,
      "updatedAt": 1734256394000,
      "lut": 1734256394000,
      "entityType": "chat_message"
    }
  }
]
```

> ℹ️ **Note:** Messages are sorted by `base.createdAt` in ascending order (chronological stream).

---

### POST /api/chat
Send a new chat message.

**Request Body:**
```json
{
  "senderUserId": 1,
  "message": "Hello, everyone!"
}
```

**Response:** `201 Created`
```json
{
  "id": "675f1a2b3c4d5e6f7a8b9c0d",
  "senderUserId": 1,
  "message": "Hello, everyone!",
  "base": {
    "isDeleted": false,
    "createdAt": 1734256394000,
    "updatedAt": 1734256394000,
    "lut": 1734256394000,
    "entityType": "chat_message"
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

## Validation Rules

| Field | Rule |
|-------|------|
| `senderUserId` | Required, integer |
| `message` | Required, string |

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error or invalid request |

---

## Notes

- Chat messages are **append-only** - there are no UPDATE or DELETE endpoints exposed
- Messages are stored in the `ents` collection with `entityType: "chat_message"`
- Timestamps are in milliseconds (Unix timestamp * 1000)
