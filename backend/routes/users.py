from flask import Blueprint, request, jsonify
from database import mongo
from bson.objectid import ObjectId
from models.user_model import UserModel, UserUpdateModel
from utils.history import log_history
from utils.jwt_utils import jwt_required, admin_required, self_or_admin_required
from utils.profile_image import save_profile_image_from_base64, delete_profile_image, is_base64_image, get_full_profile_url
from utils.timestamp import get_timestamp_ms
from core.websocket import broadcast_user_update
import bcrypt
from utils.logger import logger
from utils.error_handlers import handle_client_disconnect
from middleware.idempotency import idempotency_middleware
try:
    from pymongo.errors import _OperationCancelled, DuplicateKeyError
except ImportError:
    _OperationCancelled = Exception
    DuplicateKeyError = Exception

bp = Blueprint('users', __name__, url_prefix='/api/users')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    doc.pop('passwordHash', None)  # Remove password hash from response
    # Convert relative profile image path to full URL
    if doc.get('profileImage'):
        doc['profileImage'] = get_full_profile_url(doc['profileImage'])
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_users():
    users = list(mongo.db.users.find({'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(u) for u in users])

@bp.route('/', methods=['POST'])
@admin_required
@idempotency_middleware
@handle_client_disconnect
def create_user():
    try:
        data = UserModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = get_timestamp_ms()
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

    # Ensure nickname field exists (null if not provided)
    if 'nickname' not in data:
        data['nickname'] = None

    data['_id'] = str(ObjectId())
    
    # Handle profile image - convert base64 to file
    if data.get('profileImage') and is_base64_image(data['profileImage']):
        try:
            relative_path = save_profile_image_from_base64(data['profileImage'], data['_id'])
            data['profileImage'] = relative_path
        except Exception as e:
            logger.warning(f"Failed to save profile image: {e}")
            data['profileImage'] = None
    
    try:
        mongo.db.users.insert_one(data)
    except DuplicateKeyError as e:
        # Handle duplicate username
        if 'username' in str(e):
            return jsonify({"error": f"שם המשתמש '{data.get('username')}' כבר קיים במערכת"}), 409
        return jsonify({"error": "משתמש עם פרטים זהים כבר קיים במערכת"}), 409
    except _OperationCancelled:
        # Check if the document was actually inserted despite the cancellation
        if mongo.db.users.find_one({'_id': data['_id']}):
            logger.warning(f"User {data['_id']} created despite client disconnect")
            pass  # Proceed to log history/action as if nothing happened
        else:
            raise  # Re-raise if not found
    
    # History logging and broadcast are best-effort
    try:
        log_history('user', data['_id'], 'CREATE', getattr(request, 'user_full_name', 'system'), None, data, data)
        logger.action("Create", "User", data['_id'], getattr(request, 'user_id', 'system'), f"Username: {data.get('username')}")
    except:
        pass  # Don't fail request if logging fails
    
    # Broadcast user creation to all clients
    serialized = serialize_doc(data.copy())
    try:
        broadcast_user_update('create', serialized)
    except:
        pass  # Don't fail request if broadcast fails

    return jsonify(serialized), 201

@bp.route('/<id>', methods=['PUT'])
@self_or_admin_required
@handle_client_disconnect
def update_user(id):
    try:
        validated = UserUpdateModel(**request.json)
        data = validated.model_dump(exclude_unset=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    # Fetch old document first
    old_doc = mongo.db.users.find_one({'_id': id})
    if not old_doc:
        return jsonify({"error": "User not found"}), 404
    
    now = get_timestamp_ms()
    
    # If password is being updated (and not empty), hash it
    if 'password' in data and data['password']:
        plain_password = data.pop('password')  # Remove 'password' from data
        hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
        data['passwordHash'] = hashed.decode('utf-8')  # Store as 'passwordHash'
    elif 'password' in data:
        # Empty password provided - remove from update to keep existing
        del data['password']
    
    # Handle profile image - convert base64 to file
    if data.get('profileImage') and is_base64_image(data['profileImage']):
        try:
            # Delete old profile image if exists
            old_profile = old_doc.get('profileImage')
            if old_profile and not old_profile.startswith('data:'):
                delete_profile_image(old_profile)
            
            # Save new profile image
            relative_path = save_profile_image_from_base64(data['profileImage'], id)
            data['profileImage'] = relative_path
        except Exception as e:
            logger.warning(f"Failed to save profile image: {e}")
            del data['profileImage']  # Don't update if save failed
    
    # Calculate only actual changes (compare with old document)
    changes = {}
    for key, value in data.items():
        if old_doc.get(key) != value:
            changes[key] = value
    
    # Add metadata to update payload
    update_payload = changes.copy()
    update_payload['base.updatedAt'] = now
    update_payload['base.updatedBy'] = getattr(request, 'user_full_name', 'system')
    
    try:
        mongo.db.users.update_one({'_id': id}, {'$set': update_payload})
    except DuplicateKeyError as e:
        # Handle duplicate username on update
        if 'username' in str(e):
            logger.info(f"Duplicate username attempt on update: '{data.get('username')}'")
            return jsonify({"error": f"שם המשתמש '{data.get('username')}' כבר קיים במערכת"}), 409
        logger.info(f"Duplicate user attempt on update: {str(e)[:100]}")
        return jsonify({"error": "משתמש עם פרטים זהים כבר קיים במערכת"}), 409
    except _OperationCancelled:
        # Check if the update was applied despite the cancellation
        check_doc = mongo.db.users.find_one({'_id': id})
        if check_doc and check_doc.get('base', {}).get('updatedAt') == now:
            logger.warning(f"User {id} updated despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if update didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    updated = mongo.db.users.find_one({'_id': id})
    
    # Prepare history changes (only changed fields + metadata)
    history_changes = changes.copy()
    history_changes['base'] = {
        'updatedAt': now,
        'updatedBy': getattr(request, 'user_full_name', 'system')
    }
    
    # History logging is best-effort
    try:
        log_history('user', id, 'UPDATE', getattr(request, 'user_full_name', 'system'), old_doc, updated, history_changes)
        logger.action("Update", "User", id, getattr(request, 'user_id', 'system'), f"Changed: {list(changes.keys())}")
    except:
        pass  # Don't fail request if logging fails
    
    # Broadcast user update to all clients (best-effort)
    serialized = serialize_doc(updated.copy())
    try:
        broadcast_user_update('update', serialized)
    except:
        pass  # Don't fail request if broadcast fails

    return jsonify(serialized)

@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_user(id):
    old_doc = mongo.db.users.find_one({'_id': id})
    if not old_doc:
        return jsonify({"error": "User not found"}), 404
    
    now = get_timestamp_ms()
    
    # Create a snapshot of the document as it would look after deletion (marked deleted)
    deleted_state = old_doc.copy()
    if 'base' not in deleted_state:
        deleted_state['base'] = {}
    deleted_state['base']['isDeleted'] = True
    deleted_state['base']['updatedAt'] = now
    deleted_state['base']['updatedBy'] = getattr(request, 'user_full_name', 'system')
    
    # Log history BEFORE deletion (save full entity snapshot to archive)
    try:
        # Pass deleted_state as 'new' value so 'n' field shows isDeleted=True
        log_history('user', id, 'DELETE', getattr(request, 'user_full_name', 'system'), old_doc, deleted_state, {'action': 'HARD_DELETE', 'base': {'isDeleted': True}})
        logger.action("Delete", "User", id, getattr(request, 'user_id', 'system'))
    except:
        pass  # Don't fail request if logging fails
    
    # Hard delete - actually remove the document
    try:
        result = mongo.db.users.delete_one({'_id': id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete user"}), 500
    except _OperationCancelled:
        # Check if the delete was applied despite the cancellation
        if not mongo.db.users.find_one({'_id': id}):
            logger.warning(f"User {id} deleted despite client disconnect")
            pass  # Proceed normally
        else:
            raise  # Re-raise if delete didn't apply
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    # Broadcast user deletion to all clients (best-effort)
    try:
        broadcast_user_update('delete', None, id)
    except:
        pass  # Don't fail request if broadcast fails
        
    return jsonify({"message": "Deleted"}), 200


