# Projects Portal — Assignment

This repository contains a simple Projects Portal (MERN-style) with separate `backend/` and `frontend/` folders.

Overview
- Backend: Express + MongoDB REST API (signin/register, subjects, projects, admin actions).
- Frontend: React app (Create React App) that consumes the backend API.

Repository layout
```
assignment/
├─ backend/                # Express API
├─ frontend/               # React app (Create React App)
├─ .gitignore              # repo-level ignore
└─ README.md               # THIS FILE
```

Quick prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or connection URI)

Environment
- Backend: `backend/.env` (example values shown in the project). Important vars:
  - `MONGODB_URI` — MongoDB connection string
  - `JWT_SECRET` — secret for signing tokens
  - `PORT` — server port (default 5000)
- Frontend: `frontend/.env`
  - `REACT_APP_BASE_URL` — example: `http://localhost:5000`

Install & run (backend)
1. Open a terminal in `backend/`
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Start server (development):

```powershell
npm run dev
```

The backend API default base URL is `http://localhost:5000/api` (adjust with `PORT`).

Install & run (frontend)
1. Open a terminal in `frontend/`
2. Install dependencies:

```powershell
cd frontend
npm install
```

3. Start the React dev server:

```powershell
npm start
```

The app will open at `http://localhost:3000` by default. Make sure `frontend/.env` contains `REACT_APP_BASE_URL` pointing to your backend (e.g. `http://localhost:5000`).

Notes / troubleshooting
- React env vars must begin with `REACT_APP_` (already used in `src/services/api.js`). After changing `.env`, restart the dev server.
- If you see 404s like `Cannot POST /register/undefined/api/...` check `REACT_APP_BASE_URL` is set and the frontend has been restarted.
- API routes are mounted under `/api` (e.g. `POST /api/auth/register/student`).
- Uploaded files are written to `backend/uploads/` — the repo `.gitignore` excludes that folder to avoid committing large files.
- If you add secrets to `.env`, ensure they are not committed. The repo-level `.gitignore` excludes `.env` files.

Useful endpoints (examples)
- POST /api/auth/register/student — register a student
- POST /api/auth/register/faculty — register faculty (may require admin approval)
- POST /api/auth/login — login
- GET /api/subjects — list public subjects
- POST /api/subjects/:subjectId/enroll — enroll in subject (student only)
- POST /api/projects/upload — upload a project (student only)

Next steps / suggestions
- Add README sections describing database seeding or how to create the initial admin user (there is `backend/createAdmin.js` to create a default admin).
- Add tests and CI workflow if desired.

If you'd like, I can:
- Commit the new files to Git for you.
- Add short scripts to run both frontend and backend together (concurrently).
- Add a brief developer checklist for common tasks.

---
Generated on: 2025-11-01
