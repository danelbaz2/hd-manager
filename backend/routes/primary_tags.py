from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.primary_tag_model import PrimaryTagModel, PrimaryTagUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history
from utils.jwt_utils import jwt_required, admin_required
from utils.error_handlers import handle_client_disconnect

bp = Blueprint('primary_tags', __name__, url_prefix='/api/primary-tags')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_primary_tags():
    """Get all active primary tags (non-deleted)"""
    tags = list(mongo.db.ents.find({'base.entityType': 'primary_tag', 'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(t) for t in tags])

@bp.route('/', methods=['POST'])
@admin_required
@handle_client_disconnect
def create_primary_tag():
    """Create a new primary tag"""
    try:
        data = PrimaryTagModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)

    # Check for existing tag with same name
    existing_tag = mongo.db.ents.find_one({
        'name': data['name'],
        'base.entityType': 'primary_tag'
    })

    if existing_tag:
        if existing_tag.get('base', {}).get('isDeleted'):
            # Reactivate deleted tag
            tag_id = existing_tag['_id']
            final_update = {
                '$set': {
                    'base.isDeleted': False,
                    'base.updatedAt': now,
                    'base.updatedBy': getattr(request, 'user_full_name', 'system'),
                }
            }
            
            # Add other data fields to $set
            for k, v in data.items():
                if k != 'base':
                    final_update['$set'][k] = v

            mongo.db.ents.update_one({'_id': tag_id}, final_update)
            
            updated_tag = mongo.db.ents.find_one({'_id': tag_id})
            log_history('primary_tag', tag_id, 'RESTORE', getattr(request, 'user_full_name', 'system'), existing_tag, updated_tag, final_update['$set'])
            return jsonify(serialize_doc(updated_tag)), 201
        else:
            # Tag exists and is active
            return jsonify({"error": "Primary tag with this name already exists"}), 409

    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'entityType': 'primary_tag',
        'createdBy': getattr(request, 'user_full_name', 'system'),
        'updatedBy': getattr(request, 'user_full_name', 'system')
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    log_history('primary_tag', data['_id'], 'CREATE', getattr(request, 'user_full_name', 'system'), None, data, data)
    
    return jsonify(serialize_doc(data)), 201


@bp.route('/<id>', methods=['GET'])
@jwt_required
def get_primary_tag(id):
    """Get a single primary tag by ID"""
    tag = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'primary_tag', 'base.isDeleted': {'$ne': True}})
    if not tag:
        return jsonify({"error": "Primary tag not found"}), 404
    return jsonify(serialize_doc(tag))


@bp.route('/<id>', methods=['PUT'])
@admin_required
@handle_client_disconnect
def update_primary_tag(id):
    """Update an existing primary tag"""
    try:
        validated = PrimaryTagUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    # Fetch old document first
    old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'primary_tag'})
    if not old_doc:
        return jsonify({"error": "Primary tag not found"}), 404
        
    now = int(datetime.now().timestamp() * 1000)
    data['base.updatedAt'] = now
    data['base.updatedBy'] = getattr(request, 'user_full_name', 'system')
    
    try:
        mongo.db.ents.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.ents.find_one({'_id': id})
    
    log_history('primary_tag', id, 'UPDATE', getattr(request, 'user_full_name', 'system'), old_doc, updated, data)
             
    return jsonify(serialize_doc(updated))


@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_primary_tag(id):
    """Soft delete a primary tag (sets isDeleted to true)"""
    try:
        old_doc = mongo.db.ents.find_one({'_id': id, 'base.entityType': 'primary_tag'})
        if not old_doc:
            return jsonify({"error": "Primary tag not found"}), 404
        
        # Check if any secondary tags are using this primary tag
        secondary_count = mongo.db.ents.count_documents({
            'base.entityType': 'secondary_tag',
            'primaryTagId': id,
            'base.isDeleted': {'$ne': True}
        })
        
        if secondary_count > 0:
            return jsonify({
                "error": f"Cannot delete primary tag. {secondary_count} secondary tag(s) are using it. Delete them first."
            }), 400
        
        now = int(datetime.now().timestamp() * 1000)
        mongo.db.ents.update_one({'_id': id}, {'$set': {
            'base.isDeleted': True,
            'base.updatedAt': now,
            'base.updatedBy': getattr(request, 'user_full_name', 'system')
        }})
        
        updated = mongo.db.ents.find_one({'_id': id})
        log_history('primary_tag', id, 'DELETE', getattr(request, 'user_full_name', 'system'), old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Primary tag deleted"}), 200

