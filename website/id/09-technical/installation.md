# Installation & Setup Guide

## Prasyarat

- Node.js LTS dan package manager yang dipilih tim (disarankan pnpm).
- PostgreSQL 15+ dan Redis 7+ lokal, atau Docker Compose untuk keduanya.
- Repository terpisah: `frontend` (Next.js) dan `backend` (NestJS + Prisma).

## Backend NestJS

```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm start:dev
```

Isi minimum `.env` lokal:

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/membership_hub
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

Jalankan worker pada terminal terpisah bila tidak digabung pada process development:

```bash
pnpm start:worker
```

API tersedia di `http://localhost:3001`; Swagger tersedia di `http://localhost:3001/api/docs` pada development/staging.

## Frontend Next.js

```bash
cd project/frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Gunakan `NEXT_PUBLIC_API_URL=http://localhost:3001`. Jangan menaruh database, Redis, payment secret, atau JWT private key pada environment frontend.

## Database dan queue

- Buat migration baru dengan `pnpm prisma migrate dev --name <deskripsi>`.
- Commit file migration Prisma bersama perubahan schema.
- Gunakan `pnpm prisma studio` hanya untuk development.
- Verifikasi Redis sebelum menguji email, scheduler, atau worker: worker harus terhubung dan tidak ada job gagal yang terabaikan.

## Pemeriksaan sebelum merge

1. Jalankan lint, unit test, integration test, dan build backend.
2. Jalankan migration pada database kosong dan database upgrade copy untuk memverifikasi kompatibilitas.
3. Uji Midtrans/Xendit sandbox, termasuk signature invalid dan webhook retry.
4. Uji job email/lifecycle dengan Redis aktif dan simulasi retry.
