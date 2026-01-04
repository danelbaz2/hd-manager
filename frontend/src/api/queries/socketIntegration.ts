/**
 * WebSocket + React Query Integration
 * Automatically invalidates React Query cache when WebSocket events arrive
 */
import { queryClient, queryKeys } from "../queryClient";

/**
 * Invalidate task-related queries
 * Call this when receiving task_update socket event
 */
export const invalidateTaskQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
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
    case "reconnect":
      invalidateAllQueries();
      break;
    default:
      // Unknown event type, do nothing
      break;
  }
};
