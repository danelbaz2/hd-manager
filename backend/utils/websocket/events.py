"""
Socket Event Handlers - Register all WebSocket event handlers.
Implements clean connection lifecycle management.
"""

import logging
import os # Ensure os is imported for getenv
from flask import request
from flask_socketio import emit, join_room
from .manager import socket_manager

# Configure event logger with a safe formatter
# Configure event logger - rely on root logger
event_logger = logging.getLogger('socket.events')

def _get_client_info():
    """Get client IP and session ID for logging"""
    try:
        client_ip = request.remote_addr or 'unknown'
        session_id = request.sid[:8] if hasattr(request, 'sid') and request.sid else 'no-sid'
        return f"{client_ip} | {session_id}"
    except:
        return "unknown"


def _log_event(action, message, extra_info=None):
    """Log a socket event with consistent formatting"""
    station = _get_client_info()
    
    # Construct message: [ACTION] [Station] - Message
    full_msg = f"[{action}] [{station}] - {message}"
    
    if extra_info:
        full_msg += f" | {extra_info}"
        
    event_logger.info(full_msg)


def register_socket_events(socketio):
    """
    Register all WebSocket event handlers.
    
    Events:
    - connect: Client connects to socket
    - disconnect: Client disconnects
    - join_updates: Client subscribes to real-time updates
    - authenticate: Client provides user identity
    - activity: Client reports user activity (for idle tracking)
    """
    
    # Store socketio reference for broadcasting
    from . import broadcaster
    broadcaster._socketio = socketio
    
    @socketio.on('connect')
    def handle_connect():
        """Handle new client connection"""
        sid = request.sid
        ip = request.remote_addr or 'unknown'
        socket_manager.add_client(sid, ip)
        _log_event('CONNECT', 'Client connected')
        
        # Emit connection confirmation
        emit('connected', {
            'status': 'connected',
            'sid': sid[:8] + '...'
        })
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        sid = request.sid
        client = socket_manager.remove_client(sid)
        if client:
            _log_event('DISCONNECT', f'Client disconnected (was connected for {client.connected_at})')
        else:
            _log_event('DISCONNECT', 'Unknown client disconnected')
    
    @socketio.on('join_updates')
    def handle_join_updates():
        """Client wants to receive real-time updates"""
        sid = request.sid
        join_room('updates')  # Join the global updates room
        socket_manager.update_activity(sid)
        _log_event('JOIN', 'Subscribed to updates channel')
    
    @socketio.on('authenticate')
    def handle_authenticate(data):
        """
        Client provides user identity for targeted broadcasts.
        
        Args:
            data: { userId: string }
        """
        sid = request.sid
        user_id = data.get('userId') if data else None
        
        if user_id:
            socket_manager.associate_user(sid, user_id)
            join_room(f'user:{user_id}')  # Join user-specific room
            _log_event('AUTH', f'User authenticated: {user_id[:8]}...')
            emit('authenticated', {'status': 'ok', 'userId': user_id[:8] + '...'})
        else:
            _log_event('AUTH', 'Authentication failed - no userId')
            emit('authenticated', {'status': 'error', 'message': 'No userId provided'})
    
    @socketio.on('activity')
    def handle_activity():
        """
        Client reports user activity (mouse move, click, etc.).
        Used for idle timeout tracking on server side if needed.
        """
        sid = request.sid
        socket_manager.update_activity(sid)
        # No response needed - this is a fire-and-forget event
    
    @socketio.on('ping_alive')
    def handle_ping():
        """
        Keep-alive ping from client.
        Updates activity timestamp and responds with pong.
        """
        sid = request.sid
        socket_manager.update_activity(sid)
        emit('pong_alive', {'timestamp': int(__import__('time').time() * 1000)})
    
    @socketio.on_error_default
    def default_error_handler(e):
        """Handle socket errors gracefully"""
        # Ignore connection aborted/reset errors - they're normal when clients refresh
        if isinstance(e, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            pass  # Silently ignore
        else:
            _log_event('ERROR', f'Socket error: {type(e).__name__}', str(e))