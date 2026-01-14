"""
Military Hierarchy API Routes

Provides endpoints for managing the military organizational hierarchy.
Admin users can update the hierarchy, all authenticated users can read it.
"""
from flask import Blueprint, jsonify, request
from database import mongo
from utils.jwt_utils import jwt_required, admin_required
from utils.logger import logger
from utils.history import log_history

bp = Blueprint("military_hierarchy", __name__, url_prefix="/api/military-hierarchy")


@bp.route("", methods=["GET"])
@jwt_required
def get_hierarchy():
    """
    Get the military hierarchy structure.
    
    Returns:
        200: Hierarchy data
        404: No hierarchy found (first time setup)
    """
    try:
        # Get the hierarchy document (should only be one)
        doc = mongo.db.military_hierarchy.find_one({}, {"_id": 0})
        
        if not doc or "hierarchy" not in doc:
            # Return empty hierarchy if not initialized
            logger.warning("Military hierarchy not found in database")
            return jsonify({"hierarchy": {}}), 200
        
        return jsonify(doc), 200
        
    except Exception as e:
        logger.error(f"Error fetching military hierarchy: {str(e)}")
        return jsonify({"error": "Failed to fetch hierarchy"}), 500


@bp.route("", methods=["PUT"])
@admin_required
def update_hierarchy():
    """
    Update the military hierarchy structure (Admin only).
    
    Request Body:
        {
            "hierarchy": {
                "פיקוד_name": {
                    "name": "פיקוד_name",
                    "ugdot": {
                        "ugda_id": {
                            "name": "ugda_id",
                            "hativot": {...}
                        }
                    }
                }
            }
        }
    
    Returns:
        200: Update successful
        403: User not admin
        400: Invalid data
    """
    try:
        data = request.get_json()
        if not data or "hierarchy" not in data:
            return jsonify({"error": "Invalid data: 'hierarchy' field required"}), 400
        
        hierarchy_data = data["hierarchy"]
        
        # Validate basic structure (optional - can be more thorough)
        if not isinstance(hierarchy_data, dict):
            return jsonify({"error": "Hierarchy must be an object"}), 400
        
        # Capture old state for history logging
        old_doc = mongo.db.military_hierarchy.find_one({}, {"_id": 0})
        
        # Upsert the hierarchy (replace if exists, create if not)
        result = mongo.db.military_hierarchy.update_one(
            {},  # Match any document (should only be one)
            {"$set": {"hierarchy": hierarchy_data}},
            upsert=True
        )
        
        # History logging
        action = 'CREATE' if result.upserted_id else 'UPDATE'
        new_doc = {"hierarchy": hierarchy_data}
        try:
            log_history(
                'military_hierarchy', 
                'singleton', 
                action,
                request.user_full_name,
                old_doc,
                new_doc,
                {"hierarchy": hierarchy_data}
            )
            logger.info(f"Military hierarchy {action.lower()}d by user {request.user_id}")
        except Exception as e:
            logger.error(f"Failed to log military hierarchy history: {str(e)}")
        
        return jsonify({"hierarchy": hierarchy_data}), 200
        
    except Exception as e:
        logger.error(f"Error updating military hierarchy: {str(e)}")
        return jsonify({"error": "Failed to update hierarchy"}), 500
