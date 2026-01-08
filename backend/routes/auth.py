from flask import Blueprint, request, jsonify
from database import mongo
from models.auth_model import LoginModel
from utils.jwt_utils import generate_token, jwt_required
from utils.profile_image import get_full_profile_url

import bcrypt
from utils.logger import logger

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def serialize_user(doc):
    """Serialize user document, removing sensitive fields"""
    if not doc:
        return None
    
    # Convert relative profile image path to full URL
    profile_image = doc.get('profileImage')
    if profile_image:
        profile_image = get_full_profile_url(profile_image)
    
    user = {
        'id': doc['_id'],
        'fullName': doc.get('fullName'),
        'username': doc.get('username'),
        'role': doc.get('role'),
        'color': doc.get('color'),
        'profileImage': profile_image,
        'nickname': doc.get('nickname'),  # Optional display nickname
        'base': doc.get('base')
    }
    return user

@bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint - validates user credentials and returns JWT token
    
    Request body:
    {
        "username": "string",
        "password": "string"
    }
    
    Returns:
    - 200: User data + JWT token
    - 401: Invalid credentials
    - 400: Missing fields
    """
    try:
        # Validate request using Pydantic model
        login_data = LoginModel(**request.json)
        username = login_data.username
        password = login_data.password
        
        # Find user by username
        user = mongo.db.users.find_one({
            'username': username,
            'base.isDeleted': {'$ne': True}
        })
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Check password using bcrypt
        stored_hash = user.get('passwordHash', '')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Generate JWT token
        token = generate_token(
            user_id=user['_id'],
            username=user['username'],
            full_name=user.get('fullName'),
            role=user.get('role', 'regular')
        )
        
        # Return user data with token
        logger.action("Login", "User", user['_id'], username)
        return jsonify({
            "message": "Login successful",
            "user": serialize_user(user),
            "token": token
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user():
    """
    Get current user - requires JWT token in Authorization header
    
    Headers:
    - Authorization: Bearer <token>
    
    Returns user data if token is valid
    """
    # user_id is set by @jwt_required decorator
    user_id = request.user_id
    
    user = mongo.db.users.find_one({
        '_id': user_id,
        'base.isDeleted': {'$ne': True}
    })
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({"user": serialize_user(user)}), 200

@bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint
    For JWT, the client simply discards the token
    This endpoint exists for API consistency
    """
    return jsonify({"message": "Logout successful"}), 200

@bp.route('/verify', methods=['GET'])
@jwt_required
def verify_token():
    """
    Verify if the current token is valid
    
    Headers:
    - Authorization: Bearer <token>
    
    Returns 200 if token is valid, 401 if expired/invalid
    """
    return jsonify({
        "valid": True,
        "user_id": request.user_id,
        "username": request.username
    }), 200
