import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getAllUsers, type User } from "../api/usersApi";
import { getAllPrimaryTags, type PrimaryTag } from "../api/primaryTagsApi";
import { getAllSecondaryTags } from "../api/secondaryTagsApi";
import { getAllContacts, type Contact } from "../api/contactsApi";
import {
  getAllTasks,
  getAllTasksHistory,
  type Task,
  type TaskHistoryEntry,
} from "../api/tasksApi";
import { type UserData } from "../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
  getLighterColor,
  TAG_COLORS,
} from "../schemas/tagTypes";
import { type ContactData } from "../schemas/contactTypes";
import { useAuth } from "./AuthContext";
import { useSocket } from "../socket";
import { invalidateTaskQueries, invalidateUserQueries } from "../api/queries";
import {
  getLastSyncTimestamp,
  updateLastSyncTimestamp,
  shouldDoFullSync,
  mergeItems,
} from "../utils/deltaSync";

// Helper function to convert API User to UserData
const mapUserToUserData = (user: User): UserData => ({
  id: user.id,
  fullName: user.fullName,
  username: user.username,
  role: user.role as "admin" | "regular",
  color: user.color,
  profileImage: user.profileImage,
  nickname: user.nickname,
});

// Helper function to convert API PrimaryTag to PrimaryTagData
const mapPrimaryTagToData = (tag: PrimaryTag): PrimaryTagData => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  description: tag.description || undefined,
});

// Helper function to convert API Contact to ContactData
const mapContactToContactData = (contact: Contact): ContactData => ({
  id: contact.id,
  name: contact.fullName,
  role: contact.position || "",
  phone: contact.phoneNumber || "",
  primaryTags: contact.primaryTagIds || [],
});

// Context State Interface
interface SettingsContextState {
  // Data
  users: UserData[];
  primaryTags: PrimaryTagData[]; // Two-tier tag system
  secondaryTags: SecondaryTagData[]; // Two-tier tag system
  contacts: ContactData[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[]; // All task history

  // Loading states
  isLoading: boolean;
  isLoadingUsers: boolean;
  isLoadingTags: boolean;
  isLoadingContacts: boolean;
  isLoadingTasks: boolean;
  isLoadingHistory: boolean;

  // Refresh functions
  refreshUsers: (silent?: boolean) => Promise<void>;
  refreshTags: (silent?: boolean) => Promise<void>;
  refreshContacts: (silent?: boolean) => Promise<void>;
  refreshTasks: (silent?: boolean) => Promise<void>;
  refreshTaskHistory: (silent?: boolean) => Promise<void>;
  refreshAll: (silent?: boolean) => Promise<void>;

  // History helpers
  addHistoryEntry: (entry: TaskHistoryEntry) => void;
  getHistoryForTask: (taskId: string) => TaskHistoryEntry[];
  getHistoryForDate: (date: number) => TaskHistoryEntry[];
}

// Default context value
const defaultContextValue: SettingsContextState = {
  users: [],
  primaryTags: [],
  secondaryTags: [],
  contacts: [],
  tasks: [],
  taskHistory: [],
  isLoading: true,
  isLoadingUsers: false,
  isLoadingTags: false,
  isLoadingContacts: false,
  isLoadingTasks: false,
  isLoadingHistory: false,
  refreshUsers: async () => {},
  refreshTags: async () => {},
  refreshContacts: async () => {},
  refreshTasks: async () => {},
  refreshTaskHistory: async () => {},
  refreshAll: async () => {},
  addHistoryEntry: () => {},
  getHistoryForTask: () => [],
  getHistoryForDate: () => [],
};

// Create Context
const SettingsContext =
  createContext<SettingsContextState>(defaultContextValue);

// Provider Props
interface SettingsProviderProps {
  children: ReactNode;
}

// Provider Component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [primaryTags, setPrimaryTags] = useState<PrimaryTagData[]>([]);
  const [secondaryTags, setSecondaryTags] = useState<SecondaryTagData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch users
  // Fetch users
  const refreshUsers = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingUsers(true);
    try {
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data.map(mapUserToUserData));
      } else {
        console.error("Failed to fetch users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      if (!silent) setIsLoadingUsers(false);
    }
  }, []);

  // Fetch tags (two-tier system: primary + secondary)
  // Fetch tags (two-tier system: primary + secondary)
  const refreshTags = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingTags(true);
    try {
      const [primaryResponse, secondaryResponse] = await Promise.all([
        getAllPrimaryTags(),
        getAllSecondaryTags(),
      ]);

      if (primaryResponse.success && primaryResponse.data) {
        setPrimaryTags(primaryResponse.data.map(mapPrimaryTagToData));
      } else {
        console.error("Failed to fetch primary tags:", primaryResponse.error);
      }

      if (
        secondaryResponse.success &&
        secondaryResponse.data &&
        primaryResponse.data
      ) {
        // Map secondary tags with computed colors from parent primary tag
        const primaryTagsMap = new Map(
          primaryResponse.data.map((pt) => [pt.id, pt])
        );
        const mappedSecondaryTags = secondaryResponse.data.map(
          (tag): SecondaryTagData => {
            const parentTag = primaryTagsMap.get(tag.primaryTagId);
            return {
              id: tag.id,
              name: tag.name,
              primaryTagId: tag.primaryTagId,
              color: parentTag
                ? getLighterColor(parentTag.color)
                : TAG_COLORS[0].bg,
              description: tag.description || undefined,
            };
          }
        );
        setSecondaryTags(mappedSecondaryTags);
      } else if (secondaryResponse.error) {
        console.error(
          "Failed to fetch secondary tags:",
          secondaryResponse.error
        );
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      if (!silent) setIsLoadingTags(false);
    }
  }, []);

  // Fetch contacts
  // Fetch contacts
  const refreshContacts = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingContacts(true);
    try {
      const response = await getAllContacts();
      if (response.success && response.data) {
        setContacts(response.data.map(mapContactToContactData));
      } else {
        console.error("Failed to fetch contacts:", response.error);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      if (!silent) setIsLoadingContacts(false);
    }
  }, []);

  // Fetch tasks - supports both full fetch and delta sync
  // @param silent - don't show loading indicator
  // @param useDelta - if true, only fetch tasks modified since last sync
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

  // Fetch all task history - for global access
  // Fetch all task history - for global access
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

  // Fetch all data
  const refreshAll = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      await Promise.all([
        refreshUsers(silent),
        refreshTags(silent),
        refreshContacts(silent),
        refreshTasks(silent),
        refreshTaskHistory(silent),
      ]);
      if (!silent) setIsLoading(false);
    },
    [
      refreshUsers,
      refreshTags,
      refreshContacts,
      refreshTasks,
      refreshTaskHistory,
    ]
  );

  // Clear all data (used on logout)
  const clearAllData = useCallback(() => {
    setUsers([]);
    setPrimaryTags([]);
    setSecondaryTags([]);
    setContacts([]);
    setTasks([]);
    setTaskHistory([]);
    setIsLoading(false);
  }, []);

  // Fetch data only when authenticated, clear data on logout
  useEffect(() => {
    // Don't do anything while auth is still checking
    if (isAuthLoading) {
      return;
    }

    if (isAuthenticated) {
      // User is authenticated, fetch all data
      refreshAll();
    } else {
      // Extra safeguard: check if there's still a token in sessionStorage
      // This prevents clearing data during race conditions (quick refreshes)
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        // User is not authenticated and no stored token, clear all data
        clearAllData();
      }
      // If there's a stored token but isAuthenticated is false,
      // it means auth is still being validated or there was a transient error.
      // Don't clear the data - let the user retry.
    }
  }, [isAuthenticated, isAuthLoading, refreshAll, clearAllData]);

  // Subscribe to WebSocket updates for real-time task sync across all clients
  const { subscribeToTasks, subscribeToUsers, isConnected } = useSocket();

  // Delta sync on WebSocket reconnect - only fetch changed tasks instead of everything
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      // Use delta sync for tasks (only fetch tasks modified since last sync)
      // This significantly reduces data transfer on reconnect
      const lastSync = getLastSyncTimestamp();
      if (lastSync && !shouldDoFullSync()) {
        console.log(
          `[SettingsContext] Socket reconnected, using delta sync (since ${new Date(
            lastSync
          ).toLocaleTimeString()})...`
        );
        // Delta sync: only fetch tasks, history modified since last sync
        refreshTasks(true, true); // Silent + delta mode
        refreshTaskHistory(true);
      } else {
        console.log(
          "[SettingsContext] Socket connected, performing full sync..."
        );
        refreshAll(true); // Silent full refresh
      }
    }
  }, [
    isConnected,
    isAuthenticated,
    refreshAll,
    refreshTasks,
    refreshTaskHistory,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    // When a task update comes via WebSocket, update both history and tasks
    const unsubscribe = subscribeToTasks((update: TaskHistoryEntry) => {
      // Add the update to history if it doesn't already exist
      setTaskHistory((prev) => {
        if (prev.some((e) => e.id === update.id)) return prev;
        return [...prev, update].sort((a, b) => a.timestamp - b.timestamp);
      });

      // Handle task CRUD operations incrementally
      const { action, taskId, fullTask } = update;

      if (action === "CREATE" && fullTask) {
        // Add new task to the list
        setTasks((prev) => {
          if (prev.some((t) => t.id === fullTask.id)) return prev;
          return [...prev, fullTask as Task];
        });
      } else if (action === "DELETE") {
        // Remove task from the list
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else if (
        ["UPDATE", "IN_PROGRESS", "CLOSE", "ASSIGN"].includes(action) &&
        fullTask
      ) {
        // Update existing task
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, ...(fullTask as Task) } : t
          )
        );
      }

      // Also invalidate React Query cache for components using useTasksQuery
      invalidateTaskQueries();
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToTasks]);

  // Subscribe to WebSocket updates for real-time user sync across all clients
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToUsers(
      (update: {
        action: string;
        payload: UserData | null;
        userId: string;
      }) => {
        const { action, payload, userId } = update;

        if (action === "create" && payload) {
          // Add new user to the list
          setUsers((prev) => {
            if (prev.some((u) => u.id === payload.id)) return prev;
            return [...prev, payload as UserData];
          });
        } else if (action === "delete") {
          // Remove user from the list
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } else if (action === "update" && payload) {
          // Update existing user
          setUsers((prev) =>
            prev.map((u) =>
              u.id === payload.id ? { ...u, ...(payload as UserData) } : u
            )
          );
        }

        // Also invalidate React Query cache for components using useUsersQuery
        invalidateUserQueries();
      }
    );

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToUsers]);

  const value: SettingsContextState = {
    users,
    primaryTags,
    secondaryTags,
    contacts,
    tasks,
    taskHistory,
    isLoading,
    isLoadingUsers,
    isLoadingTags,
    isLoadingContacts,
    isLoadingTasks,
    isLoadingHistory,
    refreshUsers,
    refreshTags,
    refreshContacts,
    refreshTasks,
    refreshTaskHistory,
    refreshAll,
    addHistoryEntry,
    getHistoryForTask,
    getHistoryForDate,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom Hook to use Settings Context
export const useSettings = (): SettingsContextState => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default SettingsContext;
