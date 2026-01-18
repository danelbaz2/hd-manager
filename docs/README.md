# HD Manager - Complete Documentation Index

**Documentation Hub for HD Manager Project**

**Version**: 2.2.0  
**Last Updated**: January 18, 2026

---

## 🎯 Project Overview

**HD Manager** is a comprehensive task and contact management system built for the HD team. It provides a modern, intuitive interface for managing daily operations with real-time collaboration features.

### Key Features

| Feature                    | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| 📋 **Task Management**     | Create, update, track, and prioritize tasks with full audit history |
| 🗂️ **Kanban Board**        | Drag-and-drop interface with task approval workflow                 |
| 👥 **User Management**     | Multi-user support with role-based access (admin/regular)           |
| 📇 **Contact Management**  | Organize persons and companies with tag associations                |
| 🏷️ **Two-Tier Tag System** | Primary and secondary tags for flexible categorization              |
| 💬 **Team Chat**           | Built-in real-time team communication                               |
| 🔄 **Real-time Updates**   | WebSocket-powered live synchronization across clients               |
| 🌙 **Dark Mode**           | Full theme support throughout the application                       |
| 📱 **Responsive Design**   | Works on desktop, tablet, and mobile                                |

### Technology Stack

| Layer              | Technologies                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| **Frontend**       | React 19.2, TypeScript, Vite 7.2, TailwindCSS 4.1, React Query, Socket.IO |
| **Backend**        | Python 3.9+, Flask, Pydantic v2, MongoDB, WebSocket                       |
| **Infrastructure** | Docker, Nginx, MongoDB 7.0                                                |
| **Authentication** | JWT (HttpOnly cookies), bcrypt password hashing                           |

### Recent Updates (v2.2.0)

- ✅ Docker production setup with runtime configuration
- ✅ React Query migration for efficient data caching
- ✅ Task approval workflow (pending → pending_approval → completed)
- ✅ File attachments for task notes
- ✅ Activity-based WebSocket connection management

## 📚 Documentation Organization

All documentation is organized into four main categories:

```
docs/
├── README.md (this file)          # Main documentation index
│
├── wiki/                           # 📖 Project & Wiki Documentation
│   ├── overview/                   General project information
│   ├── architecture/               Technical architecture
│   ├── api/                        Complete API reference
│   └── changes/                    Version history & reviews
│
├── backend/                        # 🔧 Backend Documentation
│   ├── README.md                   Backend architecture & setup
│   ├── api/                        Individual API endpoint docs
│   ├── system-specification/       Requirements & specifications
│   └── github/                     GitHub wiki pages
│
├── frontend/                       # ⚡ Frontend Documentation
│   └── README.md                   Frontend architecture & setup
│
../docker/                          # 🐳 Docker Deployment
├── DEPLOYMENT_GUIDE.md             Deployment instructions
├── ENVIRONMENT_VARIABLES_GUIDE.md  Environment configuration
├── docker-compose.yml              Development setup
└── docker-compose.prod.yml         Production setup
```

---

## 🚀 Quick Start

**New to the project?** Start here:

1. **[Main README](../README.md)** - Project overview and setup
2. **[Quick Reference](wiki/overview/QUICK_REFERENCE.md)** - 5-minute summary
3. Choose your path:
   - **Frontend Developer** → [Frontend Docs](frontend/README.md)
   - **Backend Developer** → [Backend Docs](backend/README.md)
   - **API Integration** → [API Docs](wiki/api/API_DOCUMENTATION.md)

---

## 📖 Wiki Documentation

**Location**: `docs/wiki/`  
**Purpose**: General project documentation, architecture, and wiki content

### Navigation

| Document                                                               | Category    | Description                   | Read Time |
| ---------------------------------------------------------------------- | ----------- | ----------------------------- | --------- |
| [Quick Reference](wiki/overview/QUICK_REFERENCE.md)                    | Overview    | 5-min summary of all changes  | 5 min     |
| [Architecture](wiki/architecture/ARCHITECTURE.md)                      | Technical   | Complete system architecture  | 30 min    |
| [API Documentation](wiki/api/API_DOCUMENTATION.md)                     | Integration | Full REST API reference       | 20 min    |
| [Changelog](wiki/changes/versions/CHANGELOG.md)                        | History     | Version history (v1.0 → v2.2) | 15 min    |
| [Production Checklist](PROD_MERGE_CHECKLIST.md)                        | DevOps      | Pre-production review items   | 10 min    |
| [Code Review Jan 2026](wiki/changes/reviews/2026-01-13-code-review.md) | History     | Latest code quality review    | 15 min    |
| [Code Review v2.1.0](wiki/changes/reviews/2025-12-22-v2.1.0-review.md) | History     | v2.1 review (JWT, Loader)     | 30 min    |
| [Code Review v2.0.0](wiki/changes/reviews/2025-12-18-v2.0.0-review.md) | History     | v2.0 review                   | 20 min    |

### Structure

```
wiki/
├── overview/                       # Quick access
│   └── QUICK_REFERENCE.md         5-minute summary
│
├── architecture/                   # Technical design
│   └── ARCHITECTURE.md            Complete architecture
│
├── api/                            # API reference
│   └── API_DOCUMENTATION.md       REST API guide (consolidated)
│
├── changes/                        # Version history
│   ├── versions/
│   │   └── CHANGELOG.md           v1.0.0 → v2.2.0
│   └── reviews/
│       ├── 2026-01-13-code-review.md     # Latest review
│       ├── 2025-12-22-v2.1.0-review.md
│       └── 2025-12-18-v2.0.0-review.md
```

**When to use**: General project information, architecture overview, complete API reference

---

## 🔧 Backend Documentation

**Location**: `docs/backend/`  
**Purpose**: Backend-specific documentation, API details, and specifications

### Main Documents

| Document                                  | Description                                     |
| ----------------------------------------- | ----------------------------------------------- |
| [Backend README](backend/README.md)       | Backend architecture, setup, and best practices |
| [API Key Guide](backend/API_KEY_GUIDE.md) | Guide for API key authentication (Postman, etc) |

### API Documentation (Individual Endpoints)

**Location**: `docs/backend/api/`

Detailed documentation for each API endpoint:

| Document                                    | Endpoint             | Description                  |
| ------------------------------------------- | -------------------- | ---------------------------- |
| [Tasks API](backend/api/Tasks-API.md)       | `/api/tasks`         | Task management endpoints    |
| [Users API](backend/api/Users-API.md)       | `/api/users`         | User management endpoints    |
| [Tags API](backend/api/Tags-API.md)         | `/api/tags`          | Tag management endpoints     |
| [Contacts API](backend/api/Contacts-API.md) | `/api/contacts`      | Contact management endpoints |
| [Chat API](backend/api/ChatMessages-API.md) | `/api/chat-messages` | Chat functionality           |
| [Auth API](backend/api/Auth-API.md)         | `/api/auth`          | Authentication endpoints     |

**Note**: For a consolidated API reference, see [Complete API Documentation](wiki/api/API_DOCUMENTATION.md)

### System Specifications

**Location**: `docs/backend/system-specification/`

| Document                                                                 | Description                       |
| ------------------------------------------------------------------------ | --------------------------------- |
| [HD Manager SRS](backend/system-specification/HD-Manager-SRS-Updated.md) | System Requirements Specification |
| [SRS Change Log](backend/system-specification/SRS-Change-Log.md)         | Requirements change history       |

### GitHub Wiki

**Location**: `docs/backend/github/`

| Document                              | Description                    |
| ------------------------------------- | ------------------------------ |
| [Home](backend/github/Home.md)        | GitHub wiki home page          |
| [Sidebar](backend/github/_Sidebar.md) | GitHub wiki sidebar navigation |

### Structure

```
backend/
├── README.md                       # Backend documentation hub
├── API_KEY_GUIDE.md                # API key authentication guide
│
├── api/                            # Individual API docs
│   ├── Tasks-API.md
│   ├── Users-API.md
│   ├── Tags-API.md
│   ├── Contacts-API.md
│   ├── ChatMessages-API.md
│   └── Auth-API.md
│
├── system-specification/           # Requirements docs
│   ├── HD-Manager-SRS-Updated.md
│   ├── HD-Manager-SRS-Updated.docx
│   ├── SRS-Change-Log.md
│   └── desk-manager.docx
│
└── github/                         # GitHub wiki pages
    ├── Home.md
    └── _Sidebar.md
```

**When to use**: Backend setup, individual API endpoints, system requirements

---

## ⚡ Frontend Documentation

**Location**: `docs/frontend/`  
**Purpose**: Frontend-specific documentation, component architecture, and patterns

### Main Documents

| Document                              | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| [Frontend README](frontend/README.md) | Frontend architecture, setup, and best practices |

### Topics Covered

- **Tech Stack**: React, TypeScript, Vite, TailwindCSS
- **Architecture**: Component structure, API layer, routing
- **Component Patterns**: Barrel exports, composition patterns
- **State Management**: Context API, local state
- **Styling**: TailwindCSS, dark mode
- **Best Practices**: Type safety, error handling, performance

### Structure

```
frontend/
└── README.md                       # Frontend documentation hub
```

**When to use**: Frontend setup, component development, styling guide

---

## 🗺️ Documentation Roadmap

### By Experience Level

#### Beginner (New to Project)

1. [Main README](../README.md) - Setup & overview
2. [Quick Reference](wiki/overview/QUICK_REFERENCE.md) - What's in the project
3. [Architecture](wiki/architecture/ARCHITECTURE.md) - How it works
4. Your role's docs ([Frontend](frontend/README.md) or [Backend](backend/README.md))

#### Intermediate (Ready to Develop)

1. [Frontend README](frontend/README.md) or [Backend README](backend/README.md)
2. [API Documentation](wiki/api/API_DOCUMENTATION.md) - Integration
3. [Code Review](wiki/changes/reviews/2025-12-18-v2.0.0-review.md) - Conventions

#### Advanced (Understanding Decisions)

1. [Architecture](wiki/architecture/ARCHITECTURE.md) - Design patterns
2. [Changelog](wiki/changes/versions/CHANGELOG.md) - Evolution
3. [Code Review](wiki/changes/reviews/2025-12-18-v2.0.0-review.md) - Rationale
4. [System Specifications](backend/system-specification/) - Requirements

---

## 🎯 Finding What You Need

### By Task

| What You Need               | Where to Go                                                     |
| --------------------------- | --------------------------------------------------------------- |
| **Set up the project**      | [Main README](../README.md)                                     |
| **5-min overview**          | [Quick Reference](wiki/overview/QUICK_REFERENCE.md)             |
| **Understand architecture** | [Architecture](wiki/architecture/ARCHITECTURE.md)               |
| **Backend setup**           | [Backend README](backend/README.md)                             |
| **Frontend setup**          | [Frontend README](frontend/README.md)                           |
| **API integration**         | [API Documentation](wiki/api/API_DOCUMENTATION.md)              |
| **Specific API endpoint**   | [Backend API docs](backend/api/)                                |
| **What changed in v2.0**    | [Changelog](wiki/changes/versions/CHANGELOG.md)                 |
| **Why things changed**      | [Code Review](wiki/changes/reviews/2025-12-18-v2.0.0-review.md) |
| **System requirements**     | [SRS](backend/system-specification/HD-Manager-SRS-Updated.md)   |

### By Role

| Your Role                | Recommended Path                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Developer**   | README → Quick Ref → [Frontend Docs](frontend/README.md) → [API Docs](wiki/api/API_DOCUMENTATION.md)                                   |
| **Backend Developer**    | README → Quick Ref → [Backend Docs](backend/README.md) → [API Docs](backend/api/)                                                      |
| **Full-Stack Developer** | README → [Architecture](wiki/architecture/ARCHITECTURE.md) → Both Frontend/Backend                                                     |
| **API Consumer**         | [API Documentation](wiki/api/API_DOCUMENTATION.md) → [API Endpoints](backend/api/)                                                     |
| **Project Manager**      | [Quick Ref](wiki/overview/QUICK_REFERENCE.md) → [Changelog](wiki/changes/versions/CHANGELOG.md) → [SRS](backend/system-specification/) |
| **Code Reviewer**        | [Code Review](wiki/changes/reviews/2025-12-18-v2.0.0-review.md) → [Architecture](wiki/architecture/ARCHITECTURE.md)                    |

---

## 📊 Documentation Statistics

| Category     | Files         | Size        | Purpose                |
| ------------ | ------------- | ----------- | ---------------------- |
| **Wiki**     | 6 files       | ~90KB       | General project docs   |
| **Backend**  | 13+ files     | ~50KB+      | Backend-specific docs  |
| **Frontend** | 1 file        | ~14KB       | Frontend-specific docs |
| **Total**    | **20+ files** | **~150KB+** | Complete coverage      |

---

## 🔍 Special Topics

### GitHub Wiki

- **Home Page**: [github/Home.md](backend/github/Home.md)
- **Sidebar**: [github/\_Sidebar.md](backend/github/_Sidebar.md)
- **Purpose**: Public-facing wiki content

### API Documentation Comparison

**Two API documentation sources**:

1. **Consolidated** ([wiki/api/API_DOCUMENTATION.md](wiki/api/API_DOCUMENTATION.md))
   - Complete API reference in one file
   - All endpoints with examples
   - Error handling and patterns
   - **Best for**: Quick reference, learning API structure

2. **Individual** ([backend/api/](backend/api/))
   - Separate file per endpoint
   - More detailed examples
   - Specific use cases
   - **Best for**: Deep dive into specific endpoints

**Use both**: Start with consolidated, refer to individual for details

---

## 📝 Documentation Standards

### Format

- **Markdown** for all documentation
- **Code examples** with syntax highlighting
- **Tables** for structured information
- **Emoji icons** for quick visual scanning

### Organization

- **Categorized** by purpose (wiki, backend, frontend)
- **Cross-referenced** with links
- **Dated** for version tracking
- **Hierarchical** folder structure

### Maintenance

- Update with code changes
- Date major revisions
- Keep examples current
- Archive old versions in `changes/reviews/`

---

## 🚀 Future Documentation

### Planned Additions

- [ ] Testing guide (frontend + backend)
- [ ] Deployment guide
- [ ] Contributing guide
- [ ] Component library (Storybook)
- [ ] API versioning documentation
- [ ] Performance optimization guide

### Where They'll Go

```
docs/
├── wiki/
│   └── guides/           # NEW: How-to guides
│       ├── TESTING.md
│       ├── DEPLOYMENT.md
│       └── CONTRIBUTING.md
├── backend/
│   └── guides/           # NEW: Backend guides
├── frontend/
    └── guides/           # NEW: Frontend guides
```

---

## 📞 Support & Contribution

### Need Help?

1. Search this documentation
2. Check relevant section (wiki/backend/frontend)
3. Review related documents
4. Contact HD development team

### Contributing to Docs

1. Follow existing structure
2. Use markdown format
3. Add cross-references
4. Update this index
5. Date your changes

---

## 🔗 Quick Links

### Essential Documentation

- [📖 Main README](../README.md)
- [⚡ Quick Reference](wiki/overview/QUICK_REFERENCE.md)
- [🏗️ Architecture](wiki/architecture/ARCHITECTURE.md)
- [🔌 API Reference](wiki/api/API_DOCUMENTATION.md)

### Setup Guides

- [🔧 Backend Setup](backend/README.md)
- [⚡ Frontend Setup](frontend/README.md)

### Deployment & Production

- [🐳 Deployment Guide](../docker/DEPLOYMENT_GUIDE.md)
- [⚙️ Environment Variables](../docker/ENVIRONMENT_VARIABLES_GUIDE.md)
- [✅ Production Checklist](PROD_MERGE_CHECKLIST.md)

### History & Changes

- [📜 Changelog](wiki/changes/versions/CHANGELOG.md)
- [📊 Code Review](wiki/changes/reviews/2026-01-13-code-review.md)

### Specifications

- [📋 System Requirements](backend/system-specification/HD-Manager-SRS-Updated.md)

---

## 🎓 Learning Path

**Recommended order for new developers**:

```
1. Main README (10 min)
   ↓
2. Quick Reference (5 min)
   ↓
3. Architecture Overview (30 min)
   ↓
4. Your Domain:
   - Frontend → Frontend README → Component patterns
   - Backend → Backend README → API endpoints
   ↓
5. API Documentation (20 min)
   ↓
6. Start Coding! 🚀
```

---

**Welcome to HD Manager Documentation!** 📚

**This centralized index helps you navigate all project documentation efficiently.**

---

**Last Updated**: January 18, 2026  
**Documentation Version**: 2.2.0  
**Maintained by**: HD Development Team
