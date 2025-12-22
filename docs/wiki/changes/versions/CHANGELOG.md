# Changelog

All notable changes to the HD Manager project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Version 2.1.0] - December 22, 2025

### 🔐 JWT Authentication System

**What Changed**: Implemented complete JWT-based authentication with role-based access control.

**Details**:
- JWT token generation with 7-day expiry
- Token stored in sessionStorage (not user data)
- New `/api/auth/me` endpoint for user validation
- Role-based UI rendering (admin vs regular users)
- `AuthContext` for authentication state management
- `ProtectedRoute` component for route protection

**New Files**:
- `backend/utils/jwt_utils.py` - JWT utilities
- `frontend/src/contexts/AuthContext.tsx` - Auth context
- `frontend/src/api/authApi.ts` - Auth API functions
- `frontend/src/components/auth/ProtectedRoute.tsx` - Route protection
- `frontend/src/components/auth/LoginTransition.tsx` - Login animations

**Benefits**:
- Stateless authentication
- Secure token-based sessions
- Role-based feature access
- Animated login flow

---

### 📊 Model Refactoring (Breaking Changes)

**What Changed**: Removed redundant fields and standardized naming conventions.

**Details**:
- **Removed `lut` field**: Was duplicate of `updatedAt` - eliminated redundancy
- **Renamed `responsibleUsersId` → `responsibleUserIds`**: Fixed plural naming
- Updated `BaseEntityMeta` with `createdBy` and `updatedBy` fields

**Before**:
```python
class BaseEntityMeta:
    lut: int           # Removed - redundant
    updatedAt: int
```

**After**:
```python
class BaseEntityMeta:
    updatedAt: int     # Single source of truth
    createdBy: str     # New
    updatedBy: str     # New
```

**Migration**: Update API consumers to use new field names

---

### 🎯 Kanban Board Improvements

**What Changed**: Complete rewrite of drag-and-drop with smooth CSS animations.

**Details**:
- Smooth CSS transitions for card movement
- Fixed sibling sliding (cards animate to make room)
- No fading or jumping on card placement
- Tasks sorted by `updatedAt` (newest at bottom)
- Optimistic UI updates for instant feedback

**Technical Changes**:
- Rewritten `KanbanColumn.tsx` with CSS transitions
- Enhanced `KanbanTaskCard.tsx` with animation support
- New animation keyframes in `index.css`

---

### 🏷️ Two-Tier Tag System

**What Changed**: Added hierarchical tag system with primary and secondary tags.

**New API Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/primary-tags` | Primary tags CRUD |
| `PUT/DELETE /api/primary-tags/<id>` | Update/delete primary |
| `GET/POST /api/secondary-tags` | Secondary tags CRUD |
| `PUT/DELETE /api/secondary-tags/<id>` | Update/delete secondary |

**Data Structure**:
```python
# Primary Tag
{ "id", "name", "color", "description" }

# Secondary Tag  
{ "id", "name", "primaryTagId", "description" }
```

**Frontend Updates**:
- `SettingsContext` with `primaryTags` and `secondaryTags`
- `TwoTierTagsSelect` component
- Contacts now use `primaryTagIds`

---

### ⚡ Unified Global Loader

**What Changed**: Created single, beautiful loading component for entire application.

**Details**:
- New `GlobalLoader` component with modern design
- Animated background orbs with gradient effects
- Bouncing dots with staggered animation
- Shimmer progress bar
- Dark mode support

**Architecture Change**:
- `ProtectedRoute` now handles ALL loading (auth + data)
- Single loader until everything is ready
- Removed individual page loaders
- `LoginTransition` uses `GlobalLoader` for loading state

**Usage**:
```tsx
<GlobalLoader />                    // Full screen, default text
<GlobalLoader text="טוען משימות" /> // Custom text
<GlobalLoader fullScreen={false} /> // Inline
```

---

### 🔧 Contact Model Simplification

**What Changed**: Simplified contact model and updated categorization.

**Details**:
- Removed `email` field
- `phoneNumber` now required (was optional)
- Uses `primaryTagIds` for categorization
- Standardized field naming (`fullName`, `position`)

---

### 🔒 Security Improvements

**What Changed**: Enhanced security for sensitive data.

**Details**:
- `passwordHash` removed from all GET responses
- Password updates protected (can't change via regular PUT)
- JWT validation on protected routes

---

### 📁 New Files Summary

**Backend**:
- `utils/jwt_utils.py` - JWT token utilities
- `routes/primary_tags.py` - Primary tags API
- `routes/secondary_tags.py` - Secondary tags API
- `.env.example` - Environment template

**Frontend**:
- `components/auth/*` - Authentication components
- `components/global-loader/*` - Unified loader
- `contexts/AuthContext.tsx` - Auth state
- `api/authApi.ts` - Auth API

---

### 🐛 Bug Fixes

- Fixed Kanban card animation glitches
- Fixed sibling cards jumping during drag
- Fixed role-based UI not updating on login

---

### ⚠️ Breaking Changes

1. **Field Renames**: `responsibleUsersId` → `responsibleUserIds`
2. **Removed Fields**: `lut` field no longer exists
3. **Auth Required**: All API endpoints now require JWT token

---

## [Version 2.0.0] - December 2025

### 🚀 Major Enhancements

#### Frontend Modularization and Refactoring
**What Changed**: Complete restructuring of the frontend component architecture to follow a consistent, scalable pattern.

**Details**:
- **Barrel Export Pattern**: Added `index.ts` files to all component and page directories for clean imports
- **Component Organization**: Standardized folder structure with main component file + `index.ts` + optional `parts/` subdirectory
- **Import Path Fixes**: Corrected all import path casing issues to ensure cross-platform compatibility
- **TypeScript Improvements**: Fixed unused imports and type mismatches

**Example Structure**:
```
component-name/
├── ComponentName.tsx
├── index.ts (barrel export)
└── parts/ (optional sub-components)
    └── SubComponent.tsx
```

**Benefits**:
- Cleaner imports: `import { Component } from './component-name'` instead of `'./component-name/ComponentName'`
- Better encapsulation and modularity
- Easier to navigate and maintain
- Scalable architecture for future growth

**Affected Areas**:
- `src/components/*` - All component folders restructured
- `src/pages/*` - All page folders restructured
- Import statements across the entire frontend codebase

---

#### Strict Data Validation with Pydantic
**What Changed**: Implemented strict validation across all backend models using Pydantic's `extra='forbid'` configuration.

**Details**:
- All Pydantic models now reject unknown/unexpected fields
- Applied to both creation models (e.g., `TaskModel`) and update models (e.g., `TaskUpdateModel`)
- Prevents accidental or malicious insertion of invalid data
- Enhanced API security and data integrity

**Example**:
```python
class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')  # NEW: Rejects unknown fields
    title: str = Field(..., min_length=3)
    # ... other fields
```

**Benefits**:
- Stronger data integrity guarantees
- Prevents schema drift and unintended data
- Clearer validation errors
- Better API documentation through strict schemas

**Affected Models**:
- `TaskModel` / `TaskUpdateModel`
- `UserModel` / `UserUpdateModel`
- `TagModel` / `TagUpdateModel`
- `ContactModel` / `ContactUpdateModel`
- `BaseEntityMeta`

---

#### Task Priority System
**What Changed**: Added priority field to tasks with validation and default values.

**Details**:
- New `priority` field added to Task model
- Valid values: `"low"`, `"medium"`, `"high"`
- Default value: `"medium"`
- Regex validation: `^(low|medium|high)$`
- Updated both backend (Python) and frontend (TypeScript) interfaces

**Backend Changes**:
```python
# models/task_model.py
VALID_PRIORITIES = "^(low|medium|high)$"
priority: str = Field(default="medium", pattern=VALID_PRIORITIES)
```

**Frontend Changes**:
```typescript
// api/tasksApi.ts
export type TaskPriority = "low" | "medium" | "high";

interface Task {
  // ... other fields
  priority?: TaskPriority;
}
```

**Benefits**:
- Better task organization and prioritization
- Consistent priority values across frontend/backend
- Type-safe priority handling

**Migration**: Existing tasks without priority automatically default to `"medium"`

---

#### Reusable Delete Confirmation Modal
**What Changed**: Extracted inline delete confirmations into a reusable, type-safe component.

**Details**:
- Created `DeleteConfirmModal` component in `components/delete-confirm-modal/`
- Replaced all inline delete confirmation logic across the app
- Full TypeScript type safety with `DeleteConfirmModalProps` interface
- Consistent UX for all delete operations
- Dark mode support

**Component Interface**:
```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  text: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
}
```

**Usage Example**:
```tsx
<DeleteConfirmModal
  isOpen={showDeleteModal}
  title="האם למחוק משימה זו?"
  text={<>משימה: <strong>{taskTitle}</strong></>}
  onConfirm={handleConfirmDelete}
  onCancel={() => setShowDeleteModal(false)}
  isDarkMode={isDarkMode}
/>
```

**Benefits**:
- DRY principle: No code duplication for delete confirmations
- Consistent UX patterns
- Easier to maintain and update
- Type-safe props

**Replaced Occurrences**: All inline delete confirmations in tags, tasks, users, and contacts

---

### 🔧 Improvements

#### Kanban Board Drag-and-Drop Fix
**What Changed**: Fixed task ID transfer issue during drag-and-drop operations.

**Details**:
- Corrected `dataTransfer.setData()` and `getData()` usage
- Task IDs now properly transferred between columns
- Status updates work correctly after drag-and-drop
- Improved user feedback during drag operations

**Technical Details**:
```typescript
// KanbanColumn - onDragStart
e.dataTransfer.setData("text/plain", task.id);  // Send task ID

// KanbanBoard - onDrop
const taskId = e.dataTransfer.getData("text/plain");  // Receive task ID
onTaskStatusChange(taskId, targetStatus);
```

---

#### Database Seed Script Updates
**What Changed**: Updated seed data to match latest model schemas.

**Details**:
- Added `priority` field to all seeded tasks
- Updated user models with `color` and `profileImage` fields
- Added `color` field to tag models
- Tasks now include `tagsId` array
- All seed data complies with strict Pydantic validation

**Sample Seeds**:
- 3 users (admin + regular users)
- 15+ tasks with various priorities and statuses
- 5+ tags with different colors
- 10+ contacts (persons and companies)

---

### 📝 Documentation

#### Architecture Documentation
**Added**: Comprehensive `ARCHITECTURE.md` covering:
- Complete project overview and features
- Technology stack details
- Backend and frontend architecture
- Data models and validation rules
- API endpoint reference
- Design patterns used
- Recent enhancements
- Code quality standards
- Future roadmap

#### Changelog
**Added**: This `CHANGELOG.md` file documenting all changes

#### README Updates
**Updated**: Main README with setup instructions and project links

---

### 🐛 Bug Fixes

- Fixed casing issues in import paths (cross-platform compatibility)
- Resolved TypeScript errors from unused imports
- Corrected drag-and-drop task ID transfer in Kanban board
- Fixed validation errors in seed script after adding strict Pydantic validation

---

### 🗂️ File Structure Changes

#### New Files
- `ARCHITECTURE.md` - Comprehensive architecture documentation
- `CHANGELOG.md` - This file
- `frontend/src/components/delete-confirm-modal/` - Reusable modal component
- Multiple `index.ts` files for barrel exports across frontend

#### Modified Files
- All component and page directories now include `index.ts`
- `backend/models/*.py` - Added `extra='forbid'` to all models
- `backend/models/task_model.py` - Added priority field
- `backend/seed.py` - Updated to include new fields
- `frontend/src/api/tasksApi.ts` - Added TaskPriority type
- Numerous import statements updated across frontend

---

## [Version 1.0.0] - December 2025

### Initial Release

#### Core Features
- ✅ Task management (CRUD operations)
- ✅ User management with role-based access
- ✅ Contact management
- ✅ Tag system for categorization
- ✅ Kanban board for task visualization
- ✅ Change history tracking
- ✅ Team chat functionality
- ✅ Dark mode support
- ✅ Responsive design

#### Backend
- Flask REST API
- MongoDB database
- Pydantic model validation
- Soft delete pattern
- Change history logging to `ents_archive`
- Single collection design (`ents`)

#### Frontend
- React 19 with TypeScript
- Vite build system
- TailwindCSS for styling
- React Router for navigation
- Context API for state management
- Type-safe API layer

#### Authentication
- bcrypt password hashing
- User roles: admin, regular
- Login/logout functionality

---

## Migration Guide

### Migrating from v1.0.0 to v2.0.0

#### Backend Changes
1. **No Breaking Changes**: All existing API endpoints remain compatible
2. **Database**: Existing tasks will have `priority: "medium"` applied automatically
3. **Validation**: API now rejects unknown fields - ensure clients only send valid fields

#### Frontend Changes
1. **Import Paths**: Update all component imports to use barrel exports:
   ```typescript
   // Before
   import Component from './components/Component/Component';
   
   // After
   import { Component } from './components/Component';
   ```

2. **Delete Confirmations**: Replace inline delete logic with `DeleteConfirmModal`:
   ```tsx
   // Before
   {showConfirm && <div>/* inline modal */</div>}
   
   // After
   <DeleteConfirmModal
     isOpen={showConfirm}
     title="Delete?"
     text="Are you sure?"
     onConfirm={handleDelete}
     onCancel={() => setShowConfirm(false)}
     isDarkMode={isDarkMode}
   />
   ```

3. **Task Priority**: Update task forms to include priority selection
   ```typescript
   // Priority is now part of TaskFormData
   const taskData: TaskFormData = {
     title: "Task",
     priority: "high",  // NEW: Can specify priority
     // ... other fields
   };
   ```

#### No Data Migration Required
- Existing database records remain valid
- Default values applied automatically for new fields
- No manual migration scripts needed

---

## Development Notes

### Code Quality Improvements (v2.0.0)
- Reduced code duplication through component extraction
- Improved type safety across the entire frontend
- Enhanced maintainability with consistent patterns
- Better separation of concerns

### Performance
- No performance regressions introduced
- Barrel exports may slightly increase initial bundle size but improve tree-shaking

### Known Issues
- ⚠️ No automated tests yet (planned for v2.1.0)
- ⚠️ Chat functionality is basic (real-time updates planned)

---

## Upcoming in v2.1.0 (Planned)

### Testing
- [ ] Backend: pytest with >80% coverage
- [ ] Frontend: Vitest + React Testing Library

### Features
- [ ] Real-time task updates (WebSockets)
- [ ] File attachments for tasks
- [ ] Advanced search and filtering
- [ ] Task templates

### Performance
- [ ] API response caching
- [ ] Optimistic UI updates
- [ ] Lazy loading for pages

---

## Contributors
HD Development Team

## Feedback
For questions or issues, contact the development team.
