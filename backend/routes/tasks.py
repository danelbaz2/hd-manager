from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.task_model import TaskModel, TaskUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Helper to serialize ObjectId from MongoDB to string for JSON response

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
def get_tasks():
    # Support filtering by date (SelectedDate in frontend) or range (Week/Month)
    date_param = request.args.get('date')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    responsible_users_id = request.args.get('responsibleUsersId')
    
    query = {'base.entityType': 'task', 'base.isDeleted': {'$ne': True}}

    if date_param:
        # Specific day view
        try:
            query['date'] = int(date_param)
        except ValueError:
             pass # Or handle error
    elif start_date and end_date:
        # Range view (Week/Month)
        try:
            query['date'] = {
                '$gte': int(start_date),
                '$lte': int(end_date)
            }
        except ValueError:
            pass

    if responsible_users_id:
        # Filter by worker (Responsible user)
        # MongoDB automatically searches inside the array if responsibleUsersId is a list
        query['responsibleUsersId'] = responsible_users_id

    tasks = list(mongo.db.ents.find(query))
    return jsonify([serialize_doc(t) for t in tasks])

@bp.route('/', methods=['POST'])
def create_task():
    try:
        # Validate incoming data
        data = TaskModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'createdAt': now,
        'updatedAt': now,
        'lut': now,
        'entityType': 'task'
    }
    
    
    
    data['_id'] = str(ObjectId())
    
    mongo.db.ents.insert_one(data)
    
    # Log History
    # For Create: old=None, new=data, change=data
    log_history('task', data['_id'], 'CREATE', 'system', None, data, data)

    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_task(id):
    try:
        # Validate with TaskUpdateModel - only allows valid task fields
        validated = TaskUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)
    # data is flat, but we need to update base fields
    # If using $set with 'base.updatedAt', we must ensure 'base' exists or $set works on nested paths.
    # We update flattened 'base.updatedAt' and 'base.lut'.
    data['base.updatedAt'] = now
    data['base.lut'] = now
    
    # Fetch Old State
    old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
    if not old_doc:
        return jsonify({"error": "Task not found"}), 404

    try:
        result = mongo.db.ents.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    if result.matched_count == 0:
        return jsonify({"error": "Task not found"}), 404
            
    updated = mongo.db.ents.find_one({'_id': id})
    
    # Log History
    log_history('task', id, 'UPDATE', 'system', old_doc, updated, data)
    
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
def delete_task(id):
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'task'})
        if not old_doc:
            return jsonify({"error": "Task not found"}), 404

        mongo.db.ents.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
        
        updated = mongo.db.ents.find_one({'_id': id})
        
        # Log History
        log_history('task', id, 'DELETE', 'system', old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify({"message": "Deleted"}), 200
