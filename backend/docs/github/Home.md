# HD Manager Documentation

Welcome to the HD Manager Wiki! This documentation covers the system specification and API reference.

---

## 📚 Documentation Sections

### 📘 System Specification

Technical documentation describing the HD Manager system architecture, data models, and requirements.

| Document | Description |
|----------|-------------|
| [[System Requirements Specification\|HD-Manager-SRS-Updated]] | Complete system specification (v2.0) - Data models, architecture, and requirements |
| [[SRS Change Log\|SRS-Change-Log]] | Summary of changes from original SRS to current implementation |

---

### 🔌 API Reference

REST API documentation for all endpoints.

| API | Description | Prefix |
|-----|-------------|--------|
| [[Auth API\|Auth-API]] | Authentication and login | `/api/auth` |
| [[Users API\|Users-API]] | User management | `/api/users` |
| [[Tasks API\|Tasks-API]] | Task CRUD operations | `/api/tasks` |
| [[Tags API\|Tags-API]] | Tag management | `/api/tags` |
| [[Contacts API\|Contacts-API]] | Contact management | `/api/contacts` |
| [[Chat Messages API\|ChatMessages-API]] | Internal chat | `/api/chat` |

---

## 🚀 Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS + Material-UI |
| Backend | Python + Flask |
| Database | MongoDB |
| Validation | Pydantic |

---

## 📝 Last Updated

December 2024
