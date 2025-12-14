from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from bson.objectid import ObjectId
from models.user_model import UserModel
from utils.history import log_history

bp = Blueprint('users', __name__, url_prefix='/api/users')

def serialize_doc(doc):
    doc['id'] = doc['_id']
    del doc['_id']
    return doc

@bp.route('/', methods=['GET'])
def get_users():
    users = list(mongo.db.users.find({'isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(u) for u in users])

@bp.route('/', methods=['POST'])
def create_user():
    try:
        # Validate data
        # model_dump(exclude_none=True) drops optional fields that weren't provided, 
        # but keeps ones that were provided as null if that's valid.
        # usually just model_dump() is sufficient unless you want to lean on default values heavily.
        data = UserModel(**request.json).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    
    
    data['createdAt'] = datetime.now().isoformat()
    data['_id'] = str(ObjectId())
    mongo.db.users.insert_one(data)
    
    log_history('user', data['_id'], 'CREATE', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_user(id):
    try:
        data = request.json
        # Handle numeric IDs if they are sent as strings in URL
        query_id = int(id) if id.isdigit() else id
        
        # NOTE: For partial updates (PATCH behavior), we might not want strict full-model validation.
        # But for full updates (PUT), we should validate entire object.
        # If you want to validate partial updates, you can use:
        # UserModel.model_construct(**request.json) but that skips validation.
        # OR better: create a separate PatchUserModel with all optional fields.
        
        # Here we just blindly update for now as requested by user in previous steps 
        # or implement full validation if the frontend sends the full object.
        # Let's assume frontend sends mostly full object or we just validate what matches schema loosely.
        # Just dumping for now without strict Model wrapping for PUT to avoid breaking partial updates 
        # unless we know for sure frontend sends full object.
        
        # However, to demonstrate validation as requested:
        # If we assume PUT provides the FULL new state:
        # validated_data = UserModel(**data).model_dump()
        # db.users.update_one({'id': query_id}, {'$set': validated_data})
        
        # Fetch Old
        old_doc = mongo.db.users.find_one({'_id': id})
        
        try:
            mongo.db.users.update_one({'_id': id}, {'$set': data})
        except:
            return jsonify({"error": "Invalid ID"}), 400
            
        updated = mongo.db.users.find_one({'_id': id})
        
        if old_doc and updated:
            log_history('user', id, 'UPDATE', old_doc, updated, data)
            
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
def delete_user(id):
    query_id = int(id) if id.isdigit() else id
    try:
        old_doc = mongo.db.users.find_one({'_id': id})
        if not old_doc:
             return jsonify({"error": "User not found"}), 404
             
        mongo.db.users.update_one({'_id': id}, {'$set': {'isDeleted': True}})
        
        updated = mongo.db.users.find_one({'_id': id})
        log_history('user', id, 'DELETE', old_doc, updated, {'isDeleted': True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
