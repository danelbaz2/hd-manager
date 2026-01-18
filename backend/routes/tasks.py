from flask import Blueprint, request, jsonify
from database import mongo
from models.task_model import TaskModel, TaskUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history
from utils.error_handlers import handle_client_disconnect
from utils.timestamp import get_timestamp_ms
from middleware.idempotency import idempotency_middleware
try:
    from pymongo.errors import _OperationCancelled
except ImportError:
    _OperationCancelled = Exception

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

from utils.jwt_utils import jwt_required, admin_required
from utils.logger import logger

def determine_action_type(change_data, old_data, new_data):
    """
    Determine the specific action type based on the changes.
    Returns: CREATE, UPDATE, IN_PROGRESS, CLOSE, NOTE, DELETE, ASSIGN, PENDING_APPROVAL, APPROVE, REJECT, UPDATE_OPTIONALS, or UPDATE_EXTERNAL_SYSTEM
    """
    action = change_data.get('action', 'UPDATE')
    
    if action == 'CREATE':
        return 'CREATE'
    if action == 'DELETE':
        return 'DELETE'
    if action == 'NOTE':
        return 'NOTE'
    if action == 'APPROVE':
        return 'APPROVE'
    if action == 'REJECT':
        return 'REJECT'
    
    # For UPDATE, check if status changed
    if 'status' in change_data:
        new_status = change_data.get('status') or new_data.get('status')
        old_status = old_data.get('status')
        
        if new_status == 'in_progress':
            if old_status == 'pending_approval':
                return 'REJECT'
            return 'IN_PROGRESS'
        elif new_status == 'pending_approval':
            return 'PENDING_APPROVAL'
        elif new_status == 'completed':
            if old_status == 'pending_approval':
                return 'APPROVE'
            return 'CLOSE'
    
    # Check if responsibleUserIds changed (assignment update)
    if 'responsibleUserIds' in change_data:
        return 'ASSIGN'
    
    return 'UPDATE'

@bp.route('/', methods=['GET'])
@jwt_required
def get_tasks():
    # Support filtering by date (SelectedDate in frontend) or range (Week/Month)
    date_param = request.args.get('date')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    responsible_user_ids = request.args.get('responsibleUserIds')
    since = request.args.get('since')  # Delta sync: fetch only tasks modified after this timestamp
    
    query = {'base.entityType': 'task', 'base.isDeleted': {'$ne': True}}

    if date_param:
        try:
            query['date'] = int(date_param)
        except ValueError:
            pass
    elif start_date and end_date:
        try:
            query['date'] = {
                '$gte': int(start_date),
                '$lte': int(end_date)
            }
        except ValueError:
            pass

    if responsible_user_ids:
        query['responsibleUserIds'] = responsible_user_ids

    # Delta sync: only fetch tasks modified after 'since' timestamp
    if since:
        try:
            query['base.updatedAt'] = {'$gt': int(since)}
        except ValueError:
            pass

    tasks = list(mongo.db.ents.find(query))
    return jsonify([serialize_doc(t) for t in tasks])

@bp.route('/<id>', methods=['GET'])
@jwt_required
def get_task_by_id(id):
    """Get a single task by ID"""
    task = mongo.db.ents.find_one({
        '_id': id, 
        'base.entityType': 'task',
        'base.isDeleted': {'$ne': True}
    })
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    return jsonify(serialize_doc(task))

@bp.route('/', methods=['POST'])
@jwt_required
@idempotency_middleware
@handle_client_disconnect
def create_task():
    try:
        data = TaskModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = get_timestamp_ms()
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,

        'entityType': 'task',
        'createdBy': request.user_full_name,
        'updatedBy': request.user_full_name
    }
    
    # Use provided ID (from frontend/idempotency) or generate new
    # If using Idempotency-Key, we could potentially rely on that, but mixing concepts is tricky.
    # Ideally frontend sends an ID. But for now let's just use server ID.
    data['_id'] = str(ObjectId())
    
    try:
        mongo.db.ents.insert_one(data)
    except _OperationCancelled:
        # Check if the document was actually inserted despite the cancellation
        # This prevents "false negatives" where client disconnected but DB op succeeded
        if mongo.db.ents.find_one({'_id': data['_id']}):
            logger.warning(f"Task {data['_id']} created despite client disconnect")
            pass # Proceed to log history/action as if nothing happened
        else:
            raise # Re-raise if not found

    # History logging is best-effort
    try:
        log_history('task', data['_id'], 'CREATE', request.user_full_name, None, data, data)
        logger.action("Create", "Task", data['_id'], request.user_id, f"Title: {data.get('title', 'Untitled')}")
    except:
        pass # Don't fail request if logging fails

    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
@jwt_required
@handle_client_disconnect
def update_task(id):
    try:
        validated = TaskUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Fetch old document first
    old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
    if not old_doc:
        return jsonify({"error": "Task not found"}), 404

    # Calculate actual changes to avoid logging unchanged fields
    changes = {}
    for key, value in data.items():
        if old_doc.get(key) != value:
            changes[key] = value

    now = get_timestamp_ms()
    
    # Prepare update payload
    update_payload = changes.copy()
    
    # Handle optionals specifically to allow partial updates (dot notation)
    if 'optionals' in update_payload:
        opts = update_payload.pop('optionals')
        for k, v in opts.items():
            update_payload[f'optionals.{k}'] = v

    update_payload['base.updatedAt'] = now
    update_payload['base.updatedBy'] = request.user_full_name

    try:
        mongo.db.ents.update_one({'_id': id}, {'$set': update_payload})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    updated = mongo.db.ents.find_one({'_id': id})
    
    # Prepare change data for history (include metadata)
    history_changes = changes.copy()
    history_changes['base'] = {
        'updatedAt': now,
        'updatedBy': request.user_full_name
    }
    
    # Calculate action type before logging
    action_type = determine_action_type(history_changes, old_doc, updated)

    # Only log history if there are real changes or for tracking purposes
    # Even if only metadata changed, we log it, but 'c' will be minimal
    log_history('task', id, action_type, request.user_full_name, old_doc, updated, history_changes)
    
    logger.action("Update", "Task", id, request.user_id, f"Changed: {list(changes.keys())}")

    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_task(id):
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
        if not old_doc:
            return jsonify({"error": "Task not found"}), 404

        now = get_timestamp_ms()
        
        # Create a snapshot of the document as it would look after deletion
        deleted_state = old_doc.copy()
        if 'base' not in deleted_state:
            deleted_state['base'] = {}
        deleted_state['base']['isDeleted'] = True
        deleted_state['base']['updatedAt'] = now
        deleted_state['base']['updatedBy'] = request.user_full_name
        
        # Log history BEFORE deletion (save full entity snapshot to archive)
        # Pass deleted_state as 'new' value so 'n' field has the final state (isDeleted=True)
        log_history('task', id, 'DELETE', request.user_full_name, old_doc, deleted_state, {'action': 'HARD_DELETE', 'base': {'isDeleted': True}})
        logger.action("Delete", "Task", id, request.user_id)
        
        # Hard delete - actually remove the document
        result = mongo.db.ents.delete_one({'_id': id, 'base.entityType': 'task'})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete task"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify({"message": "Deleted"}), 200


# ============== Task Approval Workflow ==============

@bp.route('/<id>/approve', methods=['POST'])
@admin_required
@handle_client_disconnect
def approve_task(id):
    """
    Admin approves a pending_approval task, moving it to completed status.
    """
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
        if not old_doc:
            return jsonify({"error": "Task not found"}), 404

        if old_doc.get('status') != 'pending_approval':
            return jsonify({"error": "Task is not pending approval"}), 400

        now = get_timestamp_ms()
        mongo.db.ents.update_one({'_id': id}, {'$set': {
            'status': 'completed',
            'base.updatedAt': now,
            'base.updatedBy': request.user_full_name
        }})
        
        updated = mongo.db.ents.find_one({'_id': id})
        
        # Log approval with APPROVE action
        log_history('task', id, 'APPROVE', request.user_full_name, old_doc, updated, {
            'action': 'APPROVE',
            'status': 'completed',
            'base': {
                'updatedAt': now,
                'updatedBy': request.user_full_name
            }
        })
        
        logger.action("Approve", "Task", id, request.user_id, "Status: pending_approval → completed")
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify(serialize_doc(updated))


@bp.route('/<id>/reject', methods=['POST'])
@admin_required
@handle_client_disconnect
def reject_task(id):
    """
    Admin rejects a pending_approval task, moving it back to in_progress status.
    """
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
        if not old_doc:
            return jsonify({"error": "Task not found"}), 404

        if old_doc.get('status') != 'pending_approval':
            return jsonify({"error": "Task is not pending approval"}), 400

        now = get_timestamp_ms()
        mongo.db.ents.update_one({'_id': id}, {'$set': {
            'status': 'in_progress',
            'base.updatedAt': now,
            'base.updatedBy': request.user_full_name
        }})
        
        updated = mongo.db.ents.find_one({'_id': id})
        
        # Log rejection with REJECT action
        log_history('task', id, 'REJECT', request.user_full_name, old_doc, updated, {
            'action': 'REJECT',
            'status': 'in_progress',
            'base': {
                'updatedAt': now,
                'updatedBy': request.user_full_name
            }
        })
        
        logger.action("Reject", "Task", id, request.user_id, "Status: pending_approval → in_progress")
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify(serialize_doc(updated))


# ============== Task History Endpoints ==============




@bp.route('/<task_id>/history', methods=['GET'])
@jwt_required
def get_task_history(task_id):
    """
    Get the history of a specific task from ents_archive.
    Returns all archive entries for this task, sorted chronologically.
    Includes both task changes and notes.
    """
    try:
        # Find all archive entries for this task (including notes)
        query = {
            '$or': [
                {'o.id': task_id},
                {'n.id': task_id},
                {'o._id': task_id},
                {'n._id': task_id},
                {'n.taskId': task_id}  # Include notes that reference this task
            ]
        }
        
        # Get history entries sorted by timestamp (oldest first for timeline)
        entries = list(mongo.db.ents_archive.find(query).sort('c.timestamp', 1))
        
        # Transform entries for frontend
        history = []
        for entry in entries:
            change_data = entry.get('c', {})
            old_data = entry.get('o', {}) or {}
            new_data = entry.get('n', {}) or {}
            
            # Check if this is a note entity
            is_note = new_data.get('base', {}).get('entityType') == 'note'
            
            # Determine the specific action type
            if is_note:
                # Notes always use 'NOTE' action for display consistency
                action_type = 'NOTE'
            else:
                action_type = determine_action_type(change_data, old_data, new_data)
            
            history_item = {
                'id': str(entry.get('_id', '')),
                'taskId': task_id,
                'action': action_type,
                'timestamp': change_data.get('timestamp', 0),
                'updatedBy': change_data.get('base', {}).get('updatedBy') or 
                            new_data.get('base', {}).get('updatedBy') or
                            new_data.get('base', {}).get('createdBy') or 'מערכת',
                'changes': {k: v for k, v in change_data.items() if k not in ['id', '_id', 'base', 'action', 'timestamp', 'content', 'file']},
                'oldValues': {k: v for k, v in old_data.items() if k not in ['id', '_id', 'base']},
                'content': change_data.get('content'),
                'file': change_data.get('file'),  # Include file metadata if present
                'base': new_data.get('base') if is_note else None  # Include base for note entityType detection
            }
            
            # For CREATE actions, include responsibleUserIds from new_data if present
            if action_type == 'CREATE' and new_data.get('responsibleUserIds'):
                history_item['changes']['responsibleUserIds'] = new_data.get('responsibleUserIds')
            
            # For ASSIGN actions, include responsibleUserIds
            if action_type == 'ASSIGN' and 'responsibleUserIds' in change_data:
                history_item['changes']['responsibleUserIds'] = change_data.get('responsibleUserIds')
            
            history.append(history_item)
        
        return jsonify(history)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/history', methods=['GET'])
@jwt_required
def get_all_tasks_history():
    """
    Get history for ALL tasks from ents_archive.
    This is used for global fetch at login/refresh.
    Returns all changes with old and new values for detailed history display.
    Includes both task changes and notes.
    """
    try:
        # Find all archive entries for tasks and notes
        query = {
            '$or': [
                {'o.base.entityType': 'task'},
                {'n.base.entityType': 'task'},
                {'n.base.entityType': 'note'}  # Include notes
            ]
        }
        
        # Optional pagination
        before = request.args.get('before')
        after = request.args.get('after')
        limit = request.args.get('limit')

        # Build timestamp query
        timestamp_query = {}
        if before:
            timestamp_query['$lt'] = int(before)
        if after:
            timestamp_query['$gt'] = int(after)
        
        if timestamp_query:
            query['c.timestamp'] = timestamp_query
        
        # Sort order: DESC (-1) if 'before' is used, ASC (1) if 'after' is used or no pagination
        if after:
            sort_order = 1  # ASC for newer activities
        elif before or limit:
            sort_order = -1  # DESC for older activities
        else:
            sort_order = 1  # Default ASC
        
        cursor = mongo.db.ents_archive.find(query).sort('c.timestamp', sort_order)
        
        if limit:
            cursor = cursor.limit(int(limit))
            
        entries = list(cursor)
        
        # Fields that represent data changes (not metadata)
        DATA_FIELDS = ['title', 'description', 'priority', 'status', 'date', 'deadline', 
                       'responsibleUserIds', 'primaryTagIds', 'secondaryTagIds', 'optionals']
        
        # Transform entries for frontend
        history = []
        for entry in entries:
            change_data = entry.get('c', {})
            old_data = entry.get('o', {}) or {}
            new_data = entry.get('n', {}) or {}
            
            # Check if this is a note entity
            is_note = new_data.get('base', {}).get('entityType') == 'note'
            
            # Get task ID (for notes, use taskId field; for tasks, use id/_id)
            if is_note:
                task_id = new_data.get('taskId', '')
            else:
                task_id = new_data.get('id') or new_data.get('_id') or old_data.get('id') or old_data.get('_id') or ''
            
            # Determine the specific action type
            if is_note:
                # Notes always use 'NOTE' action for display consistency
                action_type = 'NOTE'
            else:
                action_type = determine_action_type(change_data, old_data, new_data)
            
            # Build changes dict with all changed data fields
            changes = {}
            old_values = {}
            
            if not is_note:
                for field in DATA_FIELDS:
                    if field in change_data:
                        changes[field] = change_data[field]
                        # Get old value from old_data
                        if old_data and field in old_data:
                            old_values[field] = old_data[field]
                
                # For CREATE, include initial values from new_data
                if action_type == 'CREATE':
                    for field in DATA_FIELDS:
                        if field in new_data and new_data[field]:
                            changes[field] = new_data[field]
                
                # For DELETE, include title in oldValues so frontend can display it
                if action_type == 'DELETE' and old_data:
                    if 'title' in old_data:
                        old_values['title'] = old_data['title']
            
            history_item = {
                'id': str(entry.get('_id', '')),
                'taskId': str(task_id),
                'action': action_type,
                'timestamp': change_data.get('timestamp', 0),
                'updatedBy': change_data.get('base', {}).get('updatedBy') or 
                            new_data.get('base', {}).get('updatedBy') or
                            new_data.get('base', {}).get('createdBy') or 'מערכת',
                'changes': changes,
                'oldValues': old_values,
                'content': change_data.get('content'),
                'file': change_data.get('file'),  # Include file metadata if present
                'base': new_data.get('base') if is_note else None  # Include base for note entityType detection
            }
            
            history.append(history_item)
        
        return jsonify(history)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<task_id>/notes', methods=['POST'])
@jwt_required
def add_task_note(task_id):
    """
    Add a note/comment to a task's history.
    Uses log_history() to create archive entry like other entities.
    
    Permission: Only admins or users assigned to the task can add notes.
    """
    try:
        data = request.json
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Verify task exists
        task = mongo.db.ents.find_one({'_id': task_id, 'base.entityType': 'task'})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check permission: admin or assigned user only
        is_admin = request.role == 'admin'
        responsible_user_ids = task.get('responsibleUserIds', [])
        # Convert to strings for comparison (user_id may be int or string)
        responsible_user_ids_str = [str(uid) for uid in responsible_user_ids]
        is_assigned = str(request.user_id) in responsible_user_ids_str
        
        if not is_admin and not is_assigned:
            return jsonify({'error': 'Permission denied. Only assigned users or admins can add notes.'}), 403
        
        now = get_timestamp_ms()
        note_id = str(ObjectId())
        
        # Create the note entity with full base fields (like other entities)
        note_entity = {
            '_id': note_id,
            'taskId': task_id,
            'content': content,
            'base': {
                'isDeleted': False,
                'isActive': True,
                'createdAt': now,
                'updatedAt': now,
                'entityType': 'note',
                'createdBy': request.user_full_name,
                'updatedBy': request.user_full_name
            }
        }
        
        # The change_val includes the content for display in history
        change_val = {
            'content': content,
            'base': {
                'updatedBy': request.user_full_name,
                'updatedAt': now
            }
        }
        
        # Use log_history like other entities (creates proper _id: ObjectId)
        log_history('note', note_id, 'CREATE', request.user_full_name, None, note_entity, change_val, now)
        logger.info(f"Note added to task {task_id} by user {request.user_id}")
        
        # Return the created note WITH taskId for frontend
        response = {
            'id': note_id,
            'taskId': task_id,
            'action': 'NOTE',  # Display as NOTE for frontend
            'timestamp': now,
            'updatedBy': request.user_full_name,
            'changes': {},
            'content': content
        }
        
        # Broadcast the note via WebSocket to all connected clients
        try:
            from websocket import broadcast_task_update
            broadcast_task_update(response)
        except Exception as e:
            print(f"Failed to broadcast note: {e}")
        
        return jsonify(response), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
