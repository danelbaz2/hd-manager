# Backend Documentation

Flask API server with WebSocket support for real-time updates.

---

## 📁 Structure

```
backend/
├── app.py              # Main Flask application & entry point
├── database.py         # MongoDB connection (PyMongo)
├── routes/             # API endpoints (Blueprints)
├── models/             # Data models & validation
├── schemas/            # JSON schemas
├── utils/              # Helper utilities
├── middleware/         # Request middleware
├── websocket/          # Real-time socket handling
├── _seed_data/         # Sample data generators
└── uploads/            # User uploaded files
```

---

## 🛤️ API Routes

| Route                     | Description                  |
| ------------------------- | ---------------------------- |
| `/api/auth`               | Login, logout, session check |
| `/api/tasks`              | Task CRUD operations         |
| `/api/users`              | User management              |
| `/api/contacts`           | Contact management           |
| `/api/primary-tags`       | Primary tag management       |
| `/api/secondary-tags`     | Secondary tag management     |
| `/api/chat-messages`      | Task chat messages           |
| `/api/history-entries`    | Entity change history        |
| `/api/military-hierarchy` | Organizational structure     |
| `/api/uploads`            | File upload handling         |
| `/api/logs`               | Runtime log control          |

---

## 📦 Models

| Model           | Purpose                         |
| --------------- | ------------------------------- |
| `user_model`    | System users & authentication   |
| `task_model`    | Tasks with status & assignments |
| `contact_model` | External contacts with tags     |
| `primary_tag`   | Main category tags              |
| `secondary_tag` | Sub-category tags               |
| `history_entry` | Audit trail for changes         |
| `chat_message`  | Task-related messages           |

---

## 🔌 WebSocket Events

Real-time updates via Socket.IO:

| Event          | Direction | Description          |
| -------------- | --------- | -------------------- |
| `connect`      | Client→   | Client connects      |
| `authenticate` | Client→   | User identifies      |
| `join_updates` | Client→   | Subscribe to updates |
| `task_update`  | →Client   | Task changed         |
| `user_update`  | →Client   | User changed         |
| `chat_update`  | →Client   | New chat message     |

---

## 🔧 Key Utilities

| File               | Purpose                       |
| ------------------ | ----------------------------- |
| `jwt_utils.py`     | JWT token handling (HttpOnly) |
| `history.py`       | Change tracking & logging     |
| `logger.py`        | Configured logging            |
| `db_indexes.py`    | MongoDB index management      |
| `profile_image.py` | User avatar generation        |

---

## 🚀 Running

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Server starts at `http://localhost:5000`

---

## 🌱 Seeding Data

```bash
python seed.py                    # Seed all test data
python seed_military_hierarchy.py # Seed org structure only
```
