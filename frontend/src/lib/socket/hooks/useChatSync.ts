/**
 * useChatSync - Hook for real-time chat updates.
 */

import { useEffect, useRef } from 'react';
import { useSocket } from '../SocketProvider';

interface UseChatSyncOptions {
  /** Whether sync is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time chat updates.
 * 
 * @param onUpdate - Callback when a chat update is received (typically refetch messages)
 * @param options - Configuration options
 */
export function useChatSync(
  onUpdate: () => void,
  options: UseChatSyncOptions = {}
): { isConnected: boolean } {
  const { enabled = true } = options;
  const { isConnected, subscribeToChat } = useSocket();
  
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  
  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = subscribeToChat(() => {
      callbackRef.current();
    });
    
    return unsubscribe;
  }, [enabled, subscribeToChat]);
  
  return { isConnected };
}

// Also export as useChatUpdates for backward compatibility
export const useChatUpdates = useChatSync;
