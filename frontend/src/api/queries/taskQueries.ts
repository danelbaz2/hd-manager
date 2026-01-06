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
  type Task,
  type TaskFormData,
  type TaskQueryParams,
} from "../tasksApi";
import { queryKeys } from "../queryClient";

/**
 * Hook to fetch all tasks
 */
export const useTasksQuery = (params?: TaskQueryParams) => {
  return useQuery({
    queryKey: params ? [...queryKeys.tasks.all, params] : queryKeys.tasks.all,
    queryFn: async () => {
      const response = await getAllTasks(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch tasks");
    },
  });
};

/**
 * Hook to fetch tasks by date range (uses params)
 */
export const useTasksByDateRangeQuery = (startDate: number, endDate: number) => {
  return useQuery({
    queryKey: queryKeys.tasks.byDateRange(startDate, endDate),
    queryFn: async () => {
      const response = await getAllTasks({ startDate, endDate });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch tasks");
    },
    enabled: !!startDate && !!endDate,
  });
};

/**
 * Hook to fetch a single task by ID
 */
export const useTaskQuery = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.single(taskId),
    queryFn: async () => {
      const response = await getTaskById(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task");
    },
    enabled: !!taskId,
  });
};

/**
 * Hook to fetch all task history
 */
export const useAllTasksHistoryQuery = () => {
  return useQuery({
    queryKey: ["tasks", "history", "all"],
    queryFn: async () => {
      const response = await getAllTasksHistory();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task history");
    },
  });
};

/**
 * Hook to fetch task history for a specific task
 */
export const useTaskHistoryQuery = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.history(taskId),
    queryFn: async () => {
      const response = await getTaskHistory(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch task history");
    },
    enabled: !!taskId,
  });
};

/**
 * Hook for creating a task
 * Uses direct cache update instead of invalidation for better performance
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
      // Direct cache update: add new task to existing cache instead of refetching
      queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (oldTasks) => {
        if (!oldTasks) return [newTask];
        // Check if task already exists (defensive)
        if (oldTasks.some(t => t.id === newTask.id)) return oldTasks;
        return [...oldTasks, newTask];
      });
      // Also invalidate history since a CREATE action was logged
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
      // Invalidate task lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      // Update single task cache if exists
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
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

/**
 * Helper hook to prefetch tasks
 */
export const usePrefetchTasks = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tasks.all,
      queryFn: async () => {
        const response = await getAllTasks();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "Failed to fetch tasks");
      },
    });
  };
};

// Re-export types for convenience
export type { Task, TaskFormData, TaskQueryParams };
