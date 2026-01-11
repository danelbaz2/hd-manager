from flask import Blueprint, jsonify
import logging
import os
from utils.logger import logger
from middleware.request_logger import (
    is_request_logging_enabled,
    set_request_logging_enabled
)

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


@bp.route('/requests/<state>/<api_key>', methods=['GET'])
def toggle_request_logging(state, api_key):
    """
    Toggle API request logging on/off at runtime.
    Usage: GET /api/logger/requests/[on|off]/[API_KEY]
    
    Examples:
        curl http://localhost:5000/api/logger/requests/off/IA1DE2  # Disable request logs
        curl http://localhost:5000/api/logger/requests/on/IA1DE2   # Enable request logs
    """
    # Simple security check (use env var in production)
    admin_key = os.getenv("ADMIN_API_KEY", "IA1DE2")
    
    if api_key != admin_key:
        print(f"Unauthorized attempt to toggle request logging with key: {api_key}", flush=True)
        return "Command is not valid", 401
    
    state_lower = state.lower()
    if state_lower not in ('on', 'off'):
        print(f"Failed to toggle request logging: Invalid state '{state}'", flush=True)
        return "Command is not valid. Use 'on' or 'off'", 400
    
    # Get current state
    was_enabled = is_request_logging_enabled()
    
    # Set new state
    new_enabled = (state_lower == 'on')
    set_request_logging_enabled(new_enabled)
    
    # Build response message
    previous_state = "ON" if was_enabled else "OFF"
    new_state = "ON" if new_enabled else "OFF"
    msg = f"Request logging changed from {previous_state} to {new_state}"
    
    # Log change using logger (yellow)
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

