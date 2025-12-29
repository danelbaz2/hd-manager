import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { TaskHistoryEntry } from "../api/tasksApi";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface SocketContextState {
  isConnected: boolean;
  subscribe: (callback: (update: TaskHistoryEntry) => void) => () => void;
  subscribeToChat: (callback: () => void) => () => void;
}

const SocketContext = createContext<SocketContextState | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const subscribersRef = useRef<Set<(update: TaskHistoryEntry) => void>>(
    new Set()
  );
  const chatSubscribersRef = useRef<Set<() => void>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection once
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("Global Socket.IO connected");
      setIsConnected(true);
      socket.emit("join_updates");
    });

    socket.on("disconnect", () => {
      console.log("Global Socket.IO disconnected");
      setIsConnected(false);
    });

    // Task updates
    socket.on(
      "task_update",
      (data: { type: string; payload: TaskHistoryEntry }) => {
        if (data.type === "task_update" && data.payload) {
          subscribersRef.current.forEach((callback) => callback(data.payload));
        }
      }
    );

    // Chat message updates - notify all chat subscribers to refetch
    socket.on("chat_update", () => {
      chatSubscribersRef.current.forEach((callback) => callback());
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Subscribe to task updates
  const subscribe = useCallback(
    (callback: (update: TaskHistoryEntry) => void) => {
      subscribersRef.current.add(callback);
      return () => {
        subscribersRef.current.delete(callback);
      };
    },
    []
  );

  // Subscribe to chat updates
  const subscribeToChat = useCallback((callback: () => void) => {
    chatSubscribersRef.current.add(callback);
    return () => {
      chatSubscribersRef.current.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, subscribe, subscribeToChat }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Hook to subscribe to task updates
export const useTaskUpdates = (
  onUpdate: (update: TaskHistoryEntry) => void,
  enabled = true
) => {
  const { subscribe, isConnected } = useSocket();

  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = subscribe(onUpdate);
    return unsubscribe;
  }, [subscribe, onUpdate, enabled]);

  return { isConnected };
};

// Hook to subscribe to chat updates
export const useChatUpdates = (onUpdate: () => void, enabled = true) => {
  const { subscribeToChat, isConnected } = useSocket();

  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = subscribeToChat(onUpdate);
    return unsubscribe;
  }, [subscribeToChat, onUpdate, enabled]);

  return { isConnected };
};
