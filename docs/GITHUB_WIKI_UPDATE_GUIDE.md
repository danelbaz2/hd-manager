# GitHub Wiki Update Guide

**How to update your GitHub Wiki with the new organized documentation**

---

## 📋 Overview

Your documentation has been reorganized into three categories:
- **Wiki** (general project documentation)
- **Backend** (backend-specific docs)
- **Frontend** (frontend-specific docs)

This guide shows you what needs to be updated in your GitHub Wiki.

---

## 📁 Current Wiki Files Location

GitHub wiki-related files are now in:
```
docs/backend/github/
├── Home.md        # Wiki home page
└── _Sidebar.md    # Wiki sidebar navigation
```

---

## ✏️ What to Update

### 1. Update Home.md

**File**: `docs/backend/github/Home.md`

**Update to include**:
- Link to main documentation index: `docs/README.md`
- Links to the three documentation categories
- Quick navigation to essential docs

**Suggested content**:

```markdown
# HD Manager Documentation

Welcome to the HD Manager documentation wiki!

## 📚 Complete Documentation

All project documentation is organized in the [`docs/`](../docs/) folder.

**Main Index**: [Documentation Hub](../docs/README.md)

## 🗂️ Documentation Categories

### 📖 Wiki Documentation
General project information, architecture, and API reference

- [Quick Reference](../docs/wiki/overview/QUICK_REFERENCE.md)
- [Architecture](../docs/wiki/architecture/ARCHITECTURE.md)
- [Complete API Reference](../docs/wiki/api/API_DOCUMENTATION.md)
- [Changelog](../docs/wiki/changes/versions/CHANGELOG.md)
- [Code Review v2.0.0](../docs/wiki/changes/reviews/2025-12-18-v2.0.0-review.md)

### 🔧 Backend Documentation
Backend architecture, setup, and API details

- [Backend Guide](../docs/backend/README.md)
- [Tasks API](../docs/backend/api/Tasks-API.md)
- [Users API](../docs/backend/api/Users-API.md)
- [Tags API](../docs/backend/api/Tags-API.md)
- [Contacts API](../docs/backend/api/Contacts-API.md)
- [Auth API](../docs/backend/api/Auth-API.md)
- [Chat API](../docs/backend/api/ChatMessages-API.md)
- [System Specifications](../docs/backend/system-specification/)

### ⚡ Frontend Documentation
Frontend architecture and setup

- [Frontend Guide](../docs/frontend/README.md)

## 🚀 Getting Started

1. [Main README](../README.md) - Project setup
2. [Quick Reference](../docs/wiki/overview/QUICK_REFERENCE.md) - 5-minute overview
3. [Architecture](../docs/wiki/architecture/ARCHITECTURE.md) - How it works
4. Your domain docs (Frontend or Backend)

## 🔌 API Reference

- **Complete Guide**: [API Documentation](../docs/wiki/api/API_DOCUMENTATION.md)
- **Individual Endpoints**: [Backend API Docs](../docs/backend/api/)

## 📖 More Information

- [Documentation Index](../docs/README.md) - Complete navigation
- [Changelog](../docs/wiki/changes/versions/CHANGELOG.md) - What's new
- [System Requirements](../docs/backend/system-specification/HD-Manager-SRS-Updated.md)

```

---

### 2. Update _Sidebar.md

**File**: `docs/backend/github/_Sidebar.md`

**Update to include** organized navigation:

**Suggested content**:

```markdown
## 📚 Documentation

### Main
- [🏠 Home](Home)
- [📖 Docs Index](../docs/README.md)

### Quick Access
- [⚡ Quick Ref](../docs/wiki/overview/QUICK_REFERENCE.md)
- [📜 Changelog](../docs/wiki/changes/versions/CHANGELOG.md)

### Architecture
- [🏗️ Architecture](../docs/wiki/architecture/ARCHITECTURE.md)
- [🔌 API Reference](../docs/wiki/api/API_DOCUMENTATION.md)

### Backend
- [🔧 Backend Guide](../docs/backend/README.md)
- [API: Tasks](../docs/backend/api/Tasks-API.md)
- [API: Users](../docs/backend/api/Users-API.md)
- [API: Tags](../docs/backend/api/Tags-API.md)
- [API: Contacts](../docs/backend/api/Contacts-API.md)
- [API: Auth](../docs/backend/api/Auth-API.md)
- [System Specs](../docs/backend/system-specification/)

### Frontend
- [⚡ Frontend Guide](../docs/frontend/README.md)

### History
- [📊 Code Review](../docs/wiki/changes/reviews/2025-12-18-v2.0.0-review.md)
```

---

## 🔄 How to Update GitHub Wiki

### Option 1: Clone Wiki Repository

```bash
# Clone your wiki
git clone https://github.com/YOUR_USERNAME/hd-manager.wiki.git

# Copy updated files
cp docs/backend/github/Home.md hd-manager.wiki/
cp docs/backend/github/_Sidebar.md hd-manager.wiki/

# Commit and push
cd hd-manager.wiki
git add .
git commit -m "docs: Update wiki structure with new organization"
git push
```

### Option 2: GitHub Web Interface

1. Go to your repository's Wiki tab
2. Click "Edit" on the Home page
3. Copy content from `docs/backend/github/Home.md`
4. Paste and save
5. Click "Add a custom sidebar"
6. Copy content from `docs/backend/github/_Sidebar.md`
7. Paste and save

---

## 📝 Additional Wiki Pages You Can Create

### 1. API Overview Page

**File**: Create `API-Overview.md` in wiki

```markdown
# API Overview

Complete REST API reference for HD Manager.

## Consolidated Reference

For a complete API guide with all endpoints:
- [Complete API Documentation](../docs/wiki/api/API_DOCUMENTATION.md)

## Individual Endpoints

Detailed documentation for each endpoint:

- [Tasks API](../docs/backend/api/Tasks-API.md) - Task management
- [Users API](../docs/backend/api/Users-API.md) - User management
- [Tags API](../docs/backend/api/Tags-API.md) - Tag management
- [Contacts API](../docs/backend/api/Contacts-API.md) - Contact management
- [Chat API](../docs/backend/api/ChatMessages-API.md) - Chat functionality
- [Auth API](../docs/backend/api/Auth-API.md) - Authentication

## Quick Examples

See [API Documentation](../docs/wiki/api/API_DOCUMENTATION.md) for code examples.
```

---

### 2. Setup Guide Page

**File**: Create `Setup-Guide.md` in wiki

```markdown
# Setup Guide

## Backend Setup

See [Backend Documentation](../docs/backend/README.md) for complete setup instructions.

## Frontend Setup

See [Frontend Documentation](../docs/frontend/README.md) for complete setup instructions.

## Quick Start

See [Main README](../README.md) for quick start guide.
```

---

### 3. Architecture Page  

**File**: Create `Architecture.md` in wiki

```markdown
# Architecture

Complete technical architecture documentation.

## Full Documentation

- [Complete Architecture Guide](../docs/wiki/architecture/ARCHITECTURE.md)

## Key Sections

- Technology Stack
- Backend Architecture
- Frontend Architecture
- Data Models
- API Design
- Design Patterns

## Quick Facts

- **Backend**: Flask + MongoDB + Pydantic
- **Frontend**: React + TypeScript + TailwindCSS
- **Database**: MongoDB (single collection design)
- **API**: RESTful with strict validation
```

---

## 🎯 Recommended Wiki Structure

Here's the recommended wiki page structure:

```
GitHub Wiki Pages:
├── Home                    # Main entry point (updated)
├── _Sidebar                # Navigation (updated)
├── API-Overview            # API navigation hub (NEW)
├── Setup-Guide             # Setup instructions (NEW)
├── Architecture            # Architecture overview (NEW)
└── [Link to docs/]         # Most content lives in docs/
```

**Philosophy**: Keep wiki minimal, link to comprehensive docs in `docs/` folder.

---

## ✅ Checklist

After updating your GitHub wiki, verify:

- [ ] Home page updated with new structure
- [ ] Sidebar updated with categorized links
- [ ] All links point to correct locations
- [ ] Links work from GitHub web interface
- [ ] Documentation is accessible
- [ ] Navigation is intuitive

---

## 🔍 Link Paths

**Important**: GitHub wiki links should use relative paths to the `docs/` folder.

### From Wiki to Docs

```markdown
<!-- From GitHub wiki to docs/ -->
[Architecture](../docs/wiki/architecture/ARCHITECTURE.md)
[Backend Guide](../docs/backend/README.md)
[Frontend Guide](../docs/frontend/README.md)
```

### Within Docs

```markdown
<!-- From one doc to another -->
[API Docs](../wiki/api/API_DOCUMENTATION.md)
[Backend README](../../backend/README.md)
```

---

## 📊 What Changed

### Before (Old Structure)
```
backend/docs/
├── api/
├── github/
└── system-specification/
```

### After (New Structure)
```
docs/
├── wiki/                   # General project docs
│   ├── overview/
│   ├── architecture/
│   ├── api/
│   └── changes/
├── backend/                # Backend-specific docs
│   ├── README.md
│   ├── api/
│   ├── system-specification/
│   └── github/             # ← Wiki files here
└── frontend/               # Frontend-specific docs
    └── README.md
```

---

## 🚀 Benefits of New Structure

✅ **Clear Separation**: Wiki, Backend, Frontend docs separated  
✅ **Better Organization**: Logical categorization  
✅ **Easier Navigation**: Clear paths to find information  
✅ **Scalable**: Easy to add new categories  
✅ **Centralized**: All docs in `docs/` folder  

---

## 📞 Need Help?

- Check [Documentation Index](../docs/README.md) for navigation
- Review [Main README](../README.md) for project overview
- Contact HD development team

---

**Last Updated**: December 18, 2025  
**Documentation Version**: 2.0.0
