from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.tag_model import TagModel, TagUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('tags', __name__, url_prefix='/api/tags')

def serialize_doc(doc):
    doc['entityId'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
def get_tags():
    tags = list(mongo.db.ents.find({'base.entityType': 'tag', 'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(t) for t in tags])

@bp.route('/', methods=['POST'])
def create_tag():
    try:
        data = TagModel(**request.json).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'lut': now,
        'entityType': 'tag'
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    log_history('tag', data['_id'], 'CREATE', 'system', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_tag(id):
    try:
        # Validate with TagUpdateModel - only allows valid tag fields
        validated = TagUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
        
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'tag'})
        
        try:
            now = int(datetime.now().timestamp() * 1000)
            data['base.updatedAt'] = now
            data['base.lut'] = now
            mongo.db.ents.update_one({'_id': id}, {'$set': data})
        except:
            return jsonify({"error": "Invalid ID"}), 400
        updated = mongo.db.ents.find_one({'_id': id})
        
        if old_doc and updated:
             log_history('tag', id, 'UPDATE', 'system', old_doc, updated, data)
             
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
def delete_tag(id):
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'tag'})
        if not old_doc:
             return jsonify({"error": "Tag not found"}), 404
             
        mongo.db.ents.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
        
        updated = mongo.db.ents.find_one({'_id': id})
        log_history('tag', id, 'DELETE', 'system', old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
