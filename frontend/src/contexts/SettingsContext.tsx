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
import { useSocket } from "./SocketContext";

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
  refreshUsers: () => Promise<void>;
  refreshTags: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshTaskHistory: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // History helpers
  addHistoryEntry: (entry: TaskHistoryEntry) => void;
  getHistoryForTask: (taskId: string) => TaskHistoryEntry[];
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
  const refreshUsers = useCallback(async () => {
    setIsLoadingUsers(true);
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
      setIsLoadingUsers(false);
    }
  }, []);

  // Fetch tags (two-tier system: primary + secondary)
  const refreshTags = useCallback(async () => {
    setIsLoadingTags(true);
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
      setIsLoadingTags(false);
    }
  }, []);

  // Fetch contacts
  const refreshContacts = useCallback(async () => {
    setIsLoadingContacts(true);
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
      setIsLoadingContacts(false);
    }
  }, []);

  // Fetch tasks - gets all tasks without date filtering
  const refreshTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const response = await getAllTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        console.error("Failed to fetch tasks:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  // Fetch all task history - for global access
  const refreshTaskHistory = useCallback(async () => {
    setIsLoadingHistory(true);
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
      setIsLoadingHistory(false);
    }
  }, []);

  // Add a single history entry (after adding a note)
  const addHistoryEntry = useCallback((entry: TaskHistoryEntry) => {
    setTaskHistory((prev) => [...prev, entry]);
  }, []);

  // Get history entries for a specific task
  const getHistoryForTask = useCallback(
    (taskId: string): TaskHistoryEntry[] => {
      return taskHistory.filter((entry) => entry.taskId === taskId);
    },
    [taskHistory]
  );

  // Fetch all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      refreshUsers(),
      refreshTags(),
      refreshContacts(),
      refreshTasks(),
      refreshTaskHistory(),
    ]);
    setIsLoading(false);
  }, [
    refreshUsers,
    refreshTags,
    refreshContacts,
    refreshTasks,
    refreshTaskHistory,
  ]);

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
  const { subscribe, isConnected } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    // When any task update comes via WebSocket, refresh tasks and history
    const unsubscribe = subscribe(() => {
      refreshTasks();
      refreshTaskHistory();
    });

    return unsubscribe;
  }, [
    isAuthenticated,
    isConnected,
    subscribe,
    refreshTasks,
    refreshTaskHistory,
  ]);

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
