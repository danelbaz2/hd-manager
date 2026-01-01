from flask import Blueprint, request, jsonify
from database import mongo
from datetime import datetime
from models.contact_model import ContactModel, ContactUpdateModel
from bson.objectid import ObjectId
from utils.history import log_history

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
@admin_required
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
    mongo.db.contacts.insert_one(data)
    
    log_history('contact', data['_id'], 'CREATE', request.user_full_name, None, data, data)
    
    return jsonify(serialize_doc(data)), 201

@bp.route('/<id>', methods=['PUT'])
@admin_required
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
    data['base.updatedAt'] = now

    data['base.updatedBy'] = request.user_full_name
    
    try:
        mongo.db.contacts.update_one({'_id': id}, {'$set': data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    updated = mongo.db.contacts.find_one({'_id': id})
    
    log_history('contact', id, 'UPDATE', request.user_full_name, old_doc, updated, data)
             
    return jsonify(serialize_doc(updated))

@bp.route('/<id>', methods=['DELETE'])
@admin_required
@handle_client_disconnect
def delete_contact(id):
    try:
        old_doc = mongo.db.contacts.find_one({'_id': id})
        if not old_doc:
            return jsonify({"error": "Contact not found"}), 404
             
        now = int(datetime.now().timestamp() * 1000)
        mongo.db.contacts.update_one({'_id': id}, {'$set': {
            'base.isDeleted': True,
            'base.updatedAt': now,

            'base.updatedBy': request.user_full_name
        }})
        
        updated = mongo.db.contacts.find_one({'_id': id})
        log_history('contact', id, 'DELETE', request.user_full_name, old_doc, updated, {'base': {'isDeleted': True}})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Deleted"}), 200
