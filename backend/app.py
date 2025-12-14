from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from dotenv import load_dotenv

from database import mongo

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/hd_manager")
mongo.init_app(app)

# Import routes after app initialization to avoid circular imports
from routes import missions, users, tags, system_contacts, history_entries, chat_messages

app.register_blueprint(missions.bp)
app.register_blueprint(users.bp)
app.register_blueprint(tags.bp)
app.register_blueprint(system_contacts.bp)
app.register_blueprint(history_entries.bp)
app.register_blueprint(chat_messages.bp)

@app.route('/')
def hello():
    return "HD Manager API Running"

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
