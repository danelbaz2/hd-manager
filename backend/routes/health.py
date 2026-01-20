"""
Health check routes and database connection monitoring.

Simple behavior:
- Check DB every 5 seconds
- If disconnected: show ERROR immediately, repeat every 5 seconds
- If reconnected: show INFO, continue normally
"""
from flask import Blueprint, jsonify
from database import mongo
from utils.logger import logger
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
import threading
import time
import os

bp = Blueprint("health", __name__, url_prefix="/api")

# State tracking
_was_connected = True
_monitor_thread = None
_stop_monitor = False
_health_client = None


@bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    Returns 200 if DB connected, 503 if not.
    """
    try:
        mongo.db.command('ping')
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "database": "disconnected",
            "error": _format_error(e)
        }), 503


def check_database_connection():
    """Check if database is accessible. For startup use."""
    try:
        mongo.db.command('ping')
        return True
    except:
        return False


def _format_error(error) -> str:
    """Clean error message."""
    err = str(error)
    if "name resolution" in err.lower() or "Errno -3" in err:
        return "Database server unreachable"
    elif "Connection refused" in err:
        return "MongoDB server not running"
    elif "timeout" in err.lower():
        return "Connection timeout"
    else:
        return err.split(',')[0][:80]


def _get_health_client():
    """Get dedicated health check client with 1s timeout."""
    global _health_client
    if _health_client is None:
        uri = os.getenv('MONGO_URI', 'mongodb://127.0.0.1:27017/hd_manager')
        _health_client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
    return _health_client


def _ping():
    """Ping database. Returns (connected: bool, error: str or None)."""
    try:
        _get_health_client().admin.command('ping')
        return True, None
    except Exception as e:
        return False, _format_error(e)


def _monitor_loop(app):
    """
    Background monitor loop.
    - Check every 5 seconds
    - Log ERROR if disconnected (repeats every 5s while down)
    - Log INFO when restored
    """
    global _was_connected, _stop_monitor
    
    CHECK_INTERVAL = int(os.getenv('DB_HEALTH_CHECK_INTERVAL', '5'))
    
    while not _stop_monitor:
        try:
            with app.app_context():
                connected, error = _ping()
                
                if connected:
                    if not _was_connected:
                        logger.info("[DATABASE] Connection to MongoDB \033[32mRESTORED\033[0m")
                    _was_connected = True
                else:
                    if _was_connected:
                        logger.error(f"[DATABASE] Connection to MongoDB LOST - \033[31m{error}\033[0m")
                    else:
                        logger.error(f"[DATABASE] MongoDB still disconnected - \033[31m{error}\033[0m")
                    _was_connected = False
                    
        except Exception as e:
            logger.error(f"[DATABASE] Monitor error: {e}")
        
        time.sleep(CHECK_INTERVAL)


def start_db_monitor(app):
    """Start the background database monitor."""
    global _monitor_thread, _was_connected, _stop_monitor
    
    if _monitor_thread is not None and _monitor_thread.is_alive():
        return
    
    # Check initial state
    with app.app_context():
        _was_connected, _ = _ping()
    
    _stop_monitor = False
    _monitor_thread = threading.Thread(target=_monitor_loop, args=(app,), daemon=True)
    _monitor_thread.start()
    
    interval = os.getenv('DB_HEALTH_CHECK_INTERVAL', '5')
    logger.info(f"[DATABASE] Connection monitor started (checking every {interval}s)")


def stop_db_monitor():
    """Stop the monitor."""
    global _stop_monitor
    _stop_monitor = True
