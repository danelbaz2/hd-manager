# HD Manager

**HD Manager** is a comprehensive task and contact management system built for the HD team. It provides a modern, intuitive interface for managing tasks, users, contacts, tags, and team communication.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.9+-green)
![Node](https://img.shields.io/badge/node-18+-green)
![React](https://img.shields.io/badge/react-19.2-blue)
![Flask](https://img.shields.io/badge/flask-latest-lightgrey)

---

## 🌟 Features

- ✅ **Task Management** - Create, update, track, and prioritize tasks
- ✅ **Kanban Board** - Drag-and-drop interface for task status management
- ✅ **User Management** - Multi-user support with role-based access (admin/regular)
- ✅ **Contact Management** - Organize persons and companies
- ✅ **Tag System** - Categorize tasks and contacts with colored tags
- ✅ **Change History** - Complete audit trail of all modifications
- ✅ **Team Chat** - Built-in communication interface
- ✅ **Dark Mode** - Full theme support throughout the app
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Type Safety** - Full TypeScript on frontend, Pydantic on backend

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher  
- **MongoDB** 5.0 or higher
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows
.venv\Scripts\activate

# On macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
# MONGO_URI=mongodb://localhost:27017/hd_manager
# PORT=5000

# Seed database with sample data (optional)
python seed.py

# Start the server
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📁 Project Structure

```
hd-manager/
├── backend/                 # Flask backend
│   ├── models/              # Pydantic data models
│   ├── routes/              # API endpoints
│   ├── schemas/             # JSON schema examples
│   ├── utils/               # Utility functions
│   ├── app.py               # Flask app initialization
│   ├── database.py          # MongoDB connection
│   ├── seed.py              # Database seeding
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── api/             # API client layer
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── schemas/         # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
├── ARCHITECTURE.md          # Detailed architecture docs
├── CHANGELOG.md             # Version history and changes
└── README.md                # This file
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask
- **Database**: MongoDB with PyMongo
- **Validation**: Pydantic v2 (strict mode)
- **Authentication**: bcrypt
- **CORS**: Flask-CORS

### Frontend
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Routing**: React Router DOM 7.10
- **Styling**: TailwindCSS 4.1
- **Icons**: Lucide React
- **State**: React Context API

---

## 📚 Documentation

**All documentation is organized in the [`docs/`](./docs/) folder**

### 🗂️ Documentation Hub

- **[📖 Documentation Index](./docs/README.md)** - Complete navigation guide

### Quick Links by Category

#### 📖 Wiki Documentation (General & Architecture)
- **[⚡ Quick Reference](./docs/wiki/overview/QUICK_REFERENCE.md)** - 5-minute overview
- **[🏗️ Architecture](./docs/wiki/architecture/ARCHITECTURE.md)** - Complete technical architecture
- **[🔌 API Reference](./docs/wiki/api/API_DOCUMENTATION.md)** - Complete REST API guide
- **[📜 Changelog](./docs/wiki/changes/versions/CHANGELOG.md)** - Version history (v1.0 → v2.0)
- **[📊 Code Review](./docs/wiki/changes/reviews/2025-12-18-v2.0.0-review.md)** - Comprehensive review

#### 🔧 Backend Documentation
- **[Backend Guide](./docs/backend/README.md)** - Backend architecture & setup
- **[Individual API Docs](./docs/backend/api/)** - Detailed endpoint documentation
- **[System Specifications](./docs/backend/system-specification/)** - Requirements & specs

#### ⚡ Frontend Documentation
- **[Frontend Guide](./docs/frontend/README.md)** - Frontend architecture & setup

### 📂 Documentation Structure

```
docs/
├── README.md              # Main documentation index
├── wiki/                  # Project wiki & general docs
│   ├── overview/          # Quick access & summaries
│   ├── architecture/      # Technical design
│   ├── api/               # Complete API reference
│   └── changes/           # Version history & reviews
├── backend/               # Backend-specific docs
│   ├── api/               # Individual API endpoints
│   ├── system-specification/
│   └── github/            # GitHub wiki pages
└── frontend/              # Frontend-specific docs
```

---

## 🔑 Key Concepts

### Task Statuses
- **pending** (פתוח) - New/open task
- **in_progress** (בטיפול) - Currently being worked on
- **completed** (סגור) - Finished
- **cancelled** (מבוטל) - Cancelled

### Task Priorities
- **low** - Low priority
- **medium** - Medium priority (default)
- **high** - High priority

### User Roles
- **regular** - Standard user with basic permissions
- **admin** - Administrator with full access

### Entity Management
- All entities use **soft delete** (not physically removed)
- Complete **change history** tracked for auditing
- **Strict validation** prevents invalid data

---

## 🧪 Development

### Backend Commands

```bash
# Run development server
python app.py

# Seed database (with --clean to clear first)
python seed.py
python seed.py --clean

# Run linter (if configured)
pylint models routes utils
```

### Frontend Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📦 Database Schema

All entities are stored in a single MongoDB collection (`ents`) with a common structure:

```json
{
  "_id": "unique-id",
  "base": {
    "entityType": "task | user | tag | contact | chat_message",
    "isDeleted": false,
    "isActive": true,
    "createdAt": 1702901234000,
    "updatedAt": 1702901234000,
    "lut": 1702901234000
  },
  // ... entity-specific fields
}
```

Change history is stored in `ents_archive` collection:

```json
{
  "o": { /* old state */ },
  "c": { /* changes + metadata */ },
  "n": { /* new state */ }
}
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/hd_manager

# Server port
PORT=5000
```

---

## 🎨 API Examples

### Create a Task

```bash
POST /api/tasks/
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the project",
  "status": "pending",
  "priority": "high",
  "responsibleUsersId": ["user-id-123"],
  "tagsId": ["tag-id-456"],
  "date": 1702901234000,
  "deadline": 1703001234000
}
```

### Update Task Status

```bash
PUT /api/tasks/{task-id}
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Get Tasks by Date Range

```bash
GET /api/tasks/?startDate=1702901234000&endDate=1703001234000
```

---

## 🆕 What's New in v2.0.0

### Major Changes
- ✨ **Task Priority System** - Added priority field with low/medium/high values
- ♻️ **Frontend Modularization** - Complete restructuring with barrel exports
- 🔒 **Strict Validation** - Pydantic `extra='forbid'` on all models
- 🗑️ **Reusable Delete Modal** - Extracted into shared component
- 🐛 **Kanban Board Fixes** - Corrected drag-and-drop task ID transfer

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

---

## 📖 Code Quality

### Backend Standards
✅ All models use Pydantic with strict validation  
✅ Consistent error handling and status codes  
✅ Complete change history logging  
✅ Soft delete pattern for all entities  
✅ Blueprint-based route organization  

### Frontend Standards
✅ TypeScript strict mode  
✅ Consistent barrel export pattern  
✅ Type-safe API layer  
✅ Component-based architecture  
✅ Dark mode support  
✅ Responsive design  

---

## 🧭 Future Roadmap

### v2.1.0 (Planned)
- [ ] Comprehensive test coverage (pytest + Vitest)
- [ ] Real-time updates with WebSockets
- [ ] File upload support
- [ ] Advanced filtering and search

### v3.0.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Analytics dashboard
- [ ] Multi-language support (i18n)

---

## 🤝 Contributing

This is an internal project for the HD team. For questions or contributions:

1. Follow the existing code patterns
2. Maintain type safety
3. Write clear commit messages (conventional commits)
4. Update documentation when adding features

---

## 📄 License

Internal project for HD Team - All rights reserved

---

## 👥 Team

Developed by the HD Development Team

For support or questions, contact the development team.

---

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ by the HD Team**
