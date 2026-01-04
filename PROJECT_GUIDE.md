# HD Manager Project Guide

Use this page as a fast orientation to the HD Manager mono-repo (Flask backend plus React/Vite frontend).

## What the project does
- Task and contact manager for the HD team with Kanban board, tagging, audit trail, and team chat
- Single MongoDB database with soft-delete and full change history (ents and ents_archive collections)
- Role-based access (regular, admin) with strict validation (Pydantic on backend, TypeScript on frontend)

## Repo layout
- backend/ Flask API, MongoDB connection, Pydantic models, routes, and seed utilities
- frontend/ React 19.2 with Vite, TypeScript, and Tailwind UI
- docs/ Complete documentation hub (architecture, API, backend, frontend)

## Run it locally
### Backend (Flask)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# set env: MONGO_URI, PORT (see README)
python app.py
```
Backend default: http://localhost:5000

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend default: http://localhost:5173

## Data model quick notes
- All entities live in Mongo collection ents with base metadata and soft delete flags
- History entries are written to ents_archive capturing old and new states

## Documentation map
- Main overview and setup: [README.md](README.md)
- Full docs index: [docs/README.md](docs/README.md)
- Backend guide and endpoints: [docs/backend/README.md](docs/backend/README.md) and [docs/backend/api](docs/backend/api)
- Frontend guide: [docs/frontend/README.md](docs/frontend/README.md)
- API reference (consolidated): [docs/wiki/api/API_DOCUMENTATION.md](docs/wiki/api/API_DOCUMENTATION.md)

## Next steps for newcomers
1. Read the main README for prerequisites and quick start.
2. Skim docs/README.md for navigation to your area (frontend or backend).
3. Run both servers with the commands above and explore the UI.
