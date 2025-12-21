"""
JWT Utility functions for token generation and validation
"""
import jwt
import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

# Get JWT configuration from environment
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-secret-change-in-production')
JWT_EXPIRATION_DAYS = int(os.getenv('JWT_EXPIRATION_DAYS', 7))
JWT_ALGORITHM = 'HS256'


from database import mongo

def generate_token(user_id: str, username: str, full_name: str = None, role: str = 'regular') -> str:
    """
    Generate a JWT token for a user
    
    Args:
        user_id: The user's unique ID
        username: The user's username
        full_name: The user's full name
        role: The user's role (default: 'regular')
    
    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'username': username,
        'fullName': full_name,
        'role': role,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> dict | None:
    """
    Decode and validate a JWT token
    
    Args:
        token: The JWT token string
    
    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token


def get_token_from_header() -> str | None:
    """
    Extract token from Authorization header
    
    Expected format: "Bearer <token>"
    
    Returns:
        Token string or None
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]


def jwt_required(f):
    """
    Decorator to protect routes with JWT authentication
    
    Usage:
        @bp.route('/protected')
        @jwt_required
        def protected_route():
            # Access user info via request.user_id, request.username, request.role
            pass
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        
        payload = decode_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request object for use in route
        request.user_id = payload.get('user_id')
        request.username = payload.get('username')
        request.role = payload.get('role')
        request.user_full_name = payload.get('fullName')

        # If fullName is missing in token (legacy token), fetch from DB
        if not request.user_full_name and request.user_id:
            try:
                user = mongo.db.users.find_one({'_id': request.user_id})
                if user:
                    request.user_full_name = user.get('fullName')
            except Exception:
                pass # Fallback to None or username if DB fails
        
        # Fallback if still no full name
        if not request.user_full_name:
            request.user_full_name = request.username

        return f(*args, **kwargs)
    
    return decorated_function
