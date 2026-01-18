/**
 * Task Query Hooks
 * TanStack Query hooks for task data management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
  type Task,
  type TaskFormData,
  type TaskQueryParams,
  type TaskHistoryEntry,
} from "./tasks.api";
import { queryKeys, queryClient as globalQueryClient } from "@api/queryClient";
import { useAuth } from "@features/auth";

/**
 * Hook to fetch all tasks
 */
export const useTasksQuery = (params?: TaskQueryParams) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: params ? [...queryKeys.tasks.all, params] : queryKeys.tasks.all,
    queryFn: async () => {
      const response = await getAllTasks(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch tasks");
    },
    enabled: !!isAuthenticated,
  });
};

/**
 * Hook to fetch tasks by date range
 */
export const useTasksByDateRangeQuery = (startDate: number, endDate: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.byDateRange(startDate, endDate),
    queryFn: async () => {
      const response = await getAllTasks({ startDate, endDate });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch tasks");
    },
    enabled: !!isAuthenticated && !!startDate && !!endDate,
  });
};

/**
 * Hook to fetch a single task by ID
 */
export const useTaskQuery = (taskId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.single(taskId),
    queryFn: async () => {
      const response = await getTaskById(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task");
    },
    enabled: !!isAuthenticated && !!taskId,
  });
};

/**
 * Hook to fetch all task history
 */
export const useAllTasksHistoryQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["tasks", "history", "all"],
    queryFn: async () => {
      const response = await getAllTasksHistory();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task history");
    },
    enabled: !!isAuthenticated,
  });
};

/**
 * Hook to fetch task history for a specific task
 */
export const useTaskHistoryQuery = (taskId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.history(taskId),
    queryFn: async () => {
      const response = await getTaskHistory(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task history");
    },
    enabled: !!isAuthenticated && !!taskId,
  });
};

/**
 * Hook for creating a task
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskFormData) => {
      const response = await createTask(task);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create task");
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (oldTasks) => {
        if (!oldTasks) return [newTask];
        if (oldTasks.some(t => t.id === newTask.id)) return oldTasks;
        return [...oldTasks, newTask];
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", "history", "all"] });
    },
  });
};

/**
 * Hook for updating a task
 */
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, task }: { id: string; task: Partial<TaskFormData> }) => {
      const response = await updateTask(id, task);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update task");
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      if (updatedTask?.id) {
        queryClient.setQueryData(queryKeys.tasks.single(updatedTask.id), updatedTask);
      }
    },
  });
};

/**
 * Hook for deleting a task
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteTask(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || "Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

/**
 * Hook for adding a note to a task
 */
export const useAddNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const response = await addTaskNote(taskId, content);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to add note");
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.history(taskId) });
      queryClient.invalidateQueries({ queryKey: ["tasks", "history", "all"] });
    },
  });
};

/**
 * Hook for closing a task
 */
export const useCloseTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await closeTask(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to close task");
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      if (updatedTask?.id) {
        queryClient.setQueryData(queryKeys.tasks.single(updatedTask.id), updatedTask);
      }
    },
  });
};

/**
 * Hook for reopening a task
 */
export const useReopenTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await reopenTask(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to reopen task");
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      if (updatedTask?.id) {
        queryClient.setQueryData(queryKeys.tasks.single(updatedTask.id), updatedTask);
      }
    },
  });
};

/**
 * Hook for starting task progress
 */
export const useStartProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await startTaskProgress(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to start task progress");
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      if (updatedTask?.id) {
        queryClient.setQueryData(queryKeys.tasks.single(updatedTask.id), updatedTask);
      }
    },
  });
};

// ============== Cache Update Functions ==============

/**
 * Directly update React Query cache with WebSocket data
 */
export const updateReactQueryCache = (action: "CREATE" | "UPDATE" | "DELETE", task: Task) => {
  globalQueryClient.setQueryData<Task[]>(queryKeys.tasks.all, (oldTasks: Task[] | undefined) => {
    if (!oldTasks) return action === "DELETE" ? [] : [task];

    switch (action) {
      case "CREATE":
        if (oldTasks.some((t: Task) => t.id === task.id)) return oldTasks;
        return [...oldTasks, task];

      case "UPDATE":
        return oldTasks.map((t: Task) => t.id === task.id ? { ...t, ...task } : t);

      case "DELETE":
        return oldTasks.filter((t: Task) => t.id !== task.id);

      default:
        return oldTasks;
    }
  });
};

/**
 * Directly update history cache with WebSocket data
 */
export const updateHistoryCache = (historyEntry: TaskHistoryEntry) => {
  globalQueryClient.setQueryData<TaskHistoryEntry[]>(queryKeys.history.all, (oldHistory: TaskHistoryEntry[] | undefined) => {
    if (!oldHistory) return [historyEntry];
    if (oldHistory.some((h: TaskHistoryEntry) => h.id === historyEntry.id)) return oldHistory;
    return [...oldHistory, historyEntry];
  });

  globalQueryClient.setQueryData<TaskHistoryEntry[]>(
    queryKeys.history.byTask(historyEntry.taskId),
    (oldHistory: TaskHistoryEntry[] | undefined) => {
      if (!oldHistory) return undefined;
      if (oldHistory.some((h: TaskHistoryEntry) => h.id === historyEntry.id)) return oldHistory;
      return [...oldHistory, historyEntry];
    }
  );
};

// Re-export types
export type { Task, TaskFormData, TaskQueryParams, TaskHistoryEntry };
