from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from bson.objectid import ObjectId
from models.user_model import UserModel, UserUpdateModel
from utils.history import log_history
from utils.jwt_utils import jwt_required, admin_required, self_or_admin_required
import bcrypt

bp = Blueprint('users', __name__, url_prefix='/api/users')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    doc.pop('passwordHash', None)  # Remove password hash from response
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_users():
    users = list(mongo.db.users.find({'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(u) for u in users])

@bp.route('/', methods=['POST'])
@admin_required
def create_user():
    try:
        data = UserModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'entityType': 'user',
        'createdBy': getattr(request, 'user_full_name', 'system'),
        'updatedBy': getattr(request, 'user_full_name', 'system')
    }
    
    # Hash the password before storing
    plain_password = data.pop('password')  # Remove 'password' from data
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    data['passwordHash'] = hashed.decode('utf-8')  # Store as 'passwordHash'

    data['_id'] = str(ObjectId())
    mongo.db.users.insert_one(data)
    
    log_history('user', data['_id'], 'CREATE', getattr(request, 'user_full_name', 'system'), None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
@self_or_admin_required
def update_user(id):
    try:
        validated = UserUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
        
        # Fetch old document first
        old_doc = mongo.db.users.find_one({'_id': id})
        if not old_doc:
            return jsonify({"error": "User not found"}), 404
        
        now = int(datetime.now().timestamp() * 1000)
        data['base.updatedAt'] = now
        data['base.updatedBy'] = getattr(request, 'user_full_name', 'system')
        
        # If password is being updated (and not empty), hash it
        if 'password' in data and data['password']:
            plain_password = data.pop('password')  # Remove 'password' from data
            hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
            data['passwordHash'] = hashed.decode('utf-8')  # Store as 'passwordHash'
        elif 'password' in data:
            # Empty password provided - remove from update to keep existing
            del data['password']
        
        mongo.db.users.update_one({'_id': id}, {'$set': data})
        updated = mongo.db.users.find_one({'_id': id})
        
        log_history('user', id, 'UPDATE', getattr(request, 'user_full_name', 'system'), old_doc, updated, data)
            
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    try:
        old_doc = mongo.db.users.find_one({'_id': id})
        if not old_doc:
            return jsonify({"error": "User not found"}), 404
        
        now = int(datetime.now().timestamp() * 1000)
        mongo.db.users.update_one({'_id': id}, {'$set': {
            'base.isDeleted': True,
            'base.updatedAt': now,
            'base.updatedBy': getattr(request, 'user_full_name', 'system')
        }})
        
        updated = mongo.db.users.find_one({'_id': id})
        log_history('user', id, 'DELETE', getattr(request, 'user_full_name', 'system'), old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200

