import { useMemo, useCallback } from "react";
import { useSettings } from "../../../contexts";
import { useUpdateTaskMutation, invalidateTaskQueries } from "../../../api/queries";
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
  const { tasks, refreshTasks } = useSettings();
  const updateMutation = useUpdateTaskMutation();

  // Filter tasks with pending_approval status
  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "pending_approval");
  }, [tasks]);

  // Approve task - change status to completed
  const approveTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id: taskId, task: { status: "completed" } });
      // Mutation handles invalidation, also trigger context refresh for compatibility
      refreshTasks();
      return true;
    } catch (error) {
      console.error("Failed to approve task:", error);
      return false;
    }
  }, [updateMutation, refreshTasks]);

  // Reject task - change status back to in_progress
  const rejectTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id: taskId, task: { status: "in_progress" } });
      // Mutation handles invalidation, also trigger context refresh for compatibility
      refreshTasks();
      return true;
    } catch (error) {
      console.error("Failed to reject task:", error);
      return false;
    }
  }, [updateMutation, refreshTasks]);

  // Refresh triggers both context and React Query cache
  const handleRefresh = useCallback(() => {
    refreshTasks();
    invalidateTaskQueries();
  }, [refreshTasks]);

  return {
    pendingTasks,
    approveTask,
    rejectTask,
    refreshTasks: handleRefresh,
    isLoading: updateMutation.isPending,
  };
};
