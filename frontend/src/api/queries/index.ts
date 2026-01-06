/**
 * Query Hooks Index
 * Re-exports all query hooks for easy importing
 */

// Task queries
export {
  useTasksQuery,
  useTasksByDateRangeQuery,
  useTaskQuery,
  useAllTasksHistoryQuery,
  useTaskHistoryQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  usePrefetchTasks,
  type Task,
  type TaskFormData,
  type TaskQueryParams,
} from "./taskQueries";

// User queries
export {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type User,
} from "./userQueries";

// Tag queries
export {
  usePrimaryTagsQuery,
  useCreatePrimaryTagMutation,
  useUpdatePrimaryTagMutation,
  useDeletePrimaryTagMutation,
  useSecondaryTagsQuery,
  useCreateSecondaryTagMutation,
  useUpdateSecondaryTagMutation,
  useDeleteSecondaryTagMutation,
  type PrimaryTag,
  type PrimaryTagFormPayload,
  type SecondaryTag,
  type SecondaryTagFormPayload,
} from "./tagQueries";

// Contact queries
export {
  useContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  type Contact,
  type ContactFormPayload,
} from "./contactQueries";

// Chat queries
export {
  useChatMessagesQuery,
  useCreateChatMessageMutation,
  chatKeys,
  type ChatMessage,
  type ChatMessageFormData,
} from "./chatQueries";

// Socket integration
export {
  invalidateTaskQueries,
  invalidateUserQueries,
  invalidateTagQueries,
  invalidateContactQueries,
  invalidateChatQueries,
  invalidateAllQueries,
  handleSocketEvent,
  updateReactQueryCache,
  updateHistoryCache,
} from "./socketIntegration";

// Query client and keys
export { queryClient, queryKeys } from "../queryClient";
