# Frontend Documentation

**HD Manager - React TypeScript Frontend**

---

## 📋 Overview

The HD Manager frontend is built with React 19, TypeScript, and Vite, providing a modern, responsive user interface for task and contact management.

---

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.10.1
- **Styling**: TailwindCSS 4.1.18
- **Icons**: Lucide React 0.561.0
- **State Management**: React Context API

---

## 🏗️ Architecture

### Directory Structure

```
frontend/src/
├── api/                    # API client layer
│   ├── apiConfig.ts        # Base configuration
│   ├── tasksApi.ts         # Tasks endpoints
│   ├── usersApi.ts         # Users endpoints
│   ├── tagsApi.ts          # Tags endpoints
│   ├── primaryTagsApi.ts   # Primary tags (NEW v2.1)
│   ├── secondaryTagsApi.ts # Secondary tags (NEW v2.1)
│   ├── contactsApi.ts      # Contacts endpoints
│   ├── chatApi.ts          # Chat endpoints
│   ├── historyApi.ts       # History endpoints
│   ├── authApi.ts          # Auth endpoints (NEW v2.1)
│   └── index.ts            # Barrel export
│
├── components/             # Reusable UI components
│   ├── Layout/             # App layout
│   │   ├── Layout.tsx
│   │   ├── menu-bar/       # Sidebar navigation
│   │   └── header-bar/     # Top header
│   ├── auth/               # Authentication (NEW v2.1)
│   │   ├── ProtectedRoute.tsx
│   │   ├── LoginTransition.tsx
│   │   └── index.ts
│   ├── global-loader/      # Unified loader (NEW v2.1)
│   │   ├── GlobalLoader.tsx
│   │   └── index.ts
│   ├── modal-new-task/     # Task creation modal
│   ├── modal-setting/      # Settings modal
│   ├── delete-confirm-modal/ # Delete confirmation
│   ├── alert-feedback/     # Toast notifications
│   ├── delay-loader/       # Loading indicator (deprecated)
│   └── index.ts            # Barrel export
│
├── contexts/               # React contexts
│   ├── ThemeContext.tsx    # Dark mode state
│   ├── AuthContext.tsx     # Auth state (NEW v2.1)
│   ├── SettingsContext.tsx # App data state
│   ├── ViewStateContext.tsx # View preferences
│   └── index.ts
│
├── pages/                  # Page components
│   ├── home-page/          # Dashboard
│   ├── task-page/          # Kanban board
│   ├── chat-page/          # Team chat
│   ├── login-page/         # Authentication
│   ├── setting-page/       # Settings
│   └── index.ts
│
├── schemas/                # TypeScript types
│   ├── taskTypes.ts
│   ├── userTypes.ts
│   ├── tagTypes.ts
│   ├── contactTypes.ts
│   └── alertTypes.ts
│
├── utils/                  # Utility functions
│   └── ...
│
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

---

## 🎨 Component Organization Pattern

All components follow a consistent structure:

```
component-name/
├── ComponentName.tsx       # Main component
├── index.ts                # Barrel export
└── parts/ (optional)       # Sub-components
    └── SubComponent.tsx
```

**Benefits**:
- Clean imports: `import { Component } from './component-name'`
- Encapsulation: Self-contained modules
- Scalability: Easy to extend
- Consistency: Same pattern everywhere

---

## 🔌 API Layer

### Configuration

**Base URL**: Configured in `api/apiConfig.ts`

```typescript
export const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  tasks: `${API_BASE_URL}/tasks`,
  users: `${API_BASE_URL}/users`,
  tags: `${API_BASE_URL}/tags`,
  contacts: `${API_BASE_URL}/contacts`,
  // ...
};
```

### API Request Wrapper

All API calls use the `apiRequest<T>()` wrapper:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const apiRequest = async <T,>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  // Handles fetch, errors, and response formatting
};
```

### Usage Example

```typescript
import { getAllTasks, createTask } from '../api/tasksApi';

// Get tasks
const response = await getAllTasks({ date: Date.now() });
if (response.success) {
  const tasks = response.data;
}

// Create task
const newTask = await createTask({
  title: "New Task",
  date: Date.now(),
  priority: "high"
});
```

---

## 🎭 State Management

### Context API

The app uses React Context for global state:

#### ThemeContext
```typescript
const { isDarkMode, toggleTheme } = useTheme();
```

#### UserContext
```typescript
const { currentUser, setUser } = useUser();
```

### Local State

Component-level state uses React hooks:
- `useState` - Local component state
- `useEffect` - Side effects
- `useMemo` - Computed values
- `useCallback` - Memoized callbacks

---

## 🎨 Styling

### TailwindCSS

All styling uses TailwindCSS utility classes:

```tsx
<div className={`
  flex items-center gap-4 p-6 rounded-lg
  ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}
`}>
  {/* Content */}
</div>
```

### Dark Mode

Dark mode is handled through TailwindCSS and ThemeContext:

```typescript
// In component
const { isDarkMode } = useTheme();

<div className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
```

### Global Styles

Global styles and TailwindCSS config in `index.css`:

```css
@import "tailwindcss";

/* Custom global styles */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
```

---

## 🧭 Routing

### React Router Setup

Routes defined in `App.tsx`:

```tsx
<Router>
  <Routes>
    {/* Login - standalone */}
    <Route path="/login" element={<LoginPage />} />

    {/* App routes - with Layout */}
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TaskPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/settings" element={<SettingPage />} />
    </Route>
  </Routes>
</Router>
```

### Navigation

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/tasks');
```

---

## 📦 Key Features

### Kanban Board

Drag-and-drop task management:
- Located in `pages/task-page/parts/KanbanBoard.tsx`
- Columns: Pending, In Progress, Completed, Cancelled
- Drag tasks between status columns
- Real-time status updates via API

### Task Management

- Create, update, delete tasks
- Assign to users and contacts
- Set priorities (low/medium/high)
- Add tags and deadlines
- Track history

### Dark Mode

- System-wide theme toggle
- Persistent preference
- Smooth transitions
- Accessible contrast ratios

### Responsive Design

- Mobile-first approach
- Tablet and desktop layouts
- Flexible grid system
- Touch-friendly controls

---

## 🔧 Development

### Setup

```bash
cd frontend
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## 📝 TypeScript Types

### Task Types

```typescript
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  responsibleUsersId: string[];
  participantsIds?: string[];
  tagsId?: string[];
  date: number;
  deadline?: number;
  base?: TaskBase;
}
```

### User Types

```typescript
export interface UserData {
  id: string;
  fullName: string;
  username: string;
  role: 'regular' | 'admin';
  color: string;
  profileImage?: string;
}
```

---

## 🎯 Best Practices

### Component Design
✅ Single responsibility  
✅ Props interface for type safety  
✅ Descriptive names  
✅ Extract reusable logic  

### State Management
✅ Keep state close to where it's used  
✅ Use Context for truly global state  
✅ Memoize expensive computations  
✅ Avoid unnecessary re-renders  

### API Calls
✅ Use the API layer (don't fetch directly)  
✅ Handle loading states  
✅ Handle errors gracefully  
✅ Show user feedback  

### Styling
✅ Use TailwindCSS utilities  
✅ Consistent spacing (p-4, gap-6, etc.)  
✅ Dark mode support  
✅ Responsive breakpoints (sm:, md:, lg:)  

---

## 🐛 Common Issues

### Import Errors
- Ensure you're using barrel exports: `import { Component } from './component'`
- Check path casing (case-sensitive on Linux/Mac)

### API Errors
- Check backend is running on port 5000
- Verify CORS settings
- Check network tab for request/response

### Type Errors
- Run `npm run build` to check TypeScript errors
- Use strict mode for better type safety

---

## 📚 Related Documentation

- [Project Architecture](../wiki/architecture/ARCHITECTURE.md)
- [API Documentation](../wiki/api/API_DOCUMENTATION.md)
- [Backend Documentation](../backend/README.md)

---

## 🚀 Future Enhancements

- [ ] Unit tests (Vitest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Storybook for component documentation
- [ ] Performance optimization (React.memo, lazy loading)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

**Last Updated**: December 22, 2025  
**Maintained by**: HD Development Team
