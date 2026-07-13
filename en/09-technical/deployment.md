# Deployment Guide — Coolify on VPS

## 1. Production Topology

Coolify is installed on a VPS and runs separate containers for:

| Service | Function | Public exposure |
|---|---|---|
| `frontend` | Next.js | Yes, `hub.domain.com`. |
| `backend-api` | NestJS HTTP/API/OAuth/webhook | Yes, `api.hub.domain.com`. |
| `backend-worker` | BullMQ processor and scheduler | No. |
| `postgres` | PostgreSQL | No. |
| `redis` | BullMQ/Redis | No. |

Coolify's reverse proxy handles domains and TLS. Database/Redis are only accessed via the private Docker/Coolify network.

## 2. Coolify Preparation

1. Create separate projects and environments: `staging` and `production`.
2. Add Git resources for frontend and backend repositories.
3. Add PostgreSQL and Redis managed resources to the appropriate environments.
4. Add domains, enable HTTPS, then configure backend CORS `FRONTEND_URL` to match the frontend domain.
5. Store all environment variables as Coolify secrets; do not commit `.env`.

The backend is deployed twice from the same source/image: `backend-api` runs `pnpm start:prod`; `backend-worker` runs `pnpm start:worker`. Ensure only **one** scheduler lifecycle is active per environment, or use a distributed Redis lock.

## 3. Deployment Order

1. Backup the database and review Prisma migrations.
2. Deploy the new `backend-api`.
3. Run production migrations with `pnpm prisma migrate deploy` as a one-time pre-deploy/release command.
4. Deploy or restart `backend-worker` with the same environment.
5. Deploy the frontend with the correct `NEXT_PUBLIC_API_URL`.
6. Check `/health`, `/api/docs` (staging only), worker queue, and webhook sandbox.

Migrations must not be executed concurrently by the API and worker. Use Coolify's release command/one-off task.

## 4. Payment Webhooks and OAuth

- Register `https://api.hub.domain.com/webhooks/midtrans` and `https://api.hub.domain.com/webhooks/xendit` in the provider dashboard.
- Register OAuth SaaS redirect URIs exactly as in `oauth_clients`; do not accept wildcards.
- Ensure the webhook endpoint receives the raw body if the provider's signature requires it.
- After deployment, perform sandbox transactions and retry webhooks to ensure idempotency.

## 5. Monitoring, Backup, and Rollback

- Monitor container health, HTTP 5xx, VPS disk, PostgreSQL/Redis connections, failed job queues, and webhook errors.
- Schedule PostgreSQL backups and periodically test restores. Redis does not hold the source of truth, but persistence configuration aids queue recovery.
- Store audit/error logs for the agreed retention period; do not store raw secrets or tokens.
- Rollback applications via Coolify's deployment revisions. For destructive migrations, use gradual compatible migrations; do not rollback schema without tested backups.

## 6. Go-Live Checklist

- [ ] HTTPS/domain/CORS are correct for frontend and API.
- [ ] PostgreSQL and Redis are not exposed to the internet.
- [ ] Environment secrets are populated and differ between staging/production.
- [ ] Prisma migration has succeeded once.
- [ ] API and worker are healthy; scheduler is not running in duplicate.
- [ ] Midtrans/Xendit webhook signature and retry passed sandbox tests.
- [ ] Email verification/invoice and job lifecycle are processed.
- [ ] Database backup and rollback procedures have been tested.