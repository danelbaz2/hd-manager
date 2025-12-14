from database import mongo
from datetime import datetime
from bson.objectid import ObjectId

def log_history(entity_type, entity_id, action, old_val=None, new_val=None, change_val=None, user_id=None):
    """
    Logs a history entry.
    
    If action is CREATE: old_val is None, new_val is the object, change_val is the object.
    If action is UPDATE: old_val is full obj before, new_val is full obj after, change_val is the diff.
    """
    
    # helper to clean ObjectId from dicts before saving to history (as sub-documents)
    def clean_doc(doc):
        if not doc: return None
        d = doc.copy()
        if '_id' in d:
             d['id'] = str(d.pop('_id'))
        return d

    entry = {
        "actionType": action,
        "timestamp": datetime.now().isoformat(),
        "performedByUserId": user_id, # Placeholder, passed from route if available
        "oldValue": clean_doc(old_val),
        "newValue": clean_doc(new_val),
        "changeValue": clean_doc(change_val),
        "details": f"{action} operation on {entity_type}"
    }

    # Upsert: Find history doc for this entity, create if missing, push entry
    mongo.db.history_entries.update_one(
        {"entityId": str(entity_id), "entityType": entity_type},
        {
            "$push": {"entries": entry},
            "$setOnInsert": {"entityId": str(entity_id), "entityType": entity_type}
        },
        upsert=True
    )
