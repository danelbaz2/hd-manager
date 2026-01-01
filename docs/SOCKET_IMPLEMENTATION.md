# Socket Implementation Documentation

## Overview

This document describes the WebSocket implementation for the HD-Manager project. The system uses a **Hybrid Activity-Based Connection Pattern** that provides real-time updates while conserving resources during user idle periods.

## Architecture

### Connection Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Socket Connection Lifecycle                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. APP LOAD                                                                │
│     ↓                                                                       │
│  2. SOCKET CONNECTS                                                         │
│     ↓                                                                       │
│  3. ACTIVITY TRACKING STARTS                                                │
│     ├── Mouse move, click, keypress, touch, scroll                         │
│     └── Each activity resets idle timer                                    │
│     ↓                                                                       │
│  4. USER ACTIVE                          5. USER IDLE (5+ minutes)         │
│     │ Socket stays connected                │ Socket disconnects           │
│     │ Real-time updates received            │ No real-time updates         │
│     ↓                                       ↓                              │
│  6. USER RETURNS                                                            │
│     ↓                                                                       │
│  7. ANY ACTIVITY DETECTED → SOCKET RECONNECTS                              │
│     ↓                                                                       │
│  8. BACK TO STEP 3                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │ ←── │   Socket.IO  │ ←── │   Backend    │
│   (React)    │     │   (Server)   │     │   (Flask)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │  User Action       │                    │
       ├───────────────────────────────────────→│
       │                    │    API Request     │
       │                    │                    │
       │                    │←───────────────────┤
       │                    │    Broadcast       │
       │←───────────────────┤    Update          │
       │  Real-time Update  │                    │
       │                    │                    │
```

## Features

### 1. Real-Time CRUD Synchronization

All CRUD operations are automatically synchronized across connected clients:

| Entity | Events Broadcasted                                       |
| ------ | -------------------------------------------------------- |
| Tasks  | CREATE, UPDATE, DELETE, IN_PROGRESS, CLOSE, ASSIGN, NOTE |
| Users  | create, update, delete                                   |
| Chat   | chat_update (triggers refetch)                           |

**Example Flow:**

1. Admin creates a task assigned to User X
2. Backend saves task to database
3. Backend broadcasts `task_update` event with full task data
4. All connected clients receive the update
5. User X sees the new task immediately without refreshing

### 2. Idempotency Protection

The system prevents duplicate API requests through:

- **Idempotency Keys**: Each mutation generates a unique key
- **In-Flight Tracking**: Duplicate requests with same key return cached promise
- **Deduplication Window**: Recently completed requests (5s) return cached result

```typescript
// Usage in frontend
import { safeMutation } from "@/api/socketAwareApi";

const result = await safeMutation("createTask:unique-key", async () => {
  return await createTask(taskData);
});
```

### 3. Socket Connection Guarantee

Before critical operations, the system ensures socket is connected:

```typescript
// Automatic connection check before mutations
const result = await withSocketConnection(async () => {
  return await api.createTask(data);
});
```

## Configuration

### Idle Timeout

Default: **5 minutes** of no user activity

```typescript
// frontend/src/socket/types.ts
export const DEFAULT_SOCKET_CONFIG: SocketConfig = {
  idleTimeoutMs: 5 * 60 * 1000, // 5 minutes
  // ...
};
```

### Activity Events Tracked

- `mousedown`
- `mousemove`
- `keydown`
- `touchstart`
- `scroll`
- `click`

### Reconnection Settings

- **Max Attempts**: 10
- **Base Delay**: 1000ms (exponential backoff, max 5x)

## API Reference

### Frontend Hooks

#### `useSocket()`

Access socket context for connection state and subscriptions.

```typescript
const {
  isConnected, // boolean
  status, // 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
  subscribeToTasks, // (handler) => unsubscribe
  subscribeToUsers, // (handler) => unsubscribe
  subscribeToChat, // (handler) => unsubscribe
  ensureConnected, // () => Promise<boolean>
} = useSocket();
```

#### `useTaskUpdates(callback, options?)`

Subscribe to task updates.

```typescript
useTaskUpdates(
  (entry: TaskHistoryEntry) => {
    console.log("Task updated:", entry);
  },
  { enabled: true }
);
```

#### `useChatUpdates(callback, options?)`

Subscribe to chat updates.

```typescript
useChatUpdates(
  () => {
    refetchMessages();
  },
  { enabled: isActive }
);
```

#### `useUserUpdates(callback, options?)`

Subscribe to user updates.

```typescript
useUserUpdates((event) => {
  console.log("User action:", event.action, event.payload);
});
```

### Backend Broadcast Functions

```python
from websocket import (
    broadcast_task_update,
    broadcast_task_created,
    broadcast_task_deleted,
    broadcast_chat_update,
    broadcast_user_update,
)

# Task update
broadcast_task_update(history_entry_dict)

# User update
broadcast_user_update('create', user_data)
broadcast_user_update('update', user_data)
broadcast_user_update('delete', None, user_id)

# Chat update
broadcast_chat_update(message_data)
```

## File Structure

### Frontend (`frontend/src/socket/`)

```
socket/
├── index.ts              # Main exports
├── types.ts              # TypeScript types and configuration
├── socketManager.ts      # Singleton socket manager
├── SocketProvider.tsx    # React context provider
└── hooks/
    ├── useSocketConnection.ts  # Connection state hook
    ├── useRealtimeSync.ts      # Task/User subscription hooks
    └── useChatSync.ts          # Chat subscription hook
```

### Backend (`backend/websocket/`)

```
websocket/
├── __init__.py           # Module exports
├── manager.py            # Client tracking & user mapping
├── events.py             # Socket event handlers
└── broadcaster.py        # Broadcast utility functions
```

## Event Types

### Task Update Event

```typescript
interface TaskUpdateEvent {
  type: "task_update";
  payload: {
    id: string;
    taskId: string;
    action:
      | "CREATE"
      | "UPDATE"
      | "DELETE"
      | "IN_PROGRESS"
      | "CLOSE"
      | "ASSIGN"
      | "NOTE";
    timestamp: number;
    updatedBy: string;
    changes: Record<string, any>;
    oldValues?: Record<string, any>;
    fullTask?: Task;
    note?: string;
    file?: { name: string; url: string };
  };
}
```

### User Update Event

```typescript
interface UserUpdateEvent {
  type: "user_update";
  action: "create" | "update" | "delete";
  payload: UserData | null;
  userId: string;
}
```

### Chat Update Event

```typescript
interface ChatUpdateEvent {
  type: "chat_update";
  payload: ChatMessage;
}
```

## Error Handling

### Connection Errors

- Connection errors are logged but don't interrupt user flow
- Auto-reconnect attempts use exponential backoff
- After max attempts, socket stays disconnected until user activity

### Broadcast Errors

- Client disconnection during broadcast is silently ignored
- Failed broadcasts don't affect the API response
- All broadcasts are fire-and-forget (no client acknowledgment required)

## User Experience Guarantees

| Scenario                         | Behavior                                            |
| -------------------------------- | --------------------------------------------------- |
| User is active                   | Socket connected, real-time updates received        |
| User goes idle                   | Socket disconnects after 5 minutes, no interruption |
| User returns from idle           | Socket reconnects on any activity, seamless         |
| User performs CRUD while idle    | Socket reconnects first, then operation proceeds    |
| Network error during operation   | Operation retries with same idempotency key         |
| Socket disconnects mid-operation | Operation completes, broadcast may be missed        |

## Security Considerations

- Socket connections respect CORS settings
- JWT authentication is independent of socket connection
- Socket authentication is optional (user-targeted broadcasts)
- All API mutations still require proper authorization

## Debugging

### Enable Debug Logging

```typescript
// Browser console
localStorage.setItem("debug", "socket*");
```

### Backend Logs

Socket events are logged with colored output:

- 🔵 `[SOCKET]` - Connection events
- 🟢 `[BROADCAST]` - Outgoing broadcasts
- 🟡 `[AUTH]` - Authentication events

## Migration from Previous Implementation

The old `SocketContext.tsx` and `websocket_events.py` have been replaced with the new modular system. Key changes:

| Old                   | New                           |
| --------------------- | ----------------------------- |
| `subscribe()`         | `subscribeToTasks()`          |
| `subscribeToUsers()`  | `subscribeToUsers()` (same)   |
| `subscribeToChat()`   | `subscribeToChat()`           |
| Auto-reconnect always | Reconnect on activity only    |
| No idempotency        | Idempotency keys on mutations |

## Best Practices

1. **Use the hooks in components** - Don't access `socketManager` directly
2. **Wrap mutations with `safeMutation`** - Ensures idempotency and connection
3. **Update local state from broadcasts** - Don't refetch after every mutation
4. **Handle the `isConnected` state** - Show indicator if needed
5. **Test with DevTools Network throttling** - Verify reconnection works
