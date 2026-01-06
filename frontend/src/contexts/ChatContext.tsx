/**
 * ChatContext - Manages global chat state and synchronization
 * Ensures chat messages are synced even when specific chat components are not mounted
 *
 * Also tracks the latest message timestamp for unread notification purposes
 */
import React, { createContext, type ReactNode, useEffect, useRef } from "react";
import { useChatSync } from "../socket";
import { invalidateChatQueries } from "../api/queries";
import { useAuth } from "./AuthContext";
import { setUserTimestamp } from "../utils/activityFeedStorage";

// Context is currently empty as we only use it for global sync effects
const ChatContext = createContext<null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const userIdRef = useRef<string | undefined>(user?.id);

  // Keep ref updated with latest user ID
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Global subscription to chat updates
  const { isConnected } = useChatSync(() => {
    // Update the latest message timestamp BEFORE invalidating queries
    // This ensures the unread indicator will show up when returning to home page
    if (userIdRef.current) {
      setUserTimestamp(userIdRef.current, "latest_team_message", Date.now());
    }
    invalidateChatQueries();
  });

  // Re-sync on connection/reconnection to ensure we didn't miss updates
  useEffect(() => {
    if (isConnected) {
      invalidateChatQueries();
    }
  }, [isConnected]);

  return <ChatContext.Provider value={null}>{children}</ChatContext.Provider>;
};

