from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.system_contact_model import SystemContactModel
from bson.objectid import ObjectId
from utils.history import log_history

bp = Blueprint('system_contacts', __name__, url_prefix='/api/system-contacts')

def serialize_doc(doc):
    doc['id'] = doc['_id']
    del doc['_id']
    return doc

@bp.route('/', methods=['GET'])
def get_system_contacts():
    contacts = list(mongo.db.system_contacts.find({'isDeleted': {'$ne': True}}))
    return jsonify([serialize_doc(c) for c in contacts])

@bp.route('/', methods=['POST'])
def create_system_contact():
    try:
        data = SystemContactModel(**request.json).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    

    data['createdAt'] = datetime.now().isoformat()
    data['_id'] = str(ObjectId())
    mongo.db.system_contacts.insert_one(data)
    
    log_history('system_contact', data['_id'], 'CREATE', None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
def update_system_contact(id):
    try:
        data = request.json
        query_id = int(id) if id.isdigit() else id
        
        old_doc = mongo.db.system_contacts.find_one({'_id': id})
        
        try:
            mongo.db.system_contacts.update_one({'_id': id}, {'$set': data})
        except:
            return jsonify({"error": "Invalid ID"}), 400
        updated = mongo.db.system_contacts.find_one({'_id': id})
        
        if old_doc and updated:
             log_history('system_contact', id, 'UPDATE', old_doc, updated, data)
             
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
             
        mongo.db.system_contacts.update_one({'_id': id}, {'$set': {'isDeleted': True}})
        
        updated = mongo.db.system_contacts.find_one({'_id': id})
        log_history('system_contact', id, 'DELETE', old_doc, updated, {'isDeleted': True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
