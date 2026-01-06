# Task 6.1 - Architecture & Performance Improvements

This document outlines recommended actions for better architecture and performance based on the current state of the HD Manager project.

---

## High Priority

### 1. Remove Redundant Context Providers

**Current State**: The app has both React Query hooks AND old context providers doing similar data fetching.

**Impact**: Duplicate API calls, unnecessary re-renders, confusing code.

**Action**:

- Simplify `SettingsProvider` to only wrap `ChatProvider`
- Remove data-fetching logic from:
  - `contexts/UsersContext.tsx`
  - `contexts/TasksContext.tsx`
  - `contexts/TagsContext.tsx`
  - `contexts/ContactsContext.tsx`
  - `contexts/HistoryContext.tsx`
- Keep these contexts only if they have non-data state (none currently do)

**Estimated Effort**: 2-3 hours

---

### 2. Implement Virtual Scrolling for Large Lists

**Current State**: Task lists render all items at once (can be slow with 20,000 tasks).

**Impact**: Slow rendering, high memory usage, janky scrolling.

**Action**:

- Install `@tanstack/react-virtual` or `react-window`
- Implement virtual scrolling for:
  - `ListTaskArchive` (Archive page)
  - `DailyList`, `WeeklyList` (Home page)
  - `UpdatesTask` (Activity feed)
- Only render visible items + buffer

**Estimated Effort**: 4-6 hours

---

### 3. Optimize React Query Caching Strategy

**Current State**: Tasks are fetched as a single large array.

**Impact**: Any task update invalidates entire cache, causing full refetch.

**Action**:

- Implement pagination for task list queries
- Use `staleTime` appropriately for different data types:
  - Users: 5 minutes (changes rarely)
  - Tags: 5 minutes (changes rarely)
  - Tasks: 30 seconds (changes frequently)
  - History: 1 minute
- Consider infinite query for history with cursor-based pagination

**Estimated Effort**: 3-4 hours

---

## Medium Priority

### 4. Lazy Load Modal Components

**Current State**: All modals are imported at app startup.

**Impact**: Larger initial bundle size, slower first paint.

**Action**:

- Use `React.lazy()` for modal components:
  - `TaskModal`
  - `NewTaskModal`
  - `CloseTaskModal`
  - `ExportModal`
  - `SettingModal`
- Wrap with `Suspense` with loading fallback

**Estimated Effort**: 1-2 hours

---

### 5. Memoize Expensive Computations

**Current State**: `mapUsersToUserData`, `mapPrimaryTagsToData` called on every render.

**Impact**: Unnecessary object allocations, potential performance issues.

**Action**:

- Already using `useMemo` in most places ✅
- Audit for missing memoization in:
  - `UpdateContent.tsx`
  - `KanbanTaskCard.tsx`
  - `TagAccordion.tsx`
- Consider `React.memo` for list item components

**Estimated Effort**: 2 hours

---

### 6. Optimize WebSocket Event Handling

**Current State**: Multiple components subscribe to same WebSocket events.

**Impact**: Duplicate event handlers, potential race conditions.

**Action**:

- Centralize all WebSocket → React Query cache updates in `RealtimeSyncProvider`
- Remove duplicate subscriptions from old context providers
- Add debouncing for rapid-fire updates (e.g., drag-drop status changes)

**Estimated Effort**: 2-3 hours

---

### 7. Add Error Boundaries

**Current State**: No error boundaries in the app.

**Impact**: One component error crashes entire app.

**Action**:

- Create `ErrorBoundary` component
- Wrap major sections:
  - Each route/page
  - Modal content areas
  - ActivityFeedBox
- Add fallback UI with "Retry" button

**Estimated Effort**: 2 hours

---

## Low Priority (Future)

### 8. Code Splitting by Route

**Current State**: Single bundle for entire app.

**Impact**: Users download code for pages they may never visit.

**Action**:

- Use `React.lazy()` for page components
- Split chunks by route:
  - Home page
  - Task page (Kanban)
  - Archive page
  - Login page
- Configure Vite for optimal chunking

**Estimated Effort**: 2-3 hours

---

### 9. Implement Service Worker for Offline Support

**Current State**: App requires constant connection.

**Impact**: No offline access, no background sync.

**Action**:

- Add Vite PWA plugin
- Cache static assets
- Cache API responses with stale-while-revalidate
- Queue mutations when offline

**Estimated Effort**: 6-8 hours

---

### 10. Add Performance Monitoring

**Current State**: No visibility into production performance.

**Impact**: Can't identify slow components or API calls.

**Action**:

- Add Web Vitals tracking (LCP, FID, CLS)
- Track React Query performance metrics
- Consider Sentry for error tracking
- Use React DevTools Profiler for development

**Estimated Effort**: 3-4 hours

---

## Backend Optimizations

### 11. Add Database Indexes

**Current State**: May be missing indexes for common queries.

**Action**:

- Ensure indexes on:
  - `ents.base.entityType` (composite with date)
  - `ents_archive.taskId + timestamp`
  - `users.username`
  - `ents.responsibleUserIds`
- Use MongoDB explain to identify slow queries

**Estimated Effort**: 1-2 hours

---

### 12. Implement Task Pagination API

**Current State**: `/api/tasks/` returns all tasks.

**Impact**: Slow with 20,000+ tasks.

**Action**:

- Add pagination parameters: `limit`, `offset` or cursor
- Return total count in response
- Frontend uses infinite scroll

**Estimated Effort**: 3-4 hours

---

### 13. Add Response Compression

**Current State**: Responses may not be compressed.

**Action**:

- Enable gzip/brotli compression in Flask
- Or use nginx in front of backend for compression
- Significant savings for large JSON responses

**Estimated Effort**: 1 hour

---

## Quick Wins (< 1 hour each)

| Task                                          | Description                     |
| --------------------------------------------- | ------------------------------- |
| ✅ Remove `notification-team` folder          | Unused code - DONE              |
| ✅ Fix team message unread indicator          | Cross-page notification - DONE  |
| Add `loading="lazy"` to images                | Profile images, file thumbnails |
| Remove console.log statements                 | Clean production logs           |
| Set React Query `refetchOnWindowFocus: false` | Reduce unnecessary refetches    |

---

## Summary

| Priority   | Tasks   | Total Effort |
| ---------- | ------- | ------------ |
| High       | 3 tasks | 9-13 hours   |
| Medium     | 4 tasks | 7-10 hours   |
| Low        | 3 tasks | 11-15 hours  |
| Backend    | 3 tasks | 5-7 hours    |
| Quick Wins | 5 tasks | 3-5 hours    |

**Recommended Order**:

1. Quick Wins (immediate impact)
2. Remove Redundant Contexts (simplify codebase)
3. Virtual Scrolling (performance with large data)
4. Lazy Load Modals (bundle size)
5. Rest as time permits

---

_Last Updated: 2026-01-06_
