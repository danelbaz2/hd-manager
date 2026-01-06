/**
 * Socket Module - Real-time WebSocket communication.
 * Implements the Hybrid Activity-Based connection pattern.
 */

export { socketManager, type SocketState } from './socketManager';
export { useSocketConnection } from './hooks/useSocketConnection';
export { useRealtimeSync, useTaskUpdates, useUserUpdates } from './hooks/useRealtimeSync';
export { useChatSync, useChatUpdates } from './hooks/useChatSync';
export { SocketProvider, useSocket } from './SocketProvider';
export { RealtimeSyncProvider } from './RealtimeSyncProvider';
export * from './types';
