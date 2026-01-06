/**
 * RealtimeSyncProvider - Bridges WebSocket events to React Query cache invalidation
 *
 * This provider subscribes to all socket events and invalidates the appropriate
 * React Query caches when updates are received from the server.
 *
 * This replaces the need to have data-fetching logic in individual contexts.
 */

import React, { useEffect, type ReactNode } from "react";
import { useSocket } from "./SocketProvider";
import { useAuth } from "../contexts/AuthContext";
import {
  invalidateTaskQueries,
  invalidateUserQueries,
  invalidateAllQueries,
  updateReactQueryCache,
  updateHistoryCache,
} from "../api/queries";
import type { TaskHistoryEntry } from "../api/tasksApi";

interface RealtimeSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider that subscribes to WebSocket events and invalidates React Query caches.
 * Must be placed inside both SocketProvider and AuthProvider, but outside QueryClientProvider.
 */
export const RealtimeSyncProvider: React.FC<RealtimeSyncProviderProps> = ({
  children,
}) => {
  const { isConnected, subscribeToTasks, subscribeToUsers } = useSocket();
  const { isAuthenticated } = useAuth();

  // Subscribe to task updates
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToTasks((entry: TaskHistoryEntry) => {
      // Update history cache directly for instant activity feed updates
      updateHistoryCache(entry);

      // For task data, use direct cache update if entry contains full task data
      if (entry.fullTask) {
        const action = entry.action as "CREATE" | "UPDATE" | "DELETE";
        updateReactQueryCache(action, entry.fullTask);
      } else {
        // Fallback to invalidation if we don't have the full task data
        invalidateTaskQueries();
      }
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToTasks]);

  // Subscribe to user updates
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToUsers(() => {
      // User updates are less frequent, just invalidate
      invalidateUserQueries();
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToUsers]);

  // Invalidate all caches on reconnection to ensure data consistency
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      // Small delay to let the socket stabilize
      const timer = setTimeout(() => {
        invalidateAllQueries();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isConnected]);

  return <>{children}</>;
};

export default RealtimeSyncProvider;
