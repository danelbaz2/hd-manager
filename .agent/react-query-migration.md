# React Query Migration Plan

## Overview

Migrate from Context-based data fetching to React Query hooks for better caching, deduplication, and fewer API calls.

## Current State

- `SettingsContext` wraps 5 sub-contexts: Users, Tasks, Tags, Contacts, History
- Each context fetches data with `useEffect` + `useState`
- React Query hooks exist but aren't used everywhere

## Migration Strategy

Replace `useSettings()` calls with direct React Query hooks in each file.

---

## Files to Migrate (Priority Order)

### Phase 1: High-Impact Pages

- [ ] `HomePage.tsx` - Main page, uses users, tasks, tags, history
- [ ] `TaskPage.tsx` - Kanban view
- [ ] `ArchivePage.tsx` - Already migrated to useTasksQuery ✅

### Phase 2: Modals

- [ ] `TaskModal.tsx` - Uses users, tags, contacts
- [ ] `NewTaskModal.tsx` - Uses users, tags, contacts
- [ ] `CloseTaskModal.tsx` - Uses users, tasks
- [ ] `ExportModal.tsx` - Uses tasks, tags, users

### Phase 3: Settings/Admin

- [ ] `ManageUser.tsx` - Uses refreshUsers
- [ ] `ManageContact.tsx` - Uses contacts, tags
- [ ] `ManageTagsTwoTier.tsx` - Uses tags

### Phase 4: Helper Components

- [ ] `KanbanTaskCard.tsx` - Uses tags
- [ ] `TaskBrief.tsx` - Uses tags
- [ ] `ActivityFeedBox.tsx` - Uses tasks, users, tags, history
- [ ] Other components...

### Phase 5: Cleanup

- [ ] Remove UsersContext, TasksContext, TagsContext, ContactsContext, HistoryContext
- [ ] Simplify SettingsContext to only provide computed values (if needed)

---

## React Query Hooks Available

| Data           | Hook                        | Status   |
| -------------- | --------------------------- | -------- |
| Users          | `useUsersQuery()`           | ✅ Ready |
| Tasks          | `useTasksQuery()`           | ✅ Ready |
| Primary Tags   | `usePrimaryTagsQuery()`     | ✅ Ready |
| Secondary Tags | `useSecondaryTagsQuery()`   | ✅ Ready |
| Contacts       | `useContactsQuery()`        | ✅ Ready |
| Task History   | `useAllTasksHistoryQuery()` | ✅ Ready |
| Chat           | `useChatMessagesQuery()`    | ✅ Ready |

---

## Notes

- Keep WebSocket integration for real-time updates (invalidate queries on socket events)
- Some components need computed values (e.g., getUserById) - create utility hooks if needed
