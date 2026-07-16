# Technical Stack — Central Membership & SSO Hub

## 1. Agreed Stack

| Layer | Technology | Function |
|---|---|---|
| Frontend | Next.js 16+ (App Router), TypeScript | Web member/admin and public pages. |
| UI | Tailwind CSS, Base UI, Lucide | Accessible design system. |
| Backend | NestJS 11+ (TypeScript) | REST API, OAuth2, webhook, and business rules. |
| API contract | REST `/api/v1`, Swagger/OpenAPI | Frontend-backend contract and documentation. |
| Database | PostgreSQL 15+ | ACID compliant source of truth. |
| ORM | Prisma | Schema, migration, and query type-safe. |
| Cache/queue | Redis 7+ + BullMQ | Queue, retry, scheduling, and rate-limit support. |
| Authentication | Passport, JWT RS256, OAuth2 Authorization Code + PKCE | Central login and SSO hub between SaaS. |
| Payment | Midtrans Snap, Xendit Invoice | Indonesian payment and webhook settlement. |
| Email | SMTP provider / Resend | Transactional email through BullMQ. |
| Deployment | Docker + Coolify on VPS | Deploy service, domain, TLS, environment, and rollback. |
| Test | Jest, Supertest, Playwright | Unit, integration/API, and end-to-end. |

## 2. Main Backend Dependencies

| Requirement | Recommended NestJS/Node Package |
|---|---|
| HTTP, config, validation | `@nestjs/common`, `@nestjs/config`, `class-validator`, `class-transformer` |
| Prisma | `prisma`, `@prisma/client` |
| Auth | `@nestjs/passport`, `passport`, `passport-jwt`, `jose` |
| Queue | `@nestjs/bullmq`, `bullmq`, `ioredis` |
| Schedule | `@nestjs/schedule` |
| API docs | `@nestjs/swagger` |
| Security | `helmet`, `@nestjs/throttler` |
| Test | `jest`, `supertest` |

The version is locked in `package.json` backend. Use active LTS Node.js when creating the backend.

## 3. Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Initial architecture | Modular monolith NestJS | Simple operation, modules remain clear and can be extracted later. |
| Database | PostgreSQL + Prisma | Supports billing transactions and data relationships strongly. |
| Queue | Redis + BullMQ | Retry, delayed jobs, and scheduler that can withstand failures. |
| Token | JWT RS256 | SaaS can verify tokens using the public key of the hub. |
| OAuth flow | Authorization Code + PKCE | Safe for web applications. |
| Deployment | Coolify on VPS | One platform for frontend, API, worker, Postgres, and Redis. |
| Payment | Midtrans + Xendit | Suitable for Indonesian payment methods. |

## 4. Repository Structure

```text
membership/
├── project/frontend/     # Next.js (repo itself)
├── backend/              # NestJS + Prisma (repo itself)
└── docs/                 # system specification
```

The backend must have at least an `api` process and a `worker` process from the same image. The API receives HTTP traffic; the worker processes BullMQ and scheduled jobs.

## 5. Core Environment Configuration

```dotenv
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
APP_URL=https://api.hub.domain.com
FRONTEND_URL=https://hub.domain.com
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
XENDIT_SECRET_KEY=...
XENDIT_CALLBACK_TOKEN=...
EMAIL_FROM=no-reply@hub.domain.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

No secrets are committed to Git or `NEXT_PUBLIC_*`. Coolify stores environments separately for staging and production.