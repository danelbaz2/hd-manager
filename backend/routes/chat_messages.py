from flask import Blueprint, request, jsonify
from database import mongo
from models.chat_message_model import ChatMessageModel
from datetime import datetime
from bson.objectid import ObjectId

bp = Blueprint('chat_messages', __name__, url_prefix='/api/chat')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
def get_messages():
    # Sort by createdAt ascending (chronological) per SRS note "continuous stream"
    messages = list(mongo.db.ents.find({'base.entityType': 'chat_message', 'base.isDeleted': {'$ne': True}}).sort('base.createdAt', 1)) 
    return jsonify([serialize_doc(m) for m in messages])

@bp.route('/', methods=['POST'])
def create_message():
    try:
        data = ChatMessageModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    

    # SRS specified ms timestamp for chat
    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'createdAt': now,
        'updatedAt': now,
        'lut': now,
        'entityType': 'chat_message'
    }
    data['_id'] = str(ObjectId())
    mongo.db.ents.insert_one(data)
    return jsonify(serialize_doc(data)), 201
