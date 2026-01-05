/**
 * Socket Event Types - Type definitions for all socket events.
 */

import type { TaskHistoryEntry } from '../api/tasksApi';
import type { UserData } from '../schemas/userTypes';

// ============================================================================
// Connection State
// ============================================================================

export type ConnectionStatus =
  | 'disconnected'    // Not connected
  | 'connecting'      // Attempting to connect
  | 'connected'       // Connected and ready
  | 'reconnecting';   // Reconnecting after disconnect

// ============================================================================
// Server -> Client Events (Incoming)
// ============================================================================

/** Task update event from server */
export interface TaskUpdateEvent {
  type: 'task_update';
  payload: TaskHistoryEntry;
}

/** Chat update event from server */
export interface ChatUpdateEvent {
  type: 'chat_update';
  payload: unknown;
}

/** User update event from server */
export interface UserUpdateEvent {
  type: 'user_update';
  action: 'create' | 'update' | 'delete';
  payload: UserData | null;
  userId: string;
}

/** Connection confirmed event */
export interface ConnectedEvent {
  status: 'connected';
  sid: string;
}

/** Authentication result event */
export interface AuthenticatedEvent {
  status: 'ok' | 'error';
  userId?: string;
  message?: string;
}

/** Pong response from server */
export interface PongEvent {
  timestamp: number;
}

// ============================================================================
// Client -> Server Events (Outgoing)
// ============================================================================

/** Authentication request */
export interface AuthenticatePayload {
  userId: string;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type TaskUpdateHandler = (entry: TaskHistoryEntry) => void;
export type ChatUpdateHandler = () => void;
export type UserUpdateHandler = (event: UserUpdateEvent) => void;
export type ConnectionChangeHandler = (status: ConnectionStatus) => void;

// ============================================================================
// Socket Manager Configuration
// ============================================================================

export interface SocketConfig {
  /** Socket server URL */
  url: string;

  /** Idle timeout in milliseconds before disconnect (default: 5 minutes) */
  idleTimeoutMs: number;

  /** Debounce time for activity events (default: 1000ms) */
  activityDebounceMs: number;

  /** Enable auto-reconnect on activity after idle disconnect */
  autoReconnectOnActivity: boolean;

  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;

  /** Base delay between reconnection attempts (ms) */
  reconnectDelayMs: number;
}

// Get socket URL from API URL
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // If it's a relative URL like '/api', use empty string (same origin)
  if (apiUrl.startsWith('/')) {
    return '';  // Socket.IO will connect to the same origin
  }
  
  // Otherwise, strip /api from absolute URL
  return apiUrl.replace('/api', '');
};

export const DEFAULT_SOCKET_CONFIG: SocketConfig = {
  url: getSocketUrl(),
  idleTimeoutMs: 300 * 1000, // disconnect after 5 minutes of inactivity
  activityDebounceMs: 1000,
  autoReconnectOnActivity: true,
  maxReconnectAttempts: 10,
  reconnectDelayMs: 1000,
};
