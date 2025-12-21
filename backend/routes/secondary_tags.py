from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.secondary_tag_model import SecondaryTagModel, SecondaryTagUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('secondary_tags', __name__, url_prefix='/api/secondary-tags')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
def get_secondary_tags():
    """Get all active secondary tags (non-deleted)
    
    Optional query params:
    - primaryTagId: Filter by parent primary tag ID
    """
    query = {'base.entityType': 'secondary_tag', 'base.isDeleted': {'$ne': True}}
    
    # Optional filter by primary tag
    primary_tag_id = request.args.get('primaryTagId')
    if primary_tag_id:
        query['primaryTagId'] = primary_tag_id
    
    tags = list(mongo.db.ents.find(query))
    return jsonify([serialize_doc(t) for t in tags])


@bp.route('/', methods=['POST'])
def create_secondary_tag():
    """Create a new secondary tag"""
    try:
        data = SecondaryTagModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Validate that the primary tag exists
    primary_tag = mongo.db.ents.find_one({
        '_id': data['primaryTagId'],
        'base.entityType': 'primary_tag',
        'base.isDeleted': {'$ne': True}
    })
    if not primary_tag:
        return jsonify({"error": "Primary tag not found"}), 400

    now = int(datetime.now().timestamp() * 1000)

    # Check for existing secondary tag with same name under same primary
    existing_tag = mongo.db.ents.find_one({
        'name': data['name'],
        'primaryTagId': data['primaryTagId'],
        'base.entityType': 'secondary_tag'
    })

    if existing_tag:
        if existing_tag.get('base', {}).get('isDeleted'):
            # Reactivate deleted tag
            tag_id = existing_tag['_id']
            final_update = {
                '$set': {
                    'base.isDeleted': False,
                    'base.updatedAt': now,
                    'base.lut': now,
                }
            }
            
            # Add other data fields to $set
            for k, v in data.items():
                if k != 'base':
                    final_update['$set'][k] = v

            mongo.db.ents.update_one({'_id': tag_id}, final_update)
            
            updated_tag = mongo.db.ents.find_one({'_id': tag_id})
            log_history('secondary_tag', tag_id, 'RESTORE', 'system', existing_tag, updated_tag, final_update['$set'])
            return jsonify(serialize_doc(updated_tag)), 201
        else:
            # Tag exists and is active
            return jsonify({"error": "Secondary tag with this name already exists under this primary tag"}), 409

    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'lut': now,
        'entityType': 'secondary_tag'
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    log_history('secondary_tag', data['_id'], 'CREATE', 'system', None, data, data)
    
    return jsonify(serialize_doc(data)), 201


@bp.route('/<id>', methods=['GET'])
def get_secondary_tag(id):
    """Get a single secondary tag by ID"""
    tag = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'secondary_tag', 'base.isDeleted': {'$ne': True}})
    if not tag:
        return jsonify({"error": "Secondary tag not found"}), 404
    return jsonify(serialize_doc(tag))


@bp.route('/<id>', methods=['PUT'])
def update_secondary_tag(id):
    """Update an existing secondary tag"""
    try:
        validated = SecondaryTagUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    # If changing primary tag, validate it exists
    if 'primaryTagId' in data:
        primary_tag = mongo.db.ents.find_one({
            '_id': data['primaryTagId'],
            'base.entityType': 'primary_tag',
            'base.isDeleted': {'$ne': True}
        })
        if not primary_tag:
            return jsonify({"error": "Primary tag not found"}), 400
        
    # Fetch old document first
    old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'secondary_tag'})
    if not old_doc:
        return jsonify({"error": "Secondary tag not found"}), 404
        
    now = int(datetime.now().timestamp() * 1000)
    data['base.updatedAt'] = now
    data['base.lut'] = now
    
    try:
        mongo.db.ents.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.ents.find_one({'_id': id})
    
    log_history('secondary_tag', id, 'UPDATE', 'system', old_doc, updated, data)
             
    return jsonify(serialize_doc(updated))


@bp.route('/<id>', methods=['DELETE'])
def delete_secondary_tag(id):
    """Soft delete a secondary tag (sets isDeleted to true)"""
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'secondary_tag'})
        if not old_doc:
            return jsonify({"error": "Secondary tag not found"}), 404
             
        mongo.db.ents.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
        
        updated = mongo.db.ents.find_one({'_id': id})
        log_history('secondary_tag', id, 'DELETE', 'system', old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Secondary tag deleted"}), 200
