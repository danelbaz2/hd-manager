from gevent import monkey
monkey.patch_all()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import logging
from dotenv import load_dotenv

from database import mongo

load_dotenv()

# Initialize Flask to serve frontend build
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')

# Hide basic request logs by default (clean terminal)
# Configure logging based on environment
log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
# Werkzeug logs are always suppressed - we use our own request logger
logging.getLogger('werkzeug').setLevel(logging.ERROR)

# Initialize our custom request logger
# This provides clean, human-readable API request logs
# LOG_REQUESTS controls the initial state (on/off), but can be toggled at runtime
from middleware.request_logger import init_request_logger, set_request_logging_enabled
from utils.logger import logger as app_logger

# Set initial state from env var (default: off, can be toggled at runtime)
initial_log_requests = os.getenv('LOG_REQUESTS', 'false').lower() == 'true'
set_request_logging_enabled(initial_log_requests)

# Parse CORS origins - handle wildcard specially
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
if cors_origins_env == "*":
    cors_origins = "*"  # Wildcard - allow all origins
else:
    cors_origins = cors_origins_env.split(",")  # List of specific origins

CORS(app, origins=cors_origins, supports_credentials=True)

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/hd_manager")

# SECURITY: SECRET_KEY is REQUIRED - no fallback to prevent insecure defaults
flask_secret = os.environ.get("SECRET_KEY")
if not flask_secret:
    raise RuntimeError(
        "CRITICAL: SECRET_KEY environment variable is not set! "
        "Set it in your .env file or environment before running the application."
    )
app.config["SECRET_KEY"] = flask_secret
mongo.init_app(app)

# Initialize SocketIO with proper CORS
socketio = SocketIO(app, cors_allowed_origins=cors_origins)

# Import routes after app initialization to avoid circular imports
from routes import tasks, users, contacts, history_entries, chat_messages, auth, primary_tags, secondary_tags, uploads, logs, military_hierarchy, health

app.register_blueprint(tasks.bp)
app.register_blueprint(users.bp)
app.register_blueprint(primary_tags.bp)
app.register_blueprint(secondary_tags.bp)
app.register_blueprint(contacts.bp)
app.register_blueprint(history_entries.bp)
app.register_blueprint(chat_messages.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(uploads.bp)
app.register_blueprint(logs.bp)
app.register_blueprint(military_hierarchy.bp)
app.register_blueprint(health.bp)

# Register SocketIO events (new modular socket system)
from websocket import register_socket_events
register_socket_events(socketio)

# Always initialize request logger middleware (state is controlled by the toggle)
init_request_logger(app, app_logger)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    from utils.logging_utils import setup_access_logging
    
    # Setup access logging (configures gevent.access logger)
    setup_access_logging()
    
    # Determine if we should run startup tasks
    # In debug mode: only run in the reloader process (WERKZEUG_RUN_MAIN=true)
    # In production: always run (no reloader)
    is_debug = os.getenv("DEBUG", "False").lower() == "true"
    is_reloader = os.environ.get('WERKZEUG_RUN_MAIN') == 'true'
    should_run_startup = is_reloader or not is_debug
    
    if should_run_startup:
        from utils.db_indexes import ensure_indexes
        from utils.startup_banner import print_banner
        from routes.health import check_database_connection, start_db_monitor
        
        # Display current configuration
        app_logger.info(f"[CONFIG] Log level: {log_level}")
        app_logger.info(f"[CONFIG] Request logging: {'ON' if initial_log_requests else 'OFF'}")

        # Verify database connection on startup
        with app.app_context():
            if check_database_connection():
                app_logger.info("[DATABASE] MongoDB connected successfully")
                ensure_indexes(mongo.db)
            else:
                app_logger.error("[DATABASE] MongoDB connection FAILED - Check MONGO_URI configuration")
        
        # Start background database connection monitor
        start_db_monitor(app)
        
        # Startup complete - show ready status
        app_logger.warning("[STARTUP] All checks complete - App is ready")
        
        print_banner()
    
    # Note: Don't pass 'log' parameter - it conflicts with newer gevent/Flask-SocketIO
    # The logging is handled via the gevent.access logger configured above
    # host='0.0.0.0' is required for Docker to accept external connections
    ssl_cert_path = os.getenv("SSL_CERT_PATH")
    ssl_key_path = os.getenv("SSL_KEY_PATH")
    
    run_kwargs = {
        "host": '0.0.0.0',
        "debug": os.getenv("DEBUG", "False").lower() == "true",
        "port": int(os.getenv("PORT", 5000))
    }
    
    if ssl_cert_path and ssl_key_path:
        if os.path.exists(ssl_cert_path) and os.path.exists(ssl_key_path):
            print(f" * Starting with SSL: {ssl_cert_path}")
            run_kwargs["certfile"] = ssl_cert_path
            run_kwargs["keyfile"] = ssl_key_path
        else:
            print(f" ! SSL certs not found at {ssl_cert_path} or {ssl_key_path}, starting HTTP only")
    
    # Handle graceful shutdown for faster dev loop (Ctrl+C)
    import signal
    import os
    
    def signal_handler(sig, frame):
        print('\n🛑 Stopping server immediately (forced)...', flush=True)
        os._exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    socketio.run(app, **run_kwargs)
