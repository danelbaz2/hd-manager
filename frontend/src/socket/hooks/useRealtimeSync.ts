/**
 * useRealtimeSync - Hook for real-time task and user updates.
 * Automatically updates local state when server broadcasts changes.
 */

import { useEffect, useRef } from 'react';
import { useSocket } from '../SocketProvider';
import type { TaskHistoryEntry } from '../../api/tasksApi';
import type { UserUpdateEvent } from '../types';

interface UseRealtimeSyncOptions {
  /** Whether sync is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time task updates.
 * 
 * @param onUpdate - Callback when a task update is received
 * @param options - Configuration options
 */
export function useTaskUpdates(
  onUpdate: (entry: TaskHistoryEntry) => void,
  options: UseRealtimeSyncOptions = {}
): { isConnected: boolean } {
  const { enabled = true } = options;
  const { isConnected, subscribeToTasks } = useSocket();
  
  // Use ref to avoid recreating subscription on callback change
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  
  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = subscribeToTasks((entry) => {
      callbackRef.current(entry);
    });
    
    return unsubscribe;
  }, [enabled, subscribeToTasks]);
  
  return { isConnected };
}

/**
 * Hook to subscribe to real-time user updates.
 * 
 * @param onUpdate - Callback when a user update is received
 * @param options - Configuration options
 */
export function useUserUpdates(
  onUpdate: (event: UserUpdateEvent) => void,
  options: UseRealtimeSyncOptions = {}
): { isConnected: boolean } {
  const { enabled = true } = options;
  const { isConnected, subscribeToUsers } = useSocket();
  
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  
  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = subscribeToUsers((event) => {
      callbackRef.current(event);
    });
    
    return unsubscribe;
  }, [enabled, subscribeToUsers]);
  
  return { isConnected };
}

/**
 * Combined hook for real-time sync of tasks and users.
 * Useful when you need both in a single component.
 */
export function useRealtimeSync(
  handlers: {
    onTaskUpdate?: (entry: TaskHistoryEntry) => void;
    onUserUpdate?: (event: UserUpdateEvent) => void;
  },
  options: UseRealtimeSyncOptions = {}
): { isConnected: boolean } {
  const { enabled = true } = options;
  const { isConnected, subscribeToTasks, subscribeToUsers } = useSocket();
  
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribes: (() => void)[] = [];
    
    if (handlersRef.current.onTaskUpdate) {
      unsubscribes.push(
        subscribeToTasks((entry) => handlersRef.current.onTaskUpdate?.(entry))
      );
    }
    
    if (handlersRef.current.onUserUpdate) {
      unsubscribes.push(
        subscribeToUsers((event) => handlersRef.current.onUserUpdate?.(event))
      );
    }
    
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [enabled, subscribeToTasks, subscribeToUsers]);
  
  return { isConnected };
}
