from flask import Blueprint, request, jsonify
from database import mongo
from models.auth_model import LoginModel
import bcrypt

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def serialize_user(doc):
    """Serialize user document, removing sensitive fields"""
    if not doc:
        return None
    user = {
        'id': doc['_id'],
        'fullName': doc.get('fullName'),
        'username': doc.get('username'),
        'role': doc.get('role'),
        'color': doc.get('color'),
        'profileImage': doc.get('profileImage'),
        'base': doc.get('base')
    }
    return user

@bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint - validates user credentials
    
    Request body:
    {
        "username": "string",
        "password": "string"
    }
    
    Returns:
    - 200: User data (without passwordHash)
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
        
        # Return user data (without sensitive fields)
        return jsonify({
            "message": "Login successful",
            "user": serialize_user(user)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/me', methods=['GET'])
def get_current_user():
    """
    Get current user - requires user ID in header (simple auth)
    
    Headers:
    - X-User-Id: user's ID
    
    For production, use JWT token instead
    """
    user_id = request.headers.get('X-User-Id')
    
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    
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
    For session-based auth, this would clear the session
    For JWT, the client simply discards the token
    """
    return jsonify({"message": "Logout successful"}), 200
