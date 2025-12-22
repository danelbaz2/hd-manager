from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.tag_model import TagModel, TagUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history
from utils.jwt_utils import jwt_required

bp = Blueprint('tags', __name__, url_prefix='/api/tags')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_tags():
    tags = list(mongo.db.ents.find({'base.entityType': 'tag', 'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(t) for t in tags])

@bp.route('/', methods=['POST'])
@jwt_required
def create_tag():
    try:
        data = TagModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)

    # Check for existing tag with same name
    existing_tag = mongo.db.ents.find_one({
        'name': data['name'],
        'base.entityType': 'tag'
    })

    if existing_tag:
        if existing_tag.get('base', {}).get('isDeleted'):
            # Reactivate deleted tag
            tag_id = existing_tag['_id']
            update_fields = {
                'base.isDeleted': False,
                'base.updatedAt': now,
                'base.lut': now,
                **data  # Update other fields like color if they changed
            }
            
            # Remove base from data so it doesn't overwrite the nested base update structure if pydantic model had it (it shouldn't for creation usually but safely)
            if 'base' in update_fields:
                del update_fields['base']
                
            # Re-construct base update properly to merge with reactivation
            final_update = {
                '$set': {
                    'base.isDeleted': False,
                    'base.updatedAt': now,
                    'base.updatedAt': now,
                }
            }
            
            # Add other data fields to $set
            for k, v in data.items():
                if k != 'base':
                    final_update['$set'][k] = v

            mongo.db.ents.update_one({'_id': tag_id}, final_update)
            
            updated_tag = mongo.db.ents.find_one({'_id': tag_id})
            log_history('tag', tag_id, 'RESTORE', 'system', existing_tag, updated_tag, final_update['$set'])
            return jsonify(serialize_doc(updated_tag)), 201
        else:
            # Tag exists and is active
             return jsonify({"error": "Tag with this name already exists"}), 409

    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'entityType': 'tag',
        'createdBy': getattr(request, 'user_full_name', 'system'),
        'updatedBy': getattr(request, 'user_full_name', 'system')
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    log_history('tag', data['_id'], 'CREATE', 'system', None, data, data)
    
    return jsonify(serialize_doc(data)), 201


@bp.route('/<id>', methods=['PUT'])
@jwt_required
def update_tag(id):
    try:
        validated = TagUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    # Fetch old document first
    old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'tag'})
    if not old_doc:
        return jsonify({"error": "Tag not found"}), 404
        
    now = int(datetime.now().timestamp() * 1000)
    data['base.updatedAt'] = now
    data['base.updatedBy'] = getattr(request, 'user_full_name', 'system')
    
    try:
        mongo.db.ents.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.ents.find_one({'_id': id})
    
    log_history('tag', id, 'UPDATE', getattr(request, 'user_full_name', 'system'), old_doc, updated, data)
             
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@jwt_required
def delete_tag(id):
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'tag'})
        if not old_doc:
            return jsonify({"error": "Tag not found"}), 404
        
        now = int(datetime.now().timestamp() * 1000)
        mongo.db.ents.update_one({'_id': id}, {'$set': {
            'base.isDeleted': True,
            'base.updatedAt': now,
            'base.updatedBy': getattr(request, 'user_full_name', 'system')
        }})
        
        updated = mongo.db.ents.find_one({'_id': id})
        log_history('tag', id, 'DELETE', getattr(request, 'user_full_name', 'system'), old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200

