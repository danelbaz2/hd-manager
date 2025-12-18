# HD Manager - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [Design Patterns](#design-patterns)
9. [Recent Enhancements](#recent-enhancements)

---

## Project Overview

**HD Manager** is a full-stack task and contact management system built for the HD team. It provides a comprehensive solution for managing tasks, users, contacts, tags, and team communication with a modern, responsive user interface.

### Key Features
- **Task Management**: Create, update, and track tasks with priorities, statuses, and assignments
- **Kanban Board**: Drag-and-drop task management with status columns
- **User Management**: Multi-user support with role-based access (admin/regular)
- **Contact Management**: Organize and maintain contact information
- **Tag System**: Categorize tasks and contacts with colored tags
- **Change History**: Complete audit trail of all entity modifications
- **Real-time Chat**: Team communication interface
- **Dark Mode**: Full theme support across the application

---

## Technology Stack

### Backend
- **Framework**: Flask (Python web framework)
- **Database**: MongoDB (NoSQL database)
- **ODM**: PyMongo with Flask-PyMongo extension
- **Validation**: Pydantic v2 (strict validation with `extra='forbid'`)
- **Authentication**: bcrypt for password hashing
- **CORS**: Flask-CORS for cross-origin requests

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.10.1
- **Styling**: TailwindCSS 4.1.18
- **Icons**: Lucide React 0.561.0
- **Type Safety**: TypeScript 5.9.3 with strict mode

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Code Quality**: TypeScript ESLint plugin
- **Hot Reload**: Vite dev server

---

## Architecture Overview

The application follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  - Pages (Home, Tasks, Chat, etc.)   │
│  - Components (Reusable UI)          │
│  - API Layer (Type-safe requests)    │
│  - Contexts (Global state)           │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│         Backend (Flask)              │
│  - Routes (API endpoints)            │
│  - Models (Pydantic validation)      │
│  - Database (MongoDB operations)     │
│  - Utils (History logging)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         MongoDB Database             │
│  - ents (Main entities collection)   │
│  - ents_archive (History collection) │
└─────────────────────────────────────┘
```

---

## Backend Architecture

### Directory Structure
```
backend/
├── app.py                  # Flask app initialization and blueprints
├── database.py             # MongoDB connection setup
├── seed.py                 # Database seeding script
├── requirements.txt        # Python dependencies
├── models/                 # Pydantic data models
│   ├── base_entity.py      # Base entity metadata model
│   ├── task_model.py       # Task models (create/update)
│   ├── user_model.py       # User models
│   ├── tag_model.py        # Tag models
│   ├── contact_model.py    # Contact models
│   ├── chat_message_model.py
│   ├── history_entry_model.py
│   └── auth_model.py       # Authentication models
├── routes/                 # API route handlers
│   ├── tasks.py            # Task CRUD operations
│   ├── users.py            # User management
│   ├── tags.py             # Tag operations
│   ├── contacts.py         # Contact management
│   ├── history_entries.py  # History retrieval
│   ├── chat_messages.py    # Chat functionality
│   └── auth.py             # Authentication endpoints
├── schemas/                # JSON schema examples
│   ├── task_create.json
│   ├── task_update.json
│   └── ...
└── utils/                  # Utility functions
    └── history.py          # Change history logging
```

### Key Backend Concepts

#### 1. Strict Validation with Pydantic
All models use `extra='forbid'` to reject unknown fields, ensuring data integrity:

```python
class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    # ... fields
```

#### 2. Dual Model Pattern
Each entity has two models:
- **Base Model**: For creation (all required fields)
- **Update Model**: For updates (all fields optional but validated)

#### 3. Soft Delete Pattern
Entities are never physically deleted. Instead, `base.isDeleted` is set to `True`:

```python
mongo.db.ents.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
```

#### 4. Change History Logging
Every CREATE, UPDATE, and DELETE operation is logged to `ents_archive`:

```python
log_history('task', task_id, 'UPDATE', 'system', old_doc, new_doc, changes)
```

History entries contain:
- **o** (old): Entity state before change
- **c** (change): What changed, who made the change, when, and action type
- **n** (new): Entity state after change

#### 5. Single Collection Design
All entities are stored in one collection (`ents`) with `base.entityType` for differentiation:
- Simplifies queries across entity types
- Enables unified history tracking
- Reduces database complexity

---

## Frontend Architecture

### Directory Structure
```
frontend/src/
├── App.tsx                 # Main app component with routing
├── main.tsx                # Application entry point
├── index.css               # Global styles and Tailwind config
├── api/                    # API client layer
│   ├── apiConfig.ts        # Base configuration and utilities
│   ├── tasksApi.ts         # Task API functions
│   ├── usersApi.ts         # User API functions
│   ├── tagsApi.ts          # Tag API functions
│   ├── contactsApi.ts      # Contact API functions
│   ├── chatApi.ts          # Chat API functions
│   ├── historyApi.ts       # History API functions
│   └── index.ts            # Barrel export
├── components/             # Reusable UI components
│   ├── Layout/             # App layout components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── menu-bar/       # Sidebar navigation
│   │   └── header-bar/     # Top header
│   ├── modal-new-task/     # Task creation modal
│   ├── modal-setting/      # Settings modal
│   ├── delete-confirm-modal/ # Reusable delete confirmation
│   ├── alert-feedback/     # Toast notifications
│   ├── delay-loader/       # Loading indicator
│   └── index.ts            # Barrel export
├── contexts/               # React contexts for global state
│   ├── ThemeContext.tsx    # Dark mode state
│   ├── UserContext.tsx     # Current user state
│   └── ...
├── pages/                  # Page components
│   ├── home-page/          # Dashboard/home view
│   ├── task-page/          # Kanban board and task management
│   ├── chat-page/          # Team chat interface
│   ├── login-page/         # Authentication
│   ├── setting-page/       # App settings
│   └── index.ts            # Barrel export
├── schemas/                # TypeScript type definitions
│   ├── taskTypes.ts        # Task-related types
│   ├── userTypes.ts        # User-related types
│   ├── tagTypes.ts         # Tag-related types
│   ├── contactTypes.ts     # Contact-related types
│   └── alertTypes.ts       # Alert/notification types
└── utils/                  # Utility functions
    └── ...
```

### Component Organization Pattern

The project follows a **consistent modular pattern** for component organization:

```
component-name/
├── ComponentName.tsx       # Main component file
├── index.ts                # Barrel export
└── parts/ (optional)       # Sub-components
    └── SubComponent.tsx
```

**Benefits**:
- Clean imports: `import { Component } from './component-name'`
- Encapsulation: Each component is self-contained
- Scalability: Easy to add sub-components in `parts/` folder
- Discoverability: Consistent structure across codebase

**Example**:
```typescript
// components/delete-confirm-modal/index.ts
export { default as DeleteConfirmModal } from './DeleteConfirmModal';

// Usage in other files
import { DeleteConfirmModal } from '../components/delete-confirm-modal';
```

### API Layer Design

The API layer provides:
1. **Type Safety**: Full TypeScript interfaces for requests/responses
2. **Centralized Configuration**: Base URL and headers in `apiConfig.ts`
3. **Error Handling**: Unified error responses with `ApiResponse<T>` type
4. **Request Wrapper**: `apiRequest<T>()` handles all HTTP operations

**Example**:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const updateTask = async (
  taskId: string,
  taskData: Partial<TaskFormData>
): Promise<ApiResponse<Task>> => {
  return apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
};
```

### State Management

The application uses **React Context API** for global state:
- **ThemeContext**: Dark mode preference
- **UserContext**: Current authenticated user
- **Additional contexts** as needed

**Why Context over Redux?**:
- Simpler for small-to-medium apps
- No external dependencies
- Type-safe with TypeScript
- Built-in to React

---

## Data Models

### Task Model

**Status Values**:
- `pending` (פתוח) - Open/new task
- `in_progress` (בטיפול) - Being worked on
- `completed` (סגור) - Finished
- `cancelled` (מבוטל) - Cancelled

**Priority Values**:
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

**Fields**:
```python
{
  "id": "string",                      # Unique identifier
  "title": "string",                   # min_length=3, required
  "description": "string",             # Optional
  "status": "TaskStatus",              # Default: "pending"
  "priority": "TaskPriority",          # Default: "medium"
  "responsibleUsersId": ["string"],    # User IDs assigned
  "participantsIds": ["string"],       # Contact IDs involved
  "tagsId": ["string"],                # Tag IDs
  "date": "number",                    # Unix timestamp (ms)
  "deadline": "number",                # Optional deadline
  "base": {                            # Metadata
    "isDeleted": "boolean",
    "isActive": "boolean",
    "createdAt": "number",
    "updatedAt": "number",
    "lut": "number",                   # Last update time
    "entityType": "task"
  }
}
```

### User Model

**Roles**:
- `regular` - Standard user
- `admin` - Administrator with full access

**Fields**:
```python
{
  "id": "string",
  "fullName": "string",                # min_length=2
  "username": "string",                # min_length=2
  "passwordHash": "string",            # bcrypt hash
  "role": "regular | admin",
  "color": "string",                   # Hex color (#RRGGBB)
  "profileImage": "string",            # Optional image URL/path
  "base": BaseEntityMeta
}
```

### Tag Model

**Fields**:
```python
{
  "id": "string",
  "name": "string",                    # min_length=1
  "description": "string",             # Optional
  "color": "string",                   # Hex color (#RRGGBB)
  "relatedContactsIds": ["string"],    # Optional contact IDs
  "base": BaseEntityMeta
}
```

### Contact Model

**Contact Types**:
- `person` - Individual contact
- `company` - Company/organization

**Fields**:
```python
{
  "id": "string",
  "fullName": "string",
  "phoneNumbers": ["string"],          # Phone number list
  "emails": ["string"],                # Email list
  "contactType": "person | company",
  "company": "string",                 # Optional company name
  "notes": "string",                   # Optional notes
  "base": BaseEntityMeta
}
```

---

## API Endpoints

### Tasks
- `GET /api/tasks/` - Get all tasks (with optional filters)
  - Query params: `date`, `startDate`, `endDate`, `responsibleUsersId`
- `POST /api/tasks/` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Soft delete a task

### Users
- `GET /api/users/` - Get all users
- `POST /api/users/` - Create a new user
- `PUT /api/users/<id>` - Update a user
- `DELETE /api/users/<id>` - Soft delete a user

### Tags
- `GET /api/tags/` - Get all tags
- `POST /api/tags/` - Create a new tag
- `PUT /api/tags/<id>` - Update a tag
- `DELETE /api/tags/<id>` - Soft delete a tag

### Contacts
- `GET /api/contacts/` - Get all contacts
- `POST /api/contacts/` - Create a new contact
- `PUT /api/contacts/<id>` - Update a contact
- `DELETE /api/contacts/<id>` - Soft delete a contact

### History
- `GET /api/history/<entity_type>/<entity_id>` - Get change history for an entity

### Chat
- `GET /api/chat-messages/` - Get chat messages
- `POST /api/chat-messages/` - Send a chat message

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

---

## Design Patterns

### 1. Repository Pattern (Backend)
Each entity has dedicated routes that act as repositories, encapsulating database operations.

### 2. Data Transfer Object (DTO) Pattern
Pydantic models serve as DTOs, validating data before it reaches the database.

### 3. Barrel Export Pattern (Frontend)
`index.ts` files in each directory export components/functions for clean imports.

### 4. Separation of Concerns
- **API Layer**: Handles HTTP communication
- **Components**: UI rendering and user interaction
- **Contexts**: Global state management
- **Routes**: Business logic and data operations

### 5. Composition over Inheritance (Frontend)
React components are composed rather than inherited, promoting reusability.

### 6. Single Responsibility Principle
Each component, function, and module has one clear purpose.

---

## Recent Enhancements

### 1. Task Priority Field Addition (December 2025)
- Added `priority` field to Task model with validation
- Default value: `"medium"`
- Valid values: `"low"`, `"medium"`, `"high"`
- Updated frontend interfaces and components
- Updated seed data to include priority

### 2. Frontend Modularization (December 2025)
- Refactored all components to follow consistent barrel export pattern
- Created `index.ts` files for all component folders
- Organized sub-components into `parts/` subdirectories
- Fixed import path casing issues
- Improved code discoverability and maintainability

### 3. Reusable Delete Confirmation Modal (December 2025)
- Extracted inline delete confirmation into `DeleteConfirmModal` component
- Made component type-safe with TypeScript
- Added to shared components directory
- Replaced all inline delete confirmations across the app
- Improved consistency and reduced code duplication

### 4. Strict Pydantic Validation (December 2025)
- Added `extra='forbid'` to all Pydantic models
- Prevents insertion of unknown/invalid fields
- Applied to both creation and update models
- Enhanced data integrity and security
- Updated seed script to comply with strict validation

### 5. Drag-and-Drop Kanban Board
- Implemented drag-and-drop task status changes
- Tasks grouped by status in columns
- Visual feedback during drag operations
- Integrated with task update API

### 6. Change History System
- Complete audit trail for all entity operations
- Stores old state, new state, and changes
- Tracks who made changes and when
- Queryable history by entity type and ID

---

## Code Quality Standards

### Backend
✅ All models use Pydantic with strict validation  
✅ Consistent error handling and HTTP status codes  
✅ Complete change history logging  
✅ Soft delete pattern for all entities  
✅ Blueprint-based route organization  

### Frontend
✅ TypeScript strict mode enabled  
✅ Consistent barrel export pattern  
✅ Type-safe API layer  
✅ Component-based architecture  
✅ Dark mode support throughout  
✅ Responsive design with TailwindCSS  

### Testing
⚠️ **Area for Improvement**: Add unit and integration tests
- Backend: pytest with Flask test client
- Frontend: React Testing Library with Vitest

---

## Future Enhancements

### Short-term
- [ ] Add comprehensive test coverage
- [ ] Implement real-time updates with WebSockets
- [ ] Add file upload support for tasks and contacts
- [ ] Implement advanced filtering and search

### Long-term
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB 5.0+

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py  # Optional: seed database with sample data
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` in backend directory:
```
MONGO_URI=mongodb://localhost:27017/hd_manager
PORT=5000
```

---

## Conventions

### Naming Conventions
- **Backend**: snake_case for files, variables, and functions
- **Frontend**: camelCase for variables/functions, PascalCase for components
- **Database**: camelCase for field names (matching frontend)

### File Organization
- **Backend**: Group by type (models, routes, utils)
- **Frontend**: Feature-based grouping with barrel exports

### Git Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `style:` Code style changes
- `test:` Test additions/modifications

---

## License
Internal project for HD Team

## Maintainers
HD Development Team
