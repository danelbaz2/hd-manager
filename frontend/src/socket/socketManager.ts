/**
 * Socket Manager - Singleton manager for WebSocket connection.
 * 
 * Implements the Hybrid Activity-Based connection pattern:
 * 1. Connects on app load
 * 2. Tracks user activity (mouse, keyboard, touch)
 * 3. Disconnects after idle timeout
 * 4. Reconnects on user activity after idle
 * 5. Ensures connection before critical operations
 */

import { io, Socket } from 'socket.io-client';
import { getIdleTimeout, getSocketTimeout } from '../config/runtimeConfig';
import {
  type ConnectionStatus,
  type SocketConfig,
  type TaskUpdateEvent,
  type ChatUpdateEvent,
  type UserUpdateEvent,
  type TaskUpdateHandler,
  type ChatUpdateHandler,
  type UserUpdateHandler,
  type ConnectionChangeHandler,
  DEFAULT_SOCKET_CONFIG,
} from './types';

export interface SocketState {
  status: ConnectionStatus;
  isConnected: boolean;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
  reconnectAttempts: number;
}

class SocketManager {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private state: SocketState;
  
  // Activity tracking
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private activityThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private isIdle: boolean = false;
  
  // Subscribers
  private taskUpdateHandlers: Set<TaskUpdateHandler> = new Set();
  private chatUpdateHandlers: Set<ChatUpdateHandler> = new Set();
  private userUpdateHandlers: Set<UserUpdateHandler> = new Set();
  private connectionChangeHandlers: Set<ConnectionChangeHandler> = new Set();
  
  // Activity events to track
  private readonly ACTIVITY_EVENTS = [
    'mousedown',
    'mousemove',
    'keydown',
    'touchstart',
    'scroll',
    'click',
  ];
  
  constructor(config: Partial<SocketConfig> = {}) {
    const defaultIdleTimeout = getIdleTimeout();
    this.config = { 
      ...DEFAULT_SOCKET_CONFIG, 
      idleTimeoutMs: defaultIdleTimeout,
      ...config 
    };
    this.state = {
      status: 'disconnected',
      isConnected: false,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      reconnectAttempts: 0,
    };
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  /**
   * Initialize and connect the socket.
   * Should be called once when the app loads.
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }
    
    this.createSocket();
    this.startActivityTracking();
  }
  
  /**
   * Disconnect the socket and stop activity tracking.
   * Should be called when user logs out.
   */
  disconnect(): void {
    this.stopActivityTracking();
    this.clearIdleTimer();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.updateState({ 
      status: 'disconnected', 
      isConnected: false,
      lastDisconnectedAt: Date.now(),
    });
  }
  
  /**
   * Ensure socket is connected before a critical operation.
   * Returns a promise that resolves when connected.
   */
  async ensureConnected(): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }
    
    // If we're idle and disconnected, reconnect
    if (this.isIdle || !this.socket) {
      this.isIdle = false;
      this.connect();
    }
    
    // Wait for connection with socket connect event
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout
      
      // Listen directly to socket connect event
      if (this.socket) {
        const onConnect = () => {
          clearTimeout(timeout);
          this.socket?.off('connect', onConnect);
          resolve(true);
        };
        
        // Check if already connected (race condition)
        if (this.socket.connected) {
          clearTimeout(timeout);
          resolve(true);
          return;
        }
        
        this.socket.on('connect', onConnect);
      } else {
        // Socket not created yet, use connection change handler
        const handler = (status: ConnectionStatus) => {
          if (status === 'connected') {
            clearTimeout(timeout);
            this.offConnectionChange(handler);
            resolve(true);
          }
        };
        this.onConnectionChange(handler);
      }
    });
  }

  /**
   * Safely emit an event: ensures connection first, returns false if emit was skipped.
   */
  async safeEmit(event: string, data?: any): Promise<boolean> {
    const connected = await this.ensureConnected();

    if (connected && this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }

    console.warn('[Socket] Emit skipped - not connected', { event });
    return false;
  }
  
  /**
   * Get current socket state.
   */
  getState(): SocketState {
    return { ...this.state };
  }
  
  /**
   * Check if socket is currently connected.
   */
  get isConnected(): boolean {
    return this.state.isConnected;
  }
  
  /**
   * Authenticate with user ID for targeted broadcasts.
   */
  authenticate(userId: string): void {
    void this.safeEmit('authenticate', { userId });
  }
  
  // ============================================================================
  // Event Subscriptions
  // ============================================================================
  
  onTaskUpdate(handler: TaskUpdateHandler): () => void {
    this.taskUpdateHandlers.add(handler);
    return () => this.taskUpdateHandlers.delete(handler);
  }
  
  onChatUpdate(handler: ChatUpdateHandler): () => void {
    this.chatUpdateHandlers.add(handler);
    return () => this.chatUpdateHandlers.delete(handler);
  }
  
  onUserUpdate(handler: UserUpdateHandler): () => void {
    this.userUpdateHandlers.add(handler);
    return () => this.userUpdateHandlers.delete(handler);
  }
  
  onConnectionChange(handler: ConnectionChangeHandler): () => void {
    this.connectionChangeHandlers.add(handler);
    // Immediately notify of current status
    handler(this.state.status);
    return () => this.connectionChangeHandlers.delete(handler);
  }
  
  offConnectionChange(handler: ConnectionChangeHandler): void {
    this.connectionChangeHandlers.delete(handler);
  }
  
  // ============================================================================
  // Private: Socket Management
  // ============================================================================
  
  private createSocket(): void {
    this.updateState({ status: 'connecting' });
    
    this.socket = io(this.config.url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false, // We handle reconnection manually based on activity
      timeout: getSocketTimeout(),
    });
    
    this.setupSocketListeners();
  }
  
  private setupSocketListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      this.updateState({ 
        status: 'connected', 
        isConnected: true,
        lastConnectedAt: Date.now(),
        reconnectAttempts: 0,
      });
      
      // Join updates room
      this.socket?.emit('join_updates');
      
      // Reset idle timer
      this.resetIdleTimer();
    });
    
    this.socket.on('disconnect', () => {
      this.updateState({ 
        status: 'disconnected', 
        isConnected: false,
        lastDisconnectedAt: Date.now(),
      });
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.handleReconnect();
    });
    
    // Task updates
    this.socket.on('task_update', (data: TaskUpdateEvent) => {
      if (data.type === 'task_update' && data.payload) {
        this.taskUpdateHandlers.forEach(h => h(data.payload));
      }
    });
    
    // Chat updates
    this.socket.on('chat_update', (data: ChatUpdateEvent) => {
      if (data.type === 'chat_update') {
        this.chatUpdateHandlers.forEach(h => h());
      }
    });
    
    // User updates
    this.socket.on('user_update', (data: UserUpdateEvent) => {
      if (data.type === 'user_update') {
        this.userUpdateHandlers.forEach(h => h(data));
      }
    });
  }
  
  private handleReconnect(): void {
    if (this.isIdle) {
      return;
    }
    
    const { maxReconnectAttempts, reconnectDelayMs } = this.config;
    
    if (this.state.reconnectAttempts >= maxReconnectAttempts) {
      return;
    }
    
    const attempts = this.state.reconnectAttempts + 1;
    const delay = reconnectDelayMs * Math.min(attempts, 5); // Exponential backoff, max 5x
    
    this.updateState({ 
      status: 'reconnecting',
      reconnectAttempts: attempts,
    });
    
    setTimeout(() => {
      if (!this.isIdle && !this.socket?.connected) {
        this.createSocket();
      }
    }, delay);
  }
  
  private updateState(updates: Partial<SocketState>): void {
    const oldStatus = this.state.status;
    this.state = { ...this.state, ...updates };
    
    if (updates.status && updates.status !== oldStatus) {
      this.connectionChangeHandlers.forEach(h => h(this.state.status));
    }
  }
  
  // ============================================================================
  // Private: Activity Tracking
  // ============================================================================
  
  private startActivityTracking(): void {
    if (typeof window === 'undefined') return;
    
    this.ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
    
    // Pre-emptively reconnect when window regains focus
    // This way socket is often already connected when user performs an action
    window.addEventListener('focus', this.handleWindowFocus);
    
    // Also handle visibility change (tab becomes visible)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.resetIdleTimer();
  }
  
  private stopActivityTracking(): void {
    if (typeof window === 'undefined') return;
    
    this.ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.handleActivity);
    });
    
    // Remove focus/visibility listeners
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  private handleActivity = (): void => {
    
    // If we were idle and disconnected, reconnect
    if (this.isIdle && !this.socket?.connected) {
      this.isIdle = false;
      this.connect();
      return;
    }
    
    // Throttle activity updates to server
    if (this.activityThrottleTimer) return;
    
    this.activityThrottleTimer = setTimeout(() => {
      this.activityThrottleTimer = null;
      
      // Notify server of activity (for server-side idle tracking if needed)
      if (this.socket?.connected) {
        this.socket.emit('activity');
      }
    }, this.config.activityDebounceMs);
    
    // Reset idle timer
    this.resetIdleTimer();
  };
  
  private resetIdleTimer(): void {
    this.clearIdleTimer();
    
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.config.idleTimeoutMs);
  }
  
  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
  
  private handleIdleTimeout(): void {
    this.isIdle = true;
    
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
  /**
   * Handle window focus - pre-emptively reconnect so socket is ready
   * when user performs an action.
   */
  private handleWindowFocus = (): void => {
    if (this.isIdle && !this.socket?.connected) {
      this.isIdle = false;
      this.connect();
    }
  };
  
  /**
   * Handle visibility change - reconnect when tab becomes visible.
   * This catches cases where focus event doesn't fire (e.g., mobile).
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      if (this.isIdle && !this.socket?.connected) {
        this.isIdle = false;
        this.connect();
      }
    }
  };
}

// Export singleton instance
export const socketManager = new SocketManager();

// Dev helper: expose globally for debugging in the browser console
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).socketManager = socketManager;
}
