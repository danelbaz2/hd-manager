"""
Socket Manager - Centralized socket connection management.
Implements the Hybrid Activity-Based connection pattern.

This module manages:
- Connected clients tracking
- User-to-socket mapping for targeted broadcasts
- Connection health monitoring
"""

import logging
from typing import Dict, Set, Optional
from dataclasses import dataclass, field
from datetime import datetime
import threading

# Configure socket logger - rely on root logger for formatting
socket_logger = logging.getLogger('socket.manager')


@dataclass
class ClientConnection:
    """Represents a connected client"""
    sid: str
    user_id: Optional[str] = None
    connected_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    ip_address: str = "unknown"


class SocketManager:
    """
    Singleton manager for WebSocket connections.
    
    Features:
    - Track all connected clients by session ID (sid)
    - Map users to their socket connections for targeted broadcasts
    - Thread-safe operations for concurrent access
    """
    
    _instance: Optional['SocketManager'] = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._clients: Dict[str, ClientConnection] = {}  # sid -> ClientConnection
        self._user_sockets: Dict[str, Set[str]] = {}  # user_id -> set of sids
        self._data_lock = threading.RLock()
        self._initialized = True
        socket_logger.info("SocketManager initialized")
    
    def add_client(self, sid: str, ip_address: str = "unknown") -> ClientConnection:
        """Register a new client connection"""
        with self._data_lock:
            client = ClientConnection(sid=sid, ip_address=ip_address)
            self._clients[sid] = client
            socket_logger.info(f"Client connected: {sid[:8]}... from {ip_address}")
            return client
    
    def remove_client(self, sid: str) -> Optional[ClientConnection]:
        """Remove a client connection and clean up user mappings"""
        with self._data_lock:
            client = self._clients.pop(sid, None)
            if client:
                # Remove from user sockets mapping
                if client.user_id and client.user_id in self._user_sockets:
                    self._user_sockets[client.user_id].discard(sid)
                    if not self._user_sockets[client.user_id]:
                        del self._user_sockets[client.user_id]
                socket_logger.info(f"Client disconnected: {sid[:8]}...")
            return client
    
    def associate_user(self, sid: str, user_id: str) -> bool:
        """Associate a socket with a user ID for targeted broadcasts"""
        with self._data_lock:
            client = self._clients.get(sid)
            if not client:
                return False
            
            # Remove from old user mapping if exists
            if client.user_id and client.user_id in self._user_sockets:
                self._user_sockets[client.user_id].discard(sid)
            
            # Update client and add to new user mapping
            client.user_id = user_id
            if user_id not in self._user_sockets:
                self._user_sockets[user_id] = set()
            self._user_sockets[user_id].add(sid)
            
            socket_logger.info(f"User {user_id[:8]}... associated with socket {sid[:8]}...")
            return True
    
    def update_activity(self, sid: str) -> bool:
        """Update last activity timestamp for a client"""
        with self._data_lock:
            client = self._clients.get(sid)
            if client:
                client.last_activity = datetime.now()
                return True
            return False
    
    def get_client(self, sid: str) -> Optional[ClientConnection]:
        """Get client connection by session ID"""
        with self._data_lock:
            return self._clients.get(sid)
    
    def get_user_sockets(self, user_id: str) -> Set[str]:
        """Get all socket IDs associated with a user"""
        with self._data_lock:
            return self._user_sockets.get(user_id, set()).copy()
    
    def get_all_sockets(self) -> Set[str]:
        """Get all connected socket IDs"""
        with self._data_lock:
            return set(self._clients.keys())
    
    def get_connected_count(self) -> int:
        """Get number of connected clients"""
        with self._data_lock:
            return len(self._clients)
    
    def get_stats(self) -> dict:
        """Get connection statistics"""
        with self._data_lock:
            return {
                "total_connections": len(self._clients),
                "unique_users": len(self._user_sockets),
                "connections_by_user": {
                    uid: len(sids) for uid, sids in self._user_sockets.items()
                }
            }


# Global singleton instance
socket_manager = SocketManager()
