from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.mission_model import MissionModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('missions', __name__, url_prefix='/api/missions')

# Helper to serialize ObjectId from MongoDB to string for JSON response
# Helper to serialize ObjectId from MongoDB to string for JSON response
def serialize_doc(doc):
    doc['id'] = doc['_id']
    del doc['_id']
    return doc

@bp.route('/', methods=['GET'])
def get_missions():
    # Support filtering by date (SelectedDate in frontend)
    date_param = request.args.get('date')
    
    query = {}
    if date_param:
        # Simple Logic: Mission Date == Selected Date
        # query['date'] = date_param
        
        # Advanced Logic (if tasks span multiple days): 
        # Selected Date is between start (date) and deadline
        # This matches the "Calendar" view logic usually.
        # But per SRS "date = selectedDate", let's try strict matching first 
        # or Start Date <= Selected Date <= Deadline logic if relevant.
        # Based on "display missions by date = selectedDate", usually implies specific day view.
        # Given your seed data has simple dates, we can try strict match on start date 
        # OR "active on this date".
        # Let's assume "Active on this date".
        query = {
            '$or': [
                {'date': date_param}, # Starts on this day
                # Optional: Include ongoing tasks?
                # {'$and': [{'date': {'$lte': date_param}}, {'deadline': {'$gte': date_param}}]} 
            ]
        }
        # If strict match only requested:
        query = {'date': date_param}
    
    # Filter out deleted missions
    query['isDeleted'] = {'$ne': True}

    missions = list(mongo.db.missions.find(query))
    return jsonify([serialize_doc(m) for m in missions])

@bp.route('/', methods=['POST'])
def create_mission():
    try:
        # Validate incoming data
        data = MissionModel(**request.json).model_dump(exclude_none=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    now = datetime.now().isoformat()
    data['createdAt'] = now
    data['updatedAt'] = now
    
    
    
    data['_id'] = str(ObjectId())
    
    mongo.db.missions.insert_one(data)
    
    # Log History
    # For Create: old=None, new=data, change=data
    log_history('mission', data['_id'], 'CREATE', None, data, data)

    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_mission(id):
    try:
        # Partial update, skip Pydantic strict validation
        data = request.json
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    data['updatedAt'] = datetime.now().isoformat()
    
    # Fetch Old State
    old_doc = mongo.db.missions.find_one({'_id': id})
    if not old_doc:
        return jsonify({"error": "Mission not found"}), 404

    try:
        result = mongo.db.missions.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    if result.matched_count == 0:
        return jsonify({"error": "Mission not found"}), 404
            
    updated = mongo.db.missions.find_one({'_id': id})
    
    # Log History
    log_history('mission', id, 'UPDATE', old_doc, updated, data)
    
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
def delete_mission(id):
    try:
        old_doc = mongo.db.missions.find_one({'_id': id})
        if not old_doc:
            return jsonify({"error": "Mission not found"}), 404

        mongo.db.missions.update_one({'_id': id}, {'$set': {'isDeleted': True}})
        
        updated = mongo.db.missions.find_one({'_id': id})
        
        # Log History
        log_history('mission', id, 'DELETE', old_doc, updated, {'isDeleted': True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
            
    return jsonify({"message": "Deleted"}), 200
