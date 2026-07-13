# Technical Stack — Central Membership & SSO Hub

## 1. Stack yang disepakati

| Layer | Teknologi | Fungsi |
|---|---|---|
| Frontend | Next.js 16+ (App Router), TypeScript | Web member/admin dan halaman publik. |
| UI | Tailwind CSS, Base UI, Lucide | Design system yang aksesibel. |
| Backend | NestJS 11+ (TypeScript) | REST API, OAuth2, webhook, dan business rules. |
| API contract | REST `/api/v1`, Swagger/OpenAPI | Kontrak frontend-backend dan dokumentasi. |
| Database | PostgreSQL 15+ | Source of truth yang ACID. |
| ORM | Prisma | Schema, migration, dan query type-safe. |
| Cache/queue | Redis 7+ + BullMQ | Queue, retry, scheduling, dan rate-limit support. |
| Authentication | Passport, JWT RS256, OAuth2 Authorization Code + PKCE | Hub login dan SSO antar SaaS. |
| Payment | Midtrans Snap, Xendit Invoice | Pembayaran Indonesia dan webhook settlement. |
| Email | SMTP provider / Resend | Email transaksional melalui BullMQ. |
| Deployment | Docker + Coolify pada VPS | Deploy service, domain, TLS, environment, dan rollback. |
| Test | Jest, Supertest, Playwright | Unit, integration/API, dan end-to-end. |

## 2. Backend dependency utama

| Kebutuhan | Paket NestJS/Node yang direkomendasikan |
|---|---|
| HTTP, config, validation | `@nestjs/common`, `@nestjs/config`, `class-validator`, `class-transformer` |
| Prisma | `prisma`, `@prisma/client` |
| Auth | `@nestjs/passport`, `passport`, `passport-jwt`, `jose` |
| Queue | `@nestjs/bullmq`, `bullmq`, `ioredis` |
| Schedule | `@nestjs/schedule` |
| API docs | `@nestjs/swagger` |
| Security | `helmet`, `@nestjs/throttler` |
| Test | `jest`, `supertest` |

Versi pasti dikunci di `package.json` backend. Gunakan LTS Node.js aktif saat backend dibuat.

## 3. Keputusan teknis

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Arsitektur awal | Modular monolith NestJS | Operasional sederhana, modul tetap jelas dan dapat diekstraksi kelak. |
| Database | PostgreSQL + Prisma | Mendukung transaksi billing dan relasi data dengan kuat. |
| Queue | Redis + BullMQ | Retry, delayed jobs, dan scheduler yang tahan kegagalan. |
| Token | JWT RS256 | SaaS dapat memverifikasi token menggunakan public key Hub. |
| OAuth flow | Authorization Code + PKCE | Aman untuk aplikasi web. |
| Deployment | Coolify pada VPS | Satu platform untuk frontend, API, worker, Postgres, dan Redis. |
| Payment | Midtrans + Xendit | Sesuai kebutuhan metode pembayaran Indonesia. |

## 4. Struktur repository

```text
membership/
├── project/frontend/     # Next.js (repo sendiri)
├── backend/              # NestJS + Prisma (repo sendiri)
└── docs/                 # spesifikasi sistem
```

Backend minimal memiliki `api` process dan `worker` process dari image yang sama. API menerima traffic HTTP; worker memproses BullMQ dan scheduled job.

## 5. Konfigurasi environment inti

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

Tidak ada secret yang masuk ke Git atau `NEXT_PUBLIC_*`. Coolify menyimpan environment terpisah untuk staging dan production.
