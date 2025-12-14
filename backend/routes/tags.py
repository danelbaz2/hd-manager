from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.tag_model import TagModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('tags', __name__, url_prefix='/api/tags')

def serialize_doc(doc):
    doc['id'] = doc['_id']
    del doc['_id']
    return doc

@bp.route('/', methods=['GET'])
def get_tags():
    tags = list(mongo.db.tags.find({'isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(t) for t in tags])

@bp.route('/', methods=['POST'])
def create_tag():
    try:
        data = TagModel(**request.json).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    

    now = datetime.now().isoformat()
    data['createdAt'] = now
    data['updatedAt'] = now
    data['_id'] = str(ObjectId())
    mongo.db.tags.insert_one(data)
    
    log_history('tag', data['_id'], 'CREATE', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_tag(id):
    try:
        data = request.json
        
        old_doc = mongo.db.tags.find_one({'_id': id})
        
        try:
            mongo.db.tags.update_one({'_id': id}, {'$set': data})
        except:
            return jsonify({"error": "Invalid ID"}), 400
        updated = mongo.db.tags.find_one({'_id': id})
        
        if old_doc and updated:
             log_history('tag', id, 'UPDATE', old_doc, updated, data)
             
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
def delete_tag(id):
    try:
        old_doc = mongo.db.tags.find_one({'_id': id})
        if not old_doc:
             return jsonify({"error": "Tag not found"}), 404
             
        mongo.db.tags.update_one({'_id': id}, {'$set': {'isDeleted': True}})
        
        updated = mongo.db.tags.find_one({'_id': id})
        log_history('tag', id, 'DELETE', old_doc, updated, {'isDeleted': True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
