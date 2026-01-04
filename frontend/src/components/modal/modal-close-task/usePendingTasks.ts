import { useMemo, useCallback } from "react";
import { useSettings } from "../../../contexts";
import { updateTask } from "../../../api/tasksApi";
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
 */
export const usePendingTasks = (): UsePendingTasksReturn => {
  const { tasks, refreshTasks } = useSettings();

  // Filter tasks with pending_approval status
  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "pending_approval");
  }, [tasks]);

  // Approve task - change status to completed
  const approveTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const response = await updateTask(taskId, { status: "completed" });
      if (response.success) {
        refreshTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to approve task:", error);
      return false;
    }
  }, [refreshTasks]);

  // Reject task - change status back to in_progress
  const rejectTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const response = await updateTask(taskId, { status: "in_progress" });
      if (response.success) {
        refreshTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to reject task:", error);
      return false;
    }
  }, [refreshTasks]);

  return {
    pendingTasks,
    approveTask,
    rejectTask,
    refreshTasks,
    isLoading: false,
  };
};
