"""
Socket module for real-time WebSocket communication.
Implements the Hybrid Activity-Based connection pattern.
"""

from .manager import SocketManager, socket_manager
from .events import register_socket_events
from .broadcaster import (
    broadcast_task_update,
    broadcast_task_created,
    broadcast_task_deleted,
    broadcast_chat_update,
    broadcast_user_update,
    broadcast_to_user,
)

__all__ = [
    'SocketManager',
    'socket_manager',
    'register_socket_events',
    'broadcast_task_update',
    'broadcast_task_created', 
    'broadcast_task_deleted',
    'broadcast_chat_update',
    'broadcast_user_update',
    'broadcast_to_user',
]
