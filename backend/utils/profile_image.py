"""
Profile Image Upload Utilities
Handles saving profile images to disk and returning the relative path.
"""
import os
import base64
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

# Allowed image extensions for profile pictures
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def get_profiles_folder():
    """Get or create the profiles upload folder."""
    # Check environment variable first
    upload_folder = os.environ.get('UPLOAD_FOLDER')
    if upload_folder and os.path.exists(upload_folder):
        profiles_folder = os.path.join(upload_folder, 'profiles')
    elif os.path.exists('/app/uploads'):
        # Docker environment
        profiles_folder = os.path.join('/app/uploads', 'profiles')
    else:
        # Local development: use backend/uploads
        local_uploads = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        profiles_folder = os.path.join(local_uploads, 'profiles')
    
    if not os.path.exists(profiles_folder):
        os.makedirs(profiles_folder)
    return profiles_folder


def allowed_image(filename):
    """Check if the file extension is allowed for profile images."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def save_profile_image_from_base64(base64_data: str, user_id: str) -> str:
    """
    Save a base64-encoded image to disk and return the relative path.
    
    Args:
        base64_data: Base64 encoded image data (with or without data URI prefix)
        user_id: User ID to use in the filename
        
    Returns:
        Relative path like "profiles/abc123.png"
    """
    # Parse base64 data - handle data URI format
    if ',' in base64_data:
        # Format: data:image/png;base64,iVBORw0KGgo...
        header, encoded = base64_data.split(',', 1)
        # Extract extension from header
        if 'png' in header:
            ext = 'png'
        elif 'jpeg' in header or 'jpg' in header:
            ext = 'jpg'
        elif 'gif' in header:
            ext = 'gif'
        elif 'webp' in header:
            ext = 'webp'
        else:
            ext = 'png'  # Default to png
    else:
        # Raw base64
        encoded = base64_data
        ext = 'png'
    
    # Decode the image
    try:
        image_data = base64.b64decode(encoded)
    except Exception as e:
        raise ValueError(f"Invalid base64 image data: {e}")
    
    # Generate filename using user_id for easy association
    # Use a short unique suffix to handle re-uploads
    unique_suffix = uuid.uuid4().hex[:8]
    filename = f"{user_id}_{unique_suffix}.{ext}"
    
    # Save the file
    profiles_folder = get_profiles_folder()
    file_path = os.path.join(profiles_folder, filename)
    
    with open(file_path, 'wb') as f:
        f.write(image_data)
    
    # Return relative path (without leading slash)
    return f"profiles/{filename}"


def delete_profile_image(relative_path: str) -> bool:
    """
    Delete a profile image file from disk.
    
    Args:
        relative_path: Relative path like "profiles/abc123.png"
        
    Returns:
        True if deleted, False if file didn't exist
    """
    if not relative_path:
        return False
    
    # Determine upload folder (same logic as get_profiles_folder)
    upload_folder = os.environ.get('UPLOAD_FOLDER')
    if upload_folder and os.path.exists(upload_folder):
        pass  # Use env var
    elif os.path.exists('/app/uploads'):
        upload_folder = '/app/uploads'
    else:
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    
    file_path = os.path.join(upload_folder, relative_path)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False


def is_base64_image(value: str) -> bool:
    """Check if a string is a base64-encoded image (data URI)."""
    if not value:
        return False
    return value.startswith('data:image/')


def get_full_profile_url(relative_path: str) -> str:
    """
    Convert a relative path to a full URL path for serving.
    
    Args:
        relative_path: Relative path like "profiles/abc123.png"
        
    Returns:
        Full URL path like "/api/uploads/profiles/abc123.png"
    """
    if not relative_path:
        return None
    
    # Already a full URL or data URI
    if relative_path.startswith('http') or relative_path.startswith('data:'):
        return relative_path
    
    # Already has /api/uploads/ prefix
    if relative_path.startswith('/api/uploads/'):
        return relative_path
    
    return f"/api/uploads/{relative_path}"
