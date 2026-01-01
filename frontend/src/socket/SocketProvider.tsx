/**
 * Socket Provider - React context for socket state.
 * Provides socket connection status and subscription methods to the app.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { socketManager, type SocketState } from "./socketManager";
import type {
  ConnectionStatus,
  TaskUpdateHandler,
  ChatUpdateHandler,
  UserUpdateHandler,
} from "./types";

interface SocketContextValue {
  /** Current connection status */
  status: ConnectionStatus;

  /** Whether socket is currently connected */
  isConnected: boolean;

  /** Full socket state */
  state: SocketState;

  /** Subscribe to task updates */
  subscribeToTasks: (handler: TaskUpdateHandler) => () => void;

  /** Subscribe to chat updates */
  subscribeToChat: (handler: ChatUpdateHandler) => () => void;

  /** Subscribe to user updates */
  subscribeToUsers: (handler: UserUpdateHandler) => () => void;

  /** Ensure socket is connected (for critical operations) */
  ensureConnected: () => Promise<boolean>;

  /** Manually connect socket */
  connect: () => void;

  /** Manually disconnect socket */
  disconnect: () => void;

  /** Authenticate with user ID */
  authenticate: (userId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [state, setState] = useState<SocketState>(socketManager.getState());

  // Initialize socket connection
  useEffect(() => {
    // Connect socket
    socketManager.connect();

    // Subscribe to connection changes
    const unsubscribe = socketManager.onConnectionChange(() => {
      setState(socketManager.getState());
    });

    return () => {
      unsubscribe();
      // Note: We don't disconnect here - let the activity system handle it
    };
  }, []);

  // Subscription methods
  const subscribeToTasks = useCallback((handler: TaskUpdateHandler) => {
    return socketManager.onTaskUpdate(handler);
  }, []);

  const subscribeToChat = useCallback((handler: ChatUpdateHandler) => {
    return socketManager.onChatUpdate(handler);
  }, []);

  const subscribeToUsers = useCallback((handler: UserUpdateHandler) => {
    return socketManager.onUserUpdate(handler);
  }, []);

  const ensureConnected = useCallback(() => {
    return socketManager.ensureConnected();
  }, []);

  const connect = useCallback(() => {
    socketManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  const authenticate = useCallback((userId: string) => {
    socketManager.authenticate(userId);
  }, []);

  const value: SocketContextValue = {
    status: state.status,
    isConnected: state.isConnected,
    state,
    subscribeToTasks,
    subscribeToChat,
    subscribeToUsers,
    ensureConnected,
    connect,
    disconnect,
    authenticate,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/**
 * Hook to access socket context.
 */
export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
