from flask import Blueprint, jsonify
import logging
import os
from utils.logger import logger

bp = Blueprint("logs", __name__, url_prefix="/api/logger")

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
        return "Command is not valid", 401
    
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
        return "Command is not valid", 400
        
    # Get current level (from werkzeug as reference)
    current_level_int = logging.getLogger('werkzeug').getEffectiveLevel()
    current_level_str = logging.getLevelName(current_level_int)
    
    # Change the logger level
    # We update 'werkzeug' (Flask), 'gevent.access' (WSGI), and the root logger (app logs)
    # Note: logging.getLogger() returns the root logger
    root_logger = logging.getLogger()
    
    # Update specific loggers
    loggers_to_update = ['werkzeug', 'gevent.access']
    for logger_name in loggers_to_update:
        logging.getLogger(logger_name).setLevel(level_map[target_level_str])
        
    # Update root logger
    root_logger.setLevel(level_map[target_level_str])
    
    # Log change using logger (yellow)
    msg = f"Log level change from {current_level_str} to {target_level_str}"
    logger.warning(msg)

    return msg, 200

@bp.route('/test', methods=['GET'])
def test_logs():
    """
    Generate test logs of all levels to verify configuration.
    """
    logger.error("This is a PROJECT SIMULATED ERROR log (Something went wrong!)")
    logger.warning("This is a PROJECT SIMULATED WARNING log")
    logger.info("This is a PROJECT SIMULATED INFO log")
    logger.debug({"type": "debug_test", "message": "This is a simulated DEBUG log with valid JSON"})
    
    return "Logs generated. Check your backend console.", 200
