# React Query Migration Plan

## Overview

Migrate from Context-based data fetching to React Query hooks for better caching, deduplication, and fewer API calls.

## Current State

- `SettingsContext` wraps 5 sub-contexts: Users, Tasks, Tags, Contacts, History
- Each context fetches data with `useEffect` + `useState`
- React Query hooks exist and are now being adopted

## Migration Strategy

Replace `useSettings()` calls with direct React Query hooks in each file.

---

## Files to Migrate (Priority Order)

### Phase 1: High-Impact Pages

- [x] `HomePage.tsx` - Migrated to React Query hooks ✅
- [x] `TaskPage.tsx` - Migrated to React Query hooks ✅
- [x] `ArchivePage.tsx` - Already migrated ✅

### Phase 2: Modals

- [x] `NewTaskModal.tsx` - Migrated ✅
- [x] `TaskModal.tsx` - Migrated ✅
- [x] `useTaskForm.ts` - Updated to use invalidateTaskQueries ✅
- [x] `useTaskDelete.ts` - Updated to use invalidateTaskQueries ✅
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

## Type Mappers (NEW)

Created `api/typeMappers.ts` to convert API types to frontend schema types:
- `mapUsersToUserData()` - Converts `User[]` to `UserData[]`
- `mapPrimaryTagsToData()` - Converts `PrimaryTag[]` to `PrimaryTagData[]`
- `mapSecondaryTagsToData()` - Converts `SecondaryTag[]` to `SecondaryTagData[]`

---

## Future: Optimistic Update Candidates

The following actions would benefit from optimistic updates for instant UI feedback:

| Action | Location | Benefit |
|--------|----------|---------|
| **Task status change (drag & drop)** | `TaskPage.tsx` Kanban | Instant column movement |
| **Task priority toggle** | Task modals/cards | Instant visual change |
| **Mark task complete** | List views | Instant strikethrough |
| **Add note to task** | `TaskModal.tsx` | Instant note appearance |

Implementation approach for future:
```typescript
// Example: Optimistic status update
const updateMutation = useUpdateTaskMutation({
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['tasks'] });
    const previous = queryClient.getQueryData(['tasks']);
    queryClient.setQueryData(['tasks'], (old) => 
      old.map(t => t.id === newData.id ? { ...t, ...newData.task } : t)
    );
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['tasks'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

---

## Notes

- Keep WebSocket integration for real-time updates (invalidate queries on socket events)
- `useSettings()` still works for backward compatibility during migration
- Type mappers handle API → Schema type conversions

