"""
JWT Utility functions for token generation and validation
"""
import jwt
import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

# Get JWT configuration from environment
# SECURITY: JWT_SECRET_KEY is REQUIRED - no fallback to prevent insecure defaults
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not JWT_SECRET_KEY:
    raise RuntimeError(
        "CRITICAL: JWT_SECRET_KEY environment variable is not set! "
        "Set it in your .env file or environment before running the application."
    )
JWT_EXPIRATION_DAYS = int(os.getenv('JWT_EXPIRATION_DAYS', 24))
JWT_ALGORITHM = 'HS256'
JWT_COOKIE_NAME = 'jwt_token'  # Name of the HttpOnly cookie

# API Key for external integrations (Postman, scripts, etc.)
# Optional - if not set, only JWT authentication is available
API_KEY = os.environ.get('API_KEY')


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


def get_token_from_cookie() -> str | None:
    """
    Extract token from HttpOnly cookie
    
    Returns:
        Token string or None
    """
    return request.cookies.get(JWT_COOKIE_NAME)


def get_token() -> str | None:
    """
    Get JWT token from HttpOnly cookie.
    
    This is the secure method for browser-based applications.
    Authorization header is NOT accepted to prevent token theft/reuse.
    
    Returns:
        Token string or None
    """
    return request.cookies.get(JWT_COOKIE_NAME)


def check_api_key() -> bool:
    """
    Check if the request contains a valid API key.
    
    API key should be sent in the X-API-Key header.
    Example: X-API-Key: your-super-secret-api-key
    
    Returns:
        True if API key is valid, False otherwise
    """
    if not API_KEY:
        return False  # API key authentication is disabled
    
    provided_key = request.headers.get('X-API-Key')
    return provided_key == API_KEY


def jwt_required(f):
    """
    Decorator to protect routes with JWT authentication OR API key
    
    Supports two authentication methods:
    1. JWT token (from HttpOnly cookie) - for browser-based apps
    2. API key (from X-API-Key header) - for Postman, scripts, external tools
    
    Usage:
        @bp.route('/protected')
        @jwt_required
        def protected_route():
            # Access user info via request.user_id, request.username, request.role
            pass
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check API key first (for Postman/external tools)
        if check_api_key():
            # API key is valid - set request as system/admin user
            request.user_id = 'system'
            request.username = 'api_key'
            request.role = 'admin'
            request.user_full_name = 'API Key User'
            return f(*args, **kwargs)
        
        # Fall back to JWT authentication
        token = get_token()  # Uses cookie
        
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


def admin_required(f):
    """
    Decorator to protect routes that require admin role.
    Supports JWT authentication OR API key.
    
    Usage:
        @bp.route('/admin-only')
        @admin_required
        def admin_only_route():
            # Only admins can access this
            pass
    
    Returns:
        401 if no valid token
        403 if user is not an admin
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check API key first (API key always has admin access)
        if check_api_key():
            request.user_id = 'system'
            request.username = 'api_key'
            request.role = 'admin'
            request.user_full_name = 'API Key User'
            return f(*args, **kwargs)
        
        # Fall back to JWT authentication
        token = get_token()
        
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
                pass  # Fallback to None or username if DB fails
        
        # Fallback if still no full name
        if not request.user_full_name:
            request.user_full_name = request.username

        # Check admin role
        if request.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        return f(*args, **kwargs)
    
    return decorated_function


def self_or_admin_required(f):
    """
    Decorator to protect user update routes.
    Supports JWT authentication OR API key.
    Allows:
    - Admins to update any user
    - Regular users to only update themselves
    - API key to update any user (has admin access)
    
    Usage:
        @bp.route('/<id>', methods=['PUT'])
        @self_or_admin_required
        def update_user(id):
            # Admins can update any user
            # Regular users can only update if id == their own user_id
            pass
    
    Returns:
        401 if no valid token
        403 if regular user tries to update another user
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check API key first (API key always has admin access)
        if check_api_key():
            request.user_id = 'system'
            request.username = 'api_key'
            request.role = 'admin'
            request.user_full_name = 'API Key User'
            return f(*args, **kwargs)
        
        # Fall back to JWT authentication
        token = get_token()
        
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
                pass  # Fallback to None or username if DB fails
        
        # Fallback if still no full name
        if not request.user_full_name:
            request.user_full_name = request.username

        # Check permissions: admin can do anything, regular users can only update themselves
        if request.role != 'admin':
            # Get the user ID from the URL parameter
            target_user_id = kwargs.get('id')
            if target_user_id and target_user_id != request.user_id:
                return jsonify({'error': 'You can only update your own profile'}), 403

        return f(*args, **kwargs)
    
    return decorated_function
