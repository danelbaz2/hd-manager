/**
 * useSocketConnection - Hook for socket connection status.
 * Provides reactive access to socket connection state.
 */

import { useState, useEffect } from 'react';
import { socketManager, type SocketState } from '../socketManager';
import type { ConnectionStatus } from '../types';

interface UseSocketConnectionResult {
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Whether socket is connected */
  isConnected: boolean;
  
  /** Full socket state */
  state: SocketState;
  
  /** Ensure socket is connected before operation */
  ensureConnected: () => Promise<boolean>;
}

/**
 * Hook to monitor socket connection status.
 * Updates reactively when connection state changes.
 */
export function useSocketConnection(): UseSocketConnectionResult {
  const [state, setState] = useState<SocketState>(socketManager.getState());
  
  useEffect(() => {
    const unsubscribe = socketManager.onConnectionChange(() => {
      setState(socketManager.getState());
    });
    
    return unsubscribe;
  }, []);
  
  return {
    status: state.status,
    isConnected: state.isConnected,
    state,
    ensureConnected: socketManager.ensureConnected.bind(socketManager),
  };
}
