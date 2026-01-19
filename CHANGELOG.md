# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-01-19

### 🎉 Initial Release

**HD-Manager** - Task & Contact Management System

#### Features

- **Task Management** - Create, update, archive tasks with full history tracking
- **Contact Management** - Manage contacts with primary and secondary tagging system
- **Military Hierarchy** - Organizational structure management (Pikud → Ugda → Hativa)
- **User Management** - Role-based user administration with secure authentication
- **Real-time Updates** - WebSocket-based live sync across all connected clients
- **Task Chat** - Real-time messaging per task
- **History Tracking** - Full audit trail for all entity changes
- **File Uploads** - Support for profile pictures and attachments

#### Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Flask, Flask-SocketIO, Gevent
- **Database:** MongoDB
- **Auth:** JWT with HttpOnly cookies
- **Deployment:** Docker with nginx reverse proxy
