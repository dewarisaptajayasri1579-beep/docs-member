# Installation & Setup Guide

## Prerequisites

- Node.js LTS and the chosen package manager by the team (pnpm is recommended).
- Local PostgreSQL 15+ and Redis 7+, or Docker Compose for both.
- Separate repositories: `frontend` (Next.js) and `backend` (NestJS + Prisma).

## Backend NestJS

```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm start:dev
```

Minimum contents for local `.env`:

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/membership_hub
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

Run worker on a separate terminal if not combined with the development process:

```bash
pnpm start:worker
```

API is available at `http://localhost:3001`; Swagger is available at `http://localhost:3001/api/docs` in development/staging.

## Frontend Next.js

```bash
cd project/frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Use `NEXT_PUBLIC_API_URL=http://localhost:3001`. Do not store database, Redis, payment secret, or JWT private key in the frontend environment.

## Database and queue

- Create a new migration with `pnpm prisma migrate dev --name <description>`.
- Commit Prisma migration files together with schema changes.
- Use `pnpm prisma studio` only for development.
- Verify Redis before testing email, scheduler, or worker: worker must be connected and no failed jobs are ignored.

## Pre-merge checks

1. Run lint, unit test, integration test, and build backend.
2. Run migration on an empty database and database upgrade copy to verify compatibility.
3. Test Midtrans/Xendit sandbox, including invalid signature and webhook retry.
4. Test email/lifecycle job with Redis active and simulate retry.