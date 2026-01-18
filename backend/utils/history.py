from database import mongo
from datetime import datetime
from bson.objectid import ObjectId

def log_history(entity_type, entity_id, action, user_id='system', old_val=None, new_val=None, change_val=None, timestamp=None):
    """
    Logs a history entry.
    
    If action is CREATE: old_val is None, new_val is the object, change_val is the object.
    If action is UPDATE: old_val is full obj before, new_val is full obj after, change_val is the diff.
    
    Args:
        entity_type: Type of entity (task, user, etc.)
        entity_id: ID of the entity
        action: Action performed (CREATE, UPDATE, DELETE)
        user_id: ID of user performing the action
        old_val: Entity state before changes (None for CREATE)
        new_val: Entity state after changes
        change_val: What changed (diff)
        timestamp: Optional timestamp override (useful for seeding)
    """
    
    # helper to clean ObjectId from dicts before saving to history (as sub-documents)
    def clean_doc(doc):
        if not doc: return None
        d = doc.copy()
        if '_id' in d:
            d['id'] = d.pop('_id')
        return d

    # Helper to convert dot notation keys to nested dicts
    # e.g., {'base.updatedAt': 123} -> {'base': {'updatedAt': 123}}
    def unflatten_doc(doc):
        if not doc:
            return None
        result = {}
        for key, value in doc.items():
            if '.' in key:
                parts = key.split('.')
                current = result
                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                current[parts[-1]] = value
            else:
                result[key] = value
        return result

    # Use provided timestamp or current time
    now = timestamp if timestamp is not None else int(datetime.now().timestamp() * 1000)
    
    # c includes the changes performed and metadata about who/when/what action
    # Unflatten to convert 'base.updatedAt' to nested {'base': {'updatedAt': ...}}
    change_data = unflatten_doc(clean_doc(change_val)) or {}
    change_data['action'] = action
    change_data['timestamp'] = now
    
    # Ensure base fields are populated in the change record
    if 'base' not in change_data:
        change_data['base'] = {}
    
    # Always record who performed the action and when
    if 'updatedBy' not in change_data['base']:
        change_data['base']['updatedBy'] = user_id
    if 'updatedAt' not in change_data['base']:
        change_data['base']['updatedAt'] = now
    
    entry = {
        "o": clean_doc(old_val),      # Old: entity before changes
        "c": change_data,              # Change: what changed + who performed it
        "n": clean_doc(new_val)        # New: entity after changes
    }

    result = mongo.db.ents_archive.insert_one(entry)
    
    # Broadcast update via WebSocket - ONLY for task entities
    # Other entity types (users, contacts, tags) are logged but not broadcast
    if entity_type != 'task':
        return  # Skip broadcasting for non-task entities
    
    try:
        from core.websocket import broadcast_task_update
        
        # Format entry for frontend (similar to get_all_tasks_history)
        task_id = (clean_doc(new_val) or {}).get('id') or (clean_doc(old_val) or {}).get('id') or ''
        
        # Determine action type label
        action_label = action
        if action == 'UPDATE' and change_data.get('status') == 'in_progress':
            action_label = 'IN_PROGRESS'
        elif action == 'UPDATE' and change_data.get('status') == 'completed':
            action_label = 'CLOSE'
        elif action == 'UPDATE' and 'responsibleUserIds' in change_data:
            action_label = 'ASSIGN'
        elif action == 'UPDATE' and 'optionals' in change_data:
            opt_changes = change_data.get('optionals', {})
            if 'externalSystem' in opt_changes or 'externalId' in opt_changes:
                action_label = 'UPDATE_EXTERNAL_SYSTEM'
            else:
                action_label = 'UPDATE_OPTIONALS'
        
        # Get the full task object for the frontend to update its state
        # Get the full task object for the frontend to update its state
        full_task = None
        # Include full task for all modification actions (not DELETE)
        if action != 'DELETE' and new_val:
            cleaned_new_val = clean_doc(new_val)
            if cleaned_new_val:
                full_task = cleaned_new_val
        
        history_item = {
            'id': str(result.inserted_id),
            'taskId': str(task_id),
            'action': action_label,
            'timestamp': now,
            'updatedBy': change_data.get('base', {}).get('updatedBy') or 'מערכת',
            'changes': {k: v for k, v in change_data.items() if k not in ['action', 'timestamp', 'base']},
            'oldValues': {k: v for k, v in (clean_doc(old_val) or {}).items() if k != 'base' and k != 'id'},
            'note': change_data.get('note'),
            'file': change_data.get('file'),
            'fullTask': full_task  # Include full task data for real-time updates
        }
        
        broadcast_task_update(history_item)
    except Exception as e:
        print(f"Failed to broadcast update: {e}")

