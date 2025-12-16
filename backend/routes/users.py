from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from bson.objectid import ObjectId
from models.user_model import UserModel, UserUpdateModel
from utils.history import log_history
import bcrypt

bp = Blueprint('users', __name__, url_prefix='/api/users')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    doc.pop('passwordHash', None)  # Remove password hash from response
    return doc

@bp.route('/', methods=['GET'])
def get_users():
    users = list(mongo.db.users.find({'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(u) for u in users])

@bp.route('/', methods=['POST'])
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
        'lut': now,
        'entityType': 'user'
    }
    
    # Hash the password before storing
    plain_password = data['passwordHash']
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    data['passwordHash'] = hashed.decode('utf-8')

    data['_id'] = str(ObjectId())
    mongo.db.users.insert_one(data)
    
    log_history('user', data['_id'], 'CREATE', 'system', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
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
        data['base.lut'] = now
        
        # If password is being updated (and not empty), hash it
        if 'passwordHash' in data and data['passwordHash']:
            plain_password = data['passwordHash']
            hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
            data['passwordHash'] = hashed.decode('utf-8')
        elif 'passwordHash' in data:
            # Empty password provided - remove from update to keep existing
            del data['passwordHash']
        
        mongo.db.users.update_one({'_id': id}, {'$set': data})
        updated = mongo.db.users.find_one({'_id': id})
        
        log_history('user', id, 'UPDATE', 'system', old_doc, updated, data)
            
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
def delete_user(id):
    try:
        old_doc = mongo.db.users.find_one({'_id': id})
        if not old_doc:
            return jsonify({"error": "User not found"}), 404
             
        mongo.db.users.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
        
        updated = mongo.db.users.find_one({'_id': id})
        log_history('user', id, 'DELETE', 'system', old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
