# HD Manager - Change Log (SRS to Implementation)

**Date:** December 18, 2024  
**Purpose:** Quick reference of changes from original SRS (desk-manager.docx) to current implementation

---

## 🔴 Breaking Changes

### Task Model
| Change | Original | Current | Impact |
|--------|----------|---------|--------|
| Tag field | `tagId` (single) | `tagsId[]` (array) | Tasks now support multiple tags |
| Priority | `priority` field existed | **REMOVED** | No priority system implemented |

### History/Archive Model
| Change | Original | Current | Impact |
|--------|----------|---------|--------|
| Collection | `history_entries` | `ents_archive` | New collection name |
| Structure | Individual records per action | **o/c/n document per change** | Each change creates a new document |
| Document format | `entityId` + `entries[]` array | `{ o: old, c: change, n: new }` | Simpler, flatter structure |
| Change data | Separate fields | Merged into `c` object with `action`, `timestamp`, `updatedBy` + changed fields | More compact |

### isActive/createdAt Fields
| Entity | Original | Current | Impact |
|--------|----------|---------|--------|
| User | Separate `isActive`, `createdAt` | Now in `base.isActive`, `base.createdAt` | Unified structure |
| Contact | Separate `isActive`, `createdAt` | Now in `base` | Unified structure |
| Tag | Separate `isActive`, `createdAt` | Now in `base` | Unified structure |

---

## 🟢 New Fields Added

### User Model
| Field | Type | Description |
|-------|------|-------------|
| `color` | `string` (#RRGGBB) | **Required** - Unique color for UI display |
| `profileImage` | `string` (URL) | Optional profile image |

### Task Model
| Field | Type | Description |
|-------|------|-------------|
| `deadline` | `int` (timestamp ms) | Optional deadline for task completion |

### Tag Model
| Field | Type | Description |
|-------|------|-------------|
| `color` | `string` (#RRGGBB) | **Required** - Color for UI display |

### BaseEntityMeta (NEW)
All entities now have a `base` field containing:
| Field | Type | Description |
|-------|------|-------------|
| `isDeleted` | `boolean` | Soft delete flag |
| `isActive` | `boolean` | Active status |
| `createdAt` | `int` (ms) | Creation timestamp |
| `updatedAt` | `int` (ms) | Last update timestamp |
| `lut` | `int` (ms) | Last update timestamp (redundant) |
| `entityType` | `string` | Type discriminator |

---

## 🟡 Structural Changes

### Database Collections
| Original (6 collections) | Current |
|-------------------------|---------|
| `users` | `users` (unchanged) |
| `tasks` | → `ents` (with `entityType: 'task'`) |
| `tags` | → `ents` (with `entityType: 'tag'`) |
| `system_contacts` | → `contacts` (renamed) |
| `history_entries` | → **`ents_archive`** (renamed + restructured) |
| `chat_messages` | → `ents` (with `entityType: 'chat_message'`) |

### API Endpoints
| Change | Original | Current |
|--------|----------|---------|
| Tasks filtering | `date` only | `date`, `startDate`/`endDate`, `responsibleUsersId` |
| Auth header | Not specified | `X-User-Id` header |
| Password security | Not specified | bcrypt hashing |

---

## 🔵 Validation Enhancements

All Pydantic models now use:
```python
model_config = ConfigDict(extra='forbid')
```

This means:
- ❌ Unknown fields are rejected
- ✅ Only defined fields are accepted
- ✅ Type validation enforced

### Field Validations Added:
| Entity | Field | Validation |
|--------|-------|------------|
| Task | `title` | `min_length=3` |
| Task | `status` | `pattern: ^(open\|in_progress\|closed)$` |
| User | `fullName` | `min_length=2` |
| User | `username` | `min_length=2` |
| User | `role` | `pattern: ^(regular\|admin)$` |
| User | `color` | `pattern: ^#[0-9a-fA-F]{6}$` |
| Tag | `name` | `min_length=1` |
| Tag | `color` | `pattern: ^#[0-9a-fA-F]{6}$` |
| Contact | `fullName` | `min_length=2` |
| Contact | `phoneNumber` | `min_length=1` |

---

## 🟣 Archive System (New)

### Document Structure
Each change creates a **new document** in `ents_archive`:

```json
{
  "o": { "id": "123", "title": "Old", ... },
  "c": {
    "action": "UPDATE",
    "timestamp": 1734512345000,
    "updatedBy": "system",
    "title": "New Title"
  },
  "n": { "id": "123", "title": "New Title", ... }
}
```

| Field | Meaning |
|-------|--------|
| `o` | **Old** - Full entity before change (null for CREATE) |
| `c` | **Change** - What changed + metadata |
| `n` | **New** - Full entity after change |

### Change Object (`c`) Contains:
- `action`: CREATE / UPDATE / DELETE
- `timestamp`: When the change occurred (ms)
- `updatedBy`: User ID or 'system'
- `...changedFields`: The actual fields that were modified (nested structure)

### History Logging
All CRUD operations automatically log to archive:
- `log_history(entityType, entityId, actionType, userId, oldValue, newValue, changeValue)`
- Stored in `ents_archive` collection

### Tag Restore Logic
When creating a tag with a name that already exists but is deleted:
- The existing tag is **restored** instead of creating a new one
- `base.isDeleted` is set to `false`
- Other fields are updated with new values

### Soft Delete
All entities use soft delete:
- `DELETE` requests set `base.isDeleted = true`
- `GET` requests filter out `base.isDeleted = true`

---

## 📊 Quick Comparison Table

| Feature | Original SRS | Current Implementation |
|---------|--------------|----------------------|
| Task tags | Single | Multiple (array) |
| Task priority | Yes | **No** |
| Task deadline | No | **Yes** |
| User color | No | **Yes (required)** |
| User profileImage | No | **Yes (optional)** |
| Tag color | No | **Yes (required)** |
| Unified base meta | No | **Yes** |
| Soft delete | Implied | **Explicit (base.isDeleted)** |
| Archive collection | `history_entries` | **`ents_archive` (o/c/n)** |
| Archive structure | `entries[]` array | **Separate doc per change** |

---

*Use this document as a quick reference. See `HD-Manager-SRS-Updated.md` for the full updated specification.*
