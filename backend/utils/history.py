from database import mongo
from datetime import datetime
from bson.objectid import ObjectId

def log_history(entity_type, entity_id, action, user_id='system', old_val=None, new_val=None, change_val=None):
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
            d['id'] = d.pop('_id')
        return d

    # Helper to convert dot notation keys to nested dicts
    # e.g., {'base.updatedAt': 123} -> {'base': {'updatedAt': 123}}
    def unflatten_doc(doc):
        if not doc:
            return None
        result = {}
        for key, value in doc.items():
            if '.' in key:
                parts = key.split('.')
                current = result
                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                current[parts[-1]] = value
            else:
                result[key] = value
        return result

    now = int(datetime.now().timestamp() * 1000)
    
    # c includes the changes performed and metadata about who/when/what action
    # Unflatten to convert 'base.updatedAt' to nested {'base': {'updatedAt': ...}}
    change_data = unflatten_doc(clean_doc(change_val)) or {}
    change_data['action'] = action
    change_data['timestamp'] = now
    
    entry = {
        "o": clean_doc(old_val),      # Old: entity before changes
        "c": change_data,              # Change: what changed + who performed it
        "n": clean_doc(new_val)        # New: entity after changes
    }

    mongo.db.ents_archive.insert_one(entry)
