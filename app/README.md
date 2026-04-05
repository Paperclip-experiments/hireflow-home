# HireFlow

AI-powered client acquisition platform for staffing agencies.

## Stack

- **Backend**: Node.js + TypeScript + Express + Prisma
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

## Quick Start

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Copy env file
cp .env.example .env

# Install dependencies
npm install
cd client && npm install && cd ..

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Run development servers
npm run dev
```

Backend runs on `http://localhost:3001`, frontend on `http://localhost:5173`.

## API Endpoints

| Module | Path | Endpoints |
|--------|------|-----------|
| Auth | `/api/auth` | register, login, me, invite |
| Prospects | `/api/prospects` | CRUD, batch-import |
| Deals | `/api/deals` | CRUD, pipeline view |
| Signals | `/api/signals` | sources CRUD, signals CRUD, batch-import, rescoring, scans, stats |
| Sequences | `/api/sequences` | CRUD, enroll, advance, stats |
| Portal | `/api/portal` | invite, submissions CRUD, magic link access, feedback |

## Architecture

- Multi-tenant: all data scoped by agency
- JWT auth with role-based access (ADMIN, BD_REP, RECRUITER)
- Signal scoring: type weights + recency decay, capped at 100
- Email sequences with template rendering (`{{var}}` placeholders)
- Client portal with magic link access
