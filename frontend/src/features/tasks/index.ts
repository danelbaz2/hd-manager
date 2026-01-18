/**
 * Tasks Feature - Domain module for task management
 * 
 * Export all task-related functionality from this index file
 */

// Context
export { TasksProvider, useTasks } from './context/tasks.context';

// Types
export type {
  TaskPriority,
  TaskStatus,
  TaskOptionals,
  TaskData,
  TaskFormData,
} from './types/task.types';

export {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  DEFAULT_TASK_FORM,
} from './types/task.types';

// API
export {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory,
  getAllTasksHistory,
  addTaskNote,
  closeTask,
  reopenTask,
  startTaskProgress,
  submitTaskForApproval,
  approveTask,
  rejectTask,
} from './api/tasks.api';

export type {
  Task,
  TaskBase,
  TaskHistoryEntry,
  TaskQueryParams,
} from './api/tasks.api';

// Queries
export {
  useTasksQuery,
  useTaskQuery,
  useTasksByDateRangeQuery,
  useAllTasksHistoryQuery,
  useTaskHistoryQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddNoteMutation,
  useCloseTaskMutation,
  useReopenTaskMutation,
  useStartProgressMutation,
  updateReactQueryCache,
  updateHistoryCache,
} from './api/tasks.queries';
