from flask import Blueprint, request, jsonify, current_app, send_from_directory
from database import mongo
from datetime import datetime
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
import os

bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_upload_folder():
    """Get or create the upload folder"""
    upload_folder = os.path.join(current_app.static_folder, 'uploads', 'task_files')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    return upload_folder

from utils.jwt_utils import jwt_required

@bp.route('/task/<task_id>', methods=['POST'])
@jwt_required
def upload_task_file(task_id):
    """
    Upload a file attachment for a task note.
    Creates a new entry in ents_archive with action 'NOTE' and file metadata.
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        note_text = request.form.get('note', '').strip()
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Seek back to start
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 10MB'}), 400
        
        # Verify task exists
        task = mongo.db.ents.find_one({'_id': task_id, 'base.entityType': 'task'})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Generate unique filename
        now = int(datetime.now().timestamp() * 1000)
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_filename = f"{task_id}_{now}.{file_ext}"
        
        # Save the file
        upload_folder = get_upload_folder()
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Create file metadata
        file_metadata = {
            'originalName': original_filename,
            'storedName': unique_filename,
            'size': file_size,
            'type': file_ext,
            'url': f'/static/uploads/task_files/{unique_filename}'
        }
        
        # Create the history entry for the note with file
        entry = {
            '_id': str(ObjectId()),
            'o': None,
            'c': {
                'action': 'NOTE',
                'timestamp': now,
                'note': note_text if note_text else f'קובץ מצורף: {original_filename}',
                'file': file_metadata,
                'base': {
                    'updatedBy': request.user_full_name
                }
            },
            'n': {
                'id': task_id,
                '_id': task_id,
                'note': note_text if note_text else f'קובץ מצורף: {original_filename}',
                'file': file_metadata,
                'base': {
                    'entityType': 'task',
                    'updatedBy': request.user_full_name
                }
            }
        }
        
        mongo.db.ents_archive.insert_one(entry)
        
        # Return the created note WITH taskId and file info for frontend
        response = {
            'id': entry['_id'],
            'taskId': task_id,
            'action': 'NOTE',
            'timestamp': now,
            'updatedBy': request.user_full_name,
            'changes': {},
            'note': note_text if note_text else f'קובץ מצורף: {original_filename}',
            'file': file_metadata
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/task/<task_id>/<filename>', methods=['GET'])
@jwt_required
def get_task_file(task_id, filename):
    """
    Serve a task file attachment.
    """
    try:
        upload_folder = get_upload_folder()
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 404


# ============================================
# General Uploads Serving (Profile Images, etc.)
# ============================================

def get_uploads_base_folder():
    """Get the base uploads folder (from environment or default)."""
    # Check environment variable first
    upload_folder = os.environ.get('UPLOAD_FOLDER')
    if upload_folder and os.path.exists(upload_folder):
        return upload_folder
    
    # For Docker: /app/uploads
    if os.path.exists('/app/uploads'):
        return '/app/uploads'
    
    # For local development: backend/uploads (relative to this file)
    local_uploads = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    if not os.path.exists(local_uploads):
        os.makedirs(local_uploads)
    return local_uploads


@bp.route('/profiles/<filename>', methods=['GET'])
def get_profile_image(filename):
    """
    Serve a profile image.
    Profile images are public - no auth required for display.
    """
    try:
        upload_folder = os.path.join(get_uploads_base_folder(), 'profiles')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404

