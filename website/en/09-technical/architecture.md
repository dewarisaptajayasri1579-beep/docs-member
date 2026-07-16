# System Architecture — Central Membership & SSO Hub

## 1. Overview

The system uses a **modular monolith** architecture: frontend Next.js and backend NestJS are deployed as separate services, but the entire Hub business domain is located in a single NestJS application. This maintains a simple initial deployment without sacrificing module separation or future service extraction capabilities.

```text
Browser
  │ HTTPS
  ├── Frontend (Next.js) ──────────────┐
  │                                    │ REST / OAuth2
  └────────────────────────────────────┤
                                       ▼
                            Backend (NestJS API)
                     auth · products · licenses · orders
                    payments · oauth · notifications · admin
                         │          │          │
                         ▼          ▼          ▼
                    PostgreSQL    Redis      Email provider
                    (Prisma)     (BullMQ)   
                         │
              Midtrans / Xendit webhook
```

## 2. Components and Responsibilities

| Component | Responsibilities |
|---|---|
| Next.js frontend | Public, member, and admin UI; consumes REST API; does not store secret gateway or private key JWT. |
| NestJS API | Validates DTO, auth, business rules, OAuth2/SSO, payment orchestration, audit, and OpenAPI. |
| PostgreSQL | Source of truth for accounts, licenses, orders, payments, OAuth clients/tokens, and audit logs. |
| Prisma | Type-safe schema, migration, and database transaction. |
| Redis | Fast storage for BullMQ queues and rate-limit/distributed lock if needed. Not a business source of truth. |
| BullMQ worker | Runs background jobs that are retryable and scheduled. |
| Midtrans/Xendit | Hosted payment page and payment confirmation webhook. |
| Email provider | Email verification, password reset, license activation, invoices, and reminders. |
| Coolify on VPS | Runs containers, domain routing/HTTPS, environment, deploy, and basic observability. |

## 3. NestJS Modules

```text
src/
├── auth/             register, login, session, verify email, reset password
├── members/          profile and notification preferences
├── products/         product and plan catalog
├── licenses/         License-ID, activation, renewal, grace/suspension
├── orders/           checkout and idempotency key
├── payments/         Midtrans, Xendit, webhook verification
├── oauth/            authorize, token, revoke, userinfo, JWKS
├── notifications/    producer BullMQ and email delivery
├── jobs/              BullMQ processors and scheduled jobs
├── admin/             protected administrative operations
├── audit/             append-only audit log
├── prisma/            PrismaService and transaction helpers
├── common/            guards, decorators, filters, interceptors
└── config/            environment validation and typed configuration
```

Controllers only handle HTTP. Services store business rules. Payment settlement changes are done in a single `prisma.$transaction`: payment, order, license, and audit log succeed or fail together.

## 4. Redis and BullMQ

Redis stores temporary queue data. **BullMQ is not a replacement for PostgreSQL**; license/order status is always read and written to PostgreSQL.

| Queue / job | Trigger | Function | Retry |
|---|---|---|---|
| `email` | Application event | Sends verification, reset password, activation, and invoice emails after main transaction succeeds. | Exponential backoff; error is recorded. |
| `license-reminder` | Daily scheduler | Finds licenses approaching expiry or in the grace period and sends notifications. | Safe to run again because it uses idempotency key. |
| `license-lifecycle` | Scheduled job | Changes `active` → `grace_period` and `grace_period` → `suspended` according to time. | Service checks actual status in DB before update. |
| `webhook-follow-up` | Webhook completed | Non-critical job: sends invoice/activation email and synchronizes analytics. | Must not activate license twice. |
| `cleanup` | Weekly scheduler | Deletes expired tokens/events according to retention. | Retry if database temporarily fails. |

Payment webhooks do not wait for queues for settlement: signature and amount are validated, and payment/order/license changes are done directly atomically. Queues only receive follow-up jobs after transaction succeeds.

## 5. Critical Flow

### Paid Checkout

1. NestJS validates member, plan, and `Idempotency-Key`.
2. The system creates a `pending_payment` order and requests a payment session from the gateway.
3. The member pays on the hosted payment page gateway.
4. The gateway calls the webhook to NestJS.
5. NestJS validates signature + amount + idempotency, then performs settlement in a single PostgreSQL transaction.
6. Email/invoice events are added to BullMQ.

### SSO

1. SaaS redirects to `/oauth/authorize` using Authorization Code + PKCE.
2. Hub validates member session and license for the requesting product.
3. `/oauth/token` issues an access token JWT RS256 and a rotated refresh token.
4. SaaS verifies JWT using the public key from `/.well-known/jwks.json`.

## 6. Security Boundaries

- Frontend only knows public API URLs and safe client configuration.
- JWT private key, database URL, gateway secret, OAuth client secret, and Redis URL are only in backend/Coolify secrets.
- PostgreSQL and Redis are on a private Coolify network; not exposed to the internet.
- NestJS uses Helmet, CORS allowlist, rate limit, global validation pipe, and exception filter.
- Audit logs record security/billing actions without storing credentials, tokens, or secret payloads.