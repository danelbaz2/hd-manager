from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.contact_model import ContactModel, ContactUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history
from middleware.idempotency import idempotency_middleware
from utils.logger import logger
try:
    from pymongo.errors import _OperationCancelled
except ImportError:
    _OperationCancelled = Exception

bp = Blueprint('contacts', __name__, url_prefix='/api/contacts')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

from utils.jwt_utils import jwt_required, admin_required
from utils.error_handlers import handle_client_disconnect

@bp.route('/', methods=['GET'])
@jwt_required
def get_contacts():
    contacts = list(mongo.db.contacts.find({'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(c) for c in contacts])

@bp.route('/', methods=['POST'])
@jwt_required
@idempotency_middleware
@handle_client_disconnect
def create_contact():
    try:
        data = ContactModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'entityType': 'contact',
        'createdBy': request.user_full_name,
        'updatedBy': request.user_full_name
    }
    data['_id'] = str(ObjectId())
    
    try:
        mongo.db.contacts.insert_one(data)
    except _OperationCancelled:
        # Check if the document was actually inserted despite the cancellation
        if mongo.db.contacts.find_one({'_id': data['_id']}):
            logger.warning(f"Contact {data['_id']} created despite client disconnect")
            pass  # Proceed to log history/action as if nothing happened
        else:
            raise  # Re-raise if not found
    
    # History logging is best-effort
    try:
        log_history('contact', data['_id'], 'CREATE', request.user_full_name, None, data, data)
        logger.action("Create", "Contact", data['_id'], request.user_id, f"Name: {data.get('name', 'Unknown')}")
    except:
        pass  # Don't fail request if logging fails
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
@jwt_required
@handle_client_disconnect
def update_contact(id):
    try:
        validated = ContactUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    # Fetch old document first
    old_doc = mongo.db.contacts.find_one({'_id': id})
    if not old_doc:
        return jsonify({"error": "Contact not found"}), 404
        
    now = int(datetime.now().timestamp() * 1000)
    
    # Calculate only actual changes (compare with old document)
    changes = {}
    for key, value in data.items():
        if old_doc.get(key) != value:
            changes[key] = value
    
    # Add metadata to update payload
    update_payload = changes.copy()
    update_payload['base.updatedAt'] = now
    update_payload['base.updatedBy'] = request.user_full_name
    
    try:
        mongo.db.contacts.update_one({'_id': id}, {'$set': update_payload})
    except _OperationCancelled:
        # Check if the update was applied despite the cancellation
        check_doc = mongo.db.contacts.find_one({'_id': id})
        if check_doc and check_doc.get('base', {}).get('updatedAt') == now:
            logger.warning(f"Contact {id} updated despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if update didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.contacts.find_one({'_id': id})
    
    # Prepare history changes (only changed fields + metadata)
    history_changes = changes.copy()
    history_changes['base'] = {
        'updatedAt': now,
        'updatedBy': request.user_full_name
    }
    
    # History logging is best-effort
    try:
        log_history('contact', id, 'UPDATE', request.user_full_name, old_doc, updated, history_changes)
        logger.action("Update", "Contact", id, request.user_id, f"Changed: {list(changes.keys())}")
    except:
        pass  # Don't fail request if logging fails
             
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_contact(id):
    old_doc = mongo.db.contacts.find_one({'_id': id})
    if not old_doc:
        return jsonify({"error": "Contact not found"}), 404
             
    now = int(datetime.now().timestamp() * 1000)
    
    # Create deleted state snapshot
    deleted_state = old_doc.copy()
    if 'base' not in deleted_state:
        deleted_state['base'] = {}
    deleted_state['base']['isDeleted'] = True
    deleted_state['base']['updatedAt'] = now
    deleted_state['base']['updatedBy'] = request.user_full_name
    
    # Log history BEFORE deletion (save full entity snapshot to archive)
    try:
        log_history('contact', id, 'DELETE', request.user_full_name, old_doc, deleted_state, {'action': 'HARD_DELETE', 'base': {'isDeleted': True}})
        logger.action("Delete", "Contact", id, request.user_id)
    except:
        pass  # Don't fail request if logging fails
    
    # Hard delete - actually remove the document
    try:
        result = mongo.db.contacts.delete_one({'_id': id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete contact"}), 500
    except _OperationCancelled:
        # Check if the delete was applied despite the cancellation
        if not mongo.db.contacts.find_one({'_id': id}):
            logger.warning(f"Contact {id} deleted despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if delete didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    return jsonify({"message": "Deleted"}), 200

