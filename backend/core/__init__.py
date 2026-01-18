"""
Core business logic modules.

This package contains core functionality that is shared across the application:
- websocket: Real-time WebSocket communication
- auth: Authentication and authorization utilities
- history: History/audit tracking (future)
"""

from . import websocket
from . import auth

__all__ = ['websocket', 'auth']
