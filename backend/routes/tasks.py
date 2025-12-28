from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.task_model import TaskModel, TaskUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

from utils.jwt_utils import jwt_required, admin_required

@bp.route('/', methods=['GET'])
@jwt_required
def get_tasks():
    # Support filtering by date (SelectedDate in frontend) or range (Week/Month)
    date_param = request.args.get('date')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    responsible_user_ids = request.args.get('responsibleUserIds')
    
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

    tasks = list(mongo.db.ents.find(query))
    return jsonify([serialize_doc(t) for t in tasks])

@bp.route('/', methods=['POST'])
@jwt_required
def create_task():
    try:
        data = TaskModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,

        'entityType': 'task',
        'createdBy': request.user_full_name,
        'updatedBy': request.user_full_name
    }
    
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    log_history('task', data['_id'], 'CREATE', request.user_full_name, None, data, data)

    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
@jwt_required
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

    now = int(datetime.now().timestamp() * 1000)
    
    # Prepare update payload
    update_payload = changes.copy()
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
    
    # Only log history if there are real changes or for tracking purposes
    # Even if only metadata changed, we log it, but 'c' will be minimal
    log_history('task', id, 'UPDATE', request.user_full_name, old_doc, updated, history_changes)
    
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@admin_required
def delete_task(id):
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
        if not old_doc:
            return jsonify({"error": "Task not found"}), 404

        now = int(datetime.now().timestamp() * 1000)
        mongo.db.ents.update_one({'_id': id}, {'$set': {
            'base.isDeleted': True,
            'base.updatedAt': now,

            'base.updatedBy': request.user_full_name
        }})
        
        updated = mongo.db.ents.find_one({'_id': id})
        
        # Log deletion - title will be retrieved from old_doc (o field) in frontend via oldValues
        log_history('task', id, 'DELETE', request.user_full_name, old_doc, updated, {
            'base': {
                'isDeleted': True,
                'updatedAt': now,
                'updatedBy': request.user_full_name
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify({"message": "Deleted"}), 200


# ============== Task History Endpoints ==============

def determine_action_type(change_data, old_data, new_data):
    """
    Determine the specific action type based on the changes.
    Returns: CREATE, UPDATE, IN_PROGRESS, CLOSE, NOTE, DELETE, or ASSIGN
    """
    action = change_data.get('action', 'UPDATE')
    
    if action == 'CREATE':
        return 'CREATE'
    if action == 'DELETE':
        return 'DELETE'
    if action == 'NOTE':
        return 'NOTE'
    
    # For UPDATE, check if status changed
    if 'status' in change_data:
        new_status = change_data.get('status') or new_data.get('status')
        if new_status == 'in_progress':
            return 'IN_PROGRESS'
        elif new_status == 'completed':
            return 'CLOSE'
    
    # Check if responsibleUserIds changed (assignment update)
    if 'responsibleUserIds' in change_data:
        return 'ASSIGN'
    
    return 'UPDATE'


@bp.route('/<task_id>/history', methods=['GET'])
@jwt_required
def get_task_history(task_id):
    """
    Get the history of a specific task from ents_archive.
    Returns all archive entries for this task, sorted chronologically.
    """
    try:
        # Find all archive entries for this task
        query = {
            '$or': [
                {'o.id': task_id},
                {'n.id': task_id},
                {'o._id': task_id},
                {'n._id': task_id}
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
            
            # Determine the specific action type
            action_type = determine_action_type(change_data, old_data, new_data)
            
            history_item = {
                'id': str(entry.get('_id', '')),
                'taskId': task_id,
                'action': action_type,
                'timestamp': change_data.get('timestamp', 0),
                'updatedBy': change_data.get('base', {}).get('updatedBy') or 
                            new_data.get('base', {}).get('updatedBy') or
                            new_data.get('base', {}).get('createdBy') or 'מערכת',
                'changes': {k: v for k, v in change_data.items() if k not in ['id', '_id', 'base', 'action', 'timestamp', 'note', 'file']},
                'note': change_data.get('note'),
                'file': change_data.get('file')  # Include file metadata if present
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
    """
    try:
        # Find all archive entries for tasks
        query = {
            '$or': [
                {'o.base.entityType': 'task'},
                {'n.base.entityType': 'task'}
            ]
        }
        
        # Get history entries sorted by timestamp (oldest first)
        entries = list(mongo.db.ents_archive.find(query).sort('c.timestamp', 1))
        
        # Fields that represent data changes (not metadata)
        DATA_FIELDS = ['title', 'description', 'priority', 'status', 'date', 'deadline', 
                       'responsibleUserIds', 'primaryTagIds', 'secondaryTagIds']
        
        # Transform entries for frontend
        history = []
        for entry in entries:
            change_data = entry.get('c', {})
            old_data = entry.get('o', {}) or {}
            new_data = entry.get('n', {}) or {}
            
            # Get task ID from either old or new data
            task_id = new_data.get('id') or new_data.get('_id') or old_data.get('id') or old_data.get('_id') or ''
            
            # Determine the specific action type
            action_type = determine_action_type(change_data, old_data, new_data)
            
            # Build changes dict with all changed data fields
            changes = {}
            old_values = {}
            
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
                'note': change_data.get('note'),
                'file': change_data.get('file')  # Include file metadata if present
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
    Creates a new entry in ents_archive with action 'NOTE'.
    """
    try:
        data = request.json
        note_text = data.get('note', '').strip()
        
        if not note_text:
            return jsonify({'error': 'Note text is required'}), 400
        
        # Verify task exists
        task = mongo.db.ents.find_one({'_id': task_id, 'base.entityType': 'task'})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        now = int(datetime.now().timestamp() * 1000)
        
        # Create the history entry for the note
        entry = {
            '_id': str(ObjectId()),
            'o': None,
            'c': {
                'action': 'NOTE',
                'timestamp': now,
                'note': note_text,
                'base': {
                    'updatedBy': request.user_full_name
                }
            },
            'n': {
                'id': task_id,
                '_id': task_id,
                'note': note_text,
                'base': {
                    'entityType': 'task',
                    'updatedBy': request.user_full_name
                }
            }
        }
        
        mongo.db.ents_archive.insert_one(entry)
        
        # Return the created note WITH taskId for frontend
        response = {
            'id': entry['_id'],
            'taskId': task_id,
            'action': 'NOTE',
            'timestamp': now,
            'updatedBy': request.user_full_name,
            'changes': {},
            'note': note_text
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
