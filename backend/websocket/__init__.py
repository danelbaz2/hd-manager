"""
Socket module for real-time WebSocket communication.
Implements the Hybrid Activity-Based connection pattern.
"""

from .manager import SocketManager
from .events import register_socket_events
from .broadcaster import (
    broadcast_task_update,
    broadcast_task_created,
    broadcast_task_deleted,
    broadcast_chat_update,
    broadcast_user_update,
)

__all__ = [
    'SocketManager',
    'register_socket_events',
    'broadcast_task_update',
    'broadcast_task_created', 
    'broadcast_task_deleted',
    'broadcast_chat_update',
    'broadcast_user_update',
]
