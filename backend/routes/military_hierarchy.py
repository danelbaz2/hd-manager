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


@bp.route("/units/<unit_type>", methods=["POST"])
@admin_required
def create_unit(unit_type):
    """
    Create a new unit in the military hierarchy (Admin only).
    
    Request Body:
        {
            "name": "unit_name",
            "pikudKey": "...",    # Required for all types except pikud
            "ugdaKey": "...",      # Required for hativa and gdud
            "hativaKey": "..."     # Required for gdud
        }
    
    Returns:
        200: Unit created successfully
        403: User not admin
        400: Invalid data
    """
    try:
        data = request.get_json()
        name = data.get("name")
        
        if not name:
            return jsonify({"error": "Unit name is required"}), 400
        
        if unit_type not in ["pikud", "ugda", "hativa", "gdud"]:
            return jsonify({"error": "Invalid unit type"}), 400
        
        # Get current hierarchy
        doc = mongo.db.military_hierarchy.find_one({}, {"_id": 0})
        hierarchy = doc.get("hierarchy", {}) if doc else {}
        old_doc = {"hierarchy": {k: v for k, v in hierarchy.items()}}
        
        # Add the new unit
        if unit_type == "pikud":
            hierarchy[name] = {"name": name, "ugdot": {}}
        elif unit_type == "ugda":
            pikud_key = data.get("pikudKey")
            if not pikud_key or pikud_key not in hierarchy:
                return jsonify({"error": "Invalid pikudKey"}), 400
            hierarchy[pikud_key]["ugdot"][name] = {"name": name, "hativot": {}}
        elif unit_type == "hativa":
            pikud_key = data.get("pikudKey")
            ugda_key = data.get("ugdaKey")
            if not pikud_key or not ugda_key or pikud_key not in hierarchy or ugda_key not in hierarchy[pikud_key]["ugdot"]:
                return jsonify({"error": "Invalid pikudKey or ugdaKey"}), 400
            hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][name] = {"name": name, "gdudim": {}}
        elif unit_type == "gdud":
            pikud_key = data.get("pikudKey")
            ugda_key = data.get("ugdaKey")
            hativa_key = data.get("hativaKey")
            if (not pikud_key or not ugda_key or not hativa_key or 
                pikud_key not in hierarchy or 
                ugda_key not in hierarchy[pikud_key]["ugdot"] or
                hativa_key not in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"]):
                return jsonify({"error": "Invalid parent keys"}), 400
            hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"][name] = {"name": name}
        
        # Update the database
        mongo.db.military_hierarchy.update_one(
            {},
            {"$set": {"hierarchy": hierarchy}},
            upsert=True
        )
        
        # History logging
        new_doc = {"hierarchy": hierarchy}
        try:
            log_history(
                'military_hierarchy', 
                'singleton', 
                'CREATE',
                request.user_full_name,
                old_doc,
                new_doc,
                {"action": "CREATE", "type": unit_type, "name": name}
            )
            logger.info(f"Military hierarchy unit created: {unit_type} '{name}' by user {request.user_id}")
        except Exception as e:
            logger.error(f"Failed to log military hierarchy creation: {str(e)}")
        
        return jsonify({"hierarchy": hierarchy}), 200
        
    except Exception as e:
        logger.error(f"Error creating hierarchy unit: {str(e)}")
        return jsonify({"error": "Failed to create unit"}), 500


@bp.route("/units/<unit_type>", methods=["DELETE"])
@admin_required
def delete_unit(unit_type):
    """
    Delete a unit from the military hierarchy (Admin only).
    
    Query Parameters:
        name: The name of the unit to delete
        pikudKey: Parent pikud (required for all types except pikud)
        ugdaKey: Parent ugda (required for hativa and gdud)
        hativaKey: Parent hativa (required for gdud)
    
    Returns:
        200: Unit deleted successfully
        403: User not admin
        400: Invalid data
    """
    try:
        name = request.args.get("name")
        pikud_key = request.args.get("pikudKey")
        ugda_key = request.args.get("ugdaKey")
        hativa_key = request.args.get("hativaKey")
        
        if not name:
            return jsonify({"error": "name parameter is required"}), 400
        
        if unit_type not in ["pikud", "ugda", "hativa", "gdud"]:
            return jsonify({"error": "Invalid unit type"}), 400
        
        # Get current hierarchy
        doc = mongo.db.military_hierarchy.find_one({}, {"_id": 0})
        hierarchy = doc.get("hierarchy", {}) if doc else {}
        old_doc = {"hierarchy": {k: v for k, v in hierarchy.items()}}
        
        # Track if unit was found and deleted
        unit_found = False
        
        # Delete the unit
        if unit_type == "pikud":
            if name in hierarchy:
                del hierarchy[name]
                unit_found = True
        elif unit_type == "ugda":
            if pikud_key and pikud_key in hierarchy and name in hierarchy[pikud_key]["ugdot"]:
                del hierarchy[pikud_key]["ugdot"][name]
                unit_found = True
        elif unit_type == "hativa":
            if (pikud_key and ugda_key and 
                pikud_key in hierarchy and ugda_key in hierarchy[pikud_key]["ugdot"] and
                name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"]):
                del hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][name]
                unit_found = True
        elif unit_type == "gdud":
            if (pikud_key and ugda_key and hativa_key and
                pikud_key in hierarchy and 
                ugda_key in hierarchy[pikud_key]["ugdot"] and
                hativa_key in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"] and
                name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"]):
                del hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"][name]
                unit_found = True
        
        # Return error if unit was not found
        if not unit_found:
            return jsonify({"error": f"Unit '{name}' not found"}), 404
        
        # Update the database
        mongo.db.military_hierarchy.update_one(
            {},
            {"$set": {"hierarchy": hierarchy}},
            upsert=True
        )
        
        # History logging - only log the specific change
        new_doc = {"hierarchy": hierarchy}
        change_data = {
            "action": "DELETE",
            "type": unit_type,
            "name": name
        }
        if pikud_key:
            change_data["pikudKey"] = pikud_key
        if ugda_key:
            change_data["ugdaKey"] = ugda_key
        if hativa_key:
            change_data["hativaKey"] = hativa_key
            
        try:
            log_history(
                'military_hierarchy', 
                'singleton', 
                'DELETE',
                request.user_full_name,
                old_doc,
                new_doc,
                change_data
            )
            logger.info(f"Military hierarchy unit deleted: {unit_type} '{name}' by user {request.user_id}")
        except Exception as e:
            logger.error(f"Failed to log military hierarchy deletion: {str(e)}")
        
        return jsonify({"hierarchy": hierarchy}), 200
        
    except Exception as e:
        logger.error(f"Error deleting hierarchy unit: {str(e)}")
        return jsonify({"error": "Failed to delete unit"}), 500


@bp.route("/units/<unit_type>", methods=["PUT"])
@admin_required
def update_unit(unit_type):
    """
    Update (rename) a unit in the military hierarchy (Admin only).
    
    Request Body:
        {
            "oldName": "current_name",
            "newName": "new_name",
            "pikudKey": "...",    # Required for all types except pikud
            "ugdaKey": "...",      # Required for hativa and gdud
            "hativaKey": "..."     # Required for gdud
        }
    
    Returns:
        200: Unit updated successfully
        403: User not admin
        400: Invalid data
        404: Unit not found
    """
    try:
        data = request.get_json()
        old_name = data.get("oldName")
        new_name = data.get("newName")
        
        if not old_name or not new_name:
            return jsonify({"error": "oldName and newName are required"}), 400
        
        if old_name == new_name:
            return jsonify({"error": "New name must be different from old name"}), 400
        
        if unit_type not in ["pikud", "ugda", "hativa", "gdud"]:
            return jsonify({"error": "Invalid unit type"}), 400
        
        pikud_key = data.get("pikudKey")
        ugda_key = data.get("ugdaKey")
        hativa_key = data.get("hativaKey")
        
        # Get current hierarchy
        doc = mongo.db.military_hierarchy.find_one({}, {"_id": 0})
        hierarchy = doc.get("hierarchy", {}) if doc else {}
        old_doc = {"hierarchy": {k: v for k, v in hierarchy.items()}}
        
        # Track if unit was found and updated
        unit_found = False
        
        # Update the unit (rename by moving to new key)
        if unit_type == "pikud":
            if old_name in hierarchy:
                if new_name in hierarchy:
                    return jsonify({"error": f"Pikud '{new_name}' already exists"}), 409
                # Move the entire pikud structure to new key
                hierarchy[new_name] = hierarchy.pop(old_name)
                hierarchy[new_name]["name"] = new_name
                unit_found = True
        elif unit_type == "ugda":
            if pikud_key and pikud_key in hierarchy and old_name in hierarchy[pikud_key]["ugdot"]:
                if new_name in hierarchy[pikud_key]["ugdot"]:
                    return jsonify({"error": f"Ugda '{new_name}' already exists in this pikud"}), 409
                # Move the ugda structure to new key
                hierarchy[pikud_key]["ugdot"][new_name] = hierarchy[pikud_key]["ugdot"].pop(old_name)
                hierarchy[pikud_key]["ugdot"][new_name]["name"] = new_name
                unit_found = True
        elif unit_type == "hativa":
            if (pikud_key and ugda_key and 
                pikud_key in hierarchy and ugda_key in hierarchy[pikud_key]["ugdot"] and
                old_name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"]):
                if new_name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"]:
                    return jsonify({"error": f"Hativa '{new_name}' already exists in this ugda"}), 409
                # Move the hativa structure to new key
                hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][new_name] = \
                    hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"].pop(old_name)
                hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][new_name]["name"] = new_name
                unit_found = True
        elif unit_type == "gdud":
            if (pikud_key and ugda_key and hativa_key and
                pikud_key in hierarchy and 
                ugda_key in hierarchy[pikud_key]["ugdot"] and
                hativa_key in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"] and
                old_name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"]):
                if new_name in hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"]:
                    return jsonify({"error": f"Gdud '{new_name}' already exists in this hativa"}), 409
                # Move the gdud structure to new key
                hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"][new_name] = \
                    hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"].pop(old_name)
                hierarchy[pikud_key]["ugdot"][ugda_key]["hativot"][hativa_key]["gdudim"][new_name]["name"] = new_name
                unit_found = True
        
        # Return error if unit was not found
        if not unit_found:
            return jsonify({"error": f"Unit '{old_name}' not found"}), 404
        
        # Update the database
        mongo.db.military_hierarchy.update_one(
            {},
            {"$set": {"hierarchy": hierarchy}},
            upsert=True
        )
        
        # History logging - only log the specific change
        new_doc = {"hierarchy": hierarchy}
        change_data = {
            "action": "UPDATE",
            "type": unit_type,
            "oldName": old_name,
            "newName": new_name
        }
        if pikud_key:
            change_data["pikudKey"] = pikud_key
        if ugda_key:
            change_data["ugdaKey"] = ugda_key
        if hativa_key:
            change_data["hativaKey"] = hativa_key
            
        try:
            log_history(
                'military_hierarchy', 
                'singleton', 
                'UPDATE',
                request.user_full_name,
                old_doc,
                new_doc,
                change_data
            )
            logger.info(f"Military hierarchy unit updated: {unit_type} '{old_name}' → '{new_name}' by user {request.user_id}")
        except Exception as e:
            logger.error(f"Failed to log military hierarchy update: {str(e)}")
        
        return jsonify({"hierarchy": hierarchy}), 200
        
    except Exception as e:
        logger.error(f"Error updating hierarchy unit: {str(e)}")
        return jsonify({"error": "Failed to update unit"}), 500
