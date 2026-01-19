# HD-Manager

**מערכת ניהול משימות ואנשי קשר** - Task & Contact Management System

A full-stack web application for managing tasks, contacts, and military organizational hierarchy with real-time updates.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **MongoDB** 6.0+

### Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd hd-manager

# 2. Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env    # Configure your environment

# 3. Frontend setup
cd ../frontend
npm install

# 4. Start MongoDB (must be running)

# 5. Start development servers
# Terminal 1 - Backend:
cd backend && python app.py

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

**Access the app:** http://localhost:5173

---

## 📁 Project Structure

```
hd-manager/
├── backend/          # Flask API server
├── frontend/         # React + TypeScript UI
├── docker/           # Docker deployment files
└── docs/             # Documentation
    ├── BACKEND.md
    ├── FRONTEND.md
    └── DEPLOYMENT.md
```

---

## 🔧 Tech Stack

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Frontend  | React, TypeScript, Vite       |
| Backend   | Flask, Flask-SocketIO, Gevent |
| Database  | MongoDB                       |
| Real-time | WebSocket (Socket.IO)         |
| Auth      | JWT (HttpOnly cookies)        |

---

## 📚 Documentation

- **[Backend](docs/BACKEND.md)** - API routes, models, and utilities
- **[Frontend](docs/FRONTEND.md)** - Components, pages, and state management
- **[Deployment](docs/DEPLOYMENT.md)** - Docker setup and production config

---

## 🔑 Key Features

- **Task Management** - Create, update, archive tasks with history tracking
- **Contact Management** - Manage contacts with tagging system
- **Military Hierarchy** - Organizational structure (Pikud → Ugda → Hativa)
- **Real-time Updates** - Live sync across all connected clients
- **User Management** - Role-based access with secure authentication
- **Chat** - Real-time messaging per task

---

## ⚙️ Environment Variables

Create `.env` files in both `backend/` and root directory. See `.env.example` for required variables.

**Required:**

- `SECRET_KEY` - JWT signing key (required)
- `MONGO_URI` - MongoDB connection string

---

## 📄 License

Private project - All rights reserved.
