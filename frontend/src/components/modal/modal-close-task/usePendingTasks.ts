import { useMemo, useCallback } from "react";
import { useTasksQuery, useUpdateTaskMutation, invalidateTaskQueries } from "../../../api/queries";
import type { Task } from "../../../api/tasksApi";

interface UsePendingTasksReturn {
  pendingTasks: Task[];
  approveTask: (taskId: string) => Promise<boolean>;
  rejectTask: (taskId: string) => Promise<boolean>;
  refreshTasks: () => void;
  isLoading: boolean;
}

/**
 * usePendingTasks - Hook to manage tasks pending approval
 * Uses React Query mutation for updates while reading from SettingsContext
 */
export const usePendingTasks = (): UsePendingTasksReturn => {
  const { data: tasks = [] } = useTasksQuery();
  const updateMutation = useUpdateTaskMutation();

  // Filter tasks with pending_approval status
  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "pending_approval");
  }, [tasks]);

  // Approve task - change status to completed
  const approveTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id: taskId, task: { status: "completed" } });
      // Mutation's onSuccess handles cache invalidation
      return true;
    } catch (error) {
      console.error("Failed to approve task:", error);
      return false;
    }
  }, [updateMutation]);

  // Reject task - change status back to in_progress
  const rejectTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id: taskId, task: { status: "in_progress" } });
      // Mutation's onSuccess handles cache invalidation
      return true;
    } catch (error) {
      console.error("Failed to reject task:", error);
      return false;
    }
  }, [updateMutation]);

  // Refresh triggers React Query cache invalidation
  const handleRefresh = useCallback(() => {
    invalidateTaskQueries();
  }, []);

  return {
    pendingTasks,
    approveTask,
    rejectTask,
    refreshTasks: handleRefresh,
    isLoading: updateMutation.isPending,
  };
};
