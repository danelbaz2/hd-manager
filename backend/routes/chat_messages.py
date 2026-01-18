from flask import Blueprint, request, jsonify
from database import mongo
from models.chat_message_model import ChatMessageModel
from bson.objectid import ObjectId
from utils.jwt_utils import jwt_required, admin_required
from utils.history import log_history
from utils.timestamp import get_timestamp_ms
from websocket import broadcast_chat_update
from utils.error_handlers import handle_client_disconnect

bp = Blueprint('chat_messages', __name__, url_prefix='/api/chat')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_messages():
    # Sort by createdAt ascending (chronological) per SRS note "continuous stream"
    messages = list(mongo.db.ents.find({'base.entityType': 'chat_message', 'base.isDeleted': {'$ne': True}}).sort('base.createdAt', 1)) 
    return jsonify([serialize_doc(m) for m in messages])

@bp.route('/', methods=['POST'])
@jwt_required  # All authenticated users can post team updates
@handle_client_disconnect
def create_message():
    try:
        data = ChatMessageModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = get_timestamp_ms()
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'entityType': 'chat_message',
        'createdBy': getattr(request, 'user_full_name', 'system'),
        'updatedBy': getattr(request, 'user_full_name', 'system')
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    
    # History logging is best-effort
    try:
        log_history('chat_message', data['_id'], 'CREATE', request.user_full_name, None, data, data)
    except:
        pass  # Don't fail request if logging fails
    
    # Broadcast to all connected clients for real-time updates
    result = serialize_doc(data.copy())
    broadcast_chat_update(result)
    
    return jsonify(result), 201

