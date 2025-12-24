# HD-Manager Frontend - Development Summary

## Project Overview

A task management system with a modern React frontend using TypeScript, Vite, and TailwindCSS.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                    # API service functions
│   ├── components/             # Reusable UI components
│   │   ├── alert-feedback/     # Toast notifications
│   │   ├── demos/              # Onboarding demos
│   │   ├── file-preview-modal/ # File preview
│   │   ├── layout/             # Layout components (MenuBar, HeaderBar)
│   │   ├── loaders/            # Loading spinners
│   │   ├── modal/              # All modal components
│   │   │   ├── modal-confirm/      # Confirmation dialogs
│   │   │   ├── modal-export-excel/ # Excel export
│   │   │   ├── modal-new-task/     # Create new task
│   │   │   ├── modal-setting/      # Settings (users, tags, contacts)
│   │   │   └── modal-task/         # Task details/edit modal
│   │   └── tags-tooltip/       # Tooltip components
│   ├── contexts/               # React contexts (Theme, Auth, Settings, ViewState)
│   ├── pages/
│   │   ├── home-page/          # Home page with Grid/List/Tags views
│   │   ├── task-page/          # Kanban board page
│   │   ├── archive-page/       # Task archive
│   │   └── LoginPage/          # Authentication
│   └── schemas/                # TypeScript type definitions
```

---

## ✅ Completed Tasks (This Session)

### 1. UserCard Size Control

- Added `size` prop to `UserCard` component with 3 options:
  - `compact` - For admin grid (smaller)
  - `normal` - Default size
  - `large` - For user view (bigger)

### 2. TaskBrief Component Enhancement

- Full height layout with auto scrollbar
- Tasks sorted by: Status → Priority → Date (newest first)
- Each row shows: Priority bar | Index | Title + Tags | Status badge
- Clicking a task opens TaskModal

### 3. AdminUserGrid Improvements

- Responsive grid (2 cols mobile, 3 cols desktop)
- Auto scrollbar only when content overflows
- Removed background for cleaner look
- Bold user names

### 4. UserView Statistics

- Now shows **team-wide** statistics (same as admin view)
- Added `allTasks` prop for team stats calculation

### 5. Home Navigation from Menu

- Clicking "בית" in MenuBar navigates to grid mode + daily view
- Uses React Router state to pass display preferences

### 6. Folder Reorganization

#### Removed Unused Folders:

- `home-page/parts/` - Replaced by `grid-view/` and `list-view/`
- `home-page/utils/` - Unused

#### Renamed Folders:

- `confirm-modal` → `modal-confirm`

#### Moved to `modal/` folder:

- `modal-confirm`
- `modal-export-excel`
- `modal-new-task`
- `modal-setting`
- `modal-task`

### 7. Import Path Fixes

- Fixed all broken imports after folder restructuring
- Updated ~50+ files with correct relative paths
- Created `shared/taskItemUtils.ts` for reusable utilities
- Created `list-view/WeeklyList.tsx` to replace deleted component

---

## 🔧 Key Components

### Home Page Views

| View       | Description                                |
| ---------- | ------------------------------------------ |
| `GridView` | User cards + Activity feed (35%/65% split) |
| `ListView` | Daily/Weekly/Monthly task calendar         |
| `TagsView` | Tasks grouped by tags                      |

### User Views

| Component   | Used By       | Description                                     |
| ----------- | ------------- | ----------------------------------------------- |
| `AdminView` | Admin users   | User grid + Statistics                          |
| `UserView`  | Regular users | Personal card + Banner + TaskBrief + Statistics |

### Statistics

- Shared between Admin and User views
- Shows: Open, In Progress, Closed counts
- Label changes based on view mode (daily/weekly/monthly)

---

## 🎨 Design Decisions

1. **UserCard sizes** - Different sizes for different contexts
2. **TaskBrief** - Horizontal layout with priority indicator bar
3. **Statistics** - Compact design to save vertical space
4. **Modal organization** - All modals in one folder for easier navigation

---

## 📝 Pending Tasks / TODOs

1. **Lint Warning**: `Import` is declared but never read in `MenuItemProfile.tsx`
2. **Type Issue**: Parameter `e` implicitly has `any` type in `TaskModal.tsx` line 80
3. **Type Issue**: `(id: number) => void` vs `(id: string) => void` in `TaskModal.tsx` line 110

---

## 🚀 Running the Project

```bash
# Start frontend dev server
cd frontend
npm run dev

# Start backend
cd backend
python app.py

# Seed database with test data
python seed.py --bulk  # For 5000 tasks
python seed.py         # For normal seeding
```

---

## 📅 Last Updated

December 24, 2024
