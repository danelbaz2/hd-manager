/**
 * HistoryContext - Manages task history state
 * Split from SettingsContext for better performance
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getAllTasksHistory, type TaskHistoryEntry } from "../api/tasksApi";
import { useAuth } from "./AuthContext";
import { useSocket } from "../socket";

interface HistoryContextState {
  taskHistory: TaskHistoryEntry[];
  isLoadingHistory: boolean;
  refreshTaskHistory: (silent?: boolean) => Promise<void>;
  addHistoryEntry: (entry: TaskHistoryEntry) => void;
  getHistoryForTask: (taskId: string) => TaskHistoryEntry[];
  getHistoryForDate: (date: number) => TaskHistoryEntry[];
}

const defaultValue: HistoryContextState = {
  taskHistory: [],
  isLoadingHistory: false,
  refreshTaskHistory: async () => {},
  addHistoryEntry: () => {},
  getHistoryForTask: () => [],
  getHistoryForDate: () => [],
};

const HistoryContext = createContext<HistoryContextState>(defaultValue);

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const refreshTaskHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingHistory(true);
    try {
      const response = await getAllTasksHistory();
      if (response.success && response.data) {
        setTaskHistory(response.data);
      } else {
        console.error("Failed to fetch task history:", response.error);
      }
    } catch (error) {
      console.error("Error fetching task history:", error);
    } finally {
      if (!silent) setIsLoadingHistory(false);
    }
  }, []);

  // Add a single history entry (after adding a note) - with deduplication
  const addHistoryEntry = useCallback((entry: TaskHistoryEntry) => {
    setTaskHistory((prev) => {
      // Check if entry already exists to prevent duplicates
      if (prev.some((e) => e.id === entry.id)) return prev;
      return [...prev, entry];
    });
  }, []);

  // Get history entries for a specific task
  const getHistoryForTask = useCallback(
    (taskId: string): TaskHistoryEntry[] => {
      return taskHistory.filter((entry) => entry.taskId === taskId);
    },
    [taskHistory]
  );

  // Get history entries for a specific date (for Activity Feed)
  const getHistoryForDate = useCallback(
    (date: number): TaskHistoryEntry[] => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return taskHistory
        .filter(
          (entry) =>
            entry.timestamp >= dayStart.getTime() &&
            entry.timestamp <= dayEnd.getTime()
        )
        .sort((a, b) => b.timestamp - a.timestamp); // Newest first
    },
    [taskHistory]
  );

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      refreshTaskHistory();
    } else {
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        setTaskHistory([]);
      }
    }
  }, [isAuthenticated, isAuthLoading, refreshTaskHistory]);

  // WebSocket subscription for real-time history updates
  const { subscribeToTasks, isConnected } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToTasks((update: TaskHistoryEntry) => {
      // Add the update to history if it doesn't already exist
      setTaskHistory((prev) => {
        if (prev.some((e) => e.id === update.id)) return prev;
        return [...prev, update].sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToTasks]);

  // Refetch on reconnect
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      refreshTaskHistory(true);
    }
  }, [isConnected, isAuthenticated, refreshTaskHistory]);

  const value: HistoryContextState = {
    taskHistory,
    isLoadingHistory,
    refreshTaskHistory,
    addHistoryEntry,
    getHistoryForTask,
    getHistoryForDate,
  };

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextState => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};

export default HistoryContext;
