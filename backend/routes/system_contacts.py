from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.system_contact_model import SystemContactModel, SystemContactUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('system_contacts', __name__, url_prefix='/api/system-contacts')

def serialize_doc(doc):
    doc['id'] = doc.pop('_id')
    return doc

@bp.route('/', methods=['GET'])
def get_system_contacts():
    contacts = list(mongo.db.system_contacts.find({'base.isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(c) for c in contacts])

@bp.route('/', methods=['POST'])
def create_system_contact():
    try:
        data = SystemContactModel(**request.json).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    

    now = int(datetime.now().timestamp() * 1000)
    data['base'] = {
        'isDeleted': False,
        'isActive': True,
        'createdAt': now,
        'updatedAt': now,
        'lut': now,
        'entityType': 'system_contact'
    }
    data['_id'] = str(ObjectId())
    mongo.db.system_contacts.insert_one(data)
    
    log_history('system_contact', data['_id'], 'CREATE', 'system', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_system_contact(id):
    try:
        # Validate with SystemContactUpdateModel - only allows valid contact fields
        validated = SystemContactUpdateModel(**request.json)
        data = validated.model_dump(exclude_none=True)
        
        old_doc = mongo.db.system_contacts.find_one({'_id': id})
        
        try:
            now = int(datetime.now().timestamp() * 1000)
            data['base.updatedAt'] = now
            data['base.lut'] = now
            mongo.db.system_contacts.update_one({'_id': id}, {'$set': data})
        except:
            return jsonify({"error": "Invalid ID"}), 400
        updated = mongo.db.system_contacts.find_one({'_id': id})
        
        if old_doc and updated:
             log_history('system_contact', id, 'UPDATE', 'system', old_doc, updated, data)
             
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/<id>', methods=['DELETE'])
def delete_system_contact(id):
    query_id = int(id) if id.isdigit() else id
    try:
        old_doc = mongo.db.system_contacts.find_one({'_id': id})
        if not old_doc:
             return jsonify({"error": "Contact not found"}), 404
             
        mongo.db.system_contacts.update_one({'_id': id}, {'$set': {'base.isDeleted': True}})
        
        updated = mongo.db.system_contacts.find_one({'_id': id})
        log_history('system_contact', id, 'DELETE', 'system', old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
