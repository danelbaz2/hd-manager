/**
 * ChatContext - Manages global chat state and synchronization
 * Ensures chat messages are synced even when specific chat components are not mounted
 */
import React, { createContext, type ReactNode, useEffect } from "react";
import { useChatSync } from "../lib/socket";
import { invalidateChatQueries } from "../api/queries";

// Context is currently empty as we only use it for global sync effects
const ChatContext = createContext<null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Global subscription to chat updates
  const { isConnected } = useChatSync(() => {
    // Invalidate queries to trigger refetch when new messages arrive
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
