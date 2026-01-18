/**
 * UsersContext - Manages user data state
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
import { getAllUsers, type User } from "../api/usersApi";
import { type UserData } from "../schemas/userTypes";
import { useAuth } from "./AuthContext";
import { useSocket } from "../lib/socket";
import { invalidateUserQueries } from "../api/queries";

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

interface UsersContextState {
  users: UserData[];
  isLoadingUsers: boolean;
  refreshUsers: (silent?: boolean) => Promise<void>;
}

const defaultValue: UsersContextState = {
  users: [],
  isLoadingUsers: false,
  refreshUsers: async () => { },
};

const UsersContext = createContext<UsersContextState>(defaultValue);

interface UsersProviderProps {
  children: ReactNode;
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      refreshUsers();
    } else {
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        setUsers([]);
      }
    }
  }, [isAuthenticated, isAuthLoading, refreshUsers]);

  // WebSocket subscription for real-time user updates
  const { subscribeToUsers, isConnected } = useSocket();

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
          setUsers((prev) => {
            if (prev.some((u) => u.id === payload.id)) return prev;
            return [...prev, payload as UserData];
          });
        } else if (action === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } else if (action === "update" && payload) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === payload.id ? { ...u, ...(payload as UserData) } : u
            )
          );
        }

        // Also invalidate React Query cache
        invalidateUserQueries();
      }
    );

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToUsers]);

  // Refetch on reconnect
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      refreshUsers(true);
    }
  }, [isConnected, isAuthenticated, refreshUsers]);

  const value: UsersContextState = {
    users,
    isLoadingUsers,
    refreshUsers,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextState => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};

export default UsersContext;
