# Asymetric Technical Test — Architecture

## Project Overview
This repository implements a full-stack blog application:
- Frontend: React + Vite SPA that communicates with the backend API.
- Backend: Node.js + TypeScript + Express REST API with Prisma ORM.
- Database: PostgreSQL (via Docker Compose).
- Deployment: Docker + Docker Compose for local / simple env orchestration.

## High-level architecture (text diagram)
Client (browser)
  └─> Frontend (React, Vite) -- HTTP (REST) --> Backend (Express + TypeScript)
        └─ Static assets served via frontend container/nginx
Backend
  ├─ API routes (`src/routes/*.ts`)
  ├─ Services (`src/services/*.ts`) implement business logic
  ├─ Managers (`src/managers/*.ts`) handle infra concerns (DB, Auth, Cron jobs)
  ├─ Prisma client (`src/generated/prisma`) for DB access
  └─ Background jobs (scheduled with `node-cron`)
Database
  └─ PostgreSQL (data model described in `prisma/schema.prisma`)

## Key components and responsibilities
- Frontend (`frontend/blog`):
  - UI pages and components (React + TypeScript).
  - Routes include public pages, auth pages, and private routes.
  - Talks to backend REST endpoints for posts, categories, author auth.
- Backend (`backend/src`):
  - Express app entry (`src/index.ts`).
  - Routers in `src/routes/*` define endpoints for Authors, Posts, Categories.
  - Services in `src/services/*` contain domain logic.
  - DTOs and validation use Zod and typed DTOs in `src/models/dtos`.
  - Prisma for database operations (generated client in `src/generated/prisma`).
  - Auth handled via JWTs (`jsonwebtoken`), password hashing (`bcrypt`).
  - Background jobs managed by `node-cron` and `JobManager`.
  - Environment configuration via `dotenv` / `DotEnvManager`.
- Database:
  - PostgreSQL configured in `infra/docker-compose.yaml`.
  - Prisma schema located at `backend/prisma/schema.prisma` with models: `Author`, `Post`, `Category`, `PostCategory`.
- Dev & infra:
  - `infra/docker-compose.yaml` orchestrates `postgres`, `backend`, `frontend`.
  - Backend and frontend each have Dockerfiles at their top-level folders.

## Data Flow (typical request)
1. User interacts with SPA → SPA sends HTTP request (fetch/axios) to backend REST endpoint.
2. Backend router receives request → validation via DTO / Zod.
3. Controller/service executes business logic → uses Prisma client for DB reads/writes.
4. Backend returns JSON response (and sets JWT on login, typically stored client-side).
5. For scheduled tasks, `node-cron` triggers JobManager routines that perform background tasks (e.g., maintenance, scheduled calls).

## Authentication & Security
- JWT-based authentication (`jsonwebtoken`), secrets configured via env vars (`JWT_SECRET`, `JWT_ISSUER`, `JWT_AUD`).
- Passwords hashed with `bcrypt`.
- Input validation with `zod` ensures request payload safety.
- DB access limited by Prisma models; DB credentials are provided via `DATABASE_URL` in env.

## Where to find important code
- Backend entry: `backend/src/index.ts`
- Routers: `backend/src/routes/*.ts` (AuthorRouter, PostRouter, CategoryRouter)
- Services: `backend/src/services/*.ts`
- Managers: `backend/src/managers/*.ts` (Prisma, Auth, Job, DotEnv)
- DTOs & validation: `backend/src/models/dtos`, `backend/src/models/validator`
- Prisma schema: `backend/prisma/schema.prisma`
- Generated Prisma client: `backend/src/generated/prisma`
- Frontend entry: `frontend/blog/src/main.tsx`
- Frontend pages: `frontend/blog/src/pages/*`

## Deployment (local / dev)
- Start DB and services with `infra/docker-compose.yaml`:
  - `docker compose -f infra/docker-compose.yaml up --build`
- Ensure the env vars in `.env` or host environment match those referenced in `infra/docker-compose.yaml` (`API_KEY`, `JWT_SECRET`, ...).
- Run migrations and Prisma generate inside `backend` as needed:
  - `cd backend && npx prisma migrate dev` and `npm run prisma:generate`

## Recommendations & notes
- Keep secrets out of version control; use a `.env` file or a secret manager.
- Run Prisma migrations after DB changes.
- Add monitoring/logging (e.g., structured logs, Sentry) for production readiness.
- Consider adding docker healthchecks for backend and frontend as needed.