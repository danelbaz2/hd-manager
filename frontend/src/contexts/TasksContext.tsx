/**
 * TasksContext - Manages tasks state
 * Split from SettingsContext for better performance
 * 
 * Also tracks the latest task update timestamp for unread notification purposes
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getAllTasks, type Task, type TaskHistoryEntry } from "../api/tasksApi";
import { useAuth } from "./AuthContext";
import { useSocket } from "../socket";
import { updateReactQueryCache, updateHistoryCache } from "../api/queries";
import {
  getLastSyncTimestamp,
  updateLastSyncTimestamp,
  shouldDoFullSync,
  mergeItems,
} from "../utils/deltaSync";
import { setUserTimestamp } from "../utils/activityFeedStorage";

interface TasksContextState {
  tasks: Task[];
  isLoadingTasks: boolean;
  refreshTasks: (silent?: boolean, useDelta?: boolean) => Promise<void>;
}

const defaultValue: TasksContextState = {
  tasks: [],
  isLoadingTasks: false,
  refreshTasks: async () => { },
};

const TasksContext = createContext<TasksContextState>(defaultValue);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Fetch tasks - supports both full fetch and delta sync
  const refreshTasks = useCallback(async (silent = false, useDelta = false) => {
    if (!silent) setIsLoadingTasks(true);
    try {
      // Determine if we should use delta sync
      const lastSync = getLastSyncTimestamp();
      const shouldDelta = useDelta && lastSync && !shouldDoFullSync();

      const response = await getAllTasks(
        shouldDelta ? { since: lastSync } : undefined
      );

      if (response.success && response.data) {
        if (shouldDelta && response.data.length > 0) {
          // Delta sync: merge updated tasks with existing
          setTasks((prev) => mergeItems(prev, response.data!));
          console.log(
            `[DeltaSync] Merged ${response.data.length} updated tasks`
          );
        } else if (!shouldDelta) {
          // Full sync: replace all tasks
          setTasks(response.data);
        }
        // Update sync timestamp on successful fetch
        updateLastSyncTimestamp();
      } else {
        console.error("Failed to fetch tasks:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      if (!silent) setIsLoadingTasks(false);
    }
  }, []);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      refreshTasks();
    } else {
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        setTasks([]);
      }
    }
  }, [isAuthenticated, isAuthLoading, refreshTasks]);

  // WebSocket subscription for real-time task updates
  const { subscribeToTasks, isConnected } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToTasks((update: TaskHistoryEntry) => {
      const { action, taskId, fullTask } = update;

      // Update Context state (for backward compatibility)
      if (action === "CREATE" && fullTask) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === fullTask.id)) return prev;
          return [...prev, fullTask as Task];
        });
        // Also update React Query cache directly (no refetch needed)
        updateReactQueryCache("CREATE", fullTask as Task);
      } else if (action === "DELETE") {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        updateReactQueryCache("DELETE", { id: taskId } as Task);
      } else if (
        [
          "UPDATE",
          "IN_PROGRESS",
          "CLOSE",
          "ASSIGN",
          "PENDING_APPROVAL",
          "APPROVE",
          "REJECT",
          "UPDATE_OPTIONALS",
          "UPDATE_EXTERNAL_SYSTEM",
        ].includes(action) &&
        fullTask
      ) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, ...(fullTask as Task) } : t
          )
        );
        updateReactQueryCache("UPDATE", fullTask as Task);
      }

      // Update the latest task update timestamp BEFORE updating history cache
      // This ensures the unread indicator will show up when returning to home page
      if (user?.id) {
        setUserTimestamp(user.id, "latest_task_update", Date.now());
      }

      // Always update history cache for real-time activity feed updates
      updateHistoryCache(update);
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToTasks]);

  // Delta sync on reconnect
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      const lastSync = getLastSyncTimestamp();
      if (lastSync && !shouldDoFullSync()) {
        console.log(`[TasksContext] Socket reconnected, using delta sync...`);
        refreshTasks(true, true); // Silent + delta mode
      } else {
        refreshTasks(true);
      }
    }
  }, [isConnected, isAuthenticated, refreshTasks]);

  const value: TasksContextState = {
    tasks,
    isLoadingTasks,
    refreshTasks,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextState => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};


export default TasksContext;
