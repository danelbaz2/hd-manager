# Backend Documentation

**HD Manager - Flask Python Backend**

---

## 📋 Overview

The HD Manager backend is a RESTful API built with Flask, MongoDB, and Pydantic for data validation. It provides endpoints for managing tasks, users, tags, contacts, and change history.

---

## 🛠️ Tech Stack

- **Framework**: Flask (Python web framework)
- **Database**: MongoDB (NoSQL)
- **ODM**: PyMongo with Flask-PyMongo
- **Validation**: Pydantic v2 (strict mode with `extra='forbid'`)
- **Authentication**: bcrypt for password hashing
- **CORS**: Flask-CORS for cross-origin requests

---

## 🏗️ Architecture

### Directory Structure

```
backend/
├── app.py                  # Flask app initialization
├── database.py             # MongoDB connection
├── seed.py                 # Database seeding script
├── requirements.txt        # Python dependencies
│
├── models/                 # Pydantic data models
│   ├── __init__.py
│   ├── base_entity.py      # Base entity metadata
│   ├── task_model.py       # Task models
│   ├── user_model.py       # User models
│   ├── tag_model.py        # Tag models
│   ├── contact_model.py    # Contact models
│   ├── chat_message_model.py
│   ├── history_entry_model.py
│   └── auth_model.py
│
├── routes/                 # API route handlers
│   ├── tasks.py            # Task CRUD operations
│   ├── users.py            # User management
│   ├── tags.py             # Tag operations
│   ├── contacts.py         # Contact management
│   ├── history_entries.py  # History retrieval
│   ├── chat_messages.py    # Chat functionality
│   └── auth.py             # Authentication
│
├── schemas/                # JSON schema examples
│   ├── task_create.json
│   ├── task_update.json
│   └── ...
│
└── utils/                  # Utility functions
    └── history.py          # Change history logging
```

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- MongoDB 5.0+
- pip (Python package manager)

### Install Dependencies

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file in backend directory:

```bash
MONGO_URI=mongodb://localhost:27017/hd_manager
PORT=5000
```

### Run Server

```bash
python app.py
```

Server runs on `http://localhost:5000`

### Seed Database (Optional)

```bash
# Seed with sample data
python seed.py

# Clean database and reseed
python seed.py --clean
```

---

## 🗄️ Database Design

### Single Collection Pattern

All entities stored in one collection (`ents`) with type discriminator:

```python
{
  "_id": "unique-id",
  "base": {
    "entityType": "task",  # task | user | tag | contact | chat_message
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1702901234000,
    "updatedAt": 1702901234000,
    "lut": 1702901234000
  },
  # ... entity-specific fields
}
```

**Benefits**:
- Simplified queries across entity types
- Unified history tracking
- Reduced database complexity
- Easy to add new entity types

### Change History

All changes logged to `ents_archive` collection:

```python
{
  "o": { /* old entity state */ },
  "c": { /* changes + metadata (who, when, action) */ },
  "n": { /* new entity state */ }
}
```

---

## 🔒 Data Validation

### Strict Pydantic Models

All models use `extra='forbid'` to reject unknown fields:

```python
from pydantic import BaseModel, Field, ConfigDict

class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')  # Rejects unknown fields
    
    title: str = Field(..., min_length=3)
    status: str = Field(default="pending", pattern=VALID_STATUSES)
    priority: str = Field(default="medium", pattern=VALID_PRIORITIES)
    # ... other fields
```

**Benefits**:
- Prevents invalid data insertion
- Enhanced security
- Clear API contracts
- Better error messages

### Dual Model Pattern

Each entity has two models:

1. **Base Model** (e.g., `TaskModel`) - For creation
   - All required fields enforced
   - Validation on creation

2. **Update Model** (e.g., `TaskUpdateModel`) - For updates
   - All fields optional
   - Validation when provided
   - Only updates specified fields

---

## 🔌 API Routes

### Blueprint Organization

Routes organized using Flask blueprints:

```python
# app.py
from routes import tasks, users, tags, contacts, auth

app.register_blueprint(tasks.bp)
app.register_blueprint(users.bp)
app.register_blueprint(tags.bp)
# ...
```

### Route Structure

Each route file follows this pattern:

```python
from flask import Blueprint, request, jsonify
from models.task_model import TaskModel, TaskUpdateModel

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@bp.route('/', methods=['GET'])
def get_tasks():
    # Implementation
    pass

@bp.route('/', methods=['POST'])
def create_task():
    # Validate with Pydantic
    data = TaskModel(**request.json).model_dump()
    # ... create entity
    pass
```

---

## 📝 Data Models

### Task Model

```python
VALID_STATUSES = "^(pending|in_progress|completed|cancelled)$"
VALID_PRIORITIES = "^(low|medium|high)$"

class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(default="pending", pattern=VALID_STATUSES)
    priority: str = Field(default="medium", pattern=VALID_PRIORITIES)
    responsibleUsersId: List[Union[int, str]] = []
    participantsIds: Optional[List[Union[int, str]]] = []
    tagsId: List[Union[int, str]] = []
    date: int  # Unix timestamp in ms
    deadline: Optional[int] = None
    base: Optional[BaseEntityMeta] = None
```

### User Model

```python
class UserModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    username: str = Field(..., min_length=2)
    passwordHash: str
    role: str = Field(..., pattern="^(regular|admin)$")
    color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")
    profileImage: Optional[str] = None
    base: Optional[BaseEntityMeta] = None
```

### Tag Model

```python
class TagModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")
    relatedContactsIds: Optional[List[Union[int, str]]] = None
    base: Optional[BaseEntityMeta] = None
```

---

## 🛡️ Security

### Password Hashing

```python
import bcrypt

def hash_password(password):
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

def verify_password(password, hashed):
    return bcrypt.checkpw(
        password.encode('utf-8'),
        hashed.encode('utf-8')
    )
```

### Data Validation

- All input validated with Pydantic
- Unknown fields rejected (`extra='forbid'`)
- Type checking enforced
- Pattern validation for enums (status, role, etc.)

### Soft Delete

- Entities never physically deleted
- `base.isDeleted` flag prevents accidental data loss
- Complete audit trail preserved

---

## 📊 Change History System

### Logging Changes

```python
from utils.history import log_history

# On CREATE
log_history('task', task_id, 'CREATE', 'system', None, new_doc, new_doc)

# On UPDATE
log_history('task', task_id, 'UPDATE', 'system', old_doc, new_doc, changes)

# On DELETE (soft)
log_history('task', task_id, 'DELETE', 'system', old_doc, updated_doc, changes)
```

### History Entry Structure

```python
{
  "o": {  # Old state
    "id": "task-123",
    "title": "Old Title",
    "status": "pending"
  },
  "c": {  # Change metadata
    "title": "New Title",
    "status": "in_progress",
    "action": "UPDATE",
    "updatedBy": "user-456",
    "timestamp": 1702901234000
  },
  "n": {  # New state
    "id": "task-123",
    "title": "New Title",
    "status": "in_progress"
  }
}
```

---

## 🔧 Utility Functions

### History Logging (`utils/history.py`)

```python
def log_history(entity_type, entity_id, action, user_id='system', 
                old_val=None, new_val=None, change_val=None):
    """
    Logs entity changes to ents_archive collection.
    
    Args:
        entity_type: Type of entity (task, user, etc.)
        entity_id: Entity ID
        action: CREATE | UPDATE | DELETE
        user_id: User who made the change
        old_val: Entity before change
        new_val: Entity after change
        change_val: What changed
    """
    # Implementation
```

---

## 🧪 Testing

### Manual API Testing

```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "date": 1702901234000,
    "priority": "high"
  }'

# Get all tasks
curl http://localhost:5000/api/tasks/

# Update task
curl -X PUT http://localhost:5000/api/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Future: Automated Tests

```bash
# Install pytest
pip install pytest pytest-flask

# Run tests (future)
pytest tests/
```

---

## 📚 API Documentation

**See**: [API Reference](api/)

Individual API documentation files:
- [Tasks API](api/Tasks-API.md)
- [Users API](api/Users-API.md)
- [Tags API](api/Tags-API.md)
- [Contacts API](api/Contacts-API.md)
- [Chat API](api/ChatMessages-API.md)
- [Auth API](api/Auth-API.md)

**Or see consolidated**: [Complete API Documentation](../wiki/api/API_DOCUMENTATION.md)

---

## 📖 System Specifications

**See**: [System Specifications](system-specification/)

- [HD Manager SRS](system-specification/HD-Manager-SRS-Updated.md)
- [SRS Change Log](system-specification/SRS-Change-Log.md)

---

## 🎯 Best Practices

### Route Handlers
✅ Validate input with Pydantic models  
✅ Handle exceptions with try/except  
✅ Return appropriate HTTP status codes  
✅ Log changes to history  
✅ Use soft delete for data preservation  

### Data Models
✅ Use `extra='forbid'` for strict validation  
✅ Provide default values where appropriate  
✅ Use regex patterns for enums  
✅ Separate create and update models  

### Database Operations
✅ Always set `base.updatedAt` and `base.lut`  
✅ Query with `base.isDeleted: {$ne: True}`  
✅ Use `_id` as string (ObjectId as string)  
✅ Log all changes to ents_archive  

---

## 🐛 Common Issues

### MongoDB Connection Errors
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify MongoDB version (5.0+)

### Validation Errors
- Check request body matches model schema
- Ensure no extra fields are sent
- Verify field types match

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Check Python version (3.9+)

---

## 🚀 Future Enhancements

- [ ] Add pytest test suite (target: 80% coverage)
- [ ] Add API rate limiting
- [ ] Implement real authentication (JWT tokens)
- [ ] Add database indexes for performance
- [ ] Add request/response logging
- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement WebSocket support for real-time updates

---

## 📚 Related Documentation

- [Project Architecture](../wiki/architecture/ARCHITECTURE.md)
- [Frontend Documentation](../frontend/README.md)
- [Complete API Reference](../wiki/api/API_DOCUMENTATION.md)
- [Changelog](../wiki/changes/versions/CHANGELOG.md)

---

**Last Updated**: December 18, 2025  
**Maintained by**: HD Development Team
