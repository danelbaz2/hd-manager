from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.primary_tag_model import PrimaryTagModel, PrimaryTagUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history
from utils.jwt_utils import jwt_required, admin_required
from utils.error_handlers import handle_client_disconnect
from middleware.idempotency import idempotency_middleware
from utils.logger import logger
try:
    from pymongo.errors import _OperationCancelled
except ImportError:
    _OperationCancelled = Exception

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
@idempotency_middleware
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
            try:
                log_history('primary_tag', tag_id, 'RESTORE', getattr(request, 'user_full_name', 'system'), existing_tag, updated_tag, final_update['$set'])
            except:
                pass  # Best-effort logging
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
    
    try:
        mongo.db.ents.insert_one(data)
    except _OperationCancelled:
        # Check if the document was actually inserted despite the cancellation
        if mongo.db.ents.find_one({'_id': data['_id']}):
            logger.warning(f"Primary tag {data['_id']} created despite client disconnect")
            pass  # Proceed to log history/action as if nothing happened
        else:
            raise  # Re-raise if not found
    
    # History logging is best-effort
    try:
        log_history('primary_tag', data['_id'], 'CREATE', getattr(request, 'user_full_name', 'system'), None, data, data)
        logger.action("Create", "PrimaryTag", data['_id'], getattr(request, 'user_full_name', 'system'), f"Name: {data.get('name', 'Unknown')}")
    except:
        pass  # Don't fail request if logging fails
    
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
    except _OperationCancelled:
        # Check if the update was applied despite the cancellation
        check_doc = mongo.db.ents.find_one({'_id': id})
        if check_doc and check_doc.get('base', {}).get('updatedAt') == now:
            logger.warning(f"Primary tag {id} updated despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if update didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.ents.find_one({'_id': id})
    
    # History logging is best-effort
    try:
        log_history('primary_tag', id, 'UPDATE', getattr(request, 'user_full_name', 'system'), old_doc, updated, data)
        logger.action("Update", "PrimaryTag", id, getattr(request, 'user_full_name', 'system'), f"Changed: {list(data.keys())}")
    except:
        pass  # Don't fail request if logging fails
             
    return jsonify(serialize_doc(updated))


@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_primary_tag(id):
    """Hard delete a primary tag (removes from collection, saves to archive)"""
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
    
    # Create deleted state snapshot
    deleted_state = old_doc.copy()
    if 'base' not in deleted_state:
        deleted_state['base'] = {}
    deleted_state['base']['isDeleted'] = True
    deleted_state['base']['updatedAt'] = now
    deleted_state['base']['updatedBy'] = getattr(request, 'user_full_name', 'system')

    # Log history BEFORE deletion (save full entity snapshot to archive)
    try:
        log_history('primary_tag', id, 'DELETE', getattr(request, 'user_full_name', 'system'), old_doc, deleted_state, {'action': 'HARD_DELETE', 'base': {'isDeleted': True}})
        logger.action("Delete", "PrimaryTag", id, getattr(request, 'user_full_name', 'system'))
    except:
        pass  # Don't fail request if logging fails
    
    # Hard delete - actually remove the document
    try:
        result = mongo.db.ents.delete_one({'_id': id, 'base.entityType': 'primary_tag'})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete primary tag"}), 500
    except _OperationCancelled:
        # Check if the delete was applied despite the cancellation
        if not mongo.db.ents.find_one({'_id': id}):
            logger.warning(f"Primary tag {id} deleted despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if delete didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    return jsonify({"message": "Primary tag deleted"}), 200


