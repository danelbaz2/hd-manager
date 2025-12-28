"""
WebSocket events for real-time updates
"""
from flask_socketio import emit
import logging

# Suppress noisy connection errors from eventlet
logging.getLogger('eventlet.wsgi').setLevel(logging.ERROR)

# Reference to socketio instance (set during registration)
_socketio = None


def register_socket_events(socketio):
    """Register all WebSocket event handlers"""
    global _socketio
    _socketio = socketio

    @socketio.on('connect')
    def handle_connect():
        print('Client connected to WebSocket')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected from WebSocket')

    @socketio.on('join_updates')
    def handle_join_updates():
        """Client wants to receive task updates"""
        print('Client joined updates channel')

    @socketio.on_error_default
    def default_error_handler(e):
        """Handle socket errors gracefully (e.g., client disconnects)"""
        # Ignore connection aborted/reset errors - they're normal when clients refresh
        if isinstance(e, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            pass  # Silently ignore
        else:
            print(f'Socket error: {e}')


def broadcast_task_update(update_data):
    """Broadcast a task update to all connected clients"""
    if _socketio:
        try:
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
            _socketio.emit('task_update', {
                'type': 'task_update',
                'payload': history_entry
            })
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass
