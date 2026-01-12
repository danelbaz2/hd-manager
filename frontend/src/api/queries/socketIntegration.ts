/**
 * WebSocket + React Query Integration
 * Provides both invalidation and direct cache update functions
 */
import { queryClient, queryKeys } from "../queryClient";
import { chatKeys } from "./chatQueries";
import type { Task, TaskHistoryEntry } from "../tasksApi";

/**
 * Invalidate task-related queries
 * Call this when receiving task_update socket event
 */
export const invalidateTaskQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
};

/**
 * Directly update React Query cache with WebSocket data
 * More efficient than invalidation - no refetch needed
 */
export const updateReactQueryCache = (action: "CREATE" | "UPDATE" | "DELETE", task: Task) => {
  queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (oldTasks) => {
    if (!oldTasks) return action === "DELETE" ? [] : [task];

    switch (action) {
      case "CREATE":
        // Add new task if not already exists
        if (oldTasks.some(t => t.id === task.id)) return oldTasks;
        return [...oldTasks, task];

      case "UPDATE":
        // Update existing task
        return oldTasks.map(t => t.id === task.id ? { ...t, ...task } : t);

      case "DELETE":
        // Remove task
        return oldTasks.filter(t => t.id !== task.id);

      default:
        return oldTasks;
    }
  });
};

/**
 * Directly update history cache with WebSocket data
 * Adds the new history entry to the cache for real-time activity feed updates
 */
export const updateHistoryCache = (historyEntry: TaskHistoryEntry) => {
  queryClient.setQueryData<TaskHistoryEntry[]>(queryKeys.history.all, (oldHistory) => {
    if (!oldHistory) return [historyEntry];

    // Check if entry already exists (avoid duplicates)
    if (oldHistory.some(h => h.id === historyEntry.id)) return oldHistory;

    // Add new entry at the end (history is typically sorted by timestamp)
    return [...oldHistory, historyEntry];
  });

  // Also update the specific task's history cache if it exists
  queryClient.setQueryData<TaskHistoryEntry[]>(
    queryKeys.history.byTask(historyEntry.taskId),
    (oldHistory) => {
      if (!oldHistory) return undefined; // Don't create if doesn't exist
      if (oldHistory.some(h => h.id === historyEntry.id)) return oldHistory;
      return [...oldHistory, historyEntry];
    }
  );
};

/**
 * Invalidate user-related queries
 * Call this when receiving user_update socket event
 */
export const invalidateUserQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
};

/**
 * Invalidate all tag queries
 * Call this when receiving tag_update socket event
 */
export const invalidateTagQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.primaryTags.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.secondaryTags.all });
};

/**
 * Invalidate contact queries
 * Call this when receiving contact_update socket event
 */
export const invalidateContactQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
};

/**
 * Invalidate chat queries
 * Call this when receiving chat_update socket event
 */
export const invalidateChatQueries = () => {
  queryClient.invalidateQueries({ queryKey: chatKeys.messages });
};

/**
 * Invalidate military hierarchy queries
 * Call this when receiving military_hierarchy_update socket event
 */
export const invalidateMilitaryHierarchyQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.militaryHierarchy.all });
};

/**
 * Invalidate all queries (full refresh)
 * Call this on socket reconnect
 */
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
};

/**
 * Handle WebSocket event and invalidate relevant queries
 * @param eventType The type of socket event received
 */
export const handleSocketEvent = (eventType: string) => {
  switch (eventType) {
    case "task_update":
    case "task_create":
    case "task_delete":
      invalidateTaskQueries();
      break;
    case "user_update":
    case "user_create":
    case "user_delete":
      invalidateUserQueries();
      break;
    case "tag_update":
    case "primary_tag_update":
    case "secondary_tag_update":
      invalidateTagQueries();
      break;
    case "contact_update":
      invalidateContactQueries();
      break;
    case "military_hierarchy_update":
      invalidateMilitaryHierarchyQueries();
      break;
    case "reconnect":
      invalidateAllQueries();
      break;
    default:
      // Unknown event type, do nothing
      break;
  }
};
