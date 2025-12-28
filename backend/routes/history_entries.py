from flask import Blueprint, request, jsonify
from database import mongo
from models.history_entry_model import EntityHistoryModel
from bson.objectid import ObjectId
from datetime import datetime
from utils.jwt_utils import jwt_required

bp = Blueprint('history_entries', __name__, url_prefix='/api/history')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
@jwt_required
def get_history_entries():
    # Optional filtering by entityId
    entity_id = request.args.get('entityId')
    query = {}
    if entity_id:
        query['entityId'] = entity_id
        
    entries = list(mongo.db.history_entries.find(query).sort('timestamp', -1))
    return jsonify([serialize_doc(e) for e in entries])

@bp.route('/', methods=['POST'])
@jwt_required
def create_history_entry():
    try:
        # Validate incoming data using HistoryEntryModel
        data = EntityHistoryModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        # Return proper error message if validation fails
        return jsonify({"error": str(e)}), 400
    
    # Insert validated data into the database
    mongo.db.history_entries.insert_one(data)
    return jsonify(serialize_doc(data)), 201

# Usually history is immutable, so no update/delete routes typically exposed broadly,
# but can add if requested. For now, just Create and Read.
