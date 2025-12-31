"""
WebSocket events for real-time updates
"""
from flask_socketio import emit
from flask import request
from datetime import datetime
import logging

# Configure WebSocket logger
ws_logger = logging.getLogger('websocket')
ws_logger.setLevel(logging.INFO)
ws_logger.propagate = False

# Create console handler with custom formatting
if not ws_logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '\033[36m[%(asctime)s]\033[0m \033[33m[%(action)s]\033[0m \033[35m[%(station)s]\033[0m %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    ws_logger.addHandler(console_handler)

# Suppress noisy connection errors from gevent
logging.getLogger('gevent').setLevel(logging.ERROR)

# Reference to socketio instance (set during registration)
_socketio = None


def _get_client_info():
    """Get client IP and session ID for logging"""
    try:
        client_ip = request.remote_addr or 'unknown'
        session_id = request.sid[:8] if hasattr(request, 'sid') and request.sid else 'no-sid'
        return f"{client_ip} | {session_id}"
    except:
        return "unknown"


def _log_ws_event(action, message, extra_info=None):
    """Log a WebSocket event with consistent formatting"""
    station = _get_client_info()
    extra = {'action': action, 'station': station}
    
    if extra_info:
        ws_logger.info(f"- {message} | {extra_info}", extra=extra)
    else:
        ws_logger.info(f"- {message}", extra=extra)


def register_socket_events(socketio):
    """Register all WebSocket event handlers"""
    global _socketio
    _socketio = socketio

    @socketio.on('connect')
    def handle_connect():
        _log_ws_event('CONNECT', 'New client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        _log_ws_event('DISCONNECT', 'Client disconnected')

    @socketio.on('join_updates')
    def handle_join_updates():
        """Client wants to receive task updates"""
        _log_ws_event('JOIN', 'Subscribed to task updates channel')

    @socketio.on_error_default
    def default_error_handler(e):
        """Handle socket errors gracefully (e.g., client disconnects)"""
        # Ignore connection aborted/reset errors - they're normal when clients refresh
        if isinstance(e, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            pass  # Silently ignore
        else:
            _log_ws_event('ERROR', f'Socket error occurred', str(e))


def broadcast_task_update(update_data):
    """Broadcast a task update to all connected clients"""
    if _socketio:
        try:
            task_id = update_data.get('taskId', 'unknown')
            action_type = update_data.get('action', 'update')
            _log_ws_event('BROADCAST', f'Task update sent', f"task={task_id} | action={action_type}")
            
            _socketio.emit('task_update', {
                'type': 'task_update',
                'payload': update_data
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # Client disconnected, ignore


def broadcast_task_created(task_data, history_entry):
    """Broadcast when a task is created"""
    if _socketio:
        try:
            task_id = task_data.get('_id', 'unknown')
            task_title = task_data.get('title', 'untitled')[:30]
            _log_ws_event('BROADCAST', f'Task created', f"task={task_id} | title={task_title}")
            
            _socketio.emit('task_update', {
                'type': 'task_update',
                'payload': history_entry
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass


def broadcast_task_deleted(task_id, history_entry):
    """Broadcast when a task is deleted"""
    if _socketio:
        try:
            _log_ws_event('BROADCAST', f'Task deleted', f"task={task_id}")
            
            _socketio.emit('task_update', {
                'type': 'task_update',
                'payload': history_entry
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass


def broadcast_chat_update(message_data=None):
    """Broadcast a chat update to all connected clients"""
    if _socketio:
        try:
            msg_id = message_data.get('id', 'unknown') if message_data else 'unknown'
            _log_ws_event('BROADCAST', f'Chat update sent', f"message={msg_id}")
            
            _socketio.emit('chat_update', {
                'type': 'chat_update',
                'payload': message_data
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # Client disconnected, ignore


def broadcast_user_update(action, user_data=None, user_id=None):
    """Broadcast a user update to all connected clients"""
    if _socketio:
        try:
            uid = user_id or (user_data.get('id') if user_data else 'unknown')
            _log_ws_event('BROADCAST', f'User update sent', f"user={uid} | action={action}")
            
            _socketio.emit('user_update', {
                'type': 'user_update',
                'action': action,  # 'create', 'update', 'delete'
                'payload': user_data,
                'userId': uid
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # Client disconnected, ignore

