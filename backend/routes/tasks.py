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

from utils.jwt_utils import jwt_required

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

    now = int(datetime.now().timestamp() * 1000)
    data['base.updatedAt'] = now

    data['base.updatedBy'] = request.user_full_name

    try:
        mongo.db.ents.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    updated = mongo.db.ents.find_one({'_id': id})
    
    log_history('task', id, 'UPDATE', request.user_full_name, old_doc, updated, data)
    
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@jwt_required
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
        
        log_history('task', id, 'DELETE', request.user_full_name, old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify({"message": "Deleted"}), 200
