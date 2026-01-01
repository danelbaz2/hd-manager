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

# Initialize Flask with static files support
app = Flask(__name__, static_folder='static', static_url_path='/static')

# Hide basic request logs by default (clean terminal)
logging.getLogger('werkzeug').setLevel(logging.ERROR)

CORS(app, origins=["http://localhost:5173"])

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/hd_manager")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "hd-manager-secret-key")
mongo.init_app(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173"])

# Import routes after app initialization to avoid circular imports
# Import routes after app initialization to avoid circular imports
from routes import tasks, users, contacts, history_entries, chat_messages, auth, primary_tags, secondary_tags, uploads, logs

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

# Register SocketIO events (new modular socket system)
from websocket import register_socket_events
register_socket_events(socketio)

@app.route('/')
def hello():
    return "HD Manager API Running"

if __name__ == '__main__':
    from utils.logging_utils import setup_access_logging
    
    # Get the adapter that pipes gevent logs to our controlled logger
    access_log_adapter = setup_access_logging()
    
    # Print startup banner (only in the reloader process to avoid double print)
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        from utils.startup_banner import print_banner
        print_banner()
    
    socketio.run(
        app, 
        debug=True, 
        port=int(os.getenv("PORT", 5000)),
        log=access_log_adapter
    )
