"""
WebSocket events for real-time updates
"""
from flask_socketio import emit

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


def broadcast_task_update(update_data):
    """Broadcast a task update to all connected clients"""
    if _socketio:
        _socketio.emit('task_update', {
            'type': 'task_update',
            'payload': update_data
        })


def broadcast_task_created(task_data, history_entry):
    """Broadcast when a task is created"""
    if _socketio:
        _socketio.emit('task_update', {
            'type': 'task_update',
            'payload': history_entry
        })


def broadcast_task_deleted(task_id, history_entry):
    """Broadcast when a task is deleted"""
    if _socketio:
        _socketio.emit('task_update', {
            'type': 'task_update',
            'payload': history_entry
        })
