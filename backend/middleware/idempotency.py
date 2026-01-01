"""
Idempotency Middleware

Prevents duplicate operations by tracking Idempotency-Key headers.
If a request with the same key is received:
1. If processing: Return 409 (Conflict) or wait (optional)
2. If completed: Return the cached response
3. If timeout/failed without cache: Allow retry

Storage: MongoDB 'idempotency_keys' collection.
TTL: Keys expire after 24 hours.
"""

from functools import wraps
from flask import request, jsonify, make_response
from database import mongo
from datetime import datetime, timedelta
import json
from utils.logger import logger

def idempotency_middleware(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 1. Check for Idempotency-Key header
        key = request.headers.get('Idempotency-Key')
        if not key:
            return f(*args, **kwargs)

        # 2. Check DB for existing key
        coll = mongo.db.idempotency_keys
        entry = coll.find_one({'_id': key})

        if entry:
            # Request was already processed or is in progress
            if entry['status'] == 'completed':
                logger.debug(f"[Idempotency] returning cached response for {key}")
                
                # Reconstruct response
                response_data = entry['response']
                status_code = entry['status_code']
                return make_response(jsonify(response_data), status_code)
            
            elif entry['status'] == 'in_progress':
                # Check if it's stale (e.g. server crashed processing it)
                # Assume 1 minute timeout for stale requests
                started_at = entry.get('createdAt', 0)
                if datetime.now().timestamp() * 1000 - started_at > 60000:
                    logger.warning(f"[Idempotency] Stale in-progress key {key}. Allowing retry.")
                    # Allow validation/processing to restart
                    pass
                else:
                    return jsonify({"error": "Request already in progress"}), 409

        # 3. Mark as in-progress
        now = int(datetime.now().timestamp() * 1000)
        user = getattr(request, 'user_full_name', 'system')
        
        try:
            # Use upsert to handle race conditions safely
            coll.update_one(
                {'_id': key},
                {'$set': {
                    'status': 'in_progress',
                    'createdAt': now,
                    'user': user,
                    'path': request.path,
                    'method': request.method
                }},
                upsert=True
            )
        except Exception as e:
            # If update fails (rare), just proceed
            logger.error(f"[Idempotency] Failed to save key: {e}")

        # 4. Process the request
        try:
            response = f(*args, **kwargs)
            
            # Response handling logic for Flask return values
            # Usually it's (response_body, status_code) or just response_body
            if isinstance(response, tuple):
                resp_obj, status_code = response
            else:
                resp_obj = response
                status_code = 200 # Default if not specified, though Flask Response objects usually have status

            # Normalize response data for cache
            # If resp_obj is a Flask Response, we need to extract data
            if hasattr(resp_obj, 'get_json'):
                try:
                    data = resp_obj.get_json()
                except:
                    data = {} # Could not parse JSON
            else:
                # Assume it's dict/list since we wrap with jsonify later or it came from jsonify
                # But decorated function might return jsonify object
                try:
                    data = resp_obj.get_json()
                except:
                    data = str(resp_obj) # Fallback

            # 5. Save success result
            if 200 <= status_code < 300:
                coll.update_one(
                    {'_id': key},
                    {'$set': {
                        'status': 'completed',
                        'response': data,
                        'status_code': status_code,
                        'completedAt': int(datetime.now().timestamp() * 1000)
                    }}
                )
            else:
                # If failed (4xx, 5xx), remove key so it can be retried
                coll.delete_one({'_id': key})

            return response

        except Exception as e:
            # On exception, remove key to allow retry
            coll.delete_one({'_id': key})
            raise e

    return decorated_function
