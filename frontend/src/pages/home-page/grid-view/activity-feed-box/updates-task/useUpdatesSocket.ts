import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { TaskHistoryEntry } from "./types";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface UseUpdatesSocketOptions {
  onNewUpdate: (update: TaskHistoryEntry) => void;
  enabled?: boolean;
}

export const useUpdatesSocket = ({ onNewUpdate, enabled = true }: UseUpdatesSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Socket.IO connected for updates");
      socket.emit("join_updates");
    });

    socket.on("task_update", (data: { type: string; payload: TaskHistoryEntry }) => {
      if (data.type === "task_update" && data.payload) {
        onNewUpdate(data.payload);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socketRef.current = socket;
  }, [enabled, onNewUpdate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect, reconnect: connect };
};
