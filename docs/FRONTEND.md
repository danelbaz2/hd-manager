# Frontend Documentation

React + TypeScript single-page application built with Vite.

---

## 📁 Structure

```
frontend/src/
├── App.tsx            # Root component with routing
├── main.tsx           # Entry point
├── index.css          # Global styles
├── api/               # API client functions
├── auth/              # Auth components & guards
├── components/        # Reusable UI components
├── contexts/          # React contexts (state management)
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── schemas/           # Zod validation schemas
├── socket/            # WebSocket client
└── utils/             # Helper utilities
```

---

## 📄 Pages

| Page     | Path        | Description              |
| -------- | ----------- | ------------------------ |
| Home     | `/`         | Main dashboard with tabs |
| Login    | `/login`    | User authentication      |
| Task     | `/task/:id` | Task detail view         |
| Archive  | `/archive`  | Archived tasks           |
| Settings | `/settings` | App settings             |

---

## 🧩 Key Components

### Layout

- `Header` - App header with navigation
- `Sidebar` - Navigation menu
- `TabSystem` - Tab-based content switching

### Tasks

- `TaskTable` - Task list with sorting/filtering
- `TaskForm` - Create/edit task form
- `TaskDetail` - Task detail view

### Users & Contacts

- `UserManagement` - User CRUD interface
- `ContactList` - Contact management
- `TagSelector` - Tag picker component

### Shared

- `Modal` - Reusable modal dialogs
- `Toast` - Notification system
- `LoadingSpinner` - Loading states

---

## 🗃️ Contexts (State Management)

| Context          | Purpose                        |
| ---------------- | ------------------------------ |
| `AuthContext`    | User auth state & login/logout |
| `TaskContext`    | Tasks data & operations        |
| `UserContext`    | Users list & current user      |
| `ContactContext` | Contacts data                  |
| `SocketContext`  | WebSocket connection           |
| `ToastContext`   | Notification management        |

---

## 🔌 Real-time Updates

The `socket/` module handles WebSocket connections:

```
socket/
├── socketManager.ts    # Connection management
├── useSocket.ts        # React hook for socket
└── handlers/           # Event handlers
```

Updates are received and automatically reflected in the UI without page refresh.

---

## 🚀 Running

```bash
cd frontend
npm install
npm run dev
```

Dev server at `http://localhost:5173`

### Build for Production

```bash
npm run build   # Output in dist/
```
