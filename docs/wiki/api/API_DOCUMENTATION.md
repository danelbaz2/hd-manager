# HD Manager API Documentation

Complete REST API documentation for HD Manager backend.

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json` (for all requests with body)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Tasks API](#tasks-api)
3. [Users API](#users-api)
4. [Tags API](#tags-api)
5. [Contacts API](#contacts-api)
6. [History API](#history-api)
7. [Chat API](#chat-api)
8. [Error Handling](#error-handling)
9. [Common Patterns](#common-patterns)

---

## Authentication

### Login
Authenticate a user and receive session token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

**Response** (200 OK):
```json
{
  "id": "user-id-123",
  "username": "user123",
  "fullName": "John Doe",
  "role": "admin",
  "color": "#3b82f6",
  "profileImage": null
}
```

**Errors**:
- `400 Bad Request` - Missing username or password
- `401 Unauthorized` - Invalid credentials

---

### Logout
End user session.

**Endpoint**: `POST /api/auth/logout`

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## Tasks API

### Get All Tasks
Retrieve all tasks with optional filtering.

**Endpoint**: `GET /api/tasks/`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | number | Filter by specific date (Unix timestamp in ms) |
| `startDate` | number | Filter by date range start |
| `endDate` | number | Filter by date range end |
| `responsibleUsersId` | string | Filter by user ID |

**Example Requests**:
```
GET /api/tasks/
GET /api/tasks/?date=1702901234000
GET /api/tasks/?startDate=1702901234000&endDate=1703001234000
GET /api/tasks/?responsibleUsersId=user-id-123
```

**Response** (200 OK):
```json
[
  {
    "id": "task-id-123",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "status": "in_progress",
    "priority": "high",
    "responsibleUsersId": ["user-id-123"],
    "participantsIds": ["contact-id-456"],
    "tagsId": ["tag-id-789"],
    "date": 1702901234000,
    "deadline": 1703001234000,
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1702901234000,
      "updatedAt": 1702901234000,
      "lut": 1702901234000,
      "entityType": "task"
    }
  }
]
```

---

### Create Task
Create a new task.

**Endpoint**: `POST /api/tasks/`

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the project",
  "status": "pending",
  "priority": "high",
  "responsibleUsersId": ["user-id-123"],
  "participantsIds": ["contact-id-456"],
  "tagsId": ["tag-id-789"],
  "date": 1702901234000,
  "deadline": 1703001234000
}
```

**Required Fields**:
- `title` (min 3 characters)
- `date` (Unix timestamp in ms)

**Optional Fields**:
- `description` (default: empty string)
- `status` (default: "pending", valid: pending|in_progress|completed|cancelled)
- `priority` (default: "medium", valid: low|medium|high)
- `responsibleUsersId` (default: empty array)
- `participantsIds` (default: empty array)
- `tagsId` (default: empty array)
- `deadline` (default: null)

**Response** (201 Created):
```json
{
  "id": "task-id-123",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the project",
  "status": "pending",
  "priority": "high",
  "responsibleUsersId": ["user-id-123"],
  "participantsIds": ["contact-id-456"],
  "tagsId": ["tag-id-789"],
  "date": 1702901234000,
  "deadline": 1703001234000,
  "base": {
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1702901234000,
    "updatedAt": 1702901234000,
    "lut": 1702901234000,
    "entityType": "task"
  }
}
```

**Errors**:
- `400 Bad Request` - Invalid data or validation error

**Validation Rules**:
- Title must be at least 3 characters
- Status must match: `pending|in_progress|completed|cancelled`
- Priority must match: `low|medium|high`
- Unknown fields are rejected (`extra='forbid'`)

---

### Update Task
Update an existing task.

**Endpoint**: `PUT /api/tasks/{id}`

**URL Parameters**:
- `id` - Task ID

**Request Body** (all fields optional, only send what needs to change):
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Response** (200 OK):
```json
{
  "id": "task-id-123",
  "title": "Complete project documentation",
  "status": "completed",
  "priority": "medium",
  // ... other fields
  "base": {
    // ... metadata with updated timestamps
  }
}
```

**Errors**:
- `400 Bad Request` - Invalid data
- `404 Not Found` - Task doesn't exist

---

### Delete Task
Soft delete a task (sets `base.isDeleted: true`).

**Endpoint**: `DELETE /api/tasks/{id}`

**URL Parameters**:
- `id` - Task ID

**Response** (200 OK):
```json
{
  "message": "Deleted"
}
```

**Errors**:
- `404 Not Found` - Task doesn't exist

**Note**: Tasks are soft-deleted, not physically removed from the database.

---

## Users API

### Get All Users
Retrieve all users.

**Endpoint**: `GET /api/users/`

**Response** (200 OK):
```json
[
  {
    "id": "user-id-123",
    "fullName": "John Doe",
    "username": "johndoe",
    "passwordHash": "$2b$12$...",
    "role": "admin",
    "color": "#3b82f6",
    "profileImage": null,
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1702901234000,
      "updatedAt": 1702901234000,
      "lut": 1702901234000,
      "entityType": "user"
    }
  }
]
```

---

### Create User
Create a new user.

**Endpoint**: `POST /api/users/`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "passwordHash": "$2b$12$hashed_password",
  "role": "regular",
  "color": "#3b82f6",
  "profileImage": null
}
```

**Required Fields**:
- `fullName` (min 2 characters)
- `username` (min 2 characters)
- `passwordHash` (bcrypt hash)
- `role` (must be "regular" or "admin")
- `color` (must be hex color: #RRGGBB)

**Optional Fields**:
- `profileImage` (URL or path to image)

**Response** (201 Created):
```json
{
  "id": "user-id-123",
  "fullName": "John Doe",
  "username": "johndoe",
  "role": "regular",
  "color": "#3b82f6",
  "profileImage": null,
  "base": { /* ... */ }
}
```

**Errors**:
- `400 Bad Request` - Invalid data

**Validation Rules**:
- Role must be exactly "regular" or "admin"
- Color must match regex: `^#[0-9a-fA-F]{6}$`
- Unknown fields are rejected

---

### Update User
Update an existing user.

**Endpoint**: `PUT /api/users/{id}`

**URL Parameters**:
- `id` - User ID

**Request Body**:
```json
{
  "fullName": "Jane Doe",
  "role": "admin"
}
```

**Response** (200 OK):
```json
{
  "id": "user-id-123",
  "fullName": "Jane Doe",
  "role": "admin",
  // ... other fields
}
```

**Errors**:
- `400 Bad Request` - Invalid data
- `404 Not Found` - User doesn't exist

---

### Delete User
Soft delete a user.

**Endpoint**: `DELETE /api/users/{id}`

**Response** (200 OK):
```json
{
  "message": "Deleted"
}
```

---

## Tags API

### Get All Tags
Retrieve all tags.

**Endpoint**: `GET /api/tags/`

**Response** (200 OK):
```json
[
  {
    "id": "tag-id-123",
    "name": "Urgent",
    "description": "Tasks that require immediate attention",
    "color": "#ef4444",
    "relatedContactsIds": ["contact-id-456"],
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1702901234000,
      "updatedAt": 1702901234000,
      "lut": 1702901234000,
      "entityType": "tag"
    }
  }
]
```

---

### Create Tag
Create a new tag.

**Endpoint**: `POST /api/tags/`

**Request Body**:
```json
{
  "name": "Urgent",
  "description": "Tasks that require immediate attention",
  "color": "#ef4444",
  "relatedContactsIds": ["contact-id-456"]
}
```

**Required Fields**:
- `name` (min 1 character)
- `color` (hex color: #RRGGBB)

**Optional Fields**:
- `description` (default: null)
- `relatedContactsIds` (default: null)

**Response** (201 Created):
```json
{
  "id": "tag-id-123",
  "name": "Urgent",
  "description": "Tasks that require immediate attention",
  "color": "#ef4444",
  "relatedContactsIds": ["contact-id-456"],
  "base": { /* ... */ }
}
```

**Validation Rules**:
- Color must match: `^#[0-9a-fA-F]{6}$`
- Unknown fields are rejected

---

### Update Tag
Update an existing tag.

**Endpoint**: `PUT /api/tags/{id}`

**Request Body**:
```json
{
  "name": "High Priority",
  "color": "#f59e0b"
}
```

**Response** (200 OK):
```json
{
  "id": "tag-id-123",
  "name": "High Priority",
  "color": "#f59e0b",
  // ... other fields
}
```

---

### Delete Tag
Soft delete a tag.

**Endpoint**: `DELETE /api/tags/{id}`

**Response** (200 OK):
```json
{
  "message": "Deleted"
}
```

---

## Contacts API

### Get All Contacts
Retrieve all contacts.

**Endpoint**: `GET /api/contacts/`

**Response** (200 OK):
```json
[
  {
    "id": "contact-id-123",
    "fullName": "Jane Smith",
    "phoneNumber": "+0987654321",
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1702901234000,
      "updatedAt": 1702901234000,
      "lut": 1702901234000,
      "entityType": "contact"
    }
  }
]
```

---

### Create Contact
Create a new contact.

**Endpoint**: `POST /api/contacts/`

**Request Body**:
```json
{
  "fullName": "Jane Smith",
  "phoneNumber": "+1234567890",
}
```

**Required Fields**:
- `fullName` (min 2 characters)
- `phoneNumber` (min 1 character)

**Optional Fields**:
- `position` (default: null)
- `department` (default: null)
- `tagsIds` (default: null)

**Response** (201 Created):
```json
{
  "id": "contact-id-123",
  "fullName": "Jane Smith",
  "phoneNumber": "+1234567890",
  "base": { /* ... */ }
}
```

**Validation Rules**:
- Unknown fields are rejected

---

### Update Contact
Update an existing contact.

**Endpoint**: `PUT /api/contacts/{id}`

**Request Body**:
```json
{
  "phoneNumber": "+1111111111"
}
```

**Response** (200 OK):
```json
{
  "id": "contact-id-123",
  "phoneNumber": "+1111111111",
  // ... other fields
}
```

---

### Delete Contact
Soft delete a contact.

**Endpoint**: `DELETE /api/contacts/{id}`

**Response** (200 OK):
```json
{
  "message": "Deleted"
}
```

---

## History API

### Get Entity History
Retrieve change history for a specific entity.

**Endpoint**: `GET /api/ history/{entity_type}/{entity_id}`

**URL Parameters**:
- `entity_type` - Type of entity (task, user, tag, contact)
- `entity_id` - ID of the entity

**Example**:
```
GET /api/history/task/task-id-123
```

**Response** (200 OK):
```json
[
  {
    "o": {
      "id": "task-id-123",
      "title": "Old Title",
      "status": "pending",
      // ... old state
    },
    "c": {
      "status": "in_progress",
      "action": "UPDATE",
      "updatedBy": "user-id-456",
      "timestamp": 1702901234000
    },
    "n": {
      "id": "task-id-123",
      "title": "Old Title",
      "status": "in_progress",
      // ... new state
    }
  }
]
```

**History Entry Structure**:
- `o` (old): Entity state before the change
- `c` (change): What changed + metadata (who, when, action)
- `n` (new): Entity state after the change

**Actions**:
- `CREATE` - Entity was created
- `UPDATE` - Entity was modified
- `DELETE` - Entity was soft-deleted

---

## Chat API

### Get Chat Messages
Retrieve all chat messages.

**Endpoint**: `GET /api/chat-messages/`

**Response** (200 OK):
```json
[
  {
    "id": "message-id-123",
    "senderId": "user-id-123",
    "message": "Hello team!",
    "timestamp": 1702901234000,
    "base": {
      "isDeleted": false,
      "isActive": true,
      "createdAt": 1702901234000,
      "updatedAt": 1702901234000,
      "lut": 1702901234000,
      "entityType": "chat_message"
    }
  }
]
```

---

### Send Chat Message
Send a new chat message.

**Endpoint**: `POST /api/chat-messages/`

**Request Body**:
```json
{
  "senderId": "user-id-123",
  "message": "Hello team!"
}
```

**Response** (201 Created):
```json
{
  "id": "message-id-123",
  "senderId": "user-id-123",
  "message": "Hello team!",
  "timestamp": 1702901234000,
  "base": { /* ... */ }
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Description of what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Authentication required or failed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

### Common Validation Errors

**Invalid Field**:
```json
{
  "error": "validation error for TaskModel\nstatus\n  String should match pattern '^(pending|in_progress|completed|cancelled)$'"
}
```

**Unknown Field**:
```json
{
  "error": "Extra inputs are not permitted"
}
```

**Missing Required Field**:
```json
{
  "error": "Field required"
}
```

---

## Common Patterns

### Timestamps
All timestamps are Unix timestamps in **milliseconds** (not seconds).

```python
# Python
import time
timestamp = int(time.time() * 1000)

# JavaScript
const timestamp = Date.now();
```

### Soft Delete Pattern
Entities are never physically deleted. Instead:
1. `base.isDeleted` is set to `true`
2. `GET` endpoints filter out deleted entities by default
3. History is preserved

### Change History
Every CREATE, UPDATE, and DELETE operation is logged:
1. `log_history()` is called after each operation
2. Entry saved to `ents_archive` collection
3. Contains old state, new state, and changes

### Validation
All requests are validated using Pydantic models:
1. Unknown fields are rejected (`extra='forbid'`)
2. Field types are strictly enforced
3. Pattern validation for enums (status, priority, role, etc.)
4. Min/max length constraints

### Base Entity Metadata
All entities include `base` metadata:

```json
{
  "isDeleted": false,      // Soft delete flag
  "isActive": true,        // Active status
  "createdAt": 1702901234000,  // Creation timestamp
  "updatedAt": 1702901234000,  // Last update timestamp
  "lut": 1702901234000,        // Last update time (same as updatedAt)
  "entityType": "task"     // Entity type identifier
}
```

---

## Testing the API

### Using cURL

**Create a task**:
```bash
curl -X POST http://localhost:5000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "date": 1702901234000,
    "priority": "high"
  }'
```

**Get all tasks**:
```bash
curl http://localhost:5000/api/tasks/
```

**Update a task**:
```bash
curl -X PUT http://localhost:5000/api/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Using Postman

1. Import the base URL: `http://localhost:5000/api`
2. Set `Content-Type: application/json` for POST/PUT requests
3. Use the endpoint paths from this documentation
4. Check response status codes and body

---

## Rate Limiting

Currently, there are **no rate limits** on the API. This may be added in future versions.

---

## Versioning

The API is currently **unversioned**. Breaking changes will be communicated through:
- Version bumps in `CHANGELOG.md`
- Migration guides
- Team notifications

---

## Support

For API questions or issues, contact the HD development team.

---

**Last Updated**: December 2025  
**API Version**: 2.0.0
