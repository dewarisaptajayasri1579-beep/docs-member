# Deployment Guide — Coolify on VPS

## 1. Production Topology

Coolify is installed on a VPS and runs separate containers for:

| Service | Function | Exposed Publicly |
|---|---|---|
| `frontend` | Next.js | Yes, `hub.domain.com`. |
| `backend-api` | NestJS HTTP/API/OAuth/webhook | Yes, `api.hub.domain.com`. |
| `backend-worker` | BullMQ processor and scheduler | No. |
| `postgres` | PostgreSQL | No. |
| `redis` | BullMQ/Redis | No. |

Coolify reverse proxy handles domains and TLS. Databases/Redis are only accessible through the private Docker/Coolify network.

## 2. Preparing Coolify

1. Create separate projects and environments: `staging` and `production`.
2. Add Git resources for frontend and backend repositories.
3. Add managed PostgreSQL and Redis resources to the corresponding environments.
4. Add a domain, enable HTTPS, and set CORS `FRONTEND_URL` for the backend according to the frontend domain.
5. Save all environment variables as Coolify secrets; do not commit `.env`.

The backend is deployed twice from the same source/image: `backend-api` runs `pnpm start:prod`; `backend-worker` runs `pnpm start:worker`. Ensure that only **one** scheduler lifecycle is active per environment, or use a distributed lock Redis.

## 3. Deployment Order

1. Backup the database and review Prisma migrations.
2. Deploy a new `backend-api`.
3. Run the production migration with `pnpm prisma migrate deploy` as a pre-deploy/release command once.
4. Deploy or restart `backend-worker` with the same environment.
5. Deploy the frontend with the correct `NEXT_PUBLIC_API_URL`.
6. Check `/health`, `/api/docs` (only in staging), worker queue, and webhook sandbox.

Migrations must not be executed simultaneously by API and worker. Use the Coolify release command/one-off task.

## 4. Payment Webhook and OAuth

- Register `https://api.hub.domain.com/webhooks/midtrans` and `https://api.hub.domain.com/webhooks/xendit` in the provider dashboard.
- Register the OAuth SaaS redirect URI exactly as in `oauth_clients`; do not accept wildcards.
- Ensure the webhook endpoint receives the raw body if the provider signature requires it.
- After deployment, perform a sandbox transaction and retry the webhook to ensure idempotence.

## 5. Monitoring, Backup, and Rollback

- Monitor container health, HTTP 5xx, VPS disk, PostgreSQL/Redis connections, failed jobs, and error webhooks.
- Schedule PostgreSQL backups and regularly test restores. Redis does not hold the source of truth, but persistence configuration helps with queue recovery.
- Save audit/error logs with agreed-upon retention; do not store secrets or raw tokens.
- Rollback the application through Coolify deployment revisions. For destructive migrations, use incremental compatible migrations; do not rollback schema without a tested backup.

## 6. Go-Live Checklist

- [ ] HTTPS/domain/CORS are correct for frontend and API.
- [ ] PostgreSQL and Redis are not exposed to the internet.
- [ ] Environment secrets are filled and different between staging/production.
- [ ] Prisma migration has been successful once.
- [ ] API and worker are healthy; scheduler is not running twice.
- [ ] Midtrans/Xendit webhook signature and retry pass sandbox tests.
- [ ] Email verification/invoice and job lifecycle are processed.
- [ ] Database backup and rollback procedure have been tested.