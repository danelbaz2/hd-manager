/**
 * ChatContext - Manages global chat state and synchronization
 * Ensures chat messages are synced even when specific chat components are not mounted
 *
 * Also tracks the latest message timestamp for unread notification purposes
 */
import React, { createContext, type ReactNode, useEffect } from "react";
import { useChatSync } from "../socket";
import { invalidateChatQueries } from "../api/queries";

// Storage key for latest team message timestamp
const LATEST_TEAM_MESSAGE_KEY = "activity_feed_latest_team_message";

/**
 * Update the latest team message timestamp in localStorage
 * Called when new messages arrive via WebSocket
 */
const updateLatestTeamMessageTime = () => {
  const now = Date.now();
  localStorage.setItem(LATEST_TEAM_MESSAGE_KEY, now.toString());
};

// Context is currently empty as we only use it for global sync effects
const ChatContext = createContext<null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Global subscription to chat updates
  const { isConnected } = useChatSync(() => {
    // Update the latest message timestamp BEFORE invalidating queries
    // This ensures the unread indicator will show up when returning to home page
    updateLatestTeamMessageTime();
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

// Export the storage key for use in useActivityFeedPersistence
export { LATEST_TEAM_MESSAGE_KEY };
