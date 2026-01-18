"""
Socket Broadcaster - Functions to emit events to connected clients.
Provides typed broadcast functions for different entity updates.
"""

import logging
from typing import Optional, Dict, Any

# Configure broadcaster logger - rely on root logger
broadcast_logger = logging.getLogger('socket.broadcast')


# Reference to socketio instance (set during event registration)
_socketio = None


def _safe_emit(event: str, data: dict, room: Optional[str] = None):
    """
    Safely emit an event, handling connection errors gracefully.
    
    Args:
        event: Event name
        data: Data payload
        room: Optional room to emit to (None = broadcast to all)
    """
    if not _socketio:
        broadcast_logger.warning(f"Cannot emit '{event}' - socketio not initialized")
        return False
    
    try:
        if room:
            _socketio.emit(event, data, room=room)
        else:
            _socketio.emit(event, data)
        return True
    except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
        # Client disconnected mid-emit, ignore
        return False
    except Exception as e:
        broadcast_logger.error(f"Failed to emit '{event}': {e}")
        return False


def broadcast_task_update(update_data: Dict[str, Any]):
    """
    Broadcast a task update to all connected clients.
    
    Args:
        update_data: Task history entry with action, changes, etc.
    """
    task_id = update_data.get('taskId', 'unknown')
    action_type = update_data.get('action', 'update')
    
    success = _safe_emit('task_update', {
        'type': 'task_update',
        'payload': update_data
    }, room='updates')
    
    if success:
        broadcast_logger.debug(f"Task update sent | task={task_id} | action={action_type}")


def broadcast_task_created(task_data: Dict[str, Any], history_entry: Dict[str, Any]):
    """
    Broadcast when a task is created.
    
    Args:
        task_data: The created task data
        history_entry: The history entry for this creation
    """
    task_id = task_data.get('_id', 'unknown')
    task_title = task_data.get('title', 'untitled')[:30]
    
    success = _safe_emit('task_update', {
        'type': 'task_update',
        'payload': history_entry
    }, room='updates')
    
    if success:
        broadcast_logger.debug(f"Task created | task={task_id} | title={task_title}")


def broadcast_task_deleted(task_id: str, history_entry: Dict[str, Any]):
    """
    Broadcast when a task is deleted.
    
    Args:
        task_id: ID of the deleted task
        history_entry: The history entry for this deletion
    """
    success = _safe_emit('task_update', {
        'type': 'task_update',
        'payload': history_entry
    }, room='updates')
    
    if success:
        broadcast_logger.debug(f"Task deleted | task={task_id}")


def broadcast_chat_update(message_data: Optional[Dict[str, Any]] = None):
    """
    Broadcast a chat update to all connected clients.
    
    Args:
        message_data: The chat message data (optional)
    """
    msg_id = message_data.get('id', 'unknown') if message_data else 'unknown'
    
    success = _safe_emit('chat_update', {
        'type': 'chat_update',
        'payload': message_data
    }, room='updates')
    
    if success:
        broadcast_logger.debug(f"Chat update sent | message={msg_id}")


def broadcast_user_update(
    action: str,
    user_data: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
):
    """
    Broadcast a user update to all connected clients.
    
    Args:
        action: 'create', 'update', or 'delete'
        user_data: The user data (for create/update)
        user_id: The user ID (for delete, or fallback)
    """
    uid = user_id or (user_data.get('id') if user_data else 'unknown')
    
    success = _safe_emit('user_update', {
        'type': 'user_update',
        'action': action,
        'payload': user_data,
        'userId': uid
    }, room='updates')
    
    if success:
        broadcast_logger.debug(f"User update sent | user={uid[:8] if uid else 'unknown'}... | action={action}")


def broadcast_to_user(user_id: str, event: str, data: Dict[str, Any]):
    """
    Broadcast an event to a specific user (all their connected sessions).
    
    Args:
        user_id: Target user ID
        event: Event name
        data: Data payload
    """
    room = f'user:{user_id}'
    success = _safe_emit(event, data, room=room)
    
    if success:
        broadcast_logger.debug(f"Targeted broadcast | user={user_id[:8]}... | event={event}")
