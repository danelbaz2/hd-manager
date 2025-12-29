from flask import Blueprint
import logging
import os

bp = Blueprint("admin_logging", __name__, url_prefix="/api/logger")

@bp.route('/<level>/<api_key>', methods=['GET'])
def set_log_level(level, api_key):
    """
    Dynamic log level switcher.
    Usage: GET /api/logger/[INFO|ERROR|DEBUG]/[API_KEY]
    """
    # Simple security check (use env var in production)
    admin_key = os.getenv("ADMIN_API_KEY", "IA1DE2")
    
    if api_key != admin_key:
        print(f"Unauthorized attempt to change log level with key: {api_key}", flush=True)
        return "", 401
    
    # Map string levels to logging constants
    level_map = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR
    }
    
    target_level_str = level.upper()
    if target_level_str not in level_map:
        print(f"Failed to change log level: Invalid level '{level}'", flush=True)
        return "", 400
        
    # Change the logger level
    # We update both 'werkzeug' (Flask default) and 'gevent.access' (Gevent WSGI)
    loggers_to_update = ['werkzeug', 'gevent.access']
    
    for logger_name in loggers_to_update:
        logging.getLogger(logger_name).setLevel(level_map[target_level_str])
    
    print(f"Log level changed to {target_level_str}", flush=True)
    return "", 204
